import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, Settings } from "./core-utils";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    /**
     * Twilio WhatsApp Webhook
     * POST /api/twilio/whatsapp
     */
    app.post('/api/twilio/whatsapp', async (c) => {
        const controller = getAppController(c.env);
        const settings = await controller.getSettings();
        const {
            twilioAccountSid,
            twilioAuthToken,
            twilioPhoneNumber
        } = settings;
        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
            console.error('Twilio settings are not configured.');
            return c.text('Twilio settings are not configured.', 500);
        }
        const body = await c.req.parseBody();
        const messageBody = body['Body'] as string;
        const from = body['From'] as string; // e.g., 'whatsapp:+15551234567'
        if (!messageBody || !from) {
            return c.text('Missing message body or sender', 400);
        }
        const clientNumber = from.split(':')[1];
        try {
            await controller.setProcessingStatus(clientNumber, true);
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, clientNumber);
            const responseMessage = await agent.handleIncomingWhatsAppMessage(messageBody, clientNumber);
            if (responseMessage) {
                console.log(`Sending to ${from}: ${responseMessage}`);
                const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
                const requestBody = new URLSearchParams();
                requestBody.append('To', from);
                requestBody.append('From', `whatsapp:${twilioPhoneNumber}`);
                requestBody.append('Body', responseMessage);
                const authHeader = 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`);
                await fetch(twilioApiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: requestBody.toString(),
                });
            }
            c.header('Content-Type', 'text/xml');
            return c.body('<Response/>');
        } catch (error) {
            console.error('Webhook processing error:', error);
            return c.text(API_RESPONSES.INTERNAL_ERROR, 500);
        } finally {
            await controller.setProcessingStatus(clientNumber, false);
        }
    });
    /**
     * Get all conversations for the dashboard
     * GET /api/conversations
     */
    app.get('/api/conversations', async (c) => {
        try {
            const controller = getAppController(c.env);
            const conversations = await controller.listConversations();
            return c.json({ success: true, data: conversations });
        } catch (error) {
            console.error('Failed to list conversations:', error);
            return c.json({ success: false, error: 'Failed to retrieve conversations' }, { status: 500 });
        }
    });
    /**
     * Get application settings
     * GET /api/settings
     */
    app.get('/api/settings', async (c) => {
        try {
            const controller = getAppController(c.env);
            const settings = await controller.getSettings();
            // Omit sensitive keys before sending to client
            const { twilioAuthToken, openaiApiKey, ...clientSafeSettings } = settings;
            return c.json({ success: true, data: clientSafeSettings });
        } catch (error) {
            console.error('Failed to get settings:', error);
            return c.json({ success: false, error: 'Failed to retrieve settings' }, { status: 500 });
        }
    });
    /**
     * Update application settings
     * POST /api/settings
     */
    app.post('/api/settings', async (c) => {
        try {
            const body = await c.req.json<Settings>();
            const controller = getAppController(c.env);
            await controller.updateSettings(body);
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to update settings:', error);
            return c.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
        }
    });
    /**
     * Get analytics data
     * GET /api/analytics
     */
    app.get('/api/analytics', async (c) => {
        try {
            const controller = getAppController(c.env);
            const analytics = await controller.getAnalytics();
            return c.json({ success: true, data: analytics });
        } catch (error) {
            console.error('Failed to get analytics:', error);
            return c.json({ success: false, error: 'Failed to retrieve analytics' }, { status: 500 });
        }
    });
}
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}