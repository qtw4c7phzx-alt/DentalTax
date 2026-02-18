import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Select, Tabs, Modal, Pagination } from '../../components/ui';
import { Search, FileText, Eye, Pencil, Trash2, Tag, Filter } from 'lucide-react';
import { format } from 'date-fns';
import type { Document, DocumentStatus } from '../../types';

const DOC_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Purchase Invoice', value: 'purchase_invoice' },
  { label: 'Sales Invoice', value: 'sales_invoice' },
  { label: 'Receipt', value: 'receipt' },
  { label: 'Bank Statement', value: 'bank_statement' },
  { label: 'Payslip', value: 'payslip' },
  { label: 'HMRC Letter', value: 'hmrc_letter' },
  { label: 'Other', value: 'other' },
];

export function AdminDocumentsPage() {
  const { documents, tenants, envelopes, updateDocument, deleteDocument, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [editType, setEditType] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const perPage = 15;

  const getTenantName = (docId: string) => {
    const env = envelopes.find(e => e.id === documents.find(d => d.id === docId)?.envelopeId);
    const t = tenants.find(t => t.id === env?.tenantId);
    return t?.name || 'Unknown';
  };

  const getEnvLabel = (envId: string) => {
    const env = envelopes.find(e => e.id === envId);
    return env ? env.label : 'Unknown';
  };

  let filtered = documents.filter(d => {
    if (search && !(d.originalName || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && d.type !== typeFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const statusTabs = [
    { id: '', label: 'All', count: documents.length },
    { id: 'pending', label: 'Pending', count: documents.filter(d => d.status === 'pending').length },
    { id: 'classified', label: 'Classified', count: documents.filter(d => d.status === 'classified').length },
    { id: 'matched', label: 'Matched', count: documents.filter(d => d.status === 'matched').length },
    { id: 'excluded', label: 'Excluded', count: documents.filter(d => d.status === 'excluded').length },
  ];

  const handleSaveEdit = () => {
    if (!editDoc) return;
    updateDocument(editDoc.id, {
      type: editType as Document['type'],
      amount: editAmount ? parseFloat(editAmount) : editDoc.amount,
      status: 'classified' as DocumentStatus,
    });
    addToast('Document updated', 'success');
    setEditDoc(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Classify and manage documents across all tenants.</p>
      </div>

      <Tabs
        tabs={statusTabs}
        activeId={statusFilter}
        onChange={(id) => { setStatusFilter(id); setPage(1); }}
      />

      <div className="flex items-center gap-3 mt-4 mb-4">
        <Input placeholder="Search documents..." icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} className="flex-1 max-w-sm" />
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={DOC_TYPE_OPTIONS} className="w-48" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tenant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Envelope</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uploaded</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(doc => (
                <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{doc.originalName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getTenantName(doc.id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getEnvLabel(doc.envelopeId)}</td>
                  <td className="px-4 py-3">
                    <Chip variant="default" size="sm">{(doc.type || 'unclassified').replace(/_/g, ' ')}</Chip>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.amount ? `£${doc.amount.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">
                    <DocStatusChip status={doc.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{format(new Date(doc.uploadedAt), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditDoc(doc); setEditType(doc.type || ''); setEditAmount(doc.amount?.toString() || ''); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { deleteDocument(doc.id); addToast('Document deleted', 'info'); }}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
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

      {/* Edit modal */}
      <Modal open={!!editDoc} onClose={() => setEditDoc(null)} title="Classify Document" footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditDoc(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </div>
      }>
        {editDoc && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{editDoc.originalName}</div>
            <Select label="Document Type" value={editType} onChange={e => setEditType(e.target.value)} options={DOC_TYPE_OPTIONS.filter(o => o.value)} />
            <Input label="Amount (£)" type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
          </div>
        )}
      </Modal>
    </div>
  );
}

function DocStatusChip({ status }: { status: DocumentStatus }) {
  const map: Record<DocumentStatus, { variant: 'success' | 'warning' | 'info' | 'error' | 'default'; label: string }> = {
    new: { variant: 'info', label: 'New' },
    pending: { variant: 'warning', label: 'Pending' },
    classified: { variant: 'info', label: 'Classified' },
    linked: { variant: 'success', label: 'Linked' },
    matched: { variant: 'success', label: 'Matched' },
    needs_info: { variant: 'warning', label: 'Needs Info' },
    archived: { variant: 'default', label: 'Archived' },
    excluded: { variant: 'default', label: 'Excluded' },
    duplicate: { variant: 'error', label: 'Duplicate' },
  };
  const m = map[status] || { variant: 'default' as const, label: status };
  return <Chip variant={m.variant} size="sm" dot>{m.label}</Chip>;
}
