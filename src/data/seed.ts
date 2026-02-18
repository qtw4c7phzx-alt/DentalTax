import { v4 as uuid } from 'uuid';
import type {
  Tenant, User, Envelope, Document, BankAccount, BankTransaction,
  Match, Ticket, TicketMessage, Output, AuditLogEntry, Customer,
  Invoice, NotificationTemplate, TransactionStatus, UserRole,
} from '../types';

// ─── Helper ───
const id = () => uuid();
const date = (y: number, m: number, d: number) =>
  new Date(y, m - 1, d).toISOString();

// ─── Tenant IDs ───
const T1 = 'tenant-brightsmile';
const T2 = 'tenant-dentalcare';
const T3 = 'tenant-oakwood';

// ─── User IDs ───
const U_ADMIN = 'user-platform-admin';
const U_ACCT = 'user-accountant';
const U_T1_ADMIN = 'user-t1-admin';
const U_T1_CLIENT = 'user-t1-client';
const U_T2_ADMIN = 'user-t2-admin';
const U_T3_ADMIN = 'user-t3-admin';

// ═══════════════════════════════════════════════
// TENANTS
// ═══════════════════════════════════════════════

export const seedTenants: Tenant[] = [
  {
    id: T1,
    name: 'BrightSmile Dental Ltd',
    entityType: 'limited_company',
    companyNumber: '12345678',
    vatStatus: 'registered',
    vatNumber: 'GB123456789',
    registeredAddress: '45 Harley Street, London W1G 8QR',
    tradingAddress: '45 Harley Street, London W1G 8QR',
    yearEnd: '31 March',
    incorporationDate: '2018-06-15',
    createdAt: date(2025, 3, 1),
    storageUsedMB: 245,
    isOnboarded: true,
    aggregatorProvider: 'truelayer',
  },
  {
    id: T2,
    name: 'DentalCare Associates',
    entityType: 'partnership',
    utrNumber: '1234567890',
    partnerCount: 3,
    partners: [
      { id: id(), name: 'Dr. Sarah Mitchell', utrNumber: '2345678901', profitSharePercent: 40 },
      { id: id(), name: 'Dr. James Crawford', utrNumber: '3456789012', profitSharePercent: 35 },
      { id: id(), name: 'Dr. Emily Watson', utrNumber: '4567890123', profitSharePercent: 25 },
    ],
    vatStatus: 'not_registered',
    registeredAddress: '12 High Street, Manchester M1 2AB',
    yearEnd: '5 April',
    createdAt: date(2025, 4, 10),
    storageUsedMB: 89,
    isOnboarded: true,
    aggregatorProvider: 'yapily',
  },
  {
    id: T3,
    name: 'Oakwood Dental - Dr. Patel',
    entityType: 'sole_trader',
    utrNumber: '5678901234',
    vatStatus: 'unknown',
    registeredAddress: '7 Oak Lane, Bristol BS1 5QD',
    yearEnd: '5 April',
    createdAt: date(2025, 5, 20),
    storageUsedMB: 34,
    isOnboarded: false,
  },
];

// ═══════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════

export const seedUsers: User[] = [
  {
    id: U_ADMIN,
    tenantId: '',
    email: 'admin@dentaltax.co.uk',
    name: 'Alex Morgan',
    role: 'platform_admin',
    isActive: true,
    lastLogin: date(2026, 2, 18),
    createdAt: date(2025, 1, 1),
  },
  {
    id: U_ACCT,
    tenantId: '',
    email: 'accountant@dentaltax.co.uk',
    name: 'Charlotte Hughes',
    role: 'accountant',
    isActive: true,
    lastLogin: date(2026, 2, 17),
    createdAt: date(2025, 1, 1),
  },
  {
    id: U_T1_ADMIN,
    tenantId: T1,
    email: 'manager@brightsmile.co.uk',
    name: 'Dr. Richard Blake',
    role: 'tenant_admin',
    isActive: true,
    lastLogin: date(2026, 2, 16),
    createdAt: date(2025, 3, 1),
  },
  {
    id: U_T1_CLIENT,
    tenantId: T1,
    email: 'reception@brightsmile.co.uk',
    name: 'Sophie Turner',
    role: 'client',
    isActive: true,
    lastLogin: date(2026, 2, 15),
    createdAt: date(2025, 3, 5),
  },
  {
    id: U_T2_ADMIN,
    tenantId: T2,
    email: 'sarah@dentalcare.co.uk',
    name: 'Dr. Sarah Mitchell',
    role: 'tenant_admin',
    isActive: true,
    lastLogin: date(2026, 2, 14),
    createdAt: date(2025, 4, 10),
  },
  {
    id: U_T3_ADMIN,
    tenantId: T3,
    email: 'patel@oakwood-dental.co.uk',
    name: 'Dr. Raj Patel',
    role: 'tenant_admin',
    isActive: true,
    lastLogin: date(2026, 1, 5),
    createdAt: date(2025, 5, 20),
  },
];

// ═══════════════════════════════════════════════
// ENVELOPES (6 months for BrightSmile)
// ═══════════════════════════════════════════════

const months = [
  { m: 9, y: 2025, label: 'September 2025', state: 'closed' as const },
  { m: 10, y: 2025, label: 'October 2025', state: 'closed' as const },
  { m: 11, y: 2025, label: 'November 2025', state: 'in_review' as const },
  { m: 12, y: 2025, label: 'December 2025', state: 'sealed' as const },
  { m: 1, y: 2026, label: 'January 2026', state: 'open' as const },
  { m: 2, y: 2026, label: 'February 2026', state: 'open' as const },
];

export const seedEnvelopes: Envelope[] = months.map((mo, i) => ({
  id: `env-${mo.y}-${String(mo.m).padStart(2, '0')}`,
  tenantId: T1,
  month: mo.m,
  year: mo.y,
  label: mo.label,
  state: mo.state,
  sealedAt: ['closed', 'in_review', 'sealed'].includes(mo.state)
    ? date(mo.y, mo.m, 28) : undefined,
  closedAt: mo.state === 'closed' ? date(mo.y, mo.m + 1, 15) : undefined,
  sealedBy: ['closed', 'in_review', 'sealed'].includes(mo.state) ? U_T1_ADMIN : undefined,
  closedBy: mo.state === 'closed' ? U_ACCT : undefined,
  documentCount: [12, 9, 14, 8, 6, 2][i],
  unmatchedTxnCount: [0, 0, 3, 2, 5, 4][i],
  openTicketCount: [0, 0, 1, 0, 2, 1][i],
  createdAt: date(mo.y, mo.m, 1),
}));

// ═══════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════

const docCategories = ['receipt', 'purchase_invoice', 'sales_invoice', 'credit_note', 'bank_statement'] as const;
const suppliers = ['Henry Schein', 'Dental Directory', 'BDA Insurance', 'NHS BSA', 'Amazon Business', 'Screwfix', 'British Gas', 'HMRC'];

function makeDocuments(): Document[] {
  const docs: Document[] = [];
  const envIds = seedEnvelopes.map(e => e.id);

  // Feb 2026 (open - current month) — 2 docs
  docs.push(
    { id: 'doc-feb-01', tenantId: T1, envelopeId: envIds[5], fileName: 'Henry_Schein_Invoice_Feb.pdf', fileSize: 245000, mimeType: 'application/pdf', category: 'purchase_invoice', amount: 1245.60, date: '2026-02-03', supplier: 'Henry Schein', status: 'new', uploadedBy: U_T1_CLIENT, uploadedAt: date(2026, 2, 5), },
    { id: 'doc-feb-02', tenantId: T1, envelopeId: envIds[5], fileName: 'Lab_Receipt_0203.jpg', fileSize: 890000, mimeType: 'image/jpeg', category: 'receipt', amount: 340.00, date: '2026-02-03', supplier: 'Dental Lab UK', status: 'new', uploadedBy: U_T1_CLIENT, uploadedAt: date(2026, 2, 6), },
  );

  // Jan 2026 (open) — 6 docs
  docs.push(
    { id: 'doc-jan-01', tenantId: T1, envelopeId: envIds[4], fileName: 'NHS_BSA_Remittance_Jan.pdf', fileSize: 156000, mimeType: 'application/pdf', category: 'sales_invoice', amount: 8450.00, date: '2026-01-15', supplier: 'NHS BSA', status: 'classified', uploadedBy: U_T1_CLIENT, uploadedAt: date(2026, 1, 16), },
    { id: 'doc-jan-02', tenantId: T1, envelopeId: envIds[4], fileName: 'Amazon_Order_Supplies.pdf', fileSize: 98000, mimeType: 'application/pdf', category: 'purchase_invoice', amount: 234.99, date: '2026-01-10', supplier: 'Amazon Business', status: 'linked', uploadedBy: U_T1_CLIENT, uploadedAt: date(2026, 1, 12), },
    { id: 'doc-jan-03', tenantId: T1, envelopeId: envIds[4], fileName: 'British_Gas_Bill_Jan.pdf', fileSize: 112000, mimeType: 'application/pdf', category: 'purchase_invoice', amount: 189.50, date: '2026-01-08', supplier: 'British Gas', status: 'needs_info', uploadedBy: U_T1_CLIENT, uploadedAt: date(2026, 1, 10), notes: 'Is this the surgery or the residential address?' },
    { id: 'doc-jan-04', tenantId: T1, envelopeId: envIds[4], fileName: 'Credit_Note_Schein.pdf', fileSize: 67000, mimeType: 'application/pdf', category: 'credit_note', amount: -125.00, date: '2026-01-20', supplier: 'Henry Schein', status: 'classified', uploadedBy: U_T1_ADMIN, uploadedAt: date(2026, 1, 22), },
    { id: 'doc-jan-05', tenantId: T1, envelopeId: envIds[4], fileName: 'Petty_Cash_Receipts_Bundle.pdf', fileSize: 2340000, mimeType: 'application/pdf', category: 'receipt', amount: 78.45, date: '2026-01-25', supplier: undefined, status: 'new', uploadedBy: U_T1_CLIENT, uploadedAt: date(2026, 1, 26), },
    { id: 'doc-jan-06', tenantId: T1, envelopeId: envIds[4], fileName: 'Private_Patient_Invoice_1042.pdf', fileSize: 89000, mimeType: 'application/pdf', category: 'sales_invoice', amount: 1850.00, date: '2026-01-18', supplier: undefined, status: 'classified', uploadedBy: U_T1_ADMIN, uploadedAt: date(2026, 1, 20), },
  );

  // Dec 2025 (sealed) — 8 docs
  for (let i = 1; i <= 8; i++) {
    const cat = docCategories[i % docCategories.length];
    docs.push({
      id: `doc-dec-${String(i).padStart(2, '0')}`,
      tenantId: T1,
      envelopeId: envIds[3],
      fileName: `Dec_${cat}_${i}.pdf`,
      fileSize: 100000 + Math.floor(Math.random() * 200000),
      mimeType: 'application/pdf',
      category: cat,
      amount: Math.round((Math.random() * 2000 + 50) * 100) / 100,
      date: `2025-12-${String(i * 3 + 1).padStart(2, '0')}`,
      supplier: suppliers[i % suppliers.length],
      status: i <= 5 ? 'classified' : 'linked',
      uploadedBy: i % 2 === 0 ? U_T1_ADMIN : U_T1_CLIENT,
      uploadedAt: date(2025, 12, i * 3 + 2),
    });
  }

  // Nov 2025 (in_review) — 14 docs
  for (let i = 1; i <= 14; i++) {
    const cat = docCategories[i % docCategories.length];
    docs.push({
      id: `doc-nov-${String(i).padStart(2, '0')}`,
      tenantId: T1,
      envelopeId: envIds[2],
      fileName: `Nov_${cat}_${i}.pdf`,
      fileSize: 80000 + Math.floor(Math.random() * 300000),
      mimeType: 'application/pdf',
      category: cat,
      amount: Math.round((Math.random() * 3000 + 100) * 100) / 100,
      date: `2025-11-${String(Math.min(i * 2, 28)).padStart(2, '0')}`,
      supplier: suppliers[i % suppliers.length],
      status: i <= 10 ? 'linked' : i <= 12 ? 'classified' : 'needs_info',
      uploadedBy: i % 3 === 0 ? U_T1_ADMIN : U_T1_CLIENT,
      uploadedAt: date(2025, 11, Math.min(i * 2 + 1, 29)),
    });
  }

  // Oct 2025 (closed) — 9 docs
  for (let i = 1; i <= 9; i++) {
    const cat = docCategories[i % docCategories.length];
    docs.push({
      id: `doc-oct-${String(i).padStart(2, '0')}`,
      tenantId: T1,
      envelopeId: envIds[1],
      fileName: `Oct_${cat}_${i}.pdf`,
      fileSize: 90000 + Math.floor(Math.random() * 150000),
      mimeType: 'application/pdf',
      category: cat,
      amount: Math.round((Math.random() * 2500 + 75) * 100) / 100,
      date: `2025-10-${String(i * 3).padStart(2, '0')}`,
      supplier: suppliers[i % suppliers.length],
      status: 'archived',
      uploadedBy: U_T1_CLIENT,
      uploadedAt: date(2025, 10, i * 3 + 1),
    });
  }

  // Sep 2025 (closed) — 12 docs
  for (let i = 1; i <= 12; i++) {
    const cat = docCategories[i % docCategories.length];
    docs.push({
      id: `doc-sep-${String(i).padStart(2, '0')}`,
      tenantId: T1,
      envelopeId: envIds[0],
      fileName: `Sep_${cat}_${i}.pdf`,
      fileSize: 70000 + Math.floor(Math.random() * 250000),
      mimeType: 'application/pdf',
      category: cat,
      amount: Math.round((Math.random() * 2000 + 50) * 100) / 100,
      date: `2025-09-${String(Math.min(i * 2, 28)).padStart(2, '0')}`,
      supplier: suppliers[i % suppliers.length],
      status: 'archived',
      uploadedBy: i % 2 === 0 ? U_T1_ADMIN : U_T1_CLIENT,
      uploadedAt: date(2025, 9, Math.min(i * 2 + 1, 29)),
    });
  }

  return docs.map(d => ({ ...d, originalName: d.originalName || d.fileName }));
}

export const seedDocuments = makeDocuments();

// ═══════════════════════════════════════════════
// BANK ACCOUNTS
// ═══════════════════════════════════════════════

export const seedBankAccounts: BankAccount[] = [
  {
    id: 'ba-brightsmile-main',
    tenantId: T1,
    bankName: 'Barclays',
    accountName: 'BrightSmile Dental Ltd - Business Current',
    accountNumber: '••••4521',
    sortCode: '20-45-67',
    currency: 'GBP',
    balance: 34521.80,
    provider: 'truelayer',
    consentStatus: 'active',
    consentExpiresAt: date(2026, 5, 15),
    lastSyncAt: date(2026, 2, 18),
    createdAt: date(2025, 3, 5),
  },
  {
    id: 'ba-brightsmile-savings',
    tenantId: T1,
    bankName: 'Barclays',
    accountName: 'BrightSmile Dental Ltd - Savings',
    accountNumber: '••••4522',
    sortCode: '20-45-67',
    currency: 'GBP',
    balance: 125000.00,
    provider: 'truelayer',
    consentStatus: 'active',
    consentExpiresAt: date(2026, 5, 15),
    lastSyncAt: date(2026, 2, 18),
    createdAt: date(2025, 3, 5),
  },
  {
    id: 'ba-dentalcare-main',
    tenantId: T2,
    bankName: 'HSBC',
    accountName: 'DentalCare Associates - Current',
    accountNumber: '••••7891',
    sortCode: '40-12-34',
    currency: 'GBP',
    balance: 18750.45,
    provider: 'yapily',
    consentStatus: 'expired',
    consentExpiresAt: date(2026, 1, 10),
    lastSyncAt: date(2026, 1, 8),
    errorMessage: 'Consent expired. Please re-authorise.',
    createdAt: date(2025, 4, 15),
  },
];

// ═══════════════════════════════════════════════
// BANK TRANSACTIONS
// ═══════════════════════════════════════════════

function makeTransactions(): BankTransaction[] {
  const txns: BankTransaction[] = [];

  // Feb 2026 transactions
  const febTxns: Partial<BankTransaction>[] = [
    { description: 'NHS BSA PAYMENT', amount: 12450.00, date: '2026-02-01', status: 'unmatched', reference: 'NHS-FEB-001' },
    { description: 'HENRY SCHEIN UK LTD', amount: -1245.60, date: '2026-02-03', status: 'unmatched', reference: 'DD-HS-FEB' },
    { description: 'DENTAL LAB UK', amount: -340.00, date: '2026-02-04', status: 'unmatched', reference: 'FP-DL-001' },
    { description: 'BRITISH GAS ELECTRICITY', amount: -189.50, date: '2026-02-05', status: 'unmatched', reference: 'DD-BG-FEB' },
  ];
  febTxns.forEach((t, i) => {
    txns.push({
      id: `txn-feb-${String(i + 1).padStart(2, '0')}`,
      tenantId: T1,
      bankAccountId: 'ba-brightsmile-main',
      envelopeId: 'env-2026-02',
      date: t.date!,
      description: t.description!,
      amount: t.amount!,
      reference: t.reference,
      status: t.status as TransactionStatus,
      matchedDocumentIds: [],
      createdAt: t.date!,
    });
  });

  // Jan 2026 transactions
  const janTxns: Partial<BankTransaction>[] = [
    { description: 'NHS BSA PAYMENT', amount: 8450.00, date: '2026-01-15', status: 'matched', reference: 'NHS-JAN-001' },
    { description: 'AMAZON BUSINESS', amount: -234.99, date: '2026-01-10', status: 'matched', reference: 'AMZ-001' },
    { description: 'BRITISH GAS', amount: -189.50, date: '2026-01-08', status: 'unmatched', reference: 'DD-BG-JAN' },
    { description: 'PRIVATE PATIENT PAYMENT', amount: 1850.00, date: '2026-01-18', status: 'unmatched', reference: 'PP-1042' },
    { description: 'HENRY SCHEIN REFUND', amount: 125.00, date: '2026-01-22', status: 'unmatched', reference: 'HS-REF' },
    { description: 'BDA INSURANCE', amount: -450.00, date: '2026-01-25', status: 'unmatched', reference: 'DD-BDA-JAN' },
    { description: 'BARCLAYS INTEREST', amount: 12.45, date: '2026-01-31', status: 'unmatched', reference: 'INT-JAN' },
  ];
  janTxns.forEach((t, i) => {
    txns.push({
      id: `txn-jan-${String(i + 1).padStart(2, '0')}`,
      tenantId: T1,
      bankAccountId: 'ba-brightsmile-main',
      envelopeId: 'env-2026-01',
      date: t.date!,
      description: t.description!,
      amount: t.amount!,
      reference: t.reference,
      status: t.status as TransactionStatus,
      matchedDocumentIds: t.status === 'matched' ? [`doc-jan-${String(i + 1).padStart(2, '0')}`] : [],
      createdAt: t.date!,
    });
  });

  // Dec 2025 — sealed, more matched
  for (let i = 1; i <= 10; i++) {
    const isDebit = i % 3 !== 0;
    txns.push({
      id: `txn-dec-${String(i).padStart(2, '0')}`,
      tenantId: T1,
      bankAccountId: 'ba-brightsmile-main',
      envelopeId: 'env-2025-12',
      date: `2025-12-${String(i * 3).padStart(2, '0')}`,
      description: isDebit ? suppliers[i % suppliers.length].toUpperCase() : 'NHS BSA PAYMENT',
      amount: isDebit ? -(Math.round(Math.random() * 1500 * 100) / 100) : Math.round(Math.random() * 8000 * 100) / 100,
      status: i <= 8 ? 'matched' : 'unmatched',
      matchedDocumentIds: i <= 8 ? [`doc-dec-${String(Math.min(i, 8)).padStart(2, '0')}`] : [],
      createdAt: `2025-12-${String(i * 3).padStart(2, '0')}`,
    });
  }

  // Nov & earlier — mostly matched
  for (let mIdx = 0; mIdx < 3; mIdx++) {
    const moData = [
      { prefix: 'nov', envId: 'env-2025-11', mo: 11, y: 2025, count: 15 },
      { prefix: 'oct', envId: 'env-2025-10', mo: 10, y: 2025, count: 10 },
      { prefix: 'sep', envId: 'env-2025-09', mo: 9, y: 2025, count: 12 },
    ][mIdx];
    for (let i = 1; i <= moData.count; i++) {
      const isDebit = i % 3 !== 0;
      txns.push({
        id: `txn-${moData.prefix}-${String(i).padStart(2, '0')}`,
        tenantId: T1,
        bankAccountId: 'ba-brightsmile-main',
        envelopeId: moData.envId,
        date: `${moData.y}-${String(moData.mo).padStart(2, '0')}-${String(Math.min(i * 2, 28)).padStart(2, '0')}`,
        description: isDebit ? suppliers[i % suppliers.length].toUpperCase() : 'PATIENT / NHS PAYMENT',
        amount: isDebit ? -(Math.round(Math.random() * 2000 * 100) / 100) : Math.round(Math.random() * 10000 * 100) / 100,
        status: moData.prefix === 'nov' && i > 12 ? 'unmatched' : 'matched',
        matchedDocumentIds: moData.prefix === 'nov' && i > 12 ? [] : [`doc-${moData.prefix}-${String(Math.min(i, moData.prefix === 'nov' ? 14 : moData.prefix === 'oct' ? 9 : 12)).padStart(2, '0')}`],
        createdAt: `${moData.y}-${String(moData.mo).padStart(2, '0')}-${String(Math.min(i * 2, 28)).padStart(2, '0')}`,
      });
    }
  }

  return txns;
}

export const seedTransactions = makeTransactions();

// ═══════════════════════════════════════════════
// MATCHES
// ═══════════════════════════════════════════════

export const seedMatches: Match[] = seedTransactions
  .filter(t => t.status === 'matched' && t.matchedDocumentIds.length > 0)
  .map(t => ({
    id: `match-${t.id}`,
    tenantId: T1,
    transactionId: t.id,
    documentId: t.matchedDocumentIds[0],
    matchedBy: U_ACCT,
    matchedAt: t.createdAt,
    confidence: Math.floor(Math.random() * 30) + 70,
    isSplit: false,
  }));

// ═══════════════════════════════════════════════
// TICKETS
// ═══════════════════════════════════════════════

export const seedTickets: Ticket[] = [
  {
    id: 'ticket-001',
    tenantId: T1,
    envelopeId: 'env-2026-01',
    documentId: 'doc-jan-03',
    subject: 'Which address is this gas bill for?',
    status: 'waiting_on_client',
    priority: 'medium',
    createdBy: U_ACCT,
    assignedTo: U_T1_ADMIN,
    createdAt: date(2026, 1, 11),
    updatedAt: date(2026, 1, 12),
  },
  {
    id: 'ticket-002',
    tenantId: T1,
    envelopeId: 'env-2026-01',
    transactionId: 'txn-jan-06',
    subject: 'BDA Insurance — is this annual or monthly?',
    status: 'open',
    priority: 'low',
    createdBy: U_ACCT,
    createdAt: date(2026, 1, 26),
    updatedAt: date(2026, 1, 26),
  },
  {
    id: 'ticket-003',
    tenantId: T1,
    envelopeId: 'env-2026-02',
    subject: 'Missing receipts for petty cash in February',
    status: 'open',
    priority: 'high',
    createdBy: U_ACCT,
    assignedTo: U_T1_CLIENT,
    createdAt: date(2026, 2, 10),
    updatedAt: date(2026, 2, 10),
  },
  {
    id: 'ticket-004',
    tenantId: T1,
    envelopeId: 'env-2025-11',
    documentId: 'doc-nov-13',
    subject: 'Invoice scan is blurry — please re-upload',
    status: 'waiting_on_client',
    priority: 'medium',
    createdBy: U_ACCT,
    assignedTo: U_T1_CLIENT,
    createdAt: date(2025, 12, 2),
    updatedAt: date(2025, 12, 5),
  },
  {
    id: 'ticket-005',
    tenantId: T1,
    envelopeId: 'env-2025-09',
    subject: 'September VAT query — HMRC correspondence',
    status: 'resolved',
    priority: 'high',
    createdBy: U_T1_ADMIN,
    assignedTo: U_ACCT,
    createdAt: date(2025, 10, 5),
    updatedAt: date(2025, 10, 15),
    resolvedAt: date(2025, 10, 15),
  },
];

// ═══════════════════════════════════════════════
// TICKET MESSAGES
// ═══════════════════════════════════════════════

export const seedTicketMessages: TicketMessage[] = ([
  {
    id: 'tm-001-1',
    ticketId: 'ticket-001',
    authorId: U_ACCT,
    authorName: 'Charlotte Hughes',
    authorRole: 'accountant' as UserRole,
    content: 'Hi Richard, the British Gas bill for January — could you confirm whether this is for the surgery at 45 Harley Street or your residential address? We need to categorise it correctly.',
    attachments: [],
    createdAt: date(2026, 1, 11),
  },
  {
    id: 'tm-001-2',
    ticketId: 'ticket-001',
    authorId: U_T1_ADMIN,
    authorName: 'Dr. Richard Blake',
    authorRole: 'tenant_admin' as UserRole,
    content: 'Let me check with the practice manager. I believe it\'s the surgery but will confirm.',
    attachments: [],
    createdAt: date(2026, 1, 12),
  },
  {
    id: 'tm-003-1',
    ticketId: 'ticket-003',
    authorId: U_ACCT,
    authorName: 'Charlotte Hughes',
    authorRole: 'accountant' as UserRole,
    content: 'We\'re missing petty cash receipts for February. Could you please scan and upload them to the February envelope?',
    attachments: [],
    createdAt: date(2026, 2, 10),
  },
  {
    id: 'tm-005-1',
    ticketId: 'ticket-005',
    authorId: U_T1_ADMIN,
    authorName: 'Dr. Richard Blake',
    authorRole: 'tenant_admin' as UserRole,
    content: 'We received a VAT query letter from HMRC about our September return. Please see attached.',
    attachments: [
      { id: 'att-001', fileName: 'HMRC_VAT_Query.pdf', fileSize: 156000, mimeType: 'application/pdf', url: '#' },
    ],
    createdAt: date(2025, 10, 5),
  },
  {
    id: 'tm-005-2',
    ticketId: 'ticket-005',
    authorId: U_ACCT,
    authorName: 'Charlotte Hughes',
    authorRole: 'accountant' as UserRole,
    content: 'Thanks Richard. I\'ve reviewed this and prepared a response. The query was about exempt supplies — I\'ve clarified the dental exemption. Response filed with HMRC today.',
    attachments: [
      { id: 'att-002', fileName: 'HMRC_Response_Draft.pdf', fileSize: 98000, mimeType: 'application/pdf', url: '#' },
    ],
    createdAt: date(2025, 10, 15),
  },
] as TicketMessage[]).map(m => ({ ...m, senderId: m.authorId, senderRole: m.authorRole, body: m.content }));

// ═══════════════════════════════════════════════
// OUTPUTS
// ═══════════════════════════════════════════════

export const seedOutputs: Output[] = [
  // Sep 2025 — full set
  { id: 'out-sep-pnl', tenantId: T1, envelopeId: 'env-2025-09', type: 'pnl', title: 'Profit & Loss — September 2025', status: 'published', version: 2, preparedBy: U_ACCT, preparedAt: date(2025, 10, 12), publishedAt: date(2025, 10, 13), isPublished: true, fileSize: 245000, createdAt: date(2025, 10, 12) },
  { id: 'out-sep-tb', tenantId: T1, envelopeId: 'env-2025-09', type: 'trial_balance', title: 'Trial Balance — September 2025', status: 'published', version: 1, preparedBy: U_ACCT, preparedAt: date(2025, 10, 12), publishedAt: date(2025, 10, 13), isPublished: true, fileSize: 189000, createdAt: date(2025, 10, 12) },
  { id: 'out-sep-gl', tenantId: T1, envelopeId: 'env-2025-09', type: 'general_ledger', title: 'General Ledger — September 2025', status: 'published', version: 1, preparedBy: U_ACCT, preparedAt: date(2025, 10, 12), publishedAt: date(2025, 10, 13), isPublished: true, fileSize: 512000, createdAt: date(2025, 10, 12) },
  { id: 'out-sep-vat', tenantId: T1, envelopeId: 'env-2025-09', type: 'vat_report', title: 'VAT Return — Q2 2025/26', status: 'published', version: 1, preparedBy: U_ACCT, preparedAt: date(2025, 10, 14), publishedAt: date(2025, 10, 14), isPublished: true, fileSize: 134000, createdAt: date(2025, 10, 14) },
  // Oct 2025 — full set
  { id: 'out-oct-pnl', tenantId: T1, envelopeId: 'env-2025-10', type: 'pnl', title: 'Profit & Loss — October 2025', status: 'published', version: 1, preparedBy: U_ACCT, preparedAt: date(2025, 11, 10), publishedAt: date(2025, 11, 11), isPublished: true, fileSize: 238000, createdAt: date(2025, 11, 10) },
  { id: 'out-oct-tb', tenantId: T1, envelopeId: 'env-2025-10', type: 'trial_balance', title: 'Trial Balance — October 2025', status: 'published', version: 1, preparedBy: U_ACCT, preparedAt: date(2025, 11, 10), publishedAt: date(2025, 11, 11), isPublished: true, fileSize: 195000, createdAt: date(2025, 11, 10) },
  { id: 'out-oct-mp', tenantId: T1, envelopeId: 'env-2025-10', type: 'management_pack', title: 'Management Pack — October 2025', status: 'published', version: 1, preparedBy: U_ACCT, preparedAt: date(2025, 11, 12), publishedAt: date(2025, 11, 12), isPublished: true, fileSize: 890000, createdAt: date(2025, 11, 12) },
  // Nov 2025 — in progress (not published yet)
  { id: 'out-nov-pnl', tenantId: T1, envelopeId: 'env-2025-11', type: 'pnl', title: 'Profit & Loss — November 2025', status: 'draft', version: 1, preparedBy: U_ACCT, preparedAt: date(2025, 12, 8), isPublished: false, fileSize: 240000, notes: 'Draft — pending clarification on 3 items', createdAt: date(2025, 12, 8) },
];

// ═══════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════

export const seedAuditLog: AuditLogEntry[] = [
  { id: 'al-001', tenantId: T1, userId: U_T1_CLIENT, userName: 'Sophie Turner', action: 'upload', resource: 'document', resourceId: 'doc-feb-01', entityType: 'document', entityId: 'doc-feb-01', details: 'Uploaded Henry_Schein_Invoice_Feb.pdf', timestamp: date(2026, 2, 5) },
  { id: 'al-002', tenantId: T1, userId: U_T1_CLIENT, userName: 'Sophie Turner', action: 'upload', resource: 'document', resourceId: 'doc-feb-02', entityType: 'document', entityId: 'doc-feb-02', details: 'Uploaded Lab_Receipt_0203.jpg', timestamp: date(2026, 2, 6) },
  { id: 'al-003', tenantId: T1, userId: U_T1_ADMIN, userName: 'Dr. Richard Blake', action: 'seal', resource: 'envelope', resourceId: 'env-2025-12', entityType: 'envelope', entityId: 'env-2025-12', details: 'Sealed December 2025 envelope', timestamp: date(2025, 12, 28) },
  { id: 'al-004', tenantId: T1, userId: U_ACCT, userName: 'Charlotte Hughes', action: 'close', resource: 'envelope', resourceId: 'env-2025-10', entityType: 'envelope', entityId: 'env-2025-10', details: 'Closed October 2025 envelope', timestamp: date(2025, 11, 15) },
  { id: 'al-005', tenantId: T1, userId: U_ACCT, userName: 'Charlotte Hughes', action: 'publish', resource: 'output', resourceId: 'out-sep-pnl', entityType: 'output', entityId: 'out-sep-pnl', details: 'Published P&L September 2025 (v2)', timestamp: date(2025, 10, 13) },
  { id: 'al-006', tenantId: T1, userId: U_ACCT, userName: 'Charlotte Hughes', action: 'match', resource: 'transaction', resourceId: 'txn-jan-01', entityType: 'transaction', entityId: 'txn-jan-01', details: 'Matched NHS BSA PAYMENT to doc-jan-01', timestamp: date(2026, 1, 17) },
  { id: 'al-007', tenantId: T1, userId: U_ACCT, userName: 'Charlotte Hughes', action: 'create_ticket', resource: 'ticket', resourceId: 'ticket-001', entityType: 'ticket', entityId: 'ticket-001', details: 'Created ticket: Which address is this gas bill for?', timestamp: date(2026, 1, 11) },
  { id: 'al-008', userId: U_ADMIN, userName: 'Alex Morgan', action: 'login', resource: 'session', resourceId: '', entityType: 'session', entityId: '', details: 'Platform admin logged in', timestamp: date(2026, 2, 18) },
  { id: 'al-009', tenantId: T1, userId: U_ACCT, userName: 'Charlotte Hughes', action: 'classify', resource: 'document', resourceId: 'doc-jan-01', entityType: 'document', entityId: 'doc-jan-01', details: 'Classified as Sales Invoice', timestamp: date(2026, 1, 16) },
  { id: 'al-010', tenantId: T1, userId: U_T1_ADMIN, userName: 'Dr. Richard Blake', action: 'invite_user', resource: 'user', resourceId: U_T1_CLIENT, entityType: 'user', entityId: U_T1_CLIENT, details: 'Invited Sophie Turner as client user', timestamp: date(2025, 3, 5) },
];

// ═══════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════

export const seedCustomers: Customer[] = [
  { id: 'cust-001', tenantId: T1, name: 'John Patterson', email: 'john.p@email.com', phone: '07700 900123', address: '12 Elm Road, London W2 1AB', nhsNumber: 'NHS-4521789', isActive: true, createdAt: date(2025, 3, 10) },
  { id: 'cust-002', tenantId: T1, name: 'Margaret Williams', email: 'mwilliams@email.com', phone: '07700 900456', address: '34 Oak Avenue, London NW3 2CD', nhsNumber: 'NHS-7823456', isActive: true, createdAt: date(2025, 4, 15) },
  { id: 'cust-003', tenantId: T1, name: 'David Chen', email: 'dchen@email.com', phone: '07700 900789', address: '56 Maple Close, London SW1 3EF', isActive: true, createdAt: date(2025, 5, 20) },
  { id: 'cust-004', tenantId: T1, name: 'Sarah O\'Brien', email: 'sobrien@email.com', phone: '07700 900321', address: '78 Pine Street, London E1 4GH', nhsNumber: 'NHS-3214567', isActive: true, createdAt: date(2025, 6, 1) },
  { id: 'cust-005', tenantId: T1, name: 'James Morrison', email: 'jmorrison@email.com', isActive: false, createdAt: date(2025, 7, 10) },
];

// ═══════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════

export const seedInvoices: Invoice[] = [
  {
    id: 'inv-001', tenantId: T1, customerId: 'cust-001', customerName: 'John Patterson',
    invoiceNumber: 'BS-2026-001', status: 'paid', issueDate: '2026-01-05', dueDate: '2026-02-04',
    lineItems: [
      { id: 'li-001-1', description: 'Dental Examination', quantity: 1, unitPrice: 65.00, total: 65.00 },
      { id: 'li-001-2', description: 'Scale & Polish', quantity: 1, unitPrice: 85.00, total: 85.00 },
      { id: 'li-001-3', description: 'X-Ray (2 periapical)', quantity: 2, unitPrice: 35.00, total: 70.00 },
    ],
    subtotal: 220.00, discount: 0, discountType: 'fixed', tax: 0, total: 220.00,
    paymentTerms: 'Net 30', createdAt: date(2026, 1, 5),
  },
  {
    id: 'inv-002', tenantId: T1, customerId: 'cust-002', customerName: 'Margaret Williams',
    invoiceNumber: 'BS-2026-002', status: 'sent', issueDate: '2026-01-15', dueDate: '2026-02-14',
    lineItems: [
      { id: 'li-002-1', description: 'Crown (Porcelain)', quantity: 1, unitPrice: 650.00, total: 650.00 },
      { id: 'li-002-2', description: 'Temporary Crown', quantity: 1, unitPrice: 120.00, total: 120.00 },
      { id: 'li-002-3', description: 'Dental Impression', quantity: 1, unitPrice: 45.00, total: 45.00 },
    ],
    subtotal: 815.00, discount: 10, discountType: 'percentage', tax: 0, total: 733.50,
    paymentTerms: 'Net 30', createdAt: date(2026, 1, 15),
  },
  {
    id: 'inv-003', tenantId: T1, customerId: 'cust-003', customerName: 'David Chen',
    invoiceNumber: 'BS-2026-003', status: 'draft', issueDate: '2026-02-10', dueDate: '2026-03-12',
    lineItems: [
      { id: 'li-003-1', description: 'Invisalign Consultation', quantity: 1, unitPrice: 150.00, total: 150.00 },
      { id: 'li-003-2', description: 'Invisalign Treatment Plan', quantity: 1, unitPrice: 3500.00, total: 3500.00 },
    ],
    subtotal: 3650.00, discount: 250, discountType: 'fixed', tax: 0, total: 3400.00,
    paymentTerms: 'Net 30', notes: 'Payment plan available — discuss at next appointment', createdAt: date(2026, 2, 10),
  },
  {
    id: 'inv-004', tenantId: T1, customerId: 'cust-004', customerName: "Sarah O'Brien",
    invoiceNumber: 'BS-2026-004', status: 'overdue', issueDate: '2025-12-01', dueDate: '2025-12-31',
    lineItems: [
      { id: 'li-004-1', description: 'Root Canal Treatment', quantity: 1, unitPrice: 750.00, total: 750.00 },
      { id: 'li-004-2', description: 'Post & Core', quantity: 1, unitPrice: 200.00, total: 200.00 },
    ],
    subtotal: 950.00, discount: 0, discountType: 'fixed', tax: 0, total: 950.00,
    paymentTerms: 'Net 30', createdAt: date(2025, 12, 1),
  },
];

// ═══════════════════════════════════════════════
// NOTIFICATION TEMPLATES
// ═══════════════════════════════════════════════

export const seedNotificationTemplates: NotificationTemplate[] = [
  { id: 'nt-001', name: 'Envelope Sealed', channel: 'email', subject: 'Monthly envelope sealed — {{month}}', body: 'Hi {{name}}, the envelope for {{month}} has been sealed. Our team will begin review shortly.', isActive: true },
  { id: 'nt-002', name: 'New Ticket', channel: 'email', subject: 'New query from your accountant — {{subject}}', body: 'Hi {{name}}, your accountant has raised a query: {{subject}}. Please log in to respond.', isActive: true },
  { id: 'nt-003', name: 'Output Published', channel: 'email', subject: 'New report available — {{title}}', body: 'Hi {{name}}, a new report has been published: {{title}}. Log in to download.', isActive: true },
  { id: 'nt-004', name: 'Bank Consent Expiring', channel: 'email', subject: 'Action required: Bank consent expiring', body: 'Hi {{name}}, your bank connection consent expires on {{date}}. Please re-authorise to continue automatic feeds.', isActive: true },
  { id: 'nt-005', name: 'Document Upload', channel: 'in_app', subject: 'New document uploaded', body: '{{userName}} uploaded {{fileName}} to {{month}}.', isActive: true },
];
