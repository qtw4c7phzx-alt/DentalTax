import { useStore } from '../../store';
import { Card, StatCard, Chip } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import {
  FileBox, Landmark, MessageCircle, FileOutput, AlertTriangle,
  ArrowRight, Upload, Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export function DashboardPage() {
  const { currentUser, envelopes, documents, transactions, tickets, outputs, bankAccounts } = useStore();
  const navigate = useNavigate();

  const tenantEnvelopes = envelopes.filter(e => e.tenantId === 'tenant-brightsmile');
  const currentEnvelope = tenantEnvelopes.find(e => e.state === 'open') || tenantEnvelopes[0];
  const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  const unmatchedTxns = transactions.filter(t => t.status === 'unmatched' && t.tenantId === 'tenant-brightsmile');
  const publishedOutputs = outputs.filter(o => o.isPublished);
  const mainBank = bankAccounts.find(b => b.tenantId === 'tenant-brightsmile' && b.consentStatus === 'active');

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {currentUser?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your bookkeeping status.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Current Month"
          value={currentEnvelope?.label || '—'}
          icon={<FileBox className="w-5 h-5" />}
        />
        <StatCard
          label="Unmatched Transactions"
          value={unmatchedTxns.length}
          icon={<Landmark className="w-5 h-5" />}
        />
        <StatCard
          label="Open Tickets"
          value={openTickets.length}
          icon={<MessageCircle className="w-5 h-5" />}
        />
        <StatCard
          label="Published Reports"
          value={publishedOutputs.length}
          icon={<FileOutput className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Envelopes summary */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Envelopes</h2>
            <button
              onClick={() => navigate('/envelopes')}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {tenantEnvelopes.map(env => (
              <div
                key={env.id}
                onClick={() => navigate('/envelopes')}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <FileBox className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{env.label}</p>
                    <p className="text-xs text-gray-500">{env.documentCount} documents</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {env.unmatchedTxnCount > 0 && (
                    <span className="text-xs text-warning-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {env.unmatchedTxnCount} unmatched
                    </span>
                  )}
                  <EnvelopeChip state={env.state} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Bank feed */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Bank Feed</h3>
            {mainBank ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{mainBank.bankName}</span>
                  <Chip variant="success" dot>Connected</Chip>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  £{mainBank.balance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">
                  Last sync: {mainBank.lastSyncAt ? format(new Date(mainBank.lastSyncAt), 'dd MMM yyyy HH:mm') : 'Never'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No bank connected</p>
            )}
          </Card>

          {/* Recent tickets */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Tickets</h3>
              <button
                onClick={() => navigate('/tickets')}
                className="text-xs text-primary-500 hover:text-primary-600 font-medium cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {tickets.slice(0, 3).map(ticket => (
                <div key={ticket.id} className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/tickets')}>
                  <p className="text-sm text-gray-900 font-medium truncate">{ticket.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TicketStatusChip status={ticket.status} />
                    <span className="text-xs text-gray-400">
                      {format(new Date(ticket.updatedAt), 'dd MMM')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/envelopes')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upload Documents</p>
                  <p className="text-xs text-gray-500">Add to current month</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/tickets')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-success-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Create Ticket</p>
                  <p className="text-xs text-gray-500">Ask your accountant</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Helper chips ───

export function EnvelopeChip({ state }: { state: string }) {
  const config: Record<string, { variant: 'success' | 'primary' | 'warning' | 'error' | 'default' | 'info'; label: string }> = {
    open: { variant: 'primary', label: 'Open' },
    sealed: { variant: 'info', label: 'Sealed' },
    in_review: { variant: 'warning', label: 'In Review' },
    clarification_needed: { variant: 'error', label: 'Clarification' },
    closed: { variant: 'success', label: 'Closed' },
  };
  const c = config[state] || config.open;
  return <Chip variant={c.variant} dot>{c.label}</Chip>;
}

export function TicketStatusChip({ status }: { status: string }) {
  const config: Record<string, { variant: 'success' | 'primary' | 'warning' | 'error' | 'default' | 'info'; label: string }> = {
    open: { variant: 'primary', label: 'Open' },
    waiting_on_client: { variant: 'warning', label: 'Waiting on Client' },
    waiting_on_accountant: { variant: 'info', label: 'Waiting on Accountant' },
    resolved: { variant: 'success', label: 'Resolved' },
    closed: { variant: 'default', label: 'Closed' },
  };
  const c = config[status] || config.open;
  return <Chip variant={c.variant} size="sm">{c.label}</Chip>;
}
