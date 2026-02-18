import { create } from 'zustand';
import type {
  User, Tenant, Envelope, Document, BankAccount, BankTransaction,
  Match, Ticket, TicketMessage, Output, AuditLogEntry, Customer,
  Invoice, NotificationTemplate, UserRole, EnvelopeState, DocumentStatus,
  TransactionStatus, TicketStatus, OnboardingState,
} from '../types';
import { defaultOnboardingState } from '../types';
import {
  seedTenants, seedUsers, seedEnvelopes, seedDocuments,
  seedBankAccounts, seedTransactions, seedMatches, seedTickets,
  seedTicketMessages, seedOutputs, seedAuditLog, seedCustomers,
  seedInvoices, seedNotificationTemplates,
} from '../data/seed';
import { v4 as uuid } from 'uuid';

// ─── App Store ───

interface AppStore {
  // Auth
  currentUser: User | null;
  portal: 'client' | 'admin';
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  switchToUser: (userId: string) => void;
  setPortal: (portal: 'client' | 'admin') => void;

  // Tenants
  tenants: Tenant[];
  currentTenantId: string | null;
  setCurrentTenantId: (id: string) => void;
  updateTenant: (id: string, data: Partial<Tenant>) => void;

  // Users
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Envelopes
  envelopes: Envelope[];
  updateEnvelopeState: (id: string, state: EnvelopeState, userId?: string) => void;

  // Documents
  documents: Document[];
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
  updateDocumentStatus: (id: string, status: DocumentStatus) => void;
  deleteDocument: (id: string) => void;

  // Bank Accounts
  bankAccounts: BankAccount[];

  // Transactions
  transactions: BankTransaction[];
  bankTransactions: BankTransaction[];   // alias
  updateTransactionStatus: (id: string, status: TransactionStatus, matchedDocIds?: string[]) => void;

  // Matches
  matches: Match[];
  addMatch: (match: Match) => void;

  // Tickets
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;

  // Ticket Messages
  ticketMessages: TicketMessage[];
  addTicketMessage: (msg: TicketMessage) => void;

  // Outputs
  outputs: Output[];
  addOutput: (output: Output) => void;
  publishOutput: (id: string) => void;

  // Audit Log
  auditLog: AuditLogEntry[];
  addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  addAuditLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void; // alias

  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;

  // Notification Templates
  notificationTemplates: NotificationTemplate[];
  updateTemplate: (id: string, data: Partial<NotificationTemplate>) => void;
  updateNotificationTemplate: (id: string, data: Partial<NotificationTemplate>) => void; // alias

  // Onboarding
  onboardingStates: Record<string, OnboardingState>;
  getOnboarding: (tenantId: string) => OnboardingState;
  updateOnboarding: (tenantId: string, data: Partial<OnboardingState>) => void;
  completeOnboardingStep: (tenantId: string, step: number) => void;
  finishOnboarding: (tenantId: string) => void;
  isOnboardingComplete: (tenantId: string) => boolean;
  isOnboardingMinComplete: (tenantId: string) => boolean; // steps 1-4 done

  // Toast
  toasts: Toast[];
  addToast: (toastOrTitle: Omit<Toast, 'id'> | string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export const useStore = create<AppStore>((set, get) => ({
  // Auth
  currentUser: seedUsers.find(u => u.role === 'client') || null,
  portal: 'client',
  setCurrentUser: (user) => set({ currentUser: user }),
  switchRole: (role) => {
    const user = seedUsers.find(u => u.role === role);
    if (user) {
      set({
        currentUser: user,
        portal: role === 'client' || role === 'tenant_admin' ? 'client' : 'admin',
        currentTenantId: user.tenantId || get().tenants[0]?.id || null,
      });
    }
  },
  switchToUser: (userId) => {
    const user = seedUsers.find(u => u.id === userId);
    if (user) {
      const role = user.role;
      set({
        currentUser: user,
        portal: role === 'client' || role === 'tenant_admin' || role === 'client_staff' || role === 'client_admin' ? 'client' : 'admin',
        currentTenantId: user.tenantId || get().tenants[0]?.id || null,
      });
    }
  },
  setPortal: (portal) => set({ portal }),

  // Tenants
  tenants: seedTenants,
  currentTenantId: 'tenant-brightsmile',
  setCurrentTenantId: (id) => set({ currentTenantId: id }),
  updateTenant: (id, data) =>
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, ...data } : t) })),

  // Users
  users: seedUsers,
  addUser: (user) => set(s => ({ users: [...s.users, user] })),
  updateUser: (id, data) =>
    set(s => ({ users: s.users.map(u => u.id === id ? { ...u, ...data } : u) })),
  deleteUser: (id) => set(s => ({ users: s.users.filter(u => u.id !== id) })),

  // Envelopes
  envelopes: seedEnvelopes,
  updateEnvelopeState: (id, state, userId) =>
    set(s => ({
      envelopes: s.envelopes.map(e => {
        if (e.id !== id) return e;
        const updates: Partial<Envelope> = { state };
        if (state === 'sealed') {
          updates.sealedAt = new Date().toISOString();
          updates.sealedBy = userId;
        }
        if (state === 'closed') {
          updates.closedAt = new Date().toISOString();
          updates.closedBy = userId;
        }
        return { ...e, ...updates };
      }),
    })),

  // Documents
  documents: seedDocuments,
  addDocument: (doc) =>
    set(s => ({
      documents: [...s.documents, doc],
      envelopes: s.envelopes.map(e =>
        e.id === doc.envelopeId ? { ...e, documentCount: e.documentCount + 1 } : e
      ),
    })),
  updateDocument: (id, data) =>
    set(s => ({ documents: s.documents.map(d => d.id === id ? { ...d, ...data } : d) })),
  updateDocumentStatus: (id, status) =>
    set(s => ({ documents: s.documents.map(d => d.id === id ? { ...d, status } : d) })),
  deleteDocument: (id) =>
    set(s => {
      const doc = s.documents.find(d => d.id === id);
      return {
        documents: s.documents.filter(d => d.id !== id),
        envelopes: doc
          ? s.envelopes.map(e => e.id === doc.envelopeId ? { ...e, documentCount: Math.max(0, e.documentCount - 1) } : e)
          : s.envelopes,
      };
    }),

  // Bank Accounts
  bankAccounts: seedBankAccounts,

  // Transactions
  transactions: seedTransactions,
  bankTransactions: seedTransactions,
  updateTransactionStatus: (id, status, matchedDocIds) =>
    set(s => {
      const updated = s.transactions.map(t =>
        t.id === id
          ? { ...t, status, matchedDocumentIds: matchedDocIds ?? t.matchedDocumentIds }
          : t
      );
      return { transactions: updated, bankTransactions: updated };
    }),

  // Matches
  matches: seedMatches,
  addMatch: (match) => set(s => ({ matches: [...s.matches, match] })),

  // Tickets
  tickets: seedTickets,
  addTicket: (ticket) =>
    set(s => ({
      tickets: [...s.tickets, ticket],
      envelopes: ticket.envelopeId
        ? s.envelopes.map(e =>
            e.id === ticket.envelopeId ? { ...e, openTicketCount: e.openTicketCount + 1 } : e
          )
        : s.envelopes,
    })),
  updateTicketStatus: (id, status) =>
    set(s => ({
      tickets: s.tickets.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t),
    })),

  // Ticket Messages
  ticketMessages: seedTicketMessages,
  addTicketMessage: (msg) => set(s => ({ ticketMessages: [...s.ticketMessages, msg] })),

  // Outputs
  outputs: seedOutputs,
  addOutput: (output) => set(s => ({ outputs: [...s.outputs, output] })),
  publishOutput: (id) =>
    set(s => ({
      outputs: s.outputs.map(o =>
        o.id === id ? { ...o, isPublished: true, status: 'published' as const, publishedAt: new Date().toISOString() } : o
      ),
    })),

  // Audit Log
  auditLog: seedAuditLog,
  addAuditEntry: (entry) =>
    set(s => ({
      auditLog: [{ ...entry, id: uuid(), timestamp: new Date().toISOString() }, ...s.auditLog],
    })),
  addAuditLogEntry: (entry) =>
    set(s => ({
      auditLog: [{ ...entry, id: uuid(), timestamp: new Date().toISOString() }, ...s.auditLog],
    })),

  // Customers
  customers: seedCustomers,
  addCustomer: (customer) => set(s => ({ customers: [...s.customers, customer] })),
  updateCustomer: (id, data) =>
    set(s => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...data } : c) })),

  // Invoices
  invoices: seedInvoices,
  addInvoice: (invoice) => set(s => ({ invoices: [...s.invoices, invoice] })),
  updateInvoice: (id, data) =>
    set(s => ({ invoices: s.invoices.map(inv => inv.id === id ? { ...inv, ...data } : inv) })),

  // Notification Templates
  notificationTemplates: seedNotificationTemplates,
  updateTemplate: (id, data) =>
    set(s => ({
      notificationTemplates: s.notificationTemplates.map(t =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),
  updateNotificationTemplate: (id, data) =>
    set(s => ({
      notificationTemplates: s.notificationTemplates.map(t =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),

  // Onboarding
  onboardingStates: (() => {
    // Load from localStorage if available
    try {
      const stored = localStorage.getItem('dentaltax-onboarding');
      if (stored) return JSON.parse(stored) as Record<string, OnboardingState>;
    } catch {}
    // Default: BrightSmile & DentalCare are onboarded, Oakwood is not
    return {
      'tenant-brightsmile': { ...defaultOnboardingState('tenant-brightsmile'), completedSteps: [true, true, true, true, true, true] },
      'tenant-dentalcare': { ...defaultOnboardingState('tenant-dentalcare'), completedSteps: [true, true, true, true, true, true] },
    } as Record<string, OnboardingState>;
  })(),
  getOnboarding: (tenantId) => {
    const s = get().onboardingStates[tenantId];
    return s || defaultOnboardingState(tenantId);
  },
  updateOnboarding: (tenantId, data) => {
    set(s => {
      const current = s.onboardingStates[tenantId] || defaultOnboardingState(tenantId);
      const updated = { ...s.onboardingStates, [tenantId]: { ...current, ...data } };
      try { localStorage.setItem('dentaltax-onboarding', JSON.stringify(updated)); } catch {}
      return { onboardingStates: updated };
    });
  },
  completeOnboardingStep: (tenantId, step) => {
    set(s => {
      const current = s.onboardingStates[tenantId] || defaultOnboardingState(tenantId);
      const completedSteps = [...current.completedSteps];
      completedSteps[step] = true;
      const updated = { ...s.onboardingStates, [tenantId]: { ...current, completedSteps } };
      try { localStorage.setItem('dentaltax-onboarding', JSON.stringify(updated)); } catch {}
      return { onboardingStates: updated };
    });
  },
  finishOnboarding: (tenantId) => {
    set(s => {
      const current = s.onboardingStates[tenantId] || defaultOnboardingState(tenantId);
      const completedSteps = current.completedSteps.map(() => true);
      const updated = { ...s.onboardingStates, [tenantId]: { ...current, completedSteps } };
      try { localStorage.setItem('dentaltax-onboarding', JSON.stringify(updated)); } catch {}
      return {
        onboardingStates: updated,
        tenants: s.tenants.map(t => t.id === tenantId ? { ...t, isOnboarded: true } : t),
      };
    });
  },
  isOnboardingComplete: (tenantId) => {
    const s = get().onboardingStates[tenantId];
    return !!s && s.completedSteps.every(Boolean);
  },
  isOnboardingMinComplete: (tenantId) => {
    const s = get().onboardingStates[tenantId];
    // Steps 0-3 (entity, business, tax, vat) must be done
    return !!s && s.completedSteps[0] && s.completedSteps[1] && s.completedSteps[2] && s.completedSteps[3];
  },

  // Toasts
  toasts: [],
  addToast: (toastOrTitle, type) => {
    const toast: Omit<Toast, 'id'> = typeof toastOrTitle === 'string'
      ? { title: toastOrTitle, type: type || 'info' }
      : toastOrTitle;
    const t = { ...toast, id: uuid() };
    set(s => ({ toasts: [...s.toasts, t] }));
    setTimeout(() => get().removeToast(t.id), 4000);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
