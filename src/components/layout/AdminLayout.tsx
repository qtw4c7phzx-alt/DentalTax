import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Avatar } from '../ui';
import {
  LayoutDashboard, Building2, Users, FileBox, Settings, Palette,
  ChevronDown, LogOut, Bell, Wrench, ClipboardList, FileOutput,
  Landmark, MessageCircle, Shield, Cog,
} from 'lucide-react';
import clsx from 'clsx';

const adminNav = [
  { section: 'Accountant Workspace', items: [
    { to: '/admin', label: 'Work Queue', icon: ClipboardList, end: true },
    { to: '/admin/documents', label: 'Documents', icon: FileBox },
    { to: '/admin/transactions', label: 'Transactions', icon: Landmark },
    { to: '/admin/outputs', label: 'Outputs', icon: FileOutput },
    { to: '/admin/tickets', label: 'Tickets', icon: MessageCircle },
  ]},
  { section: 'Platform Admin', items: [
    { to: '/admin/tenants', label: 'Tenants', icon: Building2 },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/envelopes', label: 'Envelope Override', icon: FileBox },
    { to: '/admin/aggregator', label: 'Aggregator Config', icon: Cog },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    { to: '/admin/audit-log', label: 'Audit Log', icon: Shield },
  ]},
  { section: 'Tenant Admin', items: [
    { to: '/admin/tenant-users', label: 'Manage Users', icon: Users },
    { to: '/admin/tenant-bank', label: 'Bank Connections', icon: Landmark },
    { to: '/admin/tenant-settings', label: 'Settings', icon: Settings },
  ]},
];

export function AdminLayout() {
  const { currentUser, switchRole, setPortal } = useStore();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { role: 'client' as const, label: 'Client User', desc: 'Sophie Turner — BrightSmile' },
    { role: 'tenant_admin' as const, label: 'Tenant Admin', desc: 'Dr. Richard Blake — BrightSmile' },
    { role: 'accountant' as const, label: 'Accountant', desc: 'Charlotte Hughes' },
    { role: 'platform_admin' as const, label: 'Platform Admin', desc: 'Alex Morgan' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success-400 rounded-lg flex items-center justify-center text-gray-900 font-bold text-sm">DT</div>
            <div>
              <h1 className="font-bold text-sm">DentalTax</h1>
              <p className="text-xs text-gray-400">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {adminNav.map(section => (
            <div key={section.section}>
              <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.section}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={'end' in item ? item.end : false}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-gray-800">
          <NavLink
            to="/design-system"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
          >
            <Palette className="w-4 h-4" />
            Design System
          </NavLink>
        </div>

        {/* User / Role switcher */}
        <div className="p-3 border-t border-gray-800">
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <Avatar name={currentUser?.name || 'User'} size="sm" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{currentUser?.role?.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-50 animate-fade-in">
                <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Switch Role (Demo)
                </p>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleSwitcher(false);
                      if (r.role === 'client' || r.role === 'tenant_admin') {
                        setPortal('client');
                        navigate('/dashboard');
                      } else {
                        setPortal('admin');
                        navigate('/admin');
                      }
                    }}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                      currentUser?.role === r.role
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <p className="font-medium">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowRoleSwitcher(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
