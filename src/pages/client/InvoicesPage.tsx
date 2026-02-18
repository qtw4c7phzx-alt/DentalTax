import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Modal, Chip, Tabs, EmptyState, Select } from '../../components/ui';
import { Receipt, Plus, Search, Send, Eye, Download, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import clsx from 'clsx';
import type { Invoice, InvoiceLineItem, InvoiceStatus } from '../../types';

export function InvoicesPage() {
  const { invoices, customers, addInvoice, updateInvoice, addToast } = useStore();
  const tenantInvoices = invoices.filter(i => i.tenantId === 'tenant-brightsmile');
  const tenantCustomers = customers.filter(c => c.tenantId === 'tenant-brightsmile');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Create form
  const [customerId, setCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: uuid(), description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');

  const filtered = tenantInvoices
    .filter(i => activeTab === 'all' || i.status === activeTab)
    .filter(i => !search || i.customerName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

  const updateLineItem = (idx: number, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(items => items.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.total = updated.quantity * updated.unitPrice;
      return updated;
    }));
  };

  const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0);
  const discountAmount = discountType === 'percentage' ? subtotal * discount / 100 : discount;
  const total = subtotal - discountAmount;

  const handleCreate = () => {
    const customer = tenantCustomers.find(c => c.id === customerId);
    if (!customer) return;

    const inv: Invoice = {
      id: uuid(),
      tenantId: 'tenant-brightsmile',
      customerId,
      customerName: customer.name,
      invoiceNumber: `BS-2026-${String(tenantInvoices.length + 5).padStart(3, '0')}`,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: lineItems.filter(li => li.description),
      subtotal,
      discount,
      discountType,
      tax: 0,
      total,
      paymentTerms,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    addInvoice(inv);
    addToast({ type: 'success', title: 'Invoice created', message: inv.invoiceNumber });
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setCustomerId('');
    setLineItems([{ id: uuid(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setDiscount(0);
    setNotes('');
  };

  const handleSend = (invId: string) => {
    updateInvoice(invId, { status: 'sent' });
    addToast({ type: 'success', title: 'Invoice sent', message: 'Email notification simulated' });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">Create and manage patient invoices.</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>New Invoice</Button>
      </div>

      <Tabs
        tabs={[
          { key: 'all', label: 'All', count: tenantInvoices.length },
          { key: 'draft', label: 'Drafts', count: tenantInvoices.filter(i => i.status === 'draft').length },
          { key: 'sent', label: 'Sent', count: tenantInvoices.filter(i => i.status === 'sent').length },
          { key: 'paid', label: 'Paid', count: tenantInvoices.filter(i => i.status === 'paid').length },
          { key: 'overdue', label: 'Overdue', count: tenantInvoices.filter(i => i.status === 'overdue').length },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-4 mb-4">
        <Input
          placeholder="Search invoices..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filtered.length > 0 ? (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Issue Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{format(new Date(inv.issueDate), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{format(new Date(inv.dueDate), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      £{inv.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusChip status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.status === 'draft' && (
                          <Button variant="ghost" size="sm" icon={<Send className="w-3.5 h-3.5" />} onClick={() => handleSend(inv.id)}>
                            Send
                          </Button>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <Download className="w-4 h-4" />
                        </button>
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
          icon={<Receipt className="w-8 h-8" />}
          title="No invoices"
          description="Create your first invoice to bill patients."
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>New Invoice</Button>}
        />
      )}

      {/* Create Invoice Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create Invoice"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!customerId || lineItems.every(li => !li.description)}>
              Create Draft
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Select
            label="Customer"
            options={[
              { value: '', label: 'Select a customer...' },
              ...tenantCustomers.map(c => ({ value: c.id, label: c.name })),
            ]}
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
            <div className="space-y-2">
              {lineItems.map((li, idx) => (
                <div key={li.id} className="flex gap-2 items-end">
                  <Input
                    placeholder="Description"
                    value={li.description}
                    onChange={e => updateLineItem(idx, 'description', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Qty"
                    type="number"
                    value={li.quantity || ''}
                    onChange={e => updateLineItem(idx, 'quantity', Number(e.target.value))}
                    className="w-20"
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={li.unitPrice || ''}
                    onChange={e => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                    className="w-28"
                  />
                  <span className="text-sm font-medium text-gray-700 w-20 text-right py-2">
                    £{li.total.toFixed(2)}
                  </span>
                  {lineItems.length > 1 && (
                    <button onClick={() => setLineItems(items => items.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-error-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setLineItems(items => [...items, { id: uuid(), description: '', quantity: 1, unitPrice: 0, total: 0 }])}
            >
              Add Line
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2 items-end">
              <Input
                label="Discount"
                type="number"
                value={discount || ''}
                onChange={e => setDiscount(Number(e.target.value))}
                className="flex-1"
              />
              <select
                className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm mb-0"
                value={discountType}
                onChange={e => setDiscountType(e.target.value as 'fixed' | 'percentage')}
              >
                <option value="fixed">£</option>
                <option value="percentage">%</option>
              </select>
            </div>
            <Select
              label="Payment Terms"
              options={[
                { value: 'Due on Receipt', label: 'Due on Receipt' },
                { value: 'Net 14', label: 'Net 14' },
                { value: 'Net 30', label: 'Net 30' },
                { value: 'Net 60', label: 'Net 60' },
              ]}
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">£{subtotal.toFixed(2)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-error-500">-£{discountAmount.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between text-base font-semibold pt-1 border-t border-gray-200">
              <span>Total</span><span>£{total.toFixed(2)}</span>
            </div>
          </div>

          <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment plan, special instructions, etc." />
        </div>
      </Modal>
    </div>
  );
}

function InvoiceStatusChip({ status }: { status: InvoiceStatus }) {
  const config: Record<string, { variant: 'success' | 'primary' | 'warning' | 'error' | 'default'; label: string }> = {
    draft: { variant: 'default', label: 'Draft' },
    sent: { variant: 'primary', label: 'Sent' },
    paid: { variant: 'success', label: 'Paid' },
    overdue: { variant: 'error', label: 'Overdue' },
    cancelled: { variant: 'default', label: 'Cancelled' },
  };
  const c = config[status] || config.draft;
  return <Chip variant={c.variant} size="sm" dot>{c.label}</Chip>;
}
