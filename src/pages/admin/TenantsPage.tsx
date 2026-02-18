import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Modal, Select, Tabs, Alert } from '../../components/ui';
import { Building2, Search, AlertTriangle, HardDrive, FileBox, Users, ExternalLink, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export function TenantsPage() {
  const { tenants, bankAccounts, envelopes, users } = useStore();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = tenants.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = tenants.find(t => t.id === selectedId);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage dental practice accounts on the platform.</p>
        </div>
      </div>

      <div className="mb-4">
        <Input placeholder="Search tenants..." icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Practice</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entity Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Users</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Storage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Flags</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tenant => {
                const tenantUsers = users.filter(u => u.tenantId === tenant.id);
                const tenantEnvelopes = envelopes.filter(e => e.tenantId === tenant.id);
                const sealedPending = tenantEnvelopes.filter(e => e.state === 'sealed' || e.state === 'in_review').length;
                const bankIssues = bankAccounts.filter(b => b.tenantId === tenant.id && b.consentStatus !== 'active').length;

                return (
                  <tr key={tenant.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedId(tenant.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.registeredAddress}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Chip variant="default">{tenant.entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Chip>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tenantUsers.length}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tenant.storageUsedMB} MB</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {bankIssues > 0 && <Chip variant="error" size="sm">Bank Issue</Chip>}
                        {sealedPending > 0 && <Chip variant="warning" size="sm">{sealedPending} Pending</Chip>}
                        {!tenant.isOnboarded && <Chip variant="info" size="sm">Not Onboarded</Chip>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Chip variant={tenant.isOnboarded ? 'success' : 'warning'} dot>
                        {tenant.isOnboarded ? 'Active' : 'Pending'}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tenant detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.name || ''}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-gray-500">Entity Type</span><p className="text-sm font-medium">{selected.entityType.replace('_', ' ')}</p></div>
              <div><span className="text-xs text-gray-500">VAT Status</span><p className="text-sm font-medium">{selected.vatStatus.replace('_', ' ')}</p></div>
              <div><span className="text-xs text-gray-500">Year End</span><p className="text-sm font-medium">{selected.yearEnd}</p></div>
              <div><span className="text-xs text-gray-500">Storage</span><p className="text-sm font-medium">{selected.storageUsedMB} MB</p></div>
              <div><span className="text-xs text-gray-500">Created</span><p className="text-sm font-medium">{format(new Date(selected.createdAt), 'dd MMM yyyy')}</p></div>
              {selected.companyNumber && <div><span className="text-xs text-gray-500">Company Number</span><p className="text-sm font-medium">{selected.companyNumber}</p></div>}
              {selected.utrNumber && <div><span className="text-xs text-gray-500">UTR</span><p className="text-sm font-medium">{selected.utrNumber}</p></div>}
            </div>
            {selected.partners && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Partners</h4>
                <div className="space-y-1">
                  {selected.partners.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <span>{p.name}</span>
                      <span className="text-gray-500">{p.profitSharePercent}% share</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
