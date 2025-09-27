import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { getConversations } from '@/lib/api';
import { Conversation } from '@/lib/types';
import { Toaster } from '@/components/ui/sonner';
import { SettingsPage } from './SettingsPage';
import { AnalyticsPage } from './AnalyticsPage';
type View = 'Dashboard' | 'Leads' | 'Settings' | 'Analytics';
export function HomePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const fetchConversations = useCallback(async () => {
    // Only set loading state on initial fetch, not for polling
    if (isLoading) setIsLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0) {
        if (!selectedConversationId || !data.some(c => c.id === selectedConversationId)) {
          if (isLoading) {
            setSelectedConversationId(data[0].id);
          }
        }
      } else if (data.length === 0) {
        setSelectedConversationId(null);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [selectedConversationId, isLoading]);
  useEffect(() => {
    fetchConversations(); // Initial fetch
    const intervalId = setInterval(fetchConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [fetchConversations]);
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };
  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;
  return (
    <>
      <Layout
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        isLoading={isLoading}
        activeView={activeView}
        setActiveView={setActiveView}
        settingsView={<SettingsPage />}
        analyticsView={<AnalyticsPage />}
      />
      <Toaster richColors position="top-right" />
    </>
  );
}