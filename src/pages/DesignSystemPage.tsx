import { useState } from 'react';
import {
  Button, Input, Select, Textarea, Chip, Card, Modal, Tabs,
  EmptyState, Loader, Alert, Dropzone, Pagination, StatCard, Avatar,
} from '../components/ui';
import {
  Palette, Type, Square, LayoutGrid, Bell, MousePointer, Upload,
  FileText, Users, Zap, Sun, Moon, Heart, Star, Check, X, Info,
  AlertTriangle, ArrowRight, Plus, Search, Settings, Mail,
} from 'lucide-react';

export function DesignSystemPage() {
  const [showModal, setShowModal] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [selectVal, setSelectVal] = useState('option1');
  const [activeTab, setActiveTab] = useState('tab1');
  const [page, setPage] = useState(1);

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Design System</h1>
        <p className="text-gray-500 text-lg">DentalTax UI component library and design tokens reference.</p>
      </div>

      {/* ─── Colour Tokens ─── */}
      <Section title="Colour Palette" icon={<Palette className="w-5 h-5" />}>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600">Primary (Deep Blue)</h4>
          <div className="grid grid-cols-7 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
              <div key={shade}>
                <div className={`h-16 rounded-lg bg-primary-${shade}`} style={{ backgroundColor: `var(--color-primary-${shade})` }} />
                <p className="text-xs text-gray-500 mt-1 text-center">{shade}</p>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-gray-600 mt-6">Semantic Colours</h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="h-16 rounded-lg bg-green-500" />
              <p className="text-xs text-center mt-1 text-gray-500">Success / Teal-Green</p>
            </div>
            <div>
              <div className="h-16 rounded-lg bg-amber-500" />
              <p className="text-xs text-center mt-1 text-gray-500">Warning / Amber</p>
            </div>
            <div>
              <div className="h-16 rounded-lg bg-red-500" />
              <p className="text-xs text-center mt-1 text-gray-500">Error / Red</p>
            </div>
            <div>
              <div className="h-16 rounded-lg bg-blue-500" />
              <p className="text-xs text-center mt-1 text-gray-500">Info / Blue</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Typography ─── */}
      <Section title="Typography" icon={<Type className="w-5 h-5" />}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Font Family: Inter (sans-serif)</p>
          </div>
          <div className="space-y-3">
            <p className="text-4xl font-bold text-gray-900">Heading 1 — 4xl Bold</p>
            <p className="text-3xl font-bold text-gray-900">Heading 2 — 3xl Bold</p>
            <p className="text-2xl font-bold text-gray-900">Heading 3 — 2xl Bold</p>
            <p className="text-xl font-semibold text-gray-900">Heading 4 — xl Semibold</p>
            <p className="text-lg font-semibold text-gray-900">Heading 5 — lg Semibold</p>
            <p className="text-base text-gray-700">Body — base regular</p>
            <p className="text-sm text-gray-600">Small — sm regular</p>
            <p className="text-xs text-gray-500">Caption — xs regular</p>
          </div>
        </div>
      </Section>

      {/* ─── Buttons ─── */}
      <Section title="Buttons" icon={<MousePointer className="w-5 h-5" />}>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600">Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>

          <h4 className="text-sm font-semibold text-gray-600">Sizes</h4>
          <div className="flex items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <h4 className="text-sm font-semibold text-gray-600">States</h4>
          <div className="flex gap-3">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button><Plus className="w-4 h-4 mr-1" /> With Icon</Button>
          </div>
        </div>
      </Section>

      {/* ─── Inputs ─── */}
      <Section title="Form Inputs" icon={<Square className="w-5 h-5" />}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Default Input" placeholder="Type something..." value={inputVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputVal(e.target.value)} />
          <Input label="With Icon" placeholder="Search..." icon={<Search className="w-4 h-4" />} value="" onChange={() => {}} />
          <Input label="With Hint" placeholder="Enter email" hint="We'll never share your email." value="" onChange={() => {}} />
          <Input label="With Error" placeholder="Required field" error="This field is required" value="" onChange={() => {}} />
          <Select label="Select" value={selectVal} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectVal(e.target.value)}
            options={[
              { label: 'Option 1', value: 'option1' },
              { label: 'Option 2', value: 'option2' },
              { label: 'Option 3', value: 'option3' },
            ]} />
          <Textarea label="Textarea" placeholder="Write something..." value="" onChange={() => {}} rows={3} />
        </div>
      </Section>

      {/* ─── Chips / Badges ─── */}
      <Section title="Chips & Badges" icon={<Star className="w-5 h-5" />}>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600">Variants</h4>
          <div className="flex flex-wrap gap-2">
            <Chip variant="default">Default</Chip>
            <Chip variant="success">Success</Chip>
            <Chip variant="warning">Warning</Chip>
            <Chip variant="error">Error</Chip>
            <Chip variant="info">Info</Chip>
          </div>

          <h4 className="text-sm font-semibold text-gray-600">With Dot</h4>
          <div className="flex flex-wrap gap-2">
            <Chip variant="success" dot>Active</Chip>
            <Chip variant="warning" dot>Pending</Chip>
            <Chip variant="error" dot>Expired</Chip>
            <Chip variant="info" dot>In Review</Chip>
          </div>

          <h4 className="text-sm font-semibold text-gray-600">Sizes</h4>
          <div className="flex items-center gap-2">
            <Chip variant="info" size="sm">Small</Chip>
            <Chip variant="info" size="md">Medium</Chip>
          </div>
        </div>
      </Section>

      {/* ─── Cards ─── */}
      <Section title="Cards" icon={<LayoutGrid className="w-5 h-5" />}>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <h4 className="font-semibold mb-1">Default Card</h4>
            <p className="text-sm text-gray-500">Standard card with padding.</p>
          </Card>
          <Card hover>
            <h4 className="font-semibold mb-1">Hover Card</h4>
            <p className="text-sm text-gray-500">Lifts on hover interaction.</p>
          </Card>
          <Card onClick={() => {}} hover>
            <h4 className="font-semibold mb-1">Clickable Card</h4>
            <p className="text-sm text-gray-500">Has cursor pointer.</p>
          </Card>
        </div>
      </Section>

      {/* ─── Stat Cards ─── */}
      <Section title="Stat Cards" icon={<Zap className="w-5 h-5" />}>
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Revenue" value="£24,500" icon={<FileText className="w-5 h-5" />} trend="+12%" />
          <StatCard label="Clients" value="47" icon={<Users className="w-5 h-5" />} />
          <StatCard label="Documents" value="284" icon={<FileText className="w-5 h-5" />} trend="+8%" />
          <StatCard label="Open Tickets" value="5" icon={<Bell className="w-5 h-5" />} />
        </div>
      </Section>

      {/* ─── Alerts ─── */}
      <Section title="Alerts" icon={<Bell className="w-5 h-5" />}>
        <div className="space-y-3">
          <Alert variant="info"><Info className="w-4 h-4 inline mr-1" /> This is an informational message.</Alert>
          <Alert variant="success"><Check className="w-4 h-4 inline mr-1" /> Operation completed successfully.</Alert>
          <Alert variant="warning"><AlertTriangle className="w-4 h-4 inline mr-1" /> Please review before continuing.</Alert>
          <Alert variant="error"><X className="w-4 h-4 inline mr-1" /> Something went wrong. Please try again.</Alert>
        </div>
      </Section>

      {/* ─── Tabs ─── */}
      <Section title="Tabs" icon={<LayoutGrid className="w-5 h-5" />}>
        <Tabs
          tabs={[
            { id: 'tab1', label: 'Overview', count: 12 },
            { id: 'tab2', label: 'Details', count: 5 },
            { id: 'tab3', label: 'Settings' },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
        />
        <Card className="mt-3">
          <p className="text-sm text-gray-600">Content for <strong>{activeTab}</strong></p>
        </Card>
      </Section>

      {/* ─── Avatars ─── */}
      <Section title="Avatars" icon={<Users className="w-5 h-5" />}>
        <div className="flex items-center gap-4">
          <Avatar name="John Doe" size="sm" />
          <Avatar name="Jane Smith" size="md" />
          <Avatar name="Dr Sarah Johnson" size="lg" />
          <Avatar name="BrightSmile" size="lg" />
        </div>
      </Section>

      {/* ─── Dropzone ─── */}
      <Section title="Dropzone" icon={<Upload className="w-5 h-5" />}>
        <Dropzone onDrop={() => {}} />
      </Section>

      {/* ─── Pagination ─── */}
      <Section title="Pagination" icon={<ArrowRight className="w-5 h-5" />}>
        <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
      </Section>

      {/* ─── Loader ─── */}
      <Section title="Loader" icon={<Zap className="w-5 h-5" />}>
        <Loader />
      </Section>

      {/* ─── Empty State ─── */}
      <Section title="Empty State" icon={<FileText className="w-5 h-5" />}>
        <EmptyState
          icon={<Mail className="w-12 h-12" />}
          title="No messages yet"
          description="When you receive messages, they'll appear here."
          action={<Button size="sm">Compose</Button>}
        />
      </Section>

      {/* ─── Modal ─── */}
      <Section title="Modal" icon={<Square className="w-5 h-5" />}>
        <Button onClick={() => setShowModal(true)}>Open Modal</Button>
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Example Modal" footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={() => setShowModal(false)}>Confirm</Button>
          </div>
        }>
          <p className="text-sm text-gray-600">This is a modal dialog. It supports multiple sizes and custom footer actions.</p>
        </Modal>
      </Section>

      {/* ─── Spacing & Radius ─── */}
      <Section title="Spacing & Radius" icon={<Settings className="w-5 h-5" />}>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600">Border Radius</h4>
          <div className="flex gap-4">
            {['rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'].map(r => (
              <div key={r} className="text-center">
                <div className={`w-16 h-16 bg-primary-200 ${r}`} />
                <p className="text-xs text-gray-500 mt-1">{r.replace('rounded-', '')}</p>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-gray-600 mt-4">Shadows</h4>
          <div className="flex gap-6">
            {['shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl'].map(s => (
              <div key={s} className="text-center">
                <div className={`w-20 h-20 bg-white rounded-lg ${s}`} />
                <p className="text-xs text-gray-500 mt-1">{s.replace('shadow-', '')}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
        <span className="text-primary-600">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}
