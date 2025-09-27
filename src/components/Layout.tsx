import React from 'react';
import { Sidebar } from './Sidebar';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';
import { Conversation } from '@/lib/types';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
type View = 'Dashboard' | 'Leads' | 'Settings' | 'Analytics';
interface LayoutProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  activeView: View;
  setActiveView: (view: View) => void;
  settingsView: React.ReactNode;
  analyticsView: React.ReactNode;
}
export function Layout({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading,
  activeView,
  setActiveView,
  settingsView,
  analyticsView,
}: LayoutProps) {
  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
  };
  const filteredConversations = activeView === 'Leads'
    ? conversations.filter(c => c.isLead)
    : conversations;
  React.useEffect(() => {
    if (selectedConversation && !filteredConversations.find(c => c.id === selectedConversation.id)) {
      onSelectConversation('');
    }
  }, [activeView, conversations, selectedConversation, onSelectConversation, filteredConversations]);
  const renderMainContent = () => {
    switch (activeView) {
      case 'Settings':
        return settingsView;
      case 'Analytics':
        return analyticsView;
      default:
        return (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id || null}
                onSelectConversation={handleSelectConversation}
                isLoading={isLoading}
                activeView={activeView as 'Dashboard' | 'Leads'}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
              <ChatView conversation={selectedConversation} />
            </ResizablePanel>
          </ResizablePanelGroup>
        );
    }
  };
  return (
    <div className="h-screen w-screen bg-white dark:bg-slate-950 flex text-slate-900 dark:text-slate-50 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <h1 className="text-2xl font-bold">ConnectFlow</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-Powered WhatsApp Lead Conversion</p>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}