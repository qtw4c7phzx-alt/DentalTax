# DentalTax

**A UK dental practice bookkeeping & document-capture SaaS — fully interactive demo.**

DentalTax is a show-and-tell quality web application prototype that demonstrates a complete bookkeeping platform purpose-built for UK dental practices. It features dual portals (Client + Admin), realistic seeded data, role-based access, and a comprehensive design system showcase.

---

## ✨ Key Features

### Client Portal

- **Dashboard** — KPIs, recent activity, open ticket count, upcoming deadlines
- **Envelopes** — Monthly document workspaces (open → sealed → closed lifecycle) with drag-and-drop upload
- **Banking** — Connected bank accounts, transaction feed with match status
- **Tickets** — Support threads between practice staff and accountant
- **Outputs** — Published reports (P&L, VAT Return, CT600, SA100, Management Accounts)
- **Customers** — NHS & private patient records
- **Invoices** — Invoice management with line items, discounts, and status tracking

### Admin Portal (Accountant / Platform Admin)

- **Work Queue** — Prioritised task list across all tenants
- **Documents** — Classify, match, and manage uploaded documents
- **Transactions** — Match bank transactions to documents with confidence scoring
- **Outputs** — Create and publish financial outputs per envelope
- **Tickets** — Split-view ticket management with chat-style message thread
- **Tenants** — Multi-tenant practice management with entity type display
- **Users** — Platform-wide user administration (RBAC)
- **Envelope Overrides** — Admin unseal / reopen / force-close with audit trail
- **Aggregator Config** — Open Banking provider setup (Yapily, TrueLayer, Plaid)
- **Notifications** — Email/in-app notification template management
- **Audit Log** — Full audit trail with search, filtering, and CSV export
- **Tenant Users** — Per-tenant team member management
- **Tenant Bank** — Bank connection management with consent status
- **Tenant Settings** — Practice configuration (entity type, VAT, year end, partners)

### Design System

A dedicated `/design-system` route showcasing every UI component: colours, typography, buttons, inputs, chips, cards, stat cards, alerts, tabs, avatars, dropzone, pagination, loader, empty state, and modal.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 7 |
| **Styling** | Tailwind CSS 4 (with `@tailwindcss/vite` plugin) |
| **State** | Zustand (single store, no backend needed) |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **Dates** | date-fns |
| **IDs** | uuid v4 |

---

## 📁 Project Structure

```
DentalTax/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json
└── src/
    ├── main.tsx / App.tsx / index.css
    ├── types/index.ts          # Full domain model (15+ interfaces)
    ├── data/seed.ts            # Realistic seed data
    ├── store/index.ts          # Zustand store with all CRUD actions
    ├── components/
    │   ├── layout/             # ClientLayout + AdminLayout
    │   └── ui/index.tsx         # 20+ reusable UI components
    └── pages/
        ├── auth/LoginPage.tsx
        ├── onboarding/OnboardingPage.tsx
        ├── client/ (7 pages)
        ├── admin/ (14 pages)
        └── DesignSystemPage.tsx
```

---

## 🏃 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build
npm run preview      # preview production build
```

---

## 🔐 Demo Login Personas

The login screen offers four pre-configured personas. No real authentication — clicking a persona card sets the role and redirects to the appropriate portal.

| Persona | Role | Portal | Description |
|---------|------|--------|-------------|
| **Dr. Richard Blake** | Tenant Admin | Client | Practice owner at BrightSmile Dental |
| **Sophie Turner** | Client User | Client | Office manager |
| **Charlotte Hughes** | Accountant | Admin | Bookkeeper managing multiple practices |
| **Alex Morgan** | Platform Admin | Admin | System administrator |

---

## 🏢 Entity Type Support

DentalTax supports all three UK legal entity types for dental practices:

- **Limited Company** — Company number, CT600 drafts, corporation tax
- **Sole Trader** — UTR number, SA100 drafts, self-assessment
- **Partnership** — Multiple partners with individual UTR/NI numbers, profit share percentages

---

## 🎨 Design Tokens

The design system uses a deep-blue primary palette with semantic colours:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-500` | `#2563eb` | Buttons, links, active states |
| `--color-primary-900` | `#0a1128` | Sidebar backgrounds |
| `--color-success-500` | `#10b981` | Positive states, matched items |
| `--color-warning-500` | `#f59e0b` | Pending states, alerts |
| `--color-error-500` | `#ef4444` | Errors, destructive actions |

Typography uses **Inter** via Google Fonts. Visit `/design-system` for the full interactive showcase.

---

## 📊 Seed Data

The app ships with rich, realistic seed data:

- **3 Dental Practices**: BrightSmile Dental (Ltd), DentalCare Partners (Partnership), Smile Solo (Sole Trader)
- **6 Users** across all roles
- **12 Monthly Envelopes** (Oct 2025 – Feb 2026) in various states
- **25+ Documents**: NHS BSA payments, supplier invoices, lab receipts, utility bills
- **40+ Bank Transactions**: Matched, unmatched, and split across two bank accounts
- **5 Tickets** with threaded messages and attachments
- **5 Financial Outputs**: P&L, VAT reports, management accounts
- **10 Audit Log Entries**
- **Customers, Invoices, Notification Templates**

All data uses UK-specific references (NHS, HMRC, British Gas, Henry Schein, etc.).

---

## 🧩 UI Component Library

`src/components/ui/index.tsx` exports 20+ production-ready components:

`Button` · `Input` · `Textarea` · `Select` · `Card` · `Modal` · `Chip` · `Alert` · `Tabs` · `Pagination` · `StatCard` · `Avatar` · `Loader` · `EmptyState` · `Dropzone` · `ToastContainer` · `Section` · `SearchInput`

---

## 📝 Assumptions & Scope

This is a **front-end demo only** — no backend, database, or real authentication. All data lives in Zustand’s in-memory store, initialised from `seed.ts` on app load.

- File uploads are simulated (no actual file storage)
- Bank connections show UI states but don’t connect to real Open Banking APIs
- PDF/report downloads are placeholder links
- All mutations work within the session but reset on page refresh

---

## 📄 Licence

Private — for demonstration purposes only.
