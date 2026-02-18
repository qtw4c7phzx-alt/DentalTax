import { useStore } from '../../store';
import { Card, StatCard, Chip, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import {
  Upload, AlertTriangle, FileBox, MessageCircle, Link2,
  ArrowRight, Clock, Check, Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { EnvelopeChip, TicketStatusChip } from '../client/DashboardPage';

export function WorkQueuePage() {
  const { envelopes, documents, transactions, tickets, outputs } = useStore();
  const navigate = useNavigate();

  const newDocs = documents.filter(d => d.status === 'new');
  const unmatchedTxns = transactions.filter(t => t.status === 'unmatched');
  const sealedEnvelopes = envelopes.filter(e => e.state === 'sealed' || e.state === 'in_review');
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'waiting_on_accountant');
  const draftOutputs = outputs.filter(o => !o.isPublished);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Work Queue</h1>
        <p className="text-gray-500 mt-1">Items requiring your attention across all tenants.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="New Uploads" value={newDocs.length} icon={<Upload className="w-5 h-5" />} />
        <StatCard label="Unmatched Txns" value={unmatchedTxns.length} icon={<Link2 className="w-5 h-5" />} />
        <StatCard label="Sealed Envelopes" value={sealedEnvelopes.length} icon={<FileBox className="w-5 h-5" />} />
        <StatCard label="Open Tickets" value={openTickets.length} icon={<MessageCircle className="w-5 h-5" />} />
        <StatCard label="Draft Outputs" value={draftOutputs.length} icon={<Eye className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New uploads */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary-500" />
              New Documents ({newDocs.length})
            </h3>
            <button onClick={() => navigate('/admin/documents')} className="text-xs text-primary-500 font-medium cursor-pointer flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {newDocs.slice(0, 5).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">{doc.fileName}</p>
                  <p className="text-xs text-gray-500">{format(new Date(doc.uploadedAt), 'dd MMM HH:mm')}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/documents')}>Classify</Button>
              </div>
            ))}
            {newDocs.length === 0 && <p className="text-sm text-gray-500 py-2">All documents classified ✓</p>}
          </div>
        </Card>

        {/* Unmatched transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-500" />
              Unmatched Transactions ({unmatchedTxns.length})
            </h3>
            <button onClick={() => navigate('/admin/transactions')} className="text-xs text-primary-500 font-medium cursor-pointer flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {unmatchedTxns.slice(0, 5).map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                  <p className="text-xs text-gray-500">{format(new Date(txn.date), 'dd MMM')} · £{Math.abs(txn.amount).toFixed(2)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/transactions')}>Match</Button>
              </div>
            ))}
            {unmatchedTxns.length === 0 && <p className="text-sm text-gray-500 py-2">All matched ✓</p>}
          </div>
        </Card>

        {/* Sealed envelopes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileBox className="w-4 h-4 text-primary-500" />
              Pending Envelopes ({sealedEnvelopes.length})
            </h3>
          </div>
          <div className="space-y-2">
            {sealedEnvelopes.map(env => (
              <div key={env.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{env.label}</p>
                  <p className="text-xs text-gray-500">{env.documentCount} docs · {env.unmatchedTxnCount} unmatched</p>
                </div>
                <EnvelopeChip state={env.state} />
              </div>
            ))}
            {sealedEnvelopes.length === 0 && <p className="text-sm text-gray-500 py-2">No pending envelopes</p>}
          </div>
        </Card>

        {/* Tickets */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-success-500" />
              Tickets ({openTickets.length})
            </h3>
            <button onClick={() => navigate('/admin/tickets')} className="text-xs text-primary-500 font-medium cursor-pointer flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {openTickets.slice(0, 5).map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">{format(new Date(ticket.updatedAt), 'dd MMM')}</p>
                </div>
                <TicketStatusChip status={ticket.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
