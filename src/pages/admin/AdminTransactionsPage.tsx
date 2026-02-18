import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Select, Tabs, Modal, Pagination } from '../../components/ui';
import { Search, ArrowLeftRight, Link2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import type { TransactionStatus } from '../../types';

export function AdminTransactionsPage() {
  const { bankTransactions, bankAccounts, tenants, documents, updateTransactionStatus, addMatch, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [matchingTxId, setMatchingTxId] = useState<string | null>(null);
  const perPage = 15;

  const getAccountLabel = (accountId: string) => {
    const acc = bankAccounts.find(a => a.id === accountId);
    if (!acc) return 'Unknown';
    const t = tenants.find(t => t.id === acc.tenantId);
    return `${t?.name || '?'} – ${acc.accountName}`;
  };

  const statusTabs = [
    { id: '', label: 'All', count: bankTransactions.length },
    { id: 'unmatched', label: 'Unmatched', count: bankTransactions.filter(t => t.status === 'unmatched').length },
    { id: 'suggested', label: 'Suggested', count: bankTransactions.filter(t => t.status === 'suggested').length },
    { id: 'matched', label: 'Matched', count: bankTransactions.filter(t => t.status === 'matched').length },
    { id: 'excluded', label: 'Excluded', count: bankTransactions.filter(t => t.status === 'excluded').length },
  ];

  let filtered = bankTransactions.filter(t => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const matchingTx = bankTransactions.find(t => t.id === matchingTxId);
  const matchableDocs = matchingTx
    ? documents.filter(d => d.status !== 'excluded' && d.status !== 'duplicate' && Math.abs((d.amount || 0) - Math.abs(matchingTx.amount)) < 5)
    : [];

  const handleMatch = (docId: string) => {
    if (!matchingTx) return;
    addMatch({ id: uuid(), tenantId: matchingTx.tenantId, transactionId: matchingTx.id, documentId: docId, confidence: 0.95, status: 'confirmed', matchedBy: 'admin', matchedAt: new Date().toISOString(), isSplit: false });
    updateTransactionStatus(matchingTx.id, 'matched');
    addToast('Transaction matched', 'success');
    setMatchingTxId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-1">Match bank transactions to documents across all tenants.</p>
      </div>

      <Tabs tabs={statusTabs} activeId={statusFilter} onChange={id => { setStatusFilter(id); setPage(1); }} />

      <div className="mt-4 mb-4">
        <Input placeholder="Search transactions..." icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Account</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(tx => (
                <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{format(new Date(tx.date), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate max-w-[250px]">{tx.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">{getAccountLabel(tx.bankAccountId)}</td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${tx.amount >= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount >= 0 ? '+' : ''}£{Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <TxStatusChip status={tx.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {tx.status !== 'matched' && tx.status !== 'excluded' && (
                        <Button variant="ghost" size="sm" onClick={() => setMatchingTxId(tx.id)}>
                          <Link2 className="w-3.5 h-3.5 mr-1" /> Match
                        </Button>
                      )}
                      {tx.status !== 'excluded' && (
                        <Button variant="ghost" size="sm" onClick={() => { updateTransactionStatus(tx.id, 'excluded'); addToast('Transaction excluded', 'info'); }}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {/* Match modal */}
      <Modal open={!!matchingTx} onClose={() => setMatchingTxId(null)} title="Match Transaction">
        {matchingTx && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">{matchingTx.description}</p>
              <p className="text-xs text-gray-500 mt-1">£{Math.abs(matchingTx.amount).toFixed(2)} · {format(new Date(matchingTx.date), 'dd MMM yyyy')}</p>
            </div>
            <h4 className="text-sm font-semibold">Suggested Documents (amount within £5)</h4>
            {matchableDocs.length === 0 ? (
              <p className="text-sm text-gray-500">No matching documents found.</p>
            ) : (
              <div className="space-y-2">
                {matchableDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300">
                    <div>
                      <p className="text-sm font-medium">{doc.originalName}</p>
                      <p className="text-xs text-gray-500">£{doc.amount?.toFixed(2)} · {(doc.type || 'unclassified').replace(/_/g, ' ')}</p>
                    </div>
                    <Button size="sm" onClick={() => handleMatch(doc.id)}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Match
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function TxStatusChip({ status }: { status: TransactionStatus }) {
  const map: Record<TransactionStatus, { variant: 'success' | 'warning' | 'info' | 'error' | 'default'; label: string }> = {
    unmatched: { variant: 'warning', label: 'Unmatched' },
    suggested: { variant: 'info', label: 'Suggested' },
    matched: { variant: 'success', label: 'Matched' },
    needs_info: { variant: 'warning', label: 'Needs Info' },
    excluded: { variant: 'default', label: 'Excluded' },
    split: { variant: 'info', label: 'Split' },
  };
  const m = map[status] || { variant: 'default' as const, label: status };
  return <Chip variant={m.variant} size="sm" dot>{m.label}</Chip>;
}
