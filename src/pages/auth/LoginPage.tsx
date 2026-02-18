import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Button, Input } from '../../components/ui';

export function LoginPage() {
  const { switchRole } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('reception@brightsmile.co.uk');
  const [password, setPassword] = useState('••••••••');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: match by email
    if (email.includes('admin@dentaltax')) {
      switchRole('platform_admin');
      navigate('/admin');
    } else if (email.includes('accountant@dentaltax')) {
      switchRole('accountant');
      navigate('/admin');
    } else if (email.includes('manager@')) {
      switchRole('tenant_admin');
      navigate('/dashboard');
    } else {
      switchRole('client');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-primary-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-success-400 rounded-xl flex items-center justify-center text-primary-900 font-bold text-xl">DT</div>
          </div>
          <h1 className="text-2xl font-bold text-white">DentalTax</h1>
          <p className="text-primary-200 text-sm mt-1">UK bookkeeping for dental practices</p>
        </div>

        {!showForgot ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@practice.co.uk"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            {/* Demo shortcuts */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wider">
                Demo Quick Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Client User', role: 'client' as const, path: '/dashboard' },
                  { label: 'Tenant Admin', role: 'tenant_admin' as const, path: '/dashboard' },
                  { label: 'Accountant', role: 'accountant' as const, path: '/admin' },
                  { label: 'Platform Admin', role: 'platform_admin' as const, path: '/admin' },
                ].map(r => (
                  <button
                    key={r.role}
                    onClick={() => { switchRole(r.role); navigate(r.path); }}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium cursor-pointer transition-colors"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset your password</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email address and we'll send you a reset link.
            </p>

            {forgotSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">
                  If an account exists for <strong>{forgotEmail}</strong>, you'll receive a reset link shortly.
                </p>
                <Button variant="ghost" className="mt-4" onClick={() => { setShowForgot(false); setForgotSent(false); }}>
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setForgotSent(true); }} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@practice.co.uk"
                />
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>
                  Back to sign in
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
