import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Modal, EmptyState, Chip } from '../../components/ui';
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import type { Customer } from '../../types';

export function CustomersPage() {
  const { customers, addCustomer, updateCustomer, addToast } = useStore();
  const tenantCustomers = customers.filter(c => c.tenantId === 'tenant-brightsmile');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', nhsNumber: '' });

  const filtered = tenantCustomers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', email: '', phone: '', address: '', nhsNumber: '' });
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditId(c.id);
    setForm({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '', nhsNumber: c.nhsNumber || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editId) {
      updateCustomer(editId, { ...form });
      addToast({ type: 'success', title: 'Customer updated' });
    } else {
      addCustomer({
        id: uuid(),
        tenantId: 'tenant-brightsmile',
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        nhsNumber: form.nhsNumber || undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      addToast({ type: 'success', title: 'Customer created' });
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your patient and customer records.</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add Customer</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search customers..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Card key={c.id} hover onClick={() => openEdit(c)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  {c.nhsNumber && <p className="text-xs text-gray-500">{c.nhsNumber}</p>}
                </div>
                <Chip variant={c.isActive ? 'success' : 'default'} size="sm">
                  {c.isActive ? 'Active' : 'Inactive'}
                </Chip>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" />{c.email}</p>
                {c.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{c.phone}</p>}
                {c.address && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" />{c.address}</p>}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Added {format(new Date(c.createdAt), 'dd MMM yyyy')}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No customers yet"
          description="Add your first customer to get started."
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add Customer</Button>}
        />
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Customer' : 'Add Customer'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email}>{editId ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07700 900123" />
            <Input label="NHS Number" value={form.nhsNumber} onChange={e => setForm(f => ({ ...f, nhsNumber: e.target.value }))} placeholder="NHS-1234567" />
          </div>
          <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="12 High Street, London" />
        </div>
      </Modal>
    </div>
  );
}
