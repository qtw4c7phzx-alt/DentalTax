import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Modal, Select, Avatar } from '../../components/ui';
import { UserPlus, Pencil, Trash2, Shield } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { UserRole } from '../../types';

export function TenantUsersPage() {
  const { users, tenants, currentUser, addUser, updateUser, deleteUser, addToast } = useStore();
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'client_staff' as UserRole });

  // In tenant admin view, show users for the current user's tenant
  const tenantId = currentUser?.tenantId || tenants[0]?.id;
  const tenant = tenants.find(t => t.id === tenantId);
  const tenantUsers = users.filter(u => u.tenantId === tenantId);

  const openCreate = () => {
    setForm({ name: '', email: '', role: 'client_staff' });
    setCreating(true);
  };

  const openEdit = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    setForm({ name: u.name, email: u.email, role: u.role });
    setEditId(userId);
  };

  const handleSave = () => {
    if (editId) {
      updateUser(editId, { name: form.name, email: form.email, role: form.role });
      addToast('User updated', 'success');
      setEditId(null);
    } else {
      addUser({ id: uuid(), name: form.name, email: form.email, role: form.role, tenantId, isActive: true, createdAt: new Date().toISOString() });
      addToast('Team member added', 'success');
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">Team members for {tenant?.name || 'your practice'}.</p>
        </div>
        <Button onClick={openCreate}><UserPlus className="w-4 h-4 mr-1" /> Add Team Member</Button>
      </div>

      <div className="space-y-3">
        {tenantUsers.map(user => (
          <Card key={user.id} hover>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Chip variant={user.role === 'client_admin' ? 'info' : 'default'} size="sm">
                  <Shield className="w-3 h-3 mr-1 inline" />
                  {user.role === 'client_admin' ? 'Admin' : 'Staff'}
                </Chip>
                <Button variant="ghost" size="sm" onClick={() => openEdit(user.id)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { deleteUser(user.id); addToast('User removed', 'info'); }}>
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={creating || !!editId} onClose={() => { setCreating(false); setEditId(null); }}
        title={editId ? 'Edit Team Member' : 'Add Team Member'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setCreating(false); setEditId(null); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email}>Save</Button>
          </div>
        }>
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
            options={[
              { label: 'Admin', value: 'client_admin' },
              { label: 'Staff', value: 'client_staff' },
            ]} />
        </div>
      </Modal>
    </div>
  );
}
