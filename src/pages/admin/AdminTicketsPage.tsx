import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Tabs, Modal, Textarea } from '../../components/ui';
import { Search, MessageSquare, AlertCircle, CheckCircle, Clock, Send } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import type { TicketStatus } from '../../types';

export function AdminTicketsPage() {
  const { tickets, ticketMessages, tenants, envelopes, users, currentUser, updateTicketStatus, addTicketMessage, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const statusTabs = [
    { id: '', label: 'All', count: tickets.length },
    { id: 'open', label: 'Open', count: tickets.filter(t => t.status === 'open').length },
    { id: 'in_progress', label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length },
    { id: 'waiting_on_client', label: 'Waiting', count: tickets.filter(t => t.status === 'waiting_on_client').length },
    { id: 'resolved', label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length },
  ];

  const filtered = tickets.filter(t => {
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const selected = tickets.find(t => t.id === selectedId);
  const selectedMessages = ticketMessages.filter(m => m.ticketId === selectedId);

  const getTenantName = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return 'Unknown';
    const env = envelopes.find(e => e.id === ticket.envelopeId);
    const t = tenants.find(t => t.id === env?.tenantId);
    return t?.name || 'Unknown';
  };

  const handleReply = () => {
    if (!selected || !reply.trim()) return;
    addTicketMessage({
      id: uuid(),
      ticketId: selected.id,
      senderId: currentUser?.id || '',
      senderRole: 'accountant',
      body: reply,
      authorId: currentUser?.id || '',
      authorName: currentUser?.name || 'Admin',
      authorRole: 'accountant' as const,
      content: reply,
      attachments: [],
      createdAt: new Date().toISOString(),
    });
    if (selected.status === 'open') {
      updateTicketStatus(selected.id, 'in_progress');
    }
    addToast('Reply sent', 'success');
    setReply('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <p className="text-gray-500 mt-1">Manage clarification queries across all tenants.</p>
      </div>

      <Tabs tabs={statusTabs} activeId={statusFilter} onChange={setStatusFilter} />

      <div className="flex gap-6 mt-4">
        {/* Ticket list */}
        <div className="w-96 flex-shrink-0 space-y-2">
          <Input placeholder="Search tickets..." icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} />
          {filtered.map(ticket => {
            const msgs = ticketMessages.filter(m => m.ticketId === ticket.id);
            return (
              <Card key={ticket.id} hover onClick={() => setSelectedId(ticket.id)}
                className={selectedId === ticket.id ? 'ring-2 ring-primary-500' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getTenantName(ticket.id)} · {msgs.length} messages</p>
                  </div>
                  <TicketChip status={ticket.status} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{format(new Date(ticket.createdAt), 'dd MMM · HH:mm')}</p>
              </Card>
            );
          })}
        </div>

        {/* Detail pane */}
        <div className="flex-1">
          {selected ? (
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selected.subject}</h3>
                  <p className="text-sm text-gray-500">{getTenantName(selected.id)} · Opened {format(new Date(selected.createdAt), 'dd MMM yyyy')}</p>
                </div>
                <div className="flex gap-2">
                  {selected.status !== 'resolved' && (
                    <Button size="sm" variant="outline" onClick={() => { updateTicketStatus(selected.id, 'resolved'); addToast('Ticket resolved', 'success'); }}>
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolve
                    </Button>
                  )}
                  {selected.status !== 'waiting_on_client' && selected.status !== 'resolved' && (
                    <Button size="sm" variant="outline" onClick={() => { updateTicketStatus(selected.id, 'waiting_on_client'); addToast('Marked waiting on client', 'info'); }}>
                      <Clock className="w-3.5 h-3.5 mr-1" /> Wait on Client
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-2">
                {selectedMessages.map(msg => {
                  const sender = users.find(u => u.id === msg.senderId);
                  const isAccountant = msg.senderRole === 'accountant' || msg.senderRole === 'platform_admin';
                  return (
                    <div key={msg.id} className={`flex ${isAccountant ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${isAccountant ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        <p className={`text-xs font-medium mb-1 ${isAccountant ? 'text-primary-100' : 'text-gray-500'}`}>
                          {sender?.name || msg.senderRole}
                        </p>
                        <p className="text-sm">{msg.body}</p>
                        <p className={`text-xs mt-1 ${isAccountant ? 'text-primary-200' : 'text-gray-400'}`}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selected.status !== 'resolved' && (
                <div className="flex gap-2">
                  <Textarea placeholder="Type a reply..." value={reply} onChange={e => setReply(e.target.value)} rows={2} className="flex-1" />
                  <Button onClick={handleReply} disabled={!reply.trim()} className="self-end">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Select a ticket to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TicketChip({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, { variant: 'success' | 'warning' | 'info' | 'error' | 'default'; label: string }> = {
    open: { variant: 'error', label: 'Open' },
    in_progress: { variant: 'info', label: 'In Progress' },
    waiting_on_client: { variant: 'warning', label: 'Waiting' },
    waiting_on_accountant: { variant: 'info', label: 'Waiting on Accountant' },
    resolved: { variant: 'success', label: 'Resolved' },
    closed: { variant: 'default', label: 'Closed' },
  };
  const m = map[status] || { variant: 'default' as const, label: status };
  return <Chip variant={m.variant} size="sm" dot>{m.label}</Chip>;
}
