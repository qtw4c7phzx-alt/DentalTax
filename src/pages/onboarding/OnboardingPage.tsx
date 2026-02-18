import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, Alert, Chip } from '../../components/ui';
import { useStore } from '../../store';
import {
  Building2, User, FileText, Landmark, Users, Check,
  ArrowRight, ArrowLeft, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import type { EntityType, VatStatus } from '../../types';

const steps = [
  { key: 'entity', label: 'Entity Type', icon: Building2 },
  { key: 'business', label: 'Business Details', icon: FileText },
  { key: 'tax', label: 'Tax Profile', icon: FileText },
  { key: 'vat', label: 'VAT Profile', icon: FileText },
  { key: 'bank', label: 'Bank Connect', icon: Landmark },
  { key: 'team', label: 'Invite Team', icon: Users },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { addToast } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [entityType, setEntityType] = useState<EntityType | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [tradingAddress, setTradingAddress] = useState('');
  const [yearEnd, setYearEnd] = useState('31 March');
  const [incorporationDate, setIncorporationDate] = useState('');
  const [partnerCount, setPartnerCount] = useState(2);
  const [partners, setPartners] = useState([
    { name: '', utrNumber: '', profitSharePercent: 50 },
    { name: '', utrNumber: '', profitSharePercent: 50 },
  ]);
  const [vatStatus, setVatStatus] = useState<VatStatus>('not_registered');
  const [vatNumber, setVatNumber] = useState('');
  const [vatScheme, setVatScheme] = useState('');
  const [teamEmails, setTeamEmails] = useState(['']);

  const next = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep(s => Math.max(s - 1, 0));

  const finish = () => {
    addToast({ type: 'success', title: 'Onboarding complete!', message: 'Welcome to DentalTax.' });
    navigate('/dashboard');
  };

  const entityOptions: { type: EntityType; title: string; desc: string }[] = [
    { type: 'limited_company', title: 'Limited Company', desc: 'Registered with Companies House (Ltd)' },
    { type: 'sole_trader', title: 'Sole Trader', desc: 'Individual dentist / practitioner' },
    { type: 'partnership', title: 'Partnership', desc: 'Two or more partners sharing a practice' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-success-400 rounded-lg flex items-center justify-center text-primary-900 font-bold text-sm">DT</div>
          <span className="font-bold text-gray-900">DentalTax</span>
          <span className="text-gray-400 mx-2">·</span>
          <span className="text-sm text-gray-500">Practice Setup</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <button
                onClick={() => i < currentStep && setCurrentStep(i)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  i === currentStep
                    ? 'bg-primary-500 text-white'
                    : i < currentStep
                    ? 'bg-success-100 text-success-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {i < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">{i + 1}</span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step 1: Entity Type */}
        {currentStep === 0 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of business entity?</h2>
            <p className="text-gray-500 mb-6">This determines the tax profile and reporting requirements.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {entityOptions.map(opt => (
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

        {/* Step 2: Business Details */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h2>
            <p className="text-gray-500 mb-6">
              {entityType === 'limited_company' && 'Enter your company details as registered with Companies House.'}
              {entityType === 'sole_trader' && 'Enter your trading details.'}
              {entityType === 'partnership' && 'Enter your partnership details.'}
            </p>
            <Card>
              <div className="space-y-4">
                <Input
                  label={entityType === 'sole_trader' ? 'Trading Name' : entityType === 'partnership' ? 'Partnership Name' : 'Company Name'}
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder={entityType === 'sole_trader' ? 'Dr. Smith Dental' : 'BrightSmile Dental Ltd'}
                />
                {entityType === 'limited_company' && (
                  <Input
                    label="Company Number"
                    value={companyNumber}
                    onChange={e => setCompanyNumber(e.target.value)}
                    placeholder="12345678"
                    hint="8-digit Companies House number"
                  />
                )}
                {(entityType === 'sole_trader' || entityType === 'partnership') && (
                  <Input
                    label="UTR Number"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                    placeholder="1234567890"
                    hint="10-digit Unique Taxpayer Reference"
                  />
                )}
                <Input
                  label="Registered Address"
                  value={registeredAddress}
                  onChange={e => setRegisteredAddress(e.target.value)}
                  placeholder="45 Harley Street, London W1G 8QR"
                />
                <Input
                  label="Trading Address (if different)"
                  value={tradingAddress}
                  onChange={e => setTradingAddress(e.target.value)}
                  placeholder="Same as above"
                />
                {entityType === 'limited_company' && (
                  <Input
                    label="Date of Incorporation"
                    type="date"
                    value={incorporationDate}
                    onChange={e => setIncorporationDate(e.target.value)}
                  />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Tax Profile */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Profile</h2>
            <p className="text-gray-500 mb-6">Configure your tax reporting settings.</p>
            <Card>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Year End Date</label>
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

                {entityType === 'limited_company' && (
                  <>
                    <Alert variant="info">
                      Corporation Tax returns are due 12 months after your year end. Companies House filing is due 9 months after.
                    </Alert>
                    <Input label="Corporation Tax Reference (if known)" placeholder="1234567890" />
                    <Input label="PAYE Reference (if applicable)" placeholder="123/AB45678" hint="Required if you have employees" />
                  </>
                )}

                {entityType === 'sole_trader' && (
                  <>
                    <Alert variant="info">
                      Self Assessment tax returns are due 31 January following the end of the tax year (5 April).
                    </Alert>
                    <Input label="National Insurance Number" placeholder="AB 12 34 56 C" />
                  </>
                )}

                {entityType === 'partnership' && (
                  <>
                    <Alert variant="info">
                      A Partnership Tax Return (SA800) is required, plus individual Self Assessment returns for each partner.
                    </Alert>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Number of Partners</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        value={partnerCount}
                        onChange={e => {
                          const count = Number(e.target.value);
                          setPartnerCount(count);
                          setPartners(Array.from({ length: count }, (_, i) => partners[i] || { name: '', utrNumber: '', profitSharePercent: Math.floor(100 / count) }));
                        }}
                      >
                        {[2, 3, 4, 5, 6].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      {partners.map((p, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Partner {i + 1}</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <Input
                              placeholder="Full Name"
                              value={p.name}
                              onChange={e => {
                                const updated = [...partners];
                                updated[i] = { ...updated[i], name: e.target.value };
                                setPartners(updated);
                              }}
                            />
                            <Input
                              placeholder="UTR Number"
                              value={p.utrNumber}
                              onChange={e => {
                                const updated = [...partners];
                                updated[i] = { ...updated[i], utrNumber: e.target.value };
                                setPartners(updated);
                              }}
                            />
                            <Input
                              placeholder="Profit Share %"
                              type="number"
                              value={p.profitSharePercent || ''}
                              onChange={e => {
                                const updated = [...partners];
                                updated[i] = { ...updated[i], profitSharePercent: Number(e.target.value) };
                                setPartners(updated);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: VAT Profile */}
        {currentStep === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">VAT Profile</h2>
            <p className="text-gray-500 mb-6">Most dental services are exempt from VAT, but some private treatments may be standard-rated.</p>
            <Card>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">VAT Registration Status</label>
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
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">VAT Scheme</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        value={vatScheme}
                        onChange={e => setVatScheme(e.target.value)}
                      >
                        <option value="">Select scheme...</option>
                        <option value="standard">Standard Accounting</option>
                        <option value="cash">Cash Accounting</option>
                        <option value="flat_rate">Flat Rate Scheme</option>
                      </select>
                    </div>
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

        {/* Step 5: Bank Connect */}
        {currentStep === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Bank</h2>
            <p className="text-gray-500 mb-6">Automatic bank feeds make bookkeeping faster and more accurate.</p>
            <Card>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Barclays', 'HSBC', 'Lloyds', 'NatWest', 'Santander', 'Metro Bank'].map(bank => (
                    <button
                      key={bank}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-center transition-all cursor-pointer"
                    >
                      <Landmark className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">{bank}</p>
                    </button>
                  ))}
                </div>
                <Alert variant="info">
                  We use Open Banking (FCA regulated) to securely read your transactions. You'll be redirected to your bank to authorise access.
                </Alert>
              </div>
            </Card>
            <button
              onClick={next}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
            >
              Skip for now — I'll connect later →
            </button>
          </div>
        )}

        {/* Step 6: Invite Team */}
        {currentStep === 5 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Your Team</h2>
            <p className="text-gray-500 mb-6">Add colleagues who need to upload documents or view reports.</p>
            <Card>
              <div className="space-y-3">
                {teamEmails.map((email, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="colleague@practice.co.uk"
                      value={email}
                      onChange={e => {
                        const updated = [...teamEmails];
                        updated[i] = e.target.value;
                        setTeamEmails(updated);
                      }}
                      className="flex-1"
                    />
                    <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                      <option>Client</option>
                      <option>Tenant Admin</option>
                    </select>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTeamEmails(e => [...e, ''])}
                >
                  + Add another
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
            onClick={prev}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={next}
              disabled={currentStep === 0 && !entityType}
            >
              Continue
            </Button>
          ) : (
            <Button variant="success" icon={<Check className="w-4 h-4" />} onClick={finish}>
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
