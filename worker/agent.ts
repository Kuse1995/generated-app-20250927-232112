import { Agent } from 'agents';
import OpenAI from 'openai';
import type { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs';
import type { Env } from './core-utils';
import { getAppController } from './core-utils';
import type { ChatState } from './types';
import { API_RESPONSES } from './config';
import { delay } from './utils';
import { executeTool, getToolDefinitions } from './tools';
export class ChatAgent extends Agent<Env, ChatState> {
  private openai: OpenAI | null = null;
  initialState: ChatState = {
    messages: [],
    sessionId: '', // Will be the client's phone number
    isProcessing: false,
    model: '', // Not used with Assistants API directly
    threadId: undefined,
  };
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  async onStart(): Promise<void> {
    this.state.sessionId = this.name; // The agent is named by the client's phone number
    console.log(`ChatAgent ${this.name} started.`);
  }
  private async getOpenAIClient(): Promise<{ client: OpenAI, assistantId: string }> {
    const controller = getAppController(this.env);
    const settings = await controller.getSettings();
    const apiKey = settings.openaiApiKey;
    const assistantId = settings.openaiAssistantId;
    const baseUrl = this.env.CF_AI_BASE_URL;
    if (!apiKey || !assistantId) {
      throw new Error('OpenAI API Key or Assistant ID is not configured.');
    }
    if (!baseUrl || baseUrl.includes('YOUR_ACCOUNT_ID') || baseUrl.includes('YOUR_GATEWAY_ID')) {
      console.error('CRITICAL: CF_AI_BASE_URL is not configured correctly. It still contains placeholder values.');
      throw new Error('AI Gateway is not configured. Please set up CF_AI_BASE_URL in your wrangler configuration.');
    }
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseUrl,
    });
    return { client: this.openai, assistantId };
  }
  private async updateConversationInController(lastMessage: string, sender: 'client' | 'ai') {
    const controller = getAppController(this.env);
    const clientNumber = this.state.sessionId;
    await controller.addOrUpdateConversation({
      id: clientNumber,
      clientNumber: clientNumber,
      lastMessage: lastMessage,
      timestamp: Date.now(),
    });
    await controller.addMessageToConversation(clientNumber, {
        id: crypto.randomUUID(),
        sender,
        content: lastMessage,
        timestamp: new Date().toISOString()
    });
  }
  async handleIncomingWhatsAppMessage(messageBody: string, from: string): Promise<string | null> {
    if (this.state.isProcessing) {
      console.warn(`Agent ${this.name} is already processing a message. Ignoring new message.`);
      return "I'm currently processing your previous message. I'll get back to you shortly!";
    }
    this.setState({ ...this.state, isProcessing: true });
    try {
      const { client: openai, assistantId } = await this.getOpenAIClient();
      await this.updateConversationInController(messageBody, 'client');
      if (!this.state.threadId) {
        const thread = await openai.beta.threads.create();
        this.setState({ ...this.state, threadId: thread.id });
      }
      const threadId = this.state.threadId!;
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageBody,
      });
      let run: OpenAI.Beta.Threads.Runs.Run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        tools: getToolDefinitions(),
      });
      while (true) {
        const currentRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
        if (['queued', 'in_progress'].includes(currentRun.status)) {
          await delay(1000);
          continue;
        }
        if (currentRun.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(threadId, { limit: 1 });
          const lastMessage = messages.data[0];
          if (lastMessage?.content[0]?.type === 'text') {
            const finalResponse = lastMessage.content[0].text.value;
            await this.updateConversationInController(finalResponse, 'ai');
            return finalResponse;
          }
          return null; // Should not happen if status is completed
        }
        if (currentRun.status === 'requires_action' && currentRun.required_action) {
          const tool_outputs: RunSubmitToolOutputsParams.ToolOutput[] = [];
          for (const toolCall of currentRun.required_action.submit_tool_outputs.tool_calls) {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            if (functionName === 'mark_as_lead') {
              args.clientNumber = from;
            }
            const output = await executeTool(functionName, args, this.env);
            tool_outputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify(output),
            });
          }
          run = await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, { tool_outputs });
        } else {
          console.error(`Run ended with unhandled status: ${currentRun.status}`);
          throw new Error(`Run failed with status: ${currentRun.status}`);
        }
      }
    } catch (error) {
      console.error(`Error in ChatAgent for ${from}:`, error);
      return "I'm sorry, but I encountered an error. Please try again later.";
    } finally {
      this.setState({ ...this.state, isProcessing: false });
    }
  }
  async onRequest(request: Request): Promise<Response> {
    return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
  }
}