import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { Avatar, Chip, Alert, Button } from '../ui';
import {
  LayoutDashboard, FileBox, Landmark, MessageCircle, FileOutput,
  Users, Receipt, Settings, Palette, ChevronDown, LogOut, ArrowRightLeft,
  Wrench,
} from 'lucide-react';
import clsx from 'clsx';

const clientNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/envelopes', label: 'Envelopes', icon: FileBox },
  { to: '/banking', label: 'Banking', icon: Landmark },
  { to: '/tickets', label: 'Tickets', icon: MessageCircle },
  { to: '/outputs', label: 'Outputs', icon: FileOutput },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/invoices', label: 'Invoices', icon: Receipt },
  { to: '/chat', label: 'AI Chat', icon: MessageCircle },
];

export function ClientLayout() {
  const { currentUser, portal, switchRole, switchToUser, setPortal, isOnboardingComplete, getOnboarding } = useStore();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const tenantId = currentUser?.tenantId || '';
  const onboardingDone = tenantId ? isOnboardingComplete(tenantId) : true;
  const ob = tenantId ? getOnboarding(tenantId) : null;

  // Auto-redirect to onboarding if not complete (first login scenario)
  useEffect(() => {
    if (tenantId && !onboardingDone && location.pathname !== '/onboarding') {
      // Only auto-redirect if no steps have been completed at all (fresh user)
      const anyDone = ob?.completedSteps.some(Boolean);
      if (!anyDone) {
        navigate('/onboarding');
      }
    }
  }, [tenantId, onboardingDone, location.pathname, navigate, ob]);

  // Find next incomplete step for the deep-link
  const nextIncompleteStep = ob?.completedSteps.findIndex(s => !s) ?? 0;

  const roles = [
    { role: 'client' as const, userId: 'user-t1-client', label: 'Client User', desc: 'Sophie Turner — BrightSmile' },
    { role: 'tenant_admin' as const, userId: 'user-t1-admin', label: 'Tenant Admin', desc: 'Dr. Richard Blake — BrightSmile' },
    { role: 'tenant_admin' as const, userId: 'user-t3-admin', label: 'New Practice (Demo)', desc: 'Dr. Raj Patel — Oakwood (not onboarded)' },
    { role: 'accountant' as const, userId: 'user-accountant', label: 'Accountant', desc: 'Charlotte Hughes' },
    { role: 'platform_admin' as const, userId: 'user-platform-admin', label: 'Platform Admin', desc: 'Alex Morgan' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-700 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-primary-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success-400 rounded-lg flex items-center justify-center text-primary-900 font-bold text-sm">DT</div>
            <div>
              <h1 className="font-bold text-sm">DentalTax</h1>
              <p className="text-xs text-primary-300">Client Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {clientNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-200 hover:bg-primary-600/50 hover:text-white'
                )
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 space-y-1 border-t border-primary-600">
          <NavLink
            to="/onboarding"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary-600 text-white' : 'text-primary-200 hover:bg-primary-600/50'
              )
            }
          >
            <Wrench className="w-4.5 h-4.5" />
            Business Setup
          </NavLink>
          <NavLink
            to="/design-system"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary-600 text-white' : 'text-primary-200 hover:bg-primary-600/50'
              )
            }
          >
            <Palette className="w-4.5 h-4.5" />
            Design System
          </NavLink>
        </div>

        {/* User / Role switcher */}
        <div className="p-3 border-t border-primary-600">
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary-600/50 transition-colors cursor-pointer"
            >
              <Avatar name={currentUser?.name || 'User'} size="sm" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                <p className="text-xs text-primary-300 capitalize">{currentUser?.role?.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-primary-300" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-50 animate-fade-in">
                <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Switch Role (Demo)
                </p>
                {roles.map(r => (
                  <button
                    key={r.userId}
                    onClick={() => {
                      switchToUser(r.userId);
                      setShowRoleSwitcher(false);
                      if (r.role === 'accountant' || r.role === 'platform_admin') {
                        setPortal('admin');
                        navigate('/admin');
                      } else {
                        setPortal('client');
                        navigate('/dashboard');
                      }
                    }}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                      currentUser?.id === r.userId
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
      <main className="flex-1 overflow-y-auto">
        {/* Onboarding incomplete banner */}
        {tenantId && !onboardingDone && (
          <div className="bg-warning-50 border-b border-warning-200 px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-warning-800">
              <strong>Setup incomplete.</strong> Complete your business setup to unlock all features.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/onboarding?step=${nextIncompleteStep}`)}
            >
              Complete Setup
            </Button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
