import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Chip, Modal, Input, Textarea, Tabs, EmptyState, Avatar } from '../../components/ui';
import { TicketStatusChip } from './DashboardPage';
import {
  MessageCircle, Plus, Search, Paperclip, Send, FileText,
  Link2, Clock, User, ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import clsx from 'clsx';
import type { Ticket, TicketMessage } from '../../types';

export function TicketsPage() {
  const {
    tickets, ticketMessages, envelopes, currentUser,
    addTicket, addTicketMessage, updateTicketStatus, addToast,
  } = useStore();

  const tenantTickets = tickets.filter(t => t.tenantId === 'tenant-brightsmile');

  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');

  // Create ticket form state
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newEnvelopeId, setNewEnvelopeId] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const selectedTicket = tenantTickets.find(t => t.id === selectedTicketId);
  const selectedMessages = ticketMessages.filter(m => m.ticketId === selectedTicketId);

  const filteredTickets = tenantTickets
    .filter(t => {
      if (activeTab === 'open') return t.status !== 'resolved' && t.status !== 'closed';
      if (activeTab === 'resolved') return t.status === 'resolved' || t.status === 'closed';
      return true;
    })
    .filter(t => !searchQuery || t.subject.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateTicket = () => {
    const ticket: Ticket = {
      id: uuid(),
      tenantId: 'tenant-brightsmile',
      envelopeId: newEnvelopeId || undefined,
      subject: newSubject,
      status: 'open',
      priority: newPriority,
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTicket(ticket);

    if (newMessage) {
      addTicketMessage({
        id: uuid(),
        ticketId: ticket.id,
        authorId: currentUser?.id || '',
        authorName: currentUser?.name || '',
        authorRole: currentUser?.role || 'client',
        content: newMessage,
        attachments: [],
        createdAt: new Date().toISOString(),
      });
    }

    addToast({ type: 'success', title: 'Ticket created', message: newSubject });
    setShowCreateModal(false);
    setNewSubject('');
    setNewMessage('');
    setNewEnvelopeId('');
    setSelectedTicketId(ticket.id);
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedTicketId) return;
    addTicketMessage({
      id: uuid(),
      ticketId: selectedTicketId,
      authorId: currentUser?.id || '',
      authorName: currentUser?.name || '',
      authorRole: currentUser?.role || 'client',
      content: replyText,
      attachments: [],
      createdAt: new Date().toISOString(),
    });
    setReplyText('');
    addToast({ type: 'success', title: 'Reply sent' });
  };

  return (
    <div className="flex h-screen">
      {/* Ticket list */}
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Tickets</h2>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
              New
            </Button>
          </div>
          <Input
            placeholder="Search tickets..."
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="mt-3">
            <Tabs
              tabs={[
                { key: 'all', label: 'All', count: tenantTickets.length },
                { key: 'open', label: 'Open', count: tenantTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length },
                { key: 'resolved', label: 'Resolved' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              className={clsx(
                'w-full text-left p-4 border-b border-gray-100 transition-colors cursor-pointer',
                selectedTicketId === ticket.id ? 'bg-primary-50' : 'hover:bg-gray-50'
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate pr-2">{ticket.subject}</p>
                <TicketStatusChip status={ticket.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={clsx('px-1.5 py-0.5 rounded', {
                  'bg-gray-100': ticket.priority === 'low',
                  'bg-warning-100 text-warning-700': ticket.priority === 'medium',
                  'bg-error-100 text-error-700': ticket.priority === 'high',
                })}>
                  {ticket.priority}
                </span>
                <span>{format(new Date(ticket.updatedAt), 'dd MMM yyyy')}</span>
              </div>
            </button>
          ))}
          {filteredTickets.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No tickets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket detail */}
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <TicketStatusChip status={selectedTicket.status} />
                    {selectedTicket.envelopeId && (
                      <span className="flex items-center gap-1">
                        <Link2 className="w-3.5 h-3.5" />
                        {envelopes.find(e => e.id === selectedTicket.envelopeId)?.label}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(selectedTicket.createdAt), 'dd MMM yyyy HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedTicket.status === 'waiting_on_client' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { updateTicketStatus(selectedTicket.id, 'waiting_on_accountant'); addToast({ type: 'info', title: 'Status updated' }); }}
                    >
                      Mark as Responded
                    </Button>
                  )}
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => { updateTicketStatus(selectedTicket.id, 'resolved'); addToast({ type: 'success', title: 'Ticket resolved' }); }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedMessages.map(msg => (
                <div key={msg.id} className={clsx('flex gap-3', msg.authorRole === 'client' || msg.authorRole === 'tenant_admin' ? 'flex-row-reverse' : '')}>
                  <Avatar name={msg.authorName} size="sm" />
                  <div className={clsx('max-w-lg', msg.authorRole === 'client' || msg.authorRole === 'tenant_admin' ? 'text-right' : '')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{msg.authorName}</span>
                      <span className="text-xs text-gray-400">{format(new Date(msg.createdAt), 'dd MMM HH:mm')}</span>
                    </div>
                    <div className={clsx(
                      'rounded-xl px-4 py-3 text-sm',
                      msg.authorRole === 'client' || msg.authorRole === 'tenant_admin'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    )}>
                      {msg.content}
                    </div>
                    {msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map(att => (
                          <div key={att.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-600">
                            <FileText className="w-3 h-3" />
                            {att.fileName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {selectedMessages.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No messages yet. Start the conversation.</p>
              )}
            </div>

            {/* Reply box */}
            {selectedTicket.status !== 'closed' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-white">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col gap-2 justify-end">
                    <Button variant="ghost" size="sm" icon={<Paperclip className="w-4 h-4" />} />
                    <Button size="sm" icon={<Send className="w-4 h-4" />} onClick={handleReply} disabled={!replyText.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MessageCircle className="w-8 h-8" />}
              title="Select a ticket"
              description="Choose a ticket from the left to view the conversation."
            />
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Ticket"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket} disabled={!newSubject.trim()}>Create Ticket</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            placeholder="Brief description of your query..."
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
          />
          <Textarea
            label="Message (optional)"
            placeholder="Provide more details..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Month</label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={newEnvelopeId}
                onChange={e => setNewEnvelopeId(e.target.value)}
              >
                <option value="">None</option>
                {envelopes.filter(e => e.tenantId === 'tenant-brightsmile').map(e => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
