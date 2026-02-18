import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Chip, Alert } from '../../components/ui';
import { Landmark, RefreshCw, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export function TenantBankPage() {
  const { bankAccounts, tenants, currentUser, addToast } = useStore();

  const tenantId = currentUser?.tenantId || tenants[0]?.id;
  const tenant = tenants.find(t => t.id === tenantId);
  const accounts = bankAccounts.filter(a => a.tenantId === tenantId);

  const handleReConsent = () => {
    addToast('Redirecting to bank for re-consent... (demo)', 'info');
  };

  const handleConnect = () => {
    addToast('Opening bank connection flow... (demo)', 'info');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Connections</h1>
          <p className="text-gray-500 mt-1">Manage open banking connections for {tenant?.name || 'your practice'}.</p>
        </div>
        <Button onClick={handleConnect}>
          <Landmark className="w-4 h-4 mr-1" /> Connect Bank
        </Button>
      </div>

      <Alert variant="info" className="mb-6">
        <Shield className="w-4 h-4 inline mr-1" />
        Bank connections use FCA-regulated open banking. Your credentials are never stored by DentalTax.
      </Alert>

      <div className="space-y-4">
        {accounts.map(account => (
          <Card key={account.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  account.consentStatus === 'active' ? 'bg-green-50' : 'bg-amber-50'
                }`}>
                  <Landmark className={`w-6 h-6 ${
                    account.consentStatus === 'active' ? 'text-green-600' : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{account.accountName}</h3>
                  <p className="text-sm text-gray-500">{account.bankName} · {account.sortCode} · {account.accountNumber}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip variant={account.consentStatus === 'active' ? 'success' : 'error'} size="sm" dot>
                      {account.consentStatus === 'active' ? 'Connected' :
                       account.consentStatus === 'expired' ? 'Expired' : 'Revoked'}
                    </Chip>
                    <span className="text-xs text-gray-400">
                      via {account.provider} · Consent expires {format(new Date(account.consentExpiresAt), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  £{account.balance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">
                  Last synced {format(new Date(account.lastSyncedAt || Date.now()), 'dd MMM · HH:mm')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addToast('Syncing transactions... (demo)', 'info')}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Sync Now
                </Button>
                {account.consentStatus !== 'active' && (
                  <Button size="sm" onClick={handleReConsent}>
                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Re-consent
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => addToast('Connection removed (demo)', 'info')}>
                Disconnect
              </Button>
            </div>

            {account.consentStatus !== 'active' && (
              <Alert variant="warning" className="mt-3">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Bank consent has {account.consentStatus}. Transaction sync is paused. Please re-consent to continue.
              </Alert>
            )}
          </Card>
        ))}

        {accounts.length === 0 && (
          <Card className="text-center py-12">
            <Landmark className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Banks Connected</h3>
            <p className="text-gray-500 mb-4">Connect your practice bank account to automatically import transactions.</p>
            <Button onClick={handleConnect}>Connect Bank</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
