import { Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox, Tag } from 'lucide-react';
interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  activeView: 'Dashboard' | 'Leads';
}
export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  activeView,
}: ConversationListProps) {
  const filteredConversations = activeView === 'Leads'
    ? conversations.filter(c => c.isLead)
    : conversations;
  const renderSkeletons = () => (
    Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-start space-x-4 p-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))
  );
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-500 dark:text-slate-400">
      {activeView === 'Dashboard' ? (
        <>
          <Inbox className="h-12 w-12 mb-4" />
          <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">No Conversations Yet</h3>
          <p className="text-sm">New conversations from WhatsApp will appear here.</p>
        </>
      ) : (
        <>
          <Tag className="h-12 w-12 mb-4" />
          <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">No Leads Found</h3>
          <p className="text-sm">Qualified leads will be shown in this view.</p>
        </>
      )}
    </div>
  );
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{activeView}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filteredConversations.length} conversation{filteredConversations.length !== 1 && 's'}
        </p>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? renderSkeletons() : (
          filteredConversations.length > 0 ? (
            <div>
              {filteredConversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => onSelectConversation(convo.id)}
                  className={cn(
                    'w-full text-left p-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
                    selectedConversationId === convo.id
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{convo.clientNumber}</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{convo.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{convo.lastMessage}</p>
                  {convo.isLead && (
                    <Badge variant="default" className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                      Lead
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <EmptyState />
          )
        )}
      </ScrollArea>
    </div>
  );
}