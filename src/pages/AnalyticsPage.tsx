import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, BarChart3, Users, Target, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { AnalyticsData } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/analytics');
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          toast.error('Failed to load analytics data.');
        }
      } catch (error) {
        toast.error('An error occurred while fetching analytics data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        Could not load analytics data.
      </div>
    );
  }
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Performance metrics for the AI assistant.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalConversations}</div>
              <p className="text-xs text-muted-foreground">Total number of unique clients engaged.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalLeads}</div>
              <p className="text-xs text-muted-foreground">Clients ready to make a purchase.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Percentage of conversations converted to leads.</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Number</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Qualified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentLeads.length > 0 ? (
                    data.recentLeads.map((lead) => (
                      <TableRow key={lead.clientNumber}>
                        <TableCell className="font-medium">{lead.clientNumber}</TableCell>
                        <TableCell>{lead.details}</TableCell>
                        <TableCell className="text-right">
                          {formatDistanceToNow(new Date(lead.qualifiedAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No recent leads.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <footer className="text-center text-sm text-slate-400 mt-8">
          Built with ❤️ at Cloudflare
        </footer>
      </div>
    </div>
  );
}