import { Conversation } from './types';
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await fetch('/api/conversations');
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      // The backend returns timestamps as numbers, frontend expects strings for display
      return result.data.map((convo: any) => ({
        ...convo,
        timestamp: new Date(convo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    }
    console.error("API response was not successful or data is not an array:", result);
    return [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};