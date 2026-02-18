import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Chip, Modal, Tabs, Alert, Input, Select, StatCard } from '../../components/ui';
import {
  Landmark, RefreshCw, AlertTriangle, Check, ExternalLink,
  Search, Filter, Link2, Split, MessageCircle, ArrowUpRight,
  ArrowDownRight, Clock, Shield, X,
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const providers = [
  { value: 'truelayer', label: 'TrueLayer' },
  { value: 'yapily', label: 'Yapily' },
  { value: 'tink', label: 'Tink' },
  { value: 'plaid', label: 'Plaid' },
  { value: 'salt_edge', label: 'Salt Edge' },
];

export function BankingPage() {
  const { bankAccounts, transactions, documents, addToast } = useStore();
  const tenantAccounts = bankAccounts.filter(b => b.tenantId === 'tenant-brightsmile');
  const tenantTxns = transactions.filter(t => t.tenantId === 'tenant-brightsmile');

  const [activeTab, setActiveTab] = useState('accounts');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [txnSearch, setTxnSearch] = useState('');
  const [txnFilter, setTxnFilter] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('truelayer');

  const selectedTxn = tenantTxns.find(t => t.id === selectedTxnId);

  const filteredTxns = tenantTxns
    .filter(t => txnFilter === 'all' || t.status === txnFilter)
    .filter(t =>
      !txnSearch ||
      t.description.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.reference?.toLowerCase().includes(txnSearch.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const unmatchedCount = tenantTxns.filter(t => t.status === 'unmatched').length;
  const matchedCount = tenantTxns.filter(t => t.status === 'matched').length;

  const handleMatch = (docId: string) => {
    if (selectedTxn) {
      const { updateTransactionStatus, addMatch } = useStore.getState();
      updateTransactionStatus(selectedTxn.id, 'matched', [...selectedTxn.matchedDocumentIds, docId]);
      addMatch({
        id: `match-${Date.now()}`,
        tenantId: 'tenant-brightsmile',
        transactionId: selectedTxn.id,
        documentId: docId,
        matchedBy: 'user',
        matchedAt: new Date().toISOString(),
        confidence: 95,
        isSplit: false,
      });
      addToast({ type: 'success', title: 'Transaction matched', message: 'Document linked to transaction' });
      setShowMatchModal(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banking</h1>
          <p className="text-gray-500 mt-1">Manage bank connections and match transactions to documents.</p>
        </div>
        <Button icon={<Landmark className="w-4 h-4" />} onClick={() => setShowConnectModal(true)}>
          Connect Bank
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Accounts" value={tenantAccounts.length} icon={<Landmark className="w-5 h-5" />} />
        <StatCard label="Total Transactions" value={tenantTxns.length} />
        <StatCard label="Matched" value={matchedCount} />
        <StatCard label="Unmatched" value={unmatchedCount} />
      </div>

      <Tabs
        tabs={[
          { key: 'accounts', label: 'Bank Accounts', count: tenantAccounts.length },
          { key: 'transactions', label: 'Transactions', count: tenantTxns.length },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'accounts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantAccounts.map(account => (
              <Card key={account.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{account.accountName}</h3>
                    <p className="text-xs text-gray-500">{account.bankName} · {account.accountNumber} · {account.sortCode}</p>
                  </div>
                  <Chip
                    variant={account.consentStatus === 'active' ? 'success' : account.consentStatus === 'expired' ? 'warning' : 'error'}
                    dot
                  >
                    {account.consentStatus === 'active' ? 'Connected' : account.consentStatus === 'expired' ? 'Expired' : 'Error'}
                  </Chip>
                </div>

                <p className="text-3xl font-bold text-gray-900 mb-3">
                  £{account.balance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </p>

                {/* Feed health */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last sync</span>
                    <span className="text-gray-900 font-medium">
                      {account.lastSyncAt ? format(new Date(account.lastSyncAt), 'dd MMM yyyy HH:mm') : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Consent expires</span>
                    <span className="text-gray-900 font-medium">
                      {account.consentExpiresAt ? format(new Date(account.consentExpiresAt), 'dd MMM yyyy') : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Provider</span>
                    <span className="text-gray-900 font-medium capitalize">{account.provider.replace('_', ' ')}</span>
                  </div>
                </div>

                {account.errorMessage && (
                  <Alert variant="warning">{account.errorMessage}</Alert>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => addToast({ type: 'success', title: 'Sync complete', message: 'Bank feed refreshed' })}
                  >
                    Sync Now
                  </Button>
                  {account.consentStatus !== 'active' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                      onClick={() => addToast({ type: 'info', title: 'Redirecting', message: 'Opening bank authorisation...' })}
                    >
                      Re-consent
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <Input
                placeholder="Search transactions..."
                icon={<Search className="w-4 h-4" />}
                value={txnSearch}
                onChange={e => setTxnSearch(e.target.value)}
                className="flex-1 max-w-sm"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'unmatched', label: 'Unmatched' },
                  { value: 'matched', label: 'Matched' },
                  { value: 'split', label: 'Split' },
                  { value: 'needs_info', label: 'Needs Info' },
                ]}
                value={txnFilter}
                onChange={e => setTxnFilter(e.target.value)}
              />
            </div>

            {/* Transactions table */}
            <Card padding={false}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.slice(0, 30).map(txn => (
                      <tr key={txn.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {format(new Date(txn.date), 'dd MMM yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{txn.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{txn.reference || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={clsx('text-sm font-semibold flex items-center justify-end gap-1', txn.amount >= 0 ? 'text-success-600' : 'text-gray-900')}>
                            {txn.amount >= 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            £{Math.abs(txn.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <TxnStatusChip status={txn.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {txn.status === 'unmatched' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Link2 className="w-3.5 h-3.5" />}
                                onClick={() => { setSelectedTxnId(txn.id); setShowMatchModal(true); }}
                              >
                                Match
                              </Button>
                            )}
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                              title="Create ticket"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Connect Bank Modal */}
      <Modal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        title="Connect a Bank Account"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConnectModal(false)}>Cancel</Button>
            <Button onClick={() => { setShowConnectModal(false); addToast({ type: 'info', title: 'Redirecting to bank...', message: 'You\'ll be asked to authorise access.' }); }}>
              Continue to Bank
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            We use Open Banking to securely connect to your bank. Choose a provider below:
          </p>
          <Select
            label="Aggregator Provider"
            options={providers}
            value={selectedProvider}
            onChange={e => setSelectedProvider(e.target.value)}
          />
          <Alert variant="info">
            Your bank will ask you to authorise DentalTax to read your transactions.
            We never see your login credentials.
          </Alert>
          <div className="grid grid-cols-2 gap-3">
            {['Barclays', 'HSBC', 'Lloyds', 'NatWest', 'Santander', 'Metro Bank'].map(bank => (
              <button
                key={bank}
                className="p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-sm font-medium text-gray-700 transition-colors cursor-pointer"
              >
                {bank}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Match Transaction Modal */}
      <Modal
        open={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        title="Match Transaction"
        size="lg"
      >
        {selectedTxn && (
          <div className="space-y-4">
            <Card className="!bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedTxn.description}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(selectedTxn.date), 'dd MMM yyyy')} · Ref: {selectedTxn.reference || '—'}
                  </p>
                </div>
                <span className={clsx('text-lg font-bold', selectedTxn.amount >= 0 ? 'text-success-600' : 'text-gray-900')}>
                  {selectedTxn.amount >= 0 ? '+' : '-'}£{Math.abs(selectedTxn.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </Card>

            <h4 className="text-sm font-semibold text-gray-900">Suggested Documents</h4>
            <div className="space-y-2">
              {documents
                .filter(d => d.tenantId === 'tenant-brightsmile' && d.status !== 'archived')
                .slice(0, 5)
                .map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {doc.supplier || 'Unknown'} · {doc.amount ? `£${doc.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '—'}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => handleMatch(doc.id)}>
                      Link
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function TxnStatusChip({ status }: { status: string }) {
  const config: Record<string, { variant: 'success' | 'primary' | 'warning' | 'error' | 'default' | 'info'; label: string }> = {
    unmatched: { variant: 'warning', label: 'Unmatched' },
    matched: { variant: 'success', label: 'Matched' },
    split: { variant: 'info', label: 'Split' },
    needs_info: { variant: 'error', label: 'Needs Info' },
  };
  const c = config[status] || config.unmatched;
  return <Chip variant={c.variant} size="sm" dot>{c.label}</Chip>;
}
