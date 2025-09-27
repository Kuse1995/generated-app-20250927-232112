import { MessageSquare, Tag, Settings, Bot, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
type View = 'Dashboard' | 'Leads' | 'Settings' | 'Analytics';
interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}
const navItems = [
  { name: 'Dashboard', icon: MessageSquare, view: 'Dashboard' as const },
  { name: 'Leads', icon: Tag, view: 'Leads' as const },
  { name: 'Analytics', icon: BarChart3, view: 'Analytics' as const },
  { name: 'Settings', icon: Settings, view: 'Settings' as const },
];
export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-16 flex flex-col items-center bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-4 space-y-4">
      <div className="p-2 rounded-lg bg-slate-800 dark:bg-slate-200 text-slate-50 dark:text-slate-900 mb-4">
        <Bot className="h-6 w-6" />
      </div>
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col items-center space-y-2">
          {navItems.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'rounded-lg h-10 w-10 transition-all duration-200 ease-in-out',
                    'hover:bg-slate-200 dark:hover:bg-slate-700',
                    activeView === item.view
                      ? 'bg-slate-800 text-slate-50 dark:bg-slate-50 dark:text-slate-900'
                      : 'text-slate-500'
                  )}
                  onClick={() => setActiveView(item.view)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.name}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-slate-50 dark:bg-slate-50 dark:text-slate-900 border-none">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}