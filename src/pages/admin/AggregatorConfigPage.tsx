import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Alert, Modal } from '../../components/ui';
import { Webhook, Key, RefreshCw, CheckCircle, AlertTriangle, Globe, Shield } from 'lucide-react';

export function AggregatorConfigPage() {
  const { addToast } = useStore();
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const providers = [
    {
      id: 'yapily',
      name: 'Yapily',
      status: 'active' as const,
      apiKey: 'ypl_live_k8x2mN3pQ7rS9wT4',
      webhookUrl: 'https://api.dentaltax.co.uk/webhooks/yapily',
      lastSync: '2025-01-15T10:30:00Z',
      banksConnected: 12,
      transactionsLast30d: 2847,
    },
    {
      id: 'truelayer',
      name: 'TrueLayer',
      status: 'inactive' as const,
      apiKey: '',
      webhookUrl: '',
      lastSync: null,
      banksConnected: 0,
      transactionsLast30d: 0,
    },
    {
      id: 'plaid',
      name: 'Plaid',
      status: 'inactive' as const,
      apiKey: '',
      webhookUrl: '',
      lastSync: null,
      banksConnected: 0,
      transactionsLast30d: 0,
    },
  ];

  const handleTest = () => {
    setTestResult('testing');
    setTimeout(() => {
      setTestResult('success');
      addToast('Connection test passed', 'success');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aggregator Config</h1>
        <p className="text-gray-500 mt-1">Configure open banking aggregator providers and API keys.</p>
      </div>

      <Alert variant="info" className="mb-6">
        <Shield className="w-4 h-4 inline mr-1" />
        API keys are encrypted at rest. Webhook URLs must use HTTPS. Changes are audit-logged.
      </Alert>

      <div className="space-y-6">
        {providers.map(provider => (
          <Card key={provider.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${provider.status === 'active' ? 'bg-green-50' : 'bg-gray-100'}`}>
                  <Globe className={`w-5 h-5 ${provider.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                  <Chip variant={provider.status === 'active' ? 'success' : 'default'} dot size="sm">
                    {provider.status === 'active' ? 'Active' : 'Not Configured'}
                  </Chip>
                </div>
              </div>
              {provider.status === 'active' && (
                <div className="text-right text-sm text-gray-500">
                  <p>{provider.banksConnected} banks connected</p>
                  <p>{provider.transactionsLast30d.toLocaleString()} txns (30d)</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">API Key</label>
                <div className="flex gap-2">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={provider.apiKey || ''}
                    onChange={() => {}}
                    placeholder="Enter API key..."
                    className="flex-1 font-mono text-sm"
                  />
                  <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
                    <Key className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Webhook URL</label>
                <Input
                  value={provider.webhookUrl}
                  onChange={() => {}}
                  placeholder="https://..."
                  className="font-mono text-sm"
                  icon={<Webhook className="w-4 h-4" />}
                />
              </div>
            </div>

            {provider.status === 'active' && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={handleTest} disabled={testResult === 'testing'}>
                    {testResult === 'testing' ? (
                      <><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Testing...</>
                    ) : testResult === 'success' ? (
                      <><CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" /> Passed</>
                    ) : (
                      <><RefreshCw className="w-3.5 h-3.5 mr-1" /> Test Connection</>
                    )}
                  </Button>
                  <span className="text-xs text-gray-400">
                    Last sync: {provider.lastSync ? new Date(provider.lastSync).toLocaleString() : 'Never'}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => addToast('Configuration saved', 'success')}>
                  Save Changes
                </Button>
              </div>
            )}

            {provider.status === 'inactive' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => addToast('Provider configured (demo)', 'success')}>
                  Enable Provider
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
