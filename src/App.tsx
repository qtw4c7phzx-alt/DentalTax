import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from './components/ui';

// Layouts
import { ClientLayout } from './components/layout/ClientLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Auth & Onboarding
import { LoginPage } from './pages/auth/LoginPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

// Client Pages
import { DashboardPage } from './pages/client/DashboardPage';
import { EnvelopesPage } from './pages/client/EnvelopesPage';
import { BankingPage } from './pages/client/BankingPage';
import { TicketsPage } from './pages/client/TicketsPage';
import { OutputsPage } from './pages/client/OutputsPage';
import { CustomersPage } from './pages/client/CustomersPage';
import { InvoicesPage } from './pages/client/InvoicesPage';

// Admin Pages — Accountant Workspace
import { WorkQueuePage } from './pages/admin/WorkQueuePage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminOutputsPage } from './pages/admin/AdminOutputsPage';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage';

// Admin Pages — Platform Admin
import { TenantsPage } from './pages/admin/TenantsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { EnvelopeOverridePage } from './pages/admin/EnvelopeOverridePage';
import { AggregatorConfigPage } from './pages/admin/AggregatorConfigPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';

// Admin Pages — Tenant Admin
import { TenantUsersPage } from './pages/admin/TenantUsersPage';
import { TenantBankPage } from './pages/admin/TenantBankPage';
import { TenantSettingsPage } from './pages/admin/TenantSettingsPage';

// Design System
import { DesignSystemPage } from './pages/DesignSystemPage';
// AI Chat
import { ChatPage } from './pages/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Client Portal */}
        <Route element={<ClientLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/envelopes" element={<EnvelopesPage />} />
          <Route path="/banking" element={<BankingPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/outputs" element={<OutputsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Admin Portal */}
        <Route element={<AdminLayout />}>
          {/* Accountant workspace */}
          <Route path="/admin" element={<WorkQueuePage />} />
          <Route path="/admin/documents" element={<AdminDocumentsPage />} />
          <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
          <Route path="/admin/outputs" element={<AdminOutputsPage />} />
          <Route path="/admin/tickets" element={<AdminTicketsPage />} />
          {/* Platform admin */}
          <Route path="/admin/tenants" element={<TenantsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/envelopes" element={<EnvelopeOverridePage />} />
          <Route path="/admin/aggregator" element={<AggregatorConfigPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/audit-log" element={<AuditLogPage />} />
          {/* Tenant admin */}
          <Route path="/admin/tenant-users" element={<TenantUsersPage />} />
          <Route path="/admin/tenant-bank" element={<TenantBankPage />} />
          <Route path="/admin/tenant-settings" element={<TenantSettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Global toast container */}
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
