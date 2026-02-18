import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Chip, Tabs, EmptyState } from '../../components/ui';
import { FileOutput, Download, Eye, Clock, User, Check } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const outputTypeLabels: Record<string, string> = {
  pnl: 'Profit & Loss',
  trial_balance: 'Trial Balance',
  general_ledger: 'General Ledger',
  vat_report: 'VAT Report',
  management_pack: 'Management Pack',
  tax_return: 'Tax Return',
};

const outputTypeIcons: Record<string, string> = {
  pnl: '📊',
  trial_balance: '⚖️',
  general_ledger: '📒',
  vat_report: '🏛️',
  management_pack: '📋',
  tax_return: '📄',
};

export function OutputsPage() {
  const { outputs, envelopes, users, addToast } = useStore();
  const tenantOutputs = outputs.filter(o => o.tenantId === 'tenant-brightsmile');
  const publishedOutputs = tenantOutputs.filter(o => o.isPublished);

  const [activeTab, setActiveTab] = useState('all');

  // Group by envelope
  const envGroups = envelopes
    .filter(e => e.tenantId === 'tenant-brightsmile')
    .map(env => ({
      envelope: env,
      outputs: publishedOutputs.filter(o => o.envelopeId === env.id),
    }))
    .filter(g => g.outputs.length > 0 || activeTab === 'all');

  const filteredGroups = activeTab === 'all' ? envGroups : envGroups.filter(g => g.outputs.length > 0);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outputs</h1>
          <p className="text-gray-500 mt-1">Reports and deliverables prepared by your accountant.</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: 'all', label: 'All Months' },
          { key: 'published', label: 'Published', count: publishedOutputs.length },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-6 space-y-8">
        {filteredGroups.map(({ envelope, outputs: envOutputs }) => (
          <div key={envelope.id}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{envelope.label}</h3>
              {envOutputs.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => addToast({ type: 'info', title: 'Downloading...', message: `Preparing ${envelope.label} pack` })}
                >
                  Download Pack
                </Button>
              )}
            </div>

            {envOutputs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {envOutputs.map(output => {
                  const preparer = users.find(u => u.id === output.preparedBy);
                  return (
                    <Card key={output.id} hover>
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{outputTypeIcons[output.type] || '📄'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{output.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {outputTypeLabels[output.type] || output.type}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {preparer?.name || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(output.preparedAt || output.publishedAt || new Date().toISOString()), 'dd MMM')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Chip variant="default" size="sm">v{output.version}</Chip>
                            {output.isPublished && (
                              <Chip variant="success" size="sm" dot>Published</Chip>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          className="flex-1"
                          onClick={() => addToast({ type: 'info', title: 'Opening preview...' })}
                        >
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Download className="w-3.5 h-3.5" />}
                          className="flex-1"
                          onClick={() => addToast({ type: 'success', title: 'Download started' })}
                        >
                          Download
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="!py-8 text-center">
                <p className="text-sm text-gray-500">No outputs published for this month yet.</p>
              </Card>
            )}
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <EmptyState
            icon={<FileOutput className="w-8 h-8" />}
            title="No outputs yet"
            description="Your accountant will publish reports here once they've reviewed your monthly documents."
          />
        )}
      </div>
    </div>
  );
}
