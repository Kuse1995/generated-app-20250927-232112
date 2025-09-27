import type { Env } from './core-utils';
import { getAppController } from './core-utils';
export type ToolResult = { success: boolean } | { error: string };
const toolDefinitions = [
  {
    type: 'function' as const,
    function: {
      name: 'mark_as_lead',
      description: 'Flags a client as a "hot lead" when they express clear intent to purchase or pay for a service. This should be called when the user says something like "I want to buy", "send me the payment link", "I\'m ready to pay", etc.',
      parameters: {
        type: 'object',
        properties: {
          clientNumber: {
            type: 'string',
            description: 'The phone number of the client who is now a lead. E.g., "+15551234567"',
          },
          details: {
            type: 'string',
            description: 'A brief summary of why the client is a lead, including which package they are interested in. E.g., "Client wants to subscribe to the Pro package."',
          },
        },
        required: ['clientNumber', 'details'],
      },
    },
  },
];
export function getToolDefinitions() {
  return toolDefinitions;
}
export async function executeTool(name: string, args: Record<string, unknown>, env: Env): Promise<ToolResult> {
  try {
    switch (name) {
      case 'mark_as_lead': {
        const clientNumber = args.clientNumber as string;
        const details = args.details as string;
        if (!clientNumber || !details) {
          return { error: 'Missing clientNumber or details for mark_as_lead tool.' };
        }
        const controller = getAppController(env);
        await controller.markAsLead(clientNumber, details);
        return { success: true };
      }
      default:
        return { error: `Tool "${name}" not found.` };
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return { error: error instanceof Error ? error.message : 'Unknown error during tool execution.' };
  }
}