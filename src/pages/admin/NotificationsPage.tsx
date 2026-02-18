import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Modal, Textarea } from '../../components/ui';
import { Bell, Mail, Pencil, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

export function NotificationsPage() {
  const { notificationTemplates, updateNotificationTemplate, addToast } = useStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const editing = notificationTemplates.find(t => t.id === editId);

  const openEdit = (id: string) => {
    const tpl = notificationTemplates.find(t => t.id === id);
    if (!tpl) return;
    setEditSubject(tpl.subject);
    setEditBody(tpl.bodyTemplate || '');
    setEditId(id);
  };

  const handleSave = () => {
    if (!editId) return;
    updateNotificationTemplate(editId, { subject: editSubject, bodyTemplate: editBody });
    addToast('Template updated', 'success');
    setEditId(null);
  };

  const toggleTemplate = (id: string) => {
    const tpl = notificationTemplates.find(t => t.id === id);
    if (!tpl) return;
    updateNotificationTemplate(id, { enabled: !tpl.enabled });
    addToast(tpl.enabled ? 'Notification disabled' : 'Notification enabled', 'info');
  };

  const channelIcon: Record<string, React.ReactNode> = {
    email: <Mail className="w-4 h-4" />,
    in_app: <Bell className="w-4 h-4" />,
    both: <><Mail className="w-3.5 h-3.5" /><Bell className="w-3.5 h-3.5" /></>,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">Configure notification templates and delivery channels.</p>
      </div>

      <div className="space-y-3">
        {notificationTemplates.map(tpl => (
          <Card key={tpl.id} hover>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleTemplate(tpl.id)} className="flex-shrink-0">
                  {tpl.enabled ? (
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-300" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
                    <Chip variant={tpl.enabled ? 'success' : 'default'} size="sm">
                      {tpl.enabled ? 'Active' : 'Disabled'}
                    </Chip>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Trigger: <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">{tpl.trigger}</code>
                    <span className="mx-2">·</span>
                    Channel: {tpl.channel}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Subject: {tpl.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 text-gray-400">
                  {channelIcon[tpl.channel]}
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEdit(tpl.id)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditId(null)} title="Edit Notification Template" size="lg" footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      }>
        {editing && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Template: <strong>{editing.name}</strong></p>
              <p className="text-xs text-gray-500">Trigger: <code>{editing.trigger}</code></p>
            </div>
            <Input label="Subject" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
            <Textarea label="Body Template" value={editBody} onChange={e => setEditBody(e.target.value)} rows={6}
              hint="Use {{variable}} for dynamic content. Available: {{tenant_name}}, {{envelope_label}}, {{user_name}}, {{date}}" />
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-1">Preview:</p>
              <p className="text-sm text-blue-900">{editSubject.replace(/\{\{(\w+)\}\}/g, '<$1>')}</p>
              <p className="text-xs text-blue-800 mt-1 whitespace-pre-wrap">{editBody.replace(/\{\{(\w+)\}\}/g, '<$1>')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
