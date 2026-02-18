import { useState, useCallback, useRef } from 'react';
import { useStore } from '../../store';
import {
  Card, Button, Chip, Modal, Dropzone, Alert, EmptyState, Input, Select,
} from '../../components/ui';
import { EnvelopeChip } from './DashboardPage';
import {
  FileBox, Upload, Download, Lock, Copy, Mail, Check,
  FileText, Image, File, Trash2, Eye, Edit2,
  Search, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { Document as DocType, DocumentType } from '../../types';
import { v4 as uuid } from 'uuid';

// ─── Constants ───

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType | ''; label: string }[] = [
  { value: '', label: 'Select document type…' },
  { value: 'sales_invoice', label: 'Sales invoice' },
  { value: 'purchase_invoice', label: 'Purchase invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'credit_note', label: 'Credit note' },
  { value: 'purchase_order', label: 'Purchase order' },
  { value: 'bank_statement', label: 'Bank statement' },
  { value: 'other', label: 'Other' },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  sales_invoice: 'Sales Invoice',
  purchase_invoice: 'Purchase Invoice',
  receipt: 'Receipt',
  credit_note: 'Credit Note',
  purchase_order: 'Purchase Order',
  bank_statement: 'Bank Statement',
  other: 'Other',
};

// ─── File item for upload staging ───

interface StagedFile {
  file: File;
  id: string;
  documentType: DocumentType | '';
  overridden: boolean;           // user explicitly chose a per-file type
}

export function EnvelopesPage() {
  const {
    envelopes, documents, transactions, tickets,
    currentUser, addDocument, updateDocument, updateEnvelopeState, addToast, deleteDocument,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [globalDocType, setGlobalDocType] = useState<DocumentType | ''>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit metadata modal state
  const [editDoc, setEditDoc] = useState<DocType | null>(null);
  const [editDocType, setEditDocType] = useState<DocumentType | ''>('');

  const emailInAddress = 'docs+brightsmile-feb2026@inbox.dentaltax.co.uk';

  const isOpen = selectedEnv?.state === 'open';
  const canUpload = isOpen;

  // ─── Upload flow handlers ───

  const openUploadModal = () => {
    setStagedFiles([]);
    setGlobalDocType('');
    setShowAdvanced(false);
    setUploadError('');
    setShowUploadModal(true);
  };

  const handleFilesSelected = useCallback((files: File[]) => {
    setStagedFiles(prev => [
      ...prev,
      ...files.map(f => ({
        file: f,
        id: uuid(),
        documentType: '' as DocumentType | '',
        overridden: false,
      })),
    ]);
    setUploadError('');
  }, []);

  const removeStagedFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const setFileDocType = (id: string, type: DocumentType | '') => {
    setStagedFiles(prev => prev.map(f =>
      f.id === id ? { ...f, documentType: type, overridden: type !== '' } : f
    ));
  };

  const effectiveDocType = (sf: StagedFile): DocumentType | '' =>
    sf.overridden ? sf.documentType : (globalDocType || sf.documentType);

  const allTypesResolved = stagedFiles.length > 0 &&
    stagedFiles.every(sf => effectiveDocType(sf) !== '');

  const handleConfirmUpload = () => {
    if (!allTypesResolved) {
      setUploadError('Please select a document type for all files before uploading.');
      return;
    }

    stagedFiles.forEach(sf => {
      const docType = effectiveDocType(sf) as DocumentType;
      const doc: DocType = {
        id: uuid(),
        tenantId: 'tenant-brightsmile',
        envelopeId: selectedEnvId!,
        fileName: sf.file.name,
        originalName: sf.file.name,
        fileSize: sf.file.size,
        mimeType: sf.file.type || 'application/octet-stream',
        documentType: docType,
        category: docType,
        status: 'new',
        uploadedBy: currentUser?.id || '',
        uploadedAt: new Date().toISOString(),
      };
      addDocument(doc);
    });

    addToast({
      type: 'success',
      title: 'Documents uploaded',
      message: `${stagedFiles.length} file(s) added to ${selectedEnv?.label}`,
    });
    setShowUploadModal(false);
  };

  // ─── Edit metadata handlers ───

  const openEditMeta = (doc: DocType) => {
    setEditDoc(doc);
    setEditDocType((doc.documentType || doc.category || '') as DocumentType | '');
  };

  const saveEditMeta = () => {
    if (editDoc && editDocType) {
      updateDocument(editDoc.id, { documentType: editDocType as DocumentType, category: editDocType });
      addToast({ type: 'success', title: 'Document updated', message: `Type changed to ${DOC_TYPE_LABELS[editDocType] || editDocType}` });
    }
    setEditDoc(null);
  };

  // ─── Seal ───

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

  // ─── Filtering & sorting ───

  const filteredDocs = envDocs
    .filter(d => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!d.fileName.toLowerCase().includes(q) && !(d.supplier || '').toLowerCase().includes(q)) return false;
      }
      if (typeFilter && (d.documentType || d.category || 'other') !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const aType = DOC_TYPE_LABELS[a.documentType || a.category || 'other'] || 'Other';
      const bType = DOC_TYPE_LABELS[b.documentType || b.category || 'other'] || 'Other';
      return sortDir === 'asc' ? aType.localeCompare(bType) : bType.localeCompare(aType);
    });

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
                    onClick={openUploadModal}
                  >
                    Upload Documents
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

            {/* Email-in */}
            {canUpload && (
              <Card className="!p-4 mt-4">
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
            )}

            {/* Search + filter row */}
            <div className="mt-6 mb-4 flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search documents..."
                  icon={<Search className="w-4 h-4" />}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                options={[
                  { value: '', label: 'All types' },
                  ...DOCUMENT_TYPE_OPTIONS.filter(o => o.value !== ''),
                ]}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-44"
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
                        <th
                          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none group"
                          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                        >
                          <span className="inline-flex items-center gap-1">
                            Type
                            {sortDir === 'asc'
                              ? <ChevronUp className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                              : <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />}
                          </span>
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map(doc => {
                        const typeLbl = DOC_TYPE_LABELS[doc.documentType || doc.category || ''] || 'Other';
                        return (
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
                              <Chip variant="default" size="sm">{typeLbl}</Chip>
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
                                <button
                                  title="View"
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  title="Edit metadata"
                                  onClick={() => openEditMeta(doc)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  title="Download"
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {isOpen && (
                                  <button
                                    title="Delete"
                                    onClick={() => { deleteDocument(doc.id); addToast({ type: 'info', title: 'Document removed' }); }}
                                    className="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-500 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
                  <Button icon={<Upload className="w-4 h-4" />} onClick={openUploadModal}>
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

      {/* ═══════════════ Upload Modal ═══════════════ */}
      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Documents"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              icon={<Upload className="w-4 h-4" />}
              onClick={handleConfirmUpload}
              disabled={!allTypesResolved}
            >
              Upload {stagedFiles.length > 0 ? `(${stagedFiles.length})` : ''}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Step 1: Select files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">1. Select files</label>
            <Dropzone
              onFiles={handleFilesSelected}
              label="Drag & drop files here, or click to browse"
              accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx"
            />
          </div>

          {/* Staged file list */}
          {stagedFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {stagedFiles.length} file{stagedFiles.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setStagedFiles([])}
                  className="text-xs text-gray-500 hover:text-error-500 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {stagedFiles.map(sf => {
                  const resolved = effectiveDocType(sf);
                  return (
                    <div key={sf.id} className="flex items-center gap-3 px-3 py-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <FileIcon mimeType={sf.file.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{sf.file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(sf.file.size)}</p>
                      </div>
                      {/* Per-file type (shown if Advanced is open) */}
                      {showAdvanced && (
                        <select
                          value={sf.overridden ? sf.documentType : ''}
                          onChange={e => setFileDocType(sf.id, e.target.value as DocumentType | '')}
                          className={clsx(
                            'text-xs rounded-md border px-2 py-1 bg-white transition-colors w-36',
                            sf.overridden
                              ? 'border-primary-300 text-primary-700'
                              : 'border-gray-200 text-gray-500'
                          )}
                        >
                          <option value="">Use global</option>
                          {DOCUMENT_TYPE_OPTIONS.filter(o => o.value !== '').map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      )}
                      {/* Resolved type indicator */}
                      {!showAdvanced && resolved && (
                        <Chip variant="default" size="sm">{DOC_TYPE_LABELS[resolved] || resolved}</Chip>
                      )}
                      <button
                        onClick={() => removeStagedFile(sf.id)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-error-500 cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* Advanced toggle */}
              {stagedFiles.length > 1 && (
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer inline-flex items-center gap-1"
                >
                  {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showAdvanced ? 'Hide per-file overrides' : 'Set type per file (advanced)'}
                </button>
              )}
            </div>
          )}

          {/* Step 2: Document type */}
          {stagedFiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. Document type {stagedFiles.length > 1 ? '(apply to all)' : ''}
              </label>
              <Select
                options={DOCUMENT_TYPE_OPTIONS as { value: string; label: string }[]}
                value={globalDocType}
                onChange={e => {
                  setGlobalDocType(e.target.value as DocumentType | '');
                  setUploadError('');
                }}
                error={uploadError || undefined}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* ═══════════════ Edit Metadata Modal ═══════════════ */}
      <Modal
        open={!!editDoc}
        onClose={() => setEditDoc(null)}
        title="Edit Document Metadata"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditDoc(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveEditMeta} disabled={!editDocType}>
              Save
            </Button>
          </>
        }
      >
        {editDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <FileIcon mimeType={editDoc.mimeType} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{editDoc.fileName}</p>
                <p className="text-xs text-gray-500">{formatFileSize(editDoc.fileSize)}</p>
              </div>
            </div>
            <Select
              label="Document type"
              options={DOCUMENT_TYPE_OPTIONS.filter(o => o.value !== '') as { value: string; label: string }[]}
              value={editDocType}
              onChange={e => setEditDocType(e.target.value as DocumentType | '')}
            />
          </div>
        )}
      </Modal>

      {/* ═══════════════ Seal Modal ═══════════════ */}
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
