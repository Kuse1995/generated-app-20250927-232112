import { Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bot, User, CornerDownLeft, MessageSquare, Copy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
interface ChatViewProps {
  conversation: Conversation | null;
}
const TypingIndicator = () => (
  <div className="flex items-end gap-3 justify-start">
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-slate-800 text-slate-50 dark:bg-slate-200 dark:text-slate-900">
        <Bot className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    <Card className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none">
      <div className="flex items-center justify-center space-x-1 p-1">
        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
      </div>
    </Card>
  </div>
);
export function ChatView({ conversation }: ChatViewProps) {
  const handleCopyNumber = () => {
    if (conversation?.clientNumber) {
      navigator.clipboard.writeText(conversation.clientNumber);
      toast.success('Client number copied to clipboard!');
    }
  };
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12" />
          <h3 className="mt-2 text-lg font-medium">Select a conversation</h3>
          <p className="mt-1 text-sm">Choose a conversation from the list to see the messages.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
      <header className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{conversation.clientNumber}</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" onClick={handleCopyNumber}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {conversation.isLead && <p className="text-sm text-emerald-500 font-medium">Qualified Lead</p>}
        </div>
      </header>
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-6">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex items-end gap-3', message.sender === 'client' ? 'justify-end' : 'justify-start')}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-800 text-slate-50 dark:bg-slate-200 dark:text-slate-900">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col space-y-1 max-w-xs md:max-w-md lg:max-w-lg">
                <Card
                  className={cn(
                    'p-3 rounded-2xl shadow-sm',
                    message.sender === 'client'
                      ? 'bg-slate-800 text-slate-50 rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  )}
                >
                  <CardContent className="p-0 text-base">
                    <p>{message.content}</p>
                  </CardContent>
                </Card>
                <span className={cn("text-xs text-slate-400", message.sender === 'client' ? 'text-right' : 'text-left')}>
                  {format(parseISO(message.timestamp), 'p')}
                </span>
              </div>
              {message.sender === 'client' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {conversation.isProcessing && <TypingIndicator />}
        </div>
      </ScrollArea>
      <footer className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="relative">
          <Input placeholder="The AI is handling this conversation..." className="pr-12" disabled />
          <Button size="icon" variant="ghost" className="absolute top-1/2 right-2 -translate-y-1/2" disabled>
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}