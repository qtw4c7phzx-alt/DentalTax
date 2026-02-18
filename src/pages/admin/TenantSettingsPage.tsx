import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Select, Alert } from '../../components/ui';
import { Building2, Save, Calendar, FileText, Percent, Users } from 'lucide-react';
import type { EntityType, VatStatus } from '../../types';

export function TenantSettingsPage() {
  const { tenants, currentUser, updateTenant, addToast } = useStore();

  const tenantId = currentUser?.tenantId || tenants[0]?.id;
  const tenant = tenants.find(t => t.id === tenantId);

  const [name, setName] = useState(tenant?.name || '');
  const [address, setAddress] = useState(tenant?.registeredAddress || '');
  const [yearEnd, setYearEnd] = useState(tenant?.yearEnd || '');
  const [vatStatus, setVatStatus] = useState<VatStatus>(tenant?.vatStatus || 'not_registered');
  const [vatNumber, setVatNumber] = useState(tenant?.vatNumber || '');

  if (!tenant) return null;

  const handleSave = () => {
    updateTenant(tenant.id, { name, registeredAddress: address, yearEnd, vatStatus, vatNumber: vatNumber || undefined });
    addToast('Settings saved', 'success');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Practice Settings</h1>
        <p className="text-gray-500 mt-1">Manage your practice details and tax configuration.</p>
      </div>

      <div className="space-y-6">
        {/* Business Info */}
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-600" /> Business Information
          </h3>
          <div className="space-y-4">
            <Input label="Practice Name" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Registered Address" value={address} onChange={e => setAddress(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                <div className="p-2.5 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
                  {tenant.entityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <p className="text-xs text-gray-400 mt-1">Entity type cannot be changed after onboarding.</p>
              </div>
              {tenant.companyNumber && (
                <Input label="Company Number" value={tenant.companyNumber} disabled />
              )}
            </div>
            {tenant.utrNumber && (
              <Input label="UTR Number" value={tenant.utrNumber} disabled />
            )}
          </div>
        </Card>

        {/* Tax Config */}
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" /> Tax Configuration
          </h3>
          <div className="space-y-4">
            <Input label="Year End" value={yearEnd} onChange={e => setYearEnd(e.target.value)}
              hint="Format: DD/MM (e.g. 31/03 for March)" icon={<Calendar className="w-4 h-4" />} />
            <Select label="VAT Status" value={vatStatus} onChange={e => setVatStatus(e.target.value as VatStatus)}
              options={[
                { label: 'Not Registered', value: 'not_registered' },
                { label: 'Standard', value: 'standard' },
                { label: 'Flat Rate', value: 'flat_rate' },
                { label: 'Partial Exemption', value: 'partial_exemption' },
              ]} />
            {vatStatus !== 'not_registered' && (
              <Input label="VAT Number" value={vatNumber} onChange={e => setVatNumber(e.target.value)}
                placeholder="GB 123 4567 89" icon={<Percent className="w-4 h-4" />} />
            )}
          </div>
        </Card>

        {/* Partners (if partnership) */}
        {tenant.entityType === 'partnership' && tenant.partners && (
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" /> Partners
            </h3>
            <div className="space-y-2">
              {tenant.partners.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">NI: {p.niNumber} · UTR: {p.utr}</p>
                  </div>
                  <span className="text-sm font-medium text-primary-600">{p.profitSharePercent}%</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
