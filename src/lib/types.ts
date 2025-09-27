export interface Message {
  id: string;
  sender: 'client' | 'ai';
  content: string;
  timestamp: string;
}
export interface Conversation {
  id: string;
  clientNumber: string;
  lastMessage: string;
  timestamp: string;
  isLead: boolean;
  messages: Message[];
  isProcessing?: boolean;
}
export interface ApiSettings {
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  openaiApiKey?: string;
  openaiAssistantId?: string;
}
export interface AnalyticsData {
  totalConversations: number;
  totalLeads: number;
  conversionRate: number;
  recentLeads: {
    clientNumber: string;
    qualifiedAt: number;
    details: string;
  }[];
}