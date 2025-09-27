import { DurableObject } from 'cloudflare:workers';
import type { Conversation, Lead } from './types';
import type { Env, Settings } from './core-utils';
import { LEAD_NOTIFICATION_EMAIL } from './config';
export class AppController extends DurableObject<Env> {
  private conversations = new Map<string, Conversation>();
  private leads = new Map<string, Lead>();
  private settings: Settings = {};
  private processingStatus = new Map<string, boolean>();
  private loaded = false;
  public env: Env;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.env = env;
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.get<Record<string, Conversation>>('conversations') || {};
      this.conversations = new Map(Object.entries(stored));
      const storedLeads = await this.ctx.storage.get<Record<string, Lead>>('leads') || {};
      this.leads = new Map(Object.entries(storedLeads));
      this.settings = await this.ctx.storage.get<Settings>('settings') || {};
      this.loaded = true;
    }
  }
  private async persistConversations(): Promise<void> {
    await this.ctx.storage.put('conversations', Object.fromEntries(this.conversations));
  }
  private async persistLeads(): Promise<void> {
    await this.ctx.storage.put('leads', Object.fromEntries(this.leads));
  }
  private async persistSettings(): Promise<void> {
    await this.ctx.storage.put('settings', this.settings);
  }
  async addOrUpdateConversation(conversation: Omit<Conversation, 'messages' | 'isLead'> & { isLead?: boolean }): Promise<void> {
    await this.ensureLoaded();
    const existing = this.conversations.get(conversation.id) || { messages: [], isLead: false };
    this.conversations.set(conversation.id, {
      ...existing,
      ...conversation,
      isLead: conversation.isLead ?? existing.isLead,
    });
    await this.persistConversations();
  }
  async addMessageToConversation(clientNumber: string, message: { id: string; sender: 'client' | 'ai'; content: string; timestamp: string; }): Promise<void> {
    await this.ensureLoaded();
    const conversation = this.conversations.get(clientNumber);
    if (conversation) {
      if (!conversation.messages) {
        conversation.messages = [];
      }
      conversation.messages.push(message);
      if (conversation.messages.length > 50) {
        conversation.messages.shift();
      }
      this.conversations.set(clientNumber, conversation);
      await this.persistConversations();
    }
  }
  async markAsLead(clientNumber: string, details: string): Promise<void> {
    await this.ensureLoaded();
    const conversation = this.conversations.get(clientNumber);
    if (conversation) {
      conversation.isLead = true;
      this.conversations.set(clientNumber, conversation);
      const lead: Lead = { clientNumber, qualifiedAt: Date.now(), details };
      this.leads.set(clientNumber, lead);
      await Promise.all([this.persistConversations(), this.persistLeads()]);
      await this.sendLeadNotificationEmail(clientNumber, details);
    }
  }
  private async sendLeadNotificationEmail(clientNumber: string, details: string): Promise<void> {
    const emailPayload = {
      personalizations: [{ to: [{ email: LEAD_NOTIFICATION_EMAIL }] }],
      from: { email: 'no-reply@connectflow.app', name: 'ConnectFlow AI Assistant' },
      subject: `🚀 New Hot Lead Qualified: ${clientNumber}`,
      content: [{
        type: 'text/html',
        value: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #10b981;">New Lead Qualified!</h1>
            <p>The AI assistant has successfully qualified a new lead from WhatsApp.</p>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <h2 style="color: #333;">Lead Details:</h2>
            <ul>
              <li><strong>Client Number:</strong> ${clientNumber}</li>
              <li><strong>Reason:</strong> ${details}</li>
              <li><strong>Qualified At:</strong> ${new Date().toUTCString()}</li>
            </ul>
            <p>Please follow up with the client to finalize the deal.</p>
            <p style="font-size: 12px; color: #999;">This is an automated notification from the ConnectFlow platform.</p>
          </div>
        `,
      }],
    };
    try {
      const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });
      if (response.status === 202) {
        console.log(`Successfully sent lead notification email for ${clientNumber}.`);
      } else {
        const errorBody = await response.text();
        console.error(`Failed to send lead notification email. Status: ${response.status}. Body: ${errorBody}`);
      }
    } catch (error) {
      console.error('Error sending email via MailChannels:', error);
    }
  }
  async listConversations(): Promise<Conversation[]> {
    await this.ensureLoaded();
    return Array.from(this.conversations.values())
      .map(convo => ({
        ...convo,
        isProcessing: this.processingStatus.get(convo.id) || false,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  async getSettings(): Promise<Settings> {
    await this.ensureLoaded();
    // Fallback to environment secrets if settings are not configured in UI
    return {
      twilioAccountSid: this.settings.twilioAccountSid || this.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: this.settings.twilioAuthToken || this.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: this.settings.twilioPhoneNumber || this.env.TWILIO_PHONE_NUMBER,
      openaiApiKey: this.settings.openaiApiKey || this.env.OPENAI_API_KEY,
      openaiAssistantId: this.settings.openaiAssistantId || this.env.ASSISTANT_ID,
    };
  }
  async updateSettings(newSettings: Partial<Settings>): Promise<void> {
    await this.ensureLoaded();
    const updatedSettings = { ...this.settings };
    // Non-secret fields can be updated directly
    if (newSettings.twilioAccountSid !== undefined) {
      updatedSettings.twilioAccountSid = newSettings.twilioAccountSid;
    }
    if (newSettings.twilioPhoneNumber !== undefined) {
      updatedSettings.twilioPhoneNumber = newSettings.twilioPhoneNumber;
    }
    if (newSettings.openaiAssistantId !== undefined) {
      updatedSettings.openaiAssistantId = newSettings.openaiAssistantId;
    }
    // Secret fields should only be updated if a new, non-empty value is provided
    if (newSettings.twilioAuthToken) {
      updatedSettings.twilioAuthToken = newSettings.twilioAuthToken;
    }
    if (newSettings.openaiApiKey) {
      updatedSettings.openaiApiKey = newSettings.openaiApiKey;
    }
    this.settings = updatedSettings;
    await this.persistSettings();
  }
  async setProcessingStatus(clientNumber: string, isProcessing: boolean): Promise<void> {
    this.processingStatus.set(clientNumber, isProcessing);
  }
  async getAnalytics(): Promise<{ totalConversations: number; totalLeads: number; conversionRate: number; recentLeads: Lead[] }> {
    await this.ensureLoaded();
    const totalConversations = this.conversations.size;
    const totalLeads = this.leads.size;
    const conversionRate = totalConversations > 0 ? (totalLeads / totalConversations) * 100 : 0;
    const recentLeads = Array.from(this.leads.values())
      .sort((a, b) => b.qualifiedAt - a.qualifiedAt)
      .slice(0, 5);
    return {
      totalConversations,
      totalLeads,
      conversionRate,
      recentLeads,
    };
  }
}