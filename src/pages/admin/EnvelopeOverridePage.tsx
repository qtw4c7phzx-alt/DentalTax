import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Chip, Modal, Select, Alert, Input } from '../../components/ui';
import { Package, Unlock, RotateCcw, FastForward, Trash2, Search, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { EnvelopeState } from '../../types';

export function EnvelopeOverridePage() {
  const { envelopes, tenants, updateEnvelopeState, addAuditLogEntry, addToast, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ envId: string; action: string; newState: EnvelopeState } | null>(null);

  const filtered = envelopes.filter(e => {
    if (!search) return true;
    const t = tenants.find(t => t.id === e.tenantId);
    return e.label.toLowerCase().includes(search.toLowerCase()) || t?.name.toLowerCase().includes(search.toLowerCase());
  });

  const stateColors: Record<EnvelopeState, string> = {
    open: 'info',
    sealed: 'warning',
    in_review: 'info',
    clarification_needed: 'error',
    closed: 'success',
  };

  const overrideActions: { label: string; icon: React.ReactNode; action: string; from: EnvelopeState[]; to: EnvelopeState; variant: string }[] = [
    { label: 'Unseal', icon: <Unlock className="w-3.5 h-3.5" />, action: 'unseal', from: ['sealed', 'in_review'], to: 'open', variant: 'warning' },
    { label: 'Reopen', icon: <RotateCcw className="w-3.5 h-3.5" />, action: 'reopen', from: ['closed', 'clarification_needed'], to: 'open', variant: 'info' },
    { label: 'Force Close', icon: <FastForward className="w-3.5 h-3.5" />, action: 'force_close', from: ['open', 'sealed', 'in_review', 'clarification_needed'], to: 'closed', variant: 'error' },
  ];

  const handleConfirm = () => {
    if (!confirmAction) return;
    updateEnvelopeState(confirmAction.envId, confirmAction.newState);
    addAuditLogEntry({
      userId: currentUser?.id || '',
      action: `envelope_${confirmAction.action}`,
      entityType: 'envelope',
      entityId: confirmAction.envId,
      details: `Admin override: ${confirmAction.action} envelope`,
    });
    addToast(`Envelope ${confirmAction.action} successful`, 'success');
    setConfirmAction(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Envelope Override</h1>
        <p className="text-gray-500 mt-1">Administrative overrides for envelope state management.</p>
      </div>

      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="w-4 h-4 inline mr-1" />
        Override actions are audit-logged and should only be used when necessary. All changes are recorded.
      </Alert>

      <div className="mb-4">
        <Input placeholder="Search envelopes..." icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Envelope</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tenant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">State</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Docs</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sealed</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Override Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(env => {
                const tenant = tenants.find(t => t.id === env.tenantId);
                const available = overrideActions.filter(a => a.from.includes(env.state));
                return (
                  <tr key={env.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{env.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tenant?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <Chip variant={stateColors[env.state] as any} size="sm" dot>
                        {env.state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{env.documentCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {env.sealedAt ? format(new Date(env.sealedAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {available.map(a => (
                          <Button key={a.action} variant="outline" size="sm"
                            onClick={() => setConfirmAction({ envId: env.id, action: a.action, newState: a.to })}>
                            {a.icon}
                            <span className="ml-1">{a.label}</span>
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirm modal */}
      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title="Confirm Override" footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm}>Confirm {confirmAction?.action.replace(/_/g, ' ')}</Button>
        </div>
      }>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Are you sure you want to <strong>{confirmAction?.action.replace(/_/g, ' ')}</strong> this envelope?
            This action will be recorded in the audit log.
          </p>
          <Alert variant="warning">This is an administrative override and may affect the client's workflow.</Alert>
        </div>
      </Modal>
    </div>
  );
}
