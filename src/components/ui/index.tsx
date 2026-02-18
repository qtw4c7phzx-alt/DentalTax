import React from 'react';
import clsx from 'clsx';

// ═══════════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════════

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400': variant === 'primary',
          'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-400': variant === 'secondary' || variant === 'outline',
          'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300': variant === 'ghost',
          'bg-error-500 text-white hover:bg-error-600 focus:ring-error-400': variant === 'danger',
          'bg-success-500 text-white hover:bg-success-600 focus:ring-success-400': variant === 'success',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent',
            icon && 'pl-10',
            error ? 'border-error-400 focus:ring-error-400' : 'border-gray-300'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-error-500">{error}</p>}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  )
);

// ═══════════════════════════════════════════════
// SELECT
// ═══════════════════════════════════════════════

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className={clsx('space-y-1', className)}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={clsx(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none',
          error ? 'border-error-400' : 'border-gray-300'
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TEXTAREA
// ═══════════════════════════════════════════════

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, ...props }: TextareaProps) {
  return (
    <div className={clsx('space-y-1', className)}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className={clsx(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-y min-h-[80px]',
          error ? 'border-error-400' : 'border-gray-300'
        )}
        {...props}
      />
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// CHIP / BADGE
// ═══════════════════════════════════════════════

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Chip({ children, variant = 'default', size = 'sm', dot }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-full',
        {
          'bg-gray-100 text-gray-700': variant === 'default',
          'bg-primary-100 text-primary-700': variant === 'primary',
          'bg-success-100 text-success-700': variant === 'success',
          'bg-warning-100 text-warning-600': variant === 'warning',
          'bg-error-100 text-error-600': variant === 'error',
          'bg-blue-50 text-blue-700': variant === 'info',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        }
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-gray-500': variant === 'default',
          'bg-primary-500': variant === 'primary',
          'bg-success-500': variant === 'success',
          'bg-warning-500': variant === 'warning',
          'bg-error-500': variant === 'error',
          'bg-blue-500': variant === 'info',
        })} />
      )}
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, padding = true, hover, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 shadow-xs',
        padding && 'p-6',
        hover && 'hover:shadow-md hover:border-gray-300 transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={clsx(
          'relative bg-white rounded-2xl shadow-lg max-h-[90vh] flex flex-col animate-fade-in',
          {
            'w-full max-w-sm': size === 'sm',
            'w-full max-w-lg': size === 'md',
            'w-full max-w-2xl': size === 'lg',
            'w-full max-w-4xl': size === 'xl',
          }
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════

interface TabsProps {
  tabs: { key?: string; id?: string; label: string; count?: number }[];
  activeTab?: string;
  activeId?: string;
  onTabChange?: (key: string) => void;
  onChange?: (key: string) => void;
}

export function Tabs({ tabs, activeTab, activeId, onTabChange, onChange }: TabsProps) {
  const active = activeTab ?? activeId ?? '';
  const handleChange = onTabChange ?? onChange ?? (() => {});
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-6">
        {tabs.map(tab => {
          const tabKey = tab.key ?? tab.id ?? tab.label;
          return (
            <button
              key={tabKey}
              onClick={() => handleChange(tabKey)}
              className={clsx(
                'py-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer',
                active === tabKey
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={clsx(
                  'ml-2 rounded-full px-2 py-0.5 text-xs font-medium',
                  active === tabKey ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════
// LOADER
// ═══════════════════════════════════════════════

export function Loader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center py-8">
      <svg
        className={clsx('animate-spin text-primary-500', {
          'h-5 w-5': size === 'sm',
          'h-8 w-8': size === 'md',
          'h-12 w-12': size === 'lg',
        })}
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════
// ALERT
// ═══════════════════════════════════════════════

interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant, title, children, onClose, className }: AlertProps) {
  return (
    <div
      className={clsx('rounded-lg p-4 flex gap-3', {
        'bg-blue-50 text-blue-800 border border-blue-200': variant === 'info',
        'bg-success-50 text-success-700 border border-success-200': variant === 'success',
        'bg-warning-50 text-warning-600 border border-warning-200': variant === 'warning',
        'bg-error-50 text-error-600 border border-error-200': variant === 'error',
      }, className)}
    >
      <div className="flex-1">
        {title && <p className="font-medium mb-0.5">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 cursor-pointer opacity-60 hover:opacity-100">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// DROPZONE
// ═══════════════════════════════════════════════

interface DropzoneProps {
  onFiles?: (files: File[]) => void;
  onDrop?: (files: File[]) => void;
  accept?: string;
  label?: string;
}

export function Dropzone({ onFiles, onDrop, accept, label }: DropzoneProps) {
  const handleFiles = onFiles ?? onDrop ?? (() => {});
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handleFiles(files);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
      onDragLeave={(e) => { e.stopPropagation(); setDragOver(false); }}
      onDrop={handleDrop}
      onClick={handleClick}
      className={clsx(
        'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
        dragOver
          ? 'border-primary-400 bg-primary-50'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
      )}
    >
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            {label || 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB each</p>
        </div>
      </div>
      {/* Hidden file input — NOT covering the page */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(Array.from(e.target.files));
            e.target.value = '';  // reset so same file can be re-selected
          }
        }}
        className="sr-only"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════

interface PaginationProps {
  page?: number;
  currentPage?: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page: pageProp, currentPage, totalPages, onPageChange }: PaginationProps) {
  const page = pageProp ?? currentPage ?? 1;
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string | { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  const trendObj = typeof trend === 'string'
    ? { value: trend.replace(/^[+\-]/, ''), positive: !trend.startsWith('-') }
    : trend;
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trendObj && (
            <p className={clsx('text-sm mt-1', trendObj.positive ? 'text-success-600' : 'text-error-500')}>
              {trendObj.positive ? '↑' : '↓'} {trendObj.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════════════

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={clsx(
        'rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold',
        {
          'w-7 h-7 text-xs': size === 'sm',
          'w-9 h-9 text-sm': size === 'md',
          'w-12 h-12 text-base': size === 'lg',
        },
        className
      )}
    >
      {initials}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TOAST CONTAINER
// ═══════════════════════════════════════════════

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={clsx(
            'rounded-lg px-4 py-3 shadow-lg animate-slide-in flex items-start gap-3 text-white',
            {
              'bg-success-600': toast.type === 'success',
              'bg-error-500': toast.type === 'error',
              'bg-warning-500': toast.type === 'warning',
              'bg-primary-500': toast.type === 'info',
            }
          )}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.message && <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function useToastStore() {
  const toasts = useStore(s => s.toasts);
  const removeToast = useStore(s => s.removeToast);
  return { toasts, removeToast };
}

// Re-export store hook for convenience
import { useStore } from '../../store';
