import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Modal, Select, Avatar } from '../../components/ui';
import { Search, UserPlus, Mail, Shield, Pencil, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { UserRole } from '../../types';

export function UsersPage() {
  const { users, tenants, addUser, updateUser, deleteUser, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'client_admin' as UserRole, tenantId: '' });

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<UserRole, string> = {
    platform_admin: 'error',
    tenant_admin: 'warning',
    accountant: 'info',
    client: 'default',
    client_admin: 'success',
    client_staff: 'default',
  };

  const openCreate = () => {
    setForm({ name: '', email: '', role: 'client_admin', tenantId: '' });
    setCreating(true);
  };

  const openEdit = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    setForm({ name: u.name, email: u.email, role: u.role, tenantId: u.tenantId || '' });
    setEditId(userId);
  };

  const handleSave = () => {
    if (editId) {
      updateUser(editId, { name: form.name, email: form.email, role: form.role, tenantId: form.tenantId || undefined });
      addToast('User updated', 'success');
      setEditId(null);
    } else {
      addUser({
        id: uuid(),
        name: form.name,
        email: form.email,
        role: form.role,
        tenantId: form.tenantId || '',
        avatarUrl: undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      addToast('User created', 'success');
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage platform users and their roles.</p>
        </div>
        <Button onClick={openCreate}><UserPlus className="w-4 h-4 mr-1" /> Add User</Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Search users..." icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tenant</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const tenant = tenants.find(t => t.id === user.tenantId);
                return (
                  <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Chip variant={roleColors[user.role] as any} size="sm">
                        <Shield className="w-3 h-3 mr-1 inline" />
                        {user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tenant?.name || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(user.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { deleteUser(user.id); addToast('User removed', 'info'); }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit modal */}
      <Modal open={creating || !!editId} onClose={() => { setCreating(false); setEditId(null); }}
        title={editId ? 'Edit User' : 'Add User'}
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
              { label: 'Platform Admin', value: 'platform_admin' },
              { label: 'Accountant', value: 'accountant' },
              { label: 'Client Admin', value: 'client_admin' },
              { label: 'Client Staff', value: 'client_staff' },
            ]} />
          <Select label="Tenant (optional)" value={form.tenantId} onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))}
            options={[{ label: 'No tenant (platform user)', value: '' }, ...tenants.map(t => ({ label: t.name, value: t.id }))]} />
        </div>
      </Modal>
    </div>
  );
}
