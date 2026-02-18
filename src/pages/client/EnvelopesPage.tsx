import { useState, useCallback } from 'react';
import { useStore } from '../../store';
import {
  Card, Button, Chip, Modal, Dropzone, Alert, EmptyState, Input,
} from '../../components/ui';
import { EnvelopeChip } from './DashboardPage';
import {
  FileBox, Upload, Download, Lock, Copy, Mail, Check,
  FileText, Image, File, Trash2, Eye, MoreVertical, AlertTriangle,
  Clock, Search, Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { Document as DocType, EnvelopeState } from '../../types';
import { v4 as uuid } from 'uuid';

export function EnvelopesPage() {
  const {
    envelopes, documents, transactions, tickets,
    currentUser, addDocument, updateEnvelopeState, addToast, deleteDocument,
  } = useStore();

  const tenantEnvelopes = envelopes.filter(e => e.tenantId === 'tenant-brightsmile');
  const [selectedEnvId, setSelectedEnvId] = useState(
    tenantEnvelopes.find(e => e.state === 'open')?.id || tenantEnvelopes[0]?.id
  );
  const selectedEnv = tenantEnvelopes.find(e => e.id === selectedEnvId);
  const envDocs = documents.filter(d => d.envelopeId === selectedEnvId);
  const envTxns = transactions.filter(t => t.envelopeId === selectedEnvId);
  const envTickets = tickets.filter(t => t.envelopeId === selectedEnvId);

  const [showSealModal, setShowSealModal] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const emailInAddress = 'docs+brightsmile-feb2026@inbox.dentaltax.co.uk';

  const isOpen = selectedEnv?.state === 'open';
  const canUpload = isOpen;

  const handleFileDrop = useCallback((files: File[]) => {
    files.forEach(f => {
      const doc: DocType = {
        id: uuid(),
        tenantId: 'tenant-brightsmile',
        envelopeId: selectedEnvId!,
        fileName: f.name,
        fileSize: f.size,
        mimeType: f.type,
        status: 'new',
        uploadedBy: currentUser?.id || '',
        uploadedAt: new Date().toISOString(),
      };
      addDocument(doc);
    });
    addToast({ type: 'success', title: 'Documents uploaded', message: `${files.length} file(s) added to ${selectedEnv?.label}` });
  }, [selectedEnvId, selectedEnv, currentUser, addDocument, addToast]);

  const handleSeal = () => {
    if (selectedEnv) {
      updateEnvelopeState(selectedEnv.id, 'sealed', currentUser?.id);
      addToast({ type: 'success', title: 'Envelope sealed', message: `${selectedEnv.label} has been sealed for review` });
    }
    setShowSealModal(false);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailInAddress).catch(() => {});
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const filteredDocs = envDocs.filter(d =>
    !searchQuery || d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unmatchedCount = envTxns.filter(t => t.status === 'unmatched').length;
  const openTicketCount = envTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;

  return (
    <div className="flex h-screen">
      {/* Left sidebar — month list */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Envelopes</h2>
          <p className="text-sm text-gray-500 mt-0.5">Monthly workspaces</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {tenantEnvelopes.map(env => {
            const envDocCount = documents.filter(d => d.envelopeId === env.id).length;
            const envUnmatched = transactions.filter(t => t.envelopeId === env.id && t.status === 'unmatched').length;
            return (
              <button
                key={env.id}
                onClick={() => setSelectedEnvId(env.id)}
                className={clsx(
                  'w-full text-left px-3 py-3 rounded-lg transition-colors cursor-pointer',
                  selectedEnvId === env.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{env.label}</span>
                  <EnvelopeChip state={env.state} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{envDocCount} files</span>
                  {envUnmatched > 0 && (
                    <span className="text-warning-600">{envUnmatched} unmatched</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {selectedEnv ? (
          <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{selectedEnv.label}</h1>
                  <EnvelopeChip state={selectedEnv.state} />
                </div>
                <p className="text-sm text-gray-500">
                  {envDocs.length} documents · {unmatchedCount} unmatched transactions · {openTicketCount} open tickets
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canUpload && (
                  <Button
                    variant="secondary"
                    icon={<Upload className="w-4 h-4" />}
                    onClick={() => setShowUploadArea(!showUploadArea)}
                  >
                    Upload
                  </Button>
                )}
                <Button
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => addToast({ type: 'info', title: 'Download started', message: 'Preparing month bundle...' })}
                >
                  Download Bundle
                </Button>
                {isOpen && (
                  <Button
                    variant="primary"
                    icon={<Lock className="w-4 h-4" />}
                    onClick={() => setShowSealModal(true)}
                  >
                    Seal Envelope
                  </Button>
                )}
              </div>
            </div>

            {/* Non-open state alert */}
            {!isOpen && (
              <Alert variant="info" title={`This envelope is ${selectedEnv.state.replace('_', ' ')}`}>
                {selectedEnv.state === 'sealed' && 'This month has been sealed and is awaiting accountant review. No new uploads can be made.'}
                {selectedEnv.state === 'in_review' && 'Your accountant is currently reviewing this month\'s documents.'}
                {selectedEnv.state === 'closed' && 'This month has been closed. All documents have been processed.'}
                {selectedEnv.state === 'clarification_needed' && 'Your accountant needs more information. Please check tickets.'}
              </Alert>
            )}

            {/* Upload area */}
            {showUploadArea && canUpload && (
              <div className="mt-4 space-y-4">
                <Dropzone onFiles={handleFileDrop} />

                {/* Email-in */}
                <Card className="!p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">Email documents directly</p>
                      <p className="text-xs text-gray-500 mb-2">
                        Forward invoices, receipts, or statements to this address. They'll appear in this month's envelope automatically.
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-mono text-gray-700 flex-1 truncate">
                          {emailInAddress}
                        </code>
                        <Button variant="secondary" size="sm" onClick={handleCopyEmail} icon={copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
                          {copiedEmail ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Search */}
            <div className="mt-6 mb-4">
              <Input
                placeholder="Search documents..."
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Documents table */}
            {filteredDocs.length > 0 ? (
              <Card padding={false}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map(doc => (
                        <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <FileIcon mimeType={doc.mimeType} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{doc.fileName}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Chip variant="default">{formatCategory(doc.category)}</Chip>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={clsx('text-sm font-medium', (doc.amount ?? 0) < 0 ? 'text-error-600' : 'text-gray-900')}>
                              {doc.amount ? `£${Math.abs(doc.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {doc.date ? format(new Date(doc.date), 'dd MMM yyyy') : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <DocStatusChip status={doc.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer">
                                <Download className="w-4 h-4" />
                              </button>
                              {isOpen && (
                                <button
                                  onClick={() => { deleteDocument(doc.id); addToast({ type: 'info', title: 'Document removed' }); }}
                                  className="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-500 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={<FileBox className="w-8 h-8" />}
                title="No documents yet"
                description="Upload your first document to get started with this month."
                action={canUpload ? (
                  <Button icon={<Upload className="w-4 h-4" />} onClick={() => setShowUploadArea(true)}>
                    Upload Document
                  </Button>
                ) : undefined}
              />
            )}

            {/* Activity log */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity</h3>
              <div className="space-y-3">
                {envDocs.slice(0, 5).map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <Upload className="w-3 h-3 text-primary-600" />
                    </div>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">{doc.fileName}</span> uploaded
                    </p>
                    <span className="text-xs text-gray-400 ml-auto">
                      {format(new Date(doc.uploadedAt), 'dd MMM HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<FileBox className="w-8 h-8" />}
            title="Select a month"
            description="Choose a month from the left to view its documents."
          />
        )}
      </div>

      {/* Seal Modal */}
      <Modal
        open={showSealModal}
        onClose={() => setShowSealModal(false)}
        title="Seal Envelope"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSealModal(false)}>Cancel</Button>
            <Button variant="primary" icon={<Lock className="w-4 h-4" />} onClick={handleSeal}>
              Confirm Seal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Sealing the envelope for <strong>{selectedEnv?.label}</strong> will prevent further uploads.
            Your accountant will begin reviewing the documents.
          </p>

          {/* Checklist */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Pre-seal checklist</h4>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
              All documents for this month have been uploaded
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
              Bank statements are complete
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
              Petty cash receipts are included
            </label>
          </div>

          {/* Warnings */}
          {unmatchedCount > 0 && (
            <Alert variant="warning" title={`${unmatchedCount} unmatched transactions`}>
              There are transactions without matching documents. Your accountant may need to follow up.
            </Alert>
          )}
          {openTicketCount > 0 && (
            <Alert variant="warning" title={`${openTicketCount} open ticket(s)`}>
              There are unresolved queries for this month.
            </Alert>
          )}
        </div>
      </Modal>
    </div>
  );
}

// ─── Helpers ───

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.includes('pdf')) return <FileText className="w-4 h-4 text-error-400" />;
  if (mimeType.includes('image')) return <Image className="w-4 h-4 text-primary-400" />;
  return <File className="w-4 h-4 text-gray-400" />;
}

function DocStatusChip({ status }: { status: string }) {
  const config: Record<string, { variant: 'success' | 'primary' | 'warning' | 'error' | 'default' | 'info'; label: string }> = {
    new: { variant: 'primary', label: 'New' },
    classified: { variant: 'info', label: 'Classified' },
    linked: { variant: 'success', label: 'Linked' },
    needs_info: { variant: 'warning', label: 'Needs Info' },
    archived: { variant: 'default', label: 'Archived' },
  };
  const c = config[status] || config.new;
  return <Chip variant={c.variant} size="sm">{c.label}</Chip>;
}

function formatCategory(cat?: string) {
  if (!cat) return 'Other';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
