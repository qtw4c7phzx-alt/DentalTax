// ─── Core Domain Model Types ───

// ─── Enums ───

export type EntityType = 'limited_company' | 'sole_trader' | 'partnership';
export type VatStatus = 'not_registered' | 'registered' | 'standard' | 'flat_rate' | 'partial_exemption' | 'unknown';
export type EnvelopeState = 'open' | 'sealed' | 'in_review' | 'clarification_needed' | 'closed';
export type DocumentStatus = 'new' | 'pending' | 'classified' | 'linked' | 'matched' | 'needs_info' | 'archived' | 'excluded' | 'duplicate';
export type TransactionStatus = 'unmatched' | 'matched' | 'split' | 'needs_info' | 'suggested' | 'excluded';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_client' | 'waiting_on_accountant' | 'resolved' | 'closed';
export type UserRole = 'platform_admin' | 'tenant_admin' | 'accountant' | 'client' | 'client_admin' | 'client_staff';
export type AggregatorProvider = 'truelayer' | 'yapily' | 'tink' | 'plaid' | 'salt_edge';
export type OutputType = 'pnl' | 'trial_balance' | 'general_ledger' | 'vat_report' | 'management_pack' | 'tax_return' | 'vat_return' | 'profit_and_loss' | 'balance_sheet' | 'ct600_draft' | 'sa100_draft' | 'management_accounts';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// ─── Tenant ───

export interface Tenant {
  id: string;
  name: string;
  entityType: EntityType;
  companyNumber?: string;        // Ltd only
  utrNumber?: string;            // Sole Trader / Partnership
  partnerCount?: number;         // Partnership only
  partners?: PartnerInfo[];      // Partnership only
  vatStatus: VatStatus;
  vatNumber?: string;
  registeredAddress: string;
  tradingAddress?: string;
  yearEnd: string;              // e.g. "31 March"
  incorporationDate?: string;
  createdAt: string;
  storageUsedMB: number;
  isOnboarded: boolean;
  aggregatorProvider?: AggregatorProvider;
}

export interface PartnerInfo {
  id: string;
  name: string;
  utrNumber: string;
  utr?: string;
  niNumber?: string;
  profitSharePercent: number;
}

// ─── Users ───

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// ─── Envelopes (Monthly Workspace) ───

export interface Envelope {
  id: string;
  tenantId: string;
  month: number;           // 1-12
  year: number;
  label: string;           // e.g. "September 2025"
  state: EnvelopeState;
  sealedAt?: string;
  closedAt?: string;
  sealedBy?: string;
  closedBy?: string;
  documentCount: number;
  unmatchedTxnCount: number;
  openTicketCount: number;
  createdAt: string;
}

// ─── Documents ───

export type DocumentType = 'sales_invoice' | 'purchase_invoice' | 'receipt' | 'credit_note' | 'purchase_order' | 'bank_statement' | 'other';

export interface Document {
  id: string;
  tenantId: string;
  envelopeId: string;
  fileName: string;
  originalName?: string;
  fileSize: number;         // bytes
  mimeType: string;
  documentType?: DocumentType;
  type?: string;            // legacy alias
  category?: string;        // legacy alias
  amount?: number;
  date?: string;
  supplier?: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

// ─── Bank Accounts ───

export interface BankAccount {
  id: string;
  tenantId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;     // last 4 digits shown
  sortCode: string;
  currency: string;
  balance: number;
  provider: AggregatorProvider;
  consentStatus: 'active' | 'expired' | 'revoked' | 'error';
  consentExpiresAt: string;
  lastSyncAt?: string;
  lastSyncedAt?: string;     // alias
  errorMessage?: string;
  createdAt: string;
}

// ─── Bank Transactions ───

export interface BankTransaction {
  id: string;
  tenantId: string;
  bankAccountId: string;
  envelopeId?: string;
  date: string;
  description: string;
  amount: number;            // positive = credit, negative = debit
  category?: string;
  reference?: string;
  status: TransactionStatus;
  matchedDocumentIds: string[];
  createdAt: string;
}

// ─── Matches ───

export interface Match {
  id: string;
  tenantId: string;
  transactionId: string;
  documentId: string;
  matchedBy: string;
  matchedAt: string;
  confidence?: number;       // 0-100
  isSplit: boolean;
  splitAmount?: number;
  status?: string;
}

// ─── Tickets ───

export interface Ticket {
  id: string;
  tenantId: string;
  envelopeId?: string;
  documentId?: string;
  transactionId?: string;
  subject: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  senderId?: string;           // alias for authorId
  authorName: string;
  authorRole: UserRole;
  senderRole?: UserRole;         // alias for authorRole
  content: string;
  body?: string;               // alias for content
  attachments: TicketAttachment[];
  createdAt: string;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

// ─── Outputs ───

export interface Output {
  id: string;
  tenantId?: string;
  envelopeId: string;
  type: OutputType;
  title?: string;
  status?: 'draft' | 'published';
  version: number;
  preparedBy: string;
  preparedAt?: string;
  publishedAt?: string;
  isPublished?: boolean;
  fileSize?: number;
  fileUrl?: string;
  notes?: string;
  createdAt?: string;
}

// ─── Audit Log ───

export interface AuditLogEntry {
  id: string;
  tenantId?: string;
  userId: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  entityType?: string;        // alias for resource
  entityId?: string;          // alias for resourceId
  details: string;
  timestamp: string;
}

// ─── Customers ───

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  nhsNumber?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Invoices ───

export interface Invoice {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  total: number;
  paymentTerms: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ─── Notification Templates (Admin UI only) ───

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'email' | 'in_app' | 'both';
  trigger?: string;
  subject: string;
  body: string;
  bodyTemplate?: string;      // alias for body
  isActive: boolean;
  enabled?: boolean;          // alias for isActive
}

// ─── Onboarding ───

export interface OnboardingState {
  tenantId: string;
  currentStep: number;           // 0-5
  completedSteps: boolean[];     // [step1, step2, …step6]
  entityType: EntityType | '';
  // Step 2: Business details
  tradingName: string;
  legalName: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  // Step 3: Tax profile
  companiesHouseNumber: string;
  yearEnd: string;
  utr: string;
  niNumber: string;
  bookkeepingBasis: 'cash' | 'accrual' | '';
  chartTemplate: string;
  partners: { name: string; email: string }[];
  // Step 4: VAT
  vatStatus: VatStatus | '';
  vatNumber: string;
  vatScheme: string;
  vatEffectiveDate: string;
  // Step 5: Bank
  aggregatorProvider: AggregatorProvider | '';
  bankConnected: boolean;
  // Step 6: Team
  invites: { email: string; role: 'client' | 'tenant_admin' | 'client_staff' }[];
}

export const defaultOnboardingState = (tenantId: string): OnboardingState => ({
  tenantId,
  currentStep: 0,
  completedSteps: [false, false, false, false, false, false],
  entityType: '',
  tradingName: '',
  legalName: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
  industry: 'Dental',
  companiesHouseNumber: '',
  yearEnd: '31 March',
  utr: '',
  niNumber: '',
  bookkeepingBasis: '',
  chartTemplate: 'Dental',
  partners: [{ name: '', email: '' }, { name: '', email: '' }],
  vatStatus: '',
  vatNumber: '',
  vatScheme: '',
  vatEffectiveDate: '',
  aggregatorProvider: '',
  bankConnected: false,
  invites: [{ email: '', role: 'client' }],
});

// ─── App State ───

export interface AppState {
  currentUser: User | null;
  currentTenantId: string | null;
  portal: 'client' | 'admin';
}
