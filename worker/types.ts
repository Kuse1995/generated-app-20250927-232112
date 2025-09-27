export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}
export interface MCPResult {
  content: string;
}
export interface ErrorResult {
  error: string;
}
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
  // New state for OpenAI Assistant integration
  threadId?: string;
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}
// New types for ConnectFlow
export interface Conversation {
  id: string; // Corresponds to client phone number
  clientNumber: string;
  lastMessage: string;
  timestamp: number;
  isLead: boolean;
  messages: {
    id: string;
    sender: 'client' | 'ai';
    content: string;
    timestamp: string;
  }[];
}
export interface Lead {
  clientNumber: string;
  qualifiedAt: number;
  details: string;
}