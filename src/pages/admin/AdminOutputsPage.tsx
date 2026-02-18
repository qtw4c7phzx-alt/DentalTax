import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Chip, Select, Modal, Input, Tabs } from '../../components/ui';
import { FileSpreadsheet, FileText, Download, Send, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import type { Output, OutputType } from '../../types';

const OUTPUT_TYPES: { label: string; value: OutputType }[] = [
  { label: 'VAT Return', value: 'vat_return' },
  { label: 'P&L', value: 'profit_and_loss' },
  { label: 'Balance Sheet', value: 'balance_sheet' },
  { label: 'CT600 Draft', value: 'ct600_draft' },
  { label: 'SA100 Draft', value: 'sa100_draft' },
  { label: 'Management Accounts', value: 'management_accounts' },
];

export function AdminOutputsPage() {
  const { outputs, envelopes, tenants, users, addOutput, publishOutput, addToast, currentUser } = useStore();
  const [tab, setTab] = useState('');
  const [creating, setCreating] = useState(false);
  const [newEnvelopeId, setNewEnvelopeId] = useState('');
  const [newType, setNewType] = useState<OutputType>('vat_return');
  const [newNotes, setNewNotes] = useState('');

  const tabs = [
    { id: '', label: 'All', count: outputs.length },
    { id: 'draft', label: 'Drafts', count: outputs.filter(o => o.status === 'draft').length },
    { id: 'published', label: 'Published', count: outputs.filter(o => o.status === 'published').length },
  ];

  const filtered = tab ? outputs.filter(o => o.status === tab) : outputs;

  const getEnvLabel = (envId: string) => {
    const env = envelopes.find(e => e.id === envId);
    if (!env) return 'Unknown';
    const t = tenants.find(t => t.id === env.tenantId);
    return `${t?.name || '?'} – ${env.label}`;
  };

  const handleCreate = () => {
    if (!newEnvelopeId) return;
    addOutput({
      id: uuid(),
      envelopeId: newEnvelopeId,
      type: newType,
      status: 'draft',
      version: 1,
      fileUrl: '#',
      preparedBy: currentUser?.id || '',
      notes: newNotes,
      createdAt: new Date().toISOString(),
    });
    addToast('Output created as draft', 'success');
    setCreating(false);
    setNewNotes('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outputs</h1>
          <p className="text-gray-500 mt-1">Create, review, and publish financial outputs.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-1" /> Create Output</Button>
      </div>

      <Tabs tabs={tabs} activeId={tab} onChange={setTab} />

      <div className="mt-4 grid gap-4">
        {filtered.map(output => {
          const preparer = users.find(u => u.id === output.preparedBy);
          return (
            <Card key={output.id} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    {output.type.includes('vat') || output.type.includes('ct600') || output.type.includes('sa100') ? (
                      <FileText className="w-5 h-5 text-primary-600" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{output.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="text-xs text-gray-500">{getEnvLabel(output.envelopeId)} · v{output.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <p className="text-xs text-gray-500">By {preparer?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{format(new Date(output.createdAt || Date.now()), 'dd MMM yyyy')}</p>
                  </div>
                  <Chip variant={output.status === 'published' ? 'success' : 'warning'} dot>
                    {output.status === 'published' ? 'Published' : 'Draft'}
                  </Chip>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm"><Download className="w-3.5 h-3.5" /></Button>
                    {output.status === 'draft' && (
                      <Button size="sm" onClick={() => { publishOutput(output.id); addToast('Output published to client', 'success'); }}>
                        <Send className="w-3.5 h-3.5 mr-1" /> Publish
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {output.notes && <p className="text-xs text-gray-500 mt-2 pl-13">{output.notes}</p>}
            </Card>
          );
        })}
      </div>

      {/* Create modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Create Output" footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!newEnvelopeId}>Create Draft</Button>
        </div>
      }>
        <div className="space-y-4">
          <Select label="Envelope" value={newEnvelopeId} onChange={e => setNewEnvelopeId(e.target.value)}
            options={[{ label: 'Select envelope...', value: '' }, ...envelopes.filter(e => e.state === 'in_review' || e.state === 'sealed').map(e => ({
              label: getEnvLabel(e.id), value: e.id,
            }))]} />
          <Select label="Output Type" value={newType} onChange={e => setNewType(e.target.value as OutputType)}
            options={OUTPUT_TYPES} />
          <Input label="Notes (optional)" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
