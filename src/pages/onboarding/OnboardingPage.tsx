import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card, Alert, Select } from '../../components/ui';
import { useStore } from '../../store';
import {
  Building2, FileText, Landmark, Users, Check, Shield,
  ArrowRight, ArrowLeft, ChevronRight, Plus, Trash2, Link2,
  Wifi, CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import type { EntityType, VatStatus, AggregatorProvider, OnboardingState } from '../../types';

const STEPS = [
  { key: 'entity', label: 'Entity Type', icon: Building2 },
  { key: 'business', label: 'Business Details', icon: FileText },
  { key: 'tax', label: 'Tax Profile', icon: FileText },
  { key: 'vat', label: 'VAT Profile', icon: Shield },
  { key: 'bank', label: 'Bank Connect', icon: Landmark },
  { key: 'team', label: 'Invite Team', icon: Users },
];

const ENTITY_OPTIONS: { type: EntityType; title: string; desc: string }[] = [
  { type: 'limited_company', title: 'Limited Company', desc: 'Registered with Companies House (Ltd)' },
  { type: 'sole_trader', title: 'Sole Trader', desc: 'Individual dentist / practitioner' },
  { type: 'partnership', title: 'Partnership', desc: 'Two or more partners sharing a practice' },
];

const AGGREGATORS: { value: AggregatorProvider; label: string; desc: string }[] = [
  { value: 'truelayer', label: 'TrueLayer', desc: 'FCA authorised · UK leader' },
  { value: 'yapily', label: 'Yapily', desc: 'Open Banking API' },
  { value: 'tink', label: 'Tink', desc: 'Visa Open Banking' },
  { value: 'plaid', label: 'Plaid', desc: 'Global coverage' },
  { value: 'salt_edge', label: 'Salt Edge', desc: 'PSD2 compliant' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    currentUser, addToast, getOnboarding, updateOnboarding,
    completeOnboardingStep, finishOnboarding, updateTenant,
  } = useStore();

  const tenantId = currentUser?.tenantId || 'tenant-brightsmile';
  const ob = getOnboarding(tenantId);

  // Determine start step from query param (?step=2) or saved state
  const startStep = (() => {
    const qStep = searchParams.get('step');
    if (qStep) return Math.max(0, Math.min(5, Number(qStep)));
    // Find first incomplete step
    const first = ob.completedSteps.findIndex(s => !s);
    return first === -1 ? 0 : first;
  })();

  const [step, setStep] = useState(startStep);

  // Local form state — initialised from persisted onboarding
  const [entityType, setEntityType] = useState<EntityType | ''>(ob.entityType || '');
  const [tradingName, setTradingName] = useState(ob.tradingName || '');
  const [legalName, setLegalName] = useState(ob.legalName || '');
  const [address, setAddress] = useState(ob.address || '');
  const [contactEmail, setContactEmail] = useState(ob.contactEmail || currentUser?.email || '');
  const [contactPhone, setContactPhone] = useState(ob.contactPhone || '');
  const [industry, setIndustry] = useState(ob.industry || 'Dental');

  const [companiesHouseNumber, setCompaniesHouseNumber] = useState(ob.companiesHouseNumber || '');
  const [yearEnd, setYearEnd] = useState(ob.yearEnd || '31 March');
  const [utr, setUtr] = useState(ob.utr || '');
  const [niNumber, setNiNumber] = useState(ob.niNumber || '');
  const [bookkeepingBasis, setBookkeepingBasis] = useState<'cash' | 'accrual' | ''>(ob.bookkeepingBasis || '');
  const [chartTemplate, setChartTemplate] = useState(ob.chartTemplate || 'Dental');
  const [partners, setPartners] = useState<{ name: string; email: string }[]>(
    ob.partners?.length ? ob.partners : [{ name: '', email: '' }, { name: '', email: '' }]
  );

  const [vatStatus, setVatStatus] = useState<VatStatus | ''>(ob.vatStatus || '');
  const [vatNumber, setVatNumber] = useState(ob.vatNumber || '');
  const [vatScheme, setVatScheme] = useState(ob.vatScheme || '');
  const [vatEffectiveDate, setVatEffectiveDate] = useState(ob.vatEffectiveDate || '');

  const [aggregator, setAggregator] = useState<AggregatorProvider | ''>(ob.aggregatorProvider || '');
  const [bankConnected, setBankConnected] = useState(ob.bankConnected || false);
  const [bankConnecting, setBankConnecting] = useState(false);

  const [invites, setInvites] = useState<{ email: string; role: 'client' | 'tenant_admin' | 'client_staff' }[]>(
    ob.invites?.length ? ob.invites : [{ email: '', role: 'client' }]
  );

  // ─── Helpers ───

  const saveStepData = (s: number) => {
    const data: Partial<OnboardingState> = { currentStep: s };
    switch (s) {
      case 0: data.entityType = entityType; break;
      case 1: Object.assign(data, { tradingName, legalName, address, contactEmail, contactPhone, industry }); break;
      case 2: Object.assign(data, { companiesHouseNumber, yearEnd, utr, niNumber, bookkeepingBasis, chartTemplate, partners }); break;
      case 3: Object.assign(data, { vatStatus, vatNumber, vatScheme, vatEffectiveDate }); break;
      case 4: Object.assign(data, { aggregatorProvider: aggregator, bankConnected }); break;
      case 5: data.invites = invites; break;
    }
    updateOnboarding(tenantId, data);
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 0: return !!entityType;
      case 1: return !!tradingName && !!address && !!contactEmail;
      case 2: return !!bookkeepingBasis && !!yearEnd;
      case 3: return !!vatStatus;
      case 4: return true; // optional
      case 5: return true; // optional
      default: return true;
    }
  };

  const handleNext = () => {
    saveStepData(step);
    completeOnboardingStep(tenantId, step);
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    saveStepData(step);
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    saveStepData(step);
    completeOnboardingStep(tenantId, step);
    finishOnboarding(tenantId);

    // Also update the tenant record with key data
    updateTenant(tenantId, {
      name: legalName || tradingName || undefined,
      entityType: entityType as EntityType || undefined,
      vatStatus: (vatStatus as VatStatus) || undefined,
      vatNumber: vatNumber || undefined,
      registeredAddress: address || undefined,
      utrNumber: utr || undefined,
      companyNumber: companiesHouseNumber || undefined,
      isOnboarded: true,
      aggregatorProvider: aggregator as AggregatorProvider || undefined,
    });

    addToast({ type: 'success', title: 'Setup complete!', message: 'Welcome to DentalTax. Your practice is ready to go.' });
    navigate('/envelopes');
  };

  const simulateBankConnect = () => {
    setBankConnecting(true);
    setTimeout(() => {
      setBankConnecting(false);
      setBankConnected(true);
      addToast({ type: 'success', title: 'Bank connected', message: 'Your bank feed is now active.' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success-400 rounded-lg flex items-center justify-center text-primary-900 font-bold text-sm">DT</div>
            <span className="font-bold text-gray-900">DentalTax</span>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-sm text-gray-500">Practice Setup</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
          >
            Skip for now →
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress stepper */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { saveStepData(step); setStep(i); }}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  i === step
                    ? 'bg-primary-500 text-white'
                    : ob.completedSteps[i]
                    ? 'bg-success-100 text-success-700'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                )}
              >
                {ob.completedSteps[i] && i !== step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">{i + 1}</span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
            </div>
          ))}
        </div>

        {/* ═════ Step 1: Entity Type ═════ */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of business entity?</h2>
            <p className="text-gray-500 mb-6">This determines the tax profile and reporting requirements.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ENTITY_OPTIONS.map(opt => (
                <button
                  key={opt.type}
                  onClick={() => setEntityType(opt.type)}
                  className={clsx(
                    'p-6 rounded-xl border-2 text-left transition-all cursor-pointer',
                    entityType === opt.type
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <Building2 className={clsx('w-8 h-8 mb-3', entityType === opt.type ? 'text-primary-500' : 'text-gray-400')} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{opt.title}</h3>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═════ Step 2: Business Details ═════ */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h2>
            <p className="text-gray-500 mb-6">
              {entityType === 'limited_company' && 'Enter your company details as registered with Companies House.'}
              {entityType === 'sole_trader' && 'Enter your trading details.'}
              {entityType === 'partnership' && 'Enter your partnership details.'}
              {!entityType && 'Please go back and select an entity type first.'}
            </p>
            <Card>
              <div className="space-y-4">
                <Input
                  label="Trading Name *"
                  value={tradingName}
                  onChange={e => setTradingName(e.target.value)}
                  placeholder={entityType === 'sole_trader' ? 'Dr. Smith Dental' : 'BrightSmile Dental Ltd'}
                />
                <Input
                  label="Legal Name (if different)"
                  value={legalName}
                  onChange={e => setLegalName(e.target.value)}
                  placeholder="Leave blank if same as trading name"
                />
                <Input
                  label="Address *"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="45 Harley Street, London W1G 8QR"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Email *"
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="office@practice.co.uk"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="020 7123 4567"
                  />
                </div>
                <Select
                  label="Industry"
                  options={[
                    { value: 'Dental', label: 'Dental' },
                    { value: 'Medical', label: 'Medical' },
                    { value: 'Veterinary', label: 'Veterinary' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                />
              </div>
            </Card>
          </div>
        )}

        {/* ═════ Step 3: Tax Profile ═════ */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Profile</h2>
            <p className="text-gray-500 mb-6">Configure your tax reporting settings.</p>
            <Card>
              <div className="space-y-4">
                {entityType === 'limited_company' && (
                  <>
                    <Input
                      label="Companies House Number (optional)"
                      value={companiesHouseNumber}
                      onChange={e => setCompaniesHouseNumber(e.target.value)}
                      placeholder="12345678"
                      hint="8-digit number"
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Accounting Year End *</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        value={yearEnd}
                        onChange={e => setYearEnd(e.target.value)}
                      >
                        <option value="31 March">31 March</option>
                        <option value="5 April">5 April (Tax Year)</option>
                        <option value="30 June">30 June</option>
                        <option value="30 September">30 September</option>
                        <option value="31 December">31 December</option>
                      </select>
                    </div>
                    <Input
                      label="UTR (optional)"
                      value={utr}
                      onChange={e => setUtr(e.target.value)}
                      placeholder="1234567890"
                      hint="10-digit Unique Taxpayer Reference"
                    />
                    <Alert variant="info">
                      Corporation Tax returns are due 12 months after your year end. Companies House filing is due 9 months after.
                    </Alert>
                  </>
                )}

                {entityType === 'sole_trader' && (
                  <>
                    <Input
                      label="UTR (optional)"
                      value={utr}
                      onChange={e => setUtr(e.target.value)}
                      placeholder="1234567890"
                      hint="10-digit Unique Taxpayer Reference"
                    />
                    <Alert variant="info">
                      As a sole trader your tax year runs 6 April – 5 April. Self Assessment returns are due 31 January following the tax year end.
                    </Alert>
                    <Input
                      label="National Insurance Number (optional)"
                      value={niNumber}
                      onChange={e => setNiNumber(e.target.value)}
                      placeholder="AB 12 34 56 C"
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Year End *</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        value={yearEnd}
                        onChange={e => setYearEnd(e.target.value)}
                      >
                        <option value="5 April">5 April (Tax Year)</option>
                        <option value="31 March">31 March</option>
                      </select>
                    </div>
                  </>
                )}

                {entityType === 'partnership' && (
                  <>
                    <Input
                      label="Partnership UTR (optional)"
                      value={utr}
                      onChange={e => setUtr(e.target.value)}
                      placeholder="1234567890"
                      hint="The partnership's 10-digit Unique Taxpayer Reference"
                    />
                    <Alert variant="info">
                      A Partnership Tax Return (SA800) is required, plus individual Self Assessment returns for each partner.
                    </Alert>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Year End *</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        value={yearEnd}
                        onChange={e => setYearEnd(e.target.value)}
                      >
                        <option value="5 April">5 April (Tax Year)</option>
                        <option value="31 March">31 March</option>
                        <option value="30 June">30 June</option>
                        <option value="31 December">31 December</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Partners</label>
                      <div className="space-y-3">
                        {partners.map((p, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-700">Partner {i + 1}</h4>
                              {partners.length > 2 && (
                                <button onClick={() => setPartners(ps => ps.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-error-500 cursor-pointer">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="Full Name"
                                value={p.name}
                                onChange={e => {
                                  const u = [...partners];
                                  u[i] = { ...u[i], name: e.target.value };
                                  setPartners(u);
                                }}
                              />
                              <Input
                                placeholder="Email"
                                type="email"
                                value={p.email}
                                onChange={e => {
                                  const u = [...partners];
                                  u[i] = { ...u[i], email: e.target.value };
                                  setPartners(u);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Plus className="w-4 h-4" />}
                          onClick={() => setPartners(ps => [...ps, { name: '', email: '' }])}
                        >
                          Add partner
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Common fields */}
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                  <Select
                    label="Bookkeeping Basis *"
                    options={[
                      { value: '', label: 'Select…' },
                      { value: 'cash', label: 'Cash Basis' },
                      { value: 'accrual', label: 'Accrual Basis' },
                    ]}
                    value={bookkeepingBasis}
                    onChange={e => setBookkeepingBasis(e.target.value as 'cash' | 'accrual' | '')}
                  />
                  <Select
                    label="Chart of Accounts Template"
                    options={[
                      { value: 'Dental', label: 'Dental Practice' },
                      { value: 'Medical', label: 'Medical Practice' },
                      { value: 'Generic', label: 'Generic Small Business' },
                    ]}
                    value={chartTemplate}
                    onChange={e => setChartTemplate(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ═════ Step 4: VAT Profile ═════ */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">VAT Profile</h2>
            <p className="text-gray-500 mb-6">Most dental services are exempt from VAT, but some private treatments may be standard-rated.</p>
            <Card>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">VAT Registration Status *</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {([
                      { value: 'not_registered', label: 'Not Registered', desc: 'Below £90,000 threshold' },
                      { value: 'registered', label: 'VAT Registered', desc: 'Standard or flat rate scheme' },
                      { value: 'partial_exemption', label: 'Partial Exemption', desc: 'Mix of exempt and taxable supplies' },
                      { value: 'unknown', label: 'Not Sure', desc: 'We\'ll help you determine this' },
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setVatStatus(opt.value)}
                        className={clsx(
                          'p-4 rounded-lg border-2 text-left transition-all cursor-pointer',
                          vatStatus === opt.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {vatStatus === 'registered' && (
                  <>
                    <Input
                      label="VAT Number"
                      value={vatNumber}
                      onChange={e => setVatNumber(e.target.value)}
                      placeholder="GB 123 456 789"
                    />
                    <Select
                      label="VAT Scheme"
                      options={[
                        { value: '', label: 'Select scheme…' },
                        { value: 'standard', label: 'Standard Accounting' },
                        { value: 'cash', label: 'Cash Accounting' },
                        { value: 'flat_rate', label: 'Flat Rate Scheme' },
                      ]}
                      value={vatScheme}
                      onChange={e => setVatScheme(e.target.value)}
                    />
                    <Input
                      label="Effective Date"
                      type="date"
                      value={vatEffectiveDate}
                      onChange={e => setVatEffectiveDate(e.target.value)}
                      hint="Date your VAT registration became effective"
                    />
                  </>
                )}

                {vatStatus === 'partial_exemption' && (
                  <Alert variant="info">
                    Partial exemption requires careful calculation of input VAT recovery. We'll help you set up the correct method.
                  </Alert>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ═════ Step 5: Bank Connect ═════ */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Bank</h2>
            <p className="text-gray-500 mb-6">Automatic bank feeds make bookkeeping faster and more accurate. You can skip this and connect later.</p>

            {bankConnected ? (
              <Card>
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-success-100 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-success-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Bank Connected!</h3>
                  <p className="text-sm text-gray-500">Your bank feed is active and syncing transactions.</p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Bank Feed Health</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-success-600">Active</p>
                        <p className="text-xs text-gray-500">Status</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">Just now</p>
                        <p className="text-xs text-gray-500">Last sync</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">90 days</p>
                        <p className="text-xs text-gray-500">Consent valid</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <Card>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose an aggregator</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {AGGREGATORS.map(agg => (
                        <button
                          key={agg.value}
                          onClick={() => setAggregator(agg.value)}
                          className={clsx(
                            'p-4 rounded-lg border-2 text-center transition-all cursor-pointer',
                            aggregator === agg.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <Link2 className={clsx('w-6 h-6 mx-auto mb-2', aggregator === agg.value ? 'text-primary-500' : 'text-gray-400')} />
                          <p className="text-sm font-medium text-gray-900">{agg.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{agg.desc}</p>
                        </button>
                      ))}
                    </div>

                    {aggregator && (
                      <div className="pt-4">
                        <Button
                          icon={bankConnecting ? <Wifi className="w-4 h-4 animate-pulse" /> : <Landmark className="w-4 h-4" />}
                          onClick={simulateBankConnect}
                          disabled={bankConnecting}
                        >
                          {bankConnecting ? 'Connecting…' : `Connect via ${AGGREGATORS.find(a => a.value === aggregator)?.label}`}
                        </Button>
                      </div>
                    )}

                    <Alert variant="info">
                      We use Open Banking (FCA regulated) to securely read your transactions. You'll be redirected to your bank to authorise access.
                    </Alert>
                  </div>
                </Card>
                <button
                  onClick={() => { saveStepData(step); completeOnboardingStep(tenantId, step); setStep(5); }}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                >
                  Skip for now — I'll connect later →
                </button>
              </>
            )}
          </div>
        )}

        {/* ═════ Step 6: Invite Team ═════ */}
        {step === 5 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Your Team</h2>
            <p className="text-gray-500 mb-6">Add colleagues who need to upload documents or view reports. You can do this later too.</p>
            <Card>
              <div className="space-y-3">
                {invites.map((inv, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        label={i === 0 ? 'Email' : undefined}
                        placeholder="colleague@practice.co.uk"
                        type="email"
                        value={inv.email}
                        onChange={e => {
                          const u = [...invites];
                          u[i] = { ...u[i], email: e.target.value };
                          setInvites(u);
                        }}
                      />
                    </div>
                    <div className="w-40">
                      <Select
                        label={i === 0 ? 'Role' : undefined}
                        options={[
                          { value: 'client', label: 'Staff' },
                          { value: 'tenant_admin', label: 'Admin' },
                          { value: 'client_staff', label: 'View Only' },
                        ]}
                        value={inv.role}
                        onChange={e => {
                          const u = [...invites];
                          u[i] = { ...u[i], role: e.target.value as 'client' | 'tenant_admin' | 'client_staff' };
                          setInvites(u);
                        }}
                      />
                    </div>
                    {invites.length > 1 && (
                      <button
                        onClick={() => setInvites(invs => invs.filter((_, idx) => idx !== i))}
                        className="p-2 text-gray-400 hover:text-error-500 cursor-pointer mb-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setInvites(invs => [...invs, { email: '', role: 'client' }])}
                >
                  Add another
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handlePrev}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < 5 ? (
            <Button
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleNext}
              disabled={!canContinue()}
            >
              Continue
            </Button>
          ) : (
            <Button variant="success" icon={<Check className="w-4 h-4" />} onClick={handleFinish}>
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
