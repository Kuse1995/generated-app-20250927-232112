import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ApiSettings } from '@/lib/types';
import { Loader2, Copy, Link } from 'lucide-react';
export function SettingsPage() {
  const [settings, setSettings] = useState<ApiSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/settings');
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        } else {
          toast.error('Failed to load settings.');
        }
      } catch (error) {
        toast.error('An error occurred while fetching settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
    setWebhookUrl(`${window.location.origin}/api/twilio/whatsapp`);
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings.');
      }
    } catch (error) {
      toast.error('An error occurred while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard!');
  };
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Configure your API credentials and webhook URL.</p>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Link className="h-5 w-5" />Twilio Webhook URL</CardTitle>
              <CardDescription>
                Use this URL in your Twilio console for the "A MESSAGE COMES IN" webhook.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input id="webhookUrl" value={webhookUrl} readOnly className="bg-slate-100 dark:bg-slate-800" />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Twilio Configuration</CardTitle>
              <CardDescription>Enter your Twilio Account SID, Auth Token, and WhatsApp phone number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twilioAccountSid">Account SID</Label>
                <Input id="twilioAccountSid" name="twilioAccountSid" value={settings.twilioAccountSid || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilioAuthToken">Auth Token</Label>
                <Input id="twilioAuthToken" name="twilioAuthToken" type="password" placeholder="Enter new token to update" onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilioPhoneNumber">Twilio WhatsApp Number</Label>
                <Input id="twilioPhoneNumber" name="twilioPhoneNumber" placeholder="e.g., +14155238886" value={settings.twilioPhoneNumber || ''} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>OpenAI Configuration</CardTitle>
              <CardDescription>Enter your OpenAI API Key and Assistant ID.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">API Key</Label>
                <Input id="openaiApiKey" name="openaiApiKey" type="password" placeholder="Enter new key to update" onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="openaiAssistantId">Assistant ID</Label>
                <Input id="openaiAssistantId" name="openaiAssistantId" placeholder="e.g., asst_..." value={settings.openaiAssistantId || ''} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}