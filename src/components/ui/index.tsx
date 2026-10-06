import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// ============================
// Button
// ============================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#1A4B8F] hover:bg-[#12386D] text-white shadow-[0_4px_14px_rgba(26,75,143,0.3)] hover:shadow-[0_4px_20px_rgba(26,75,143,0.45)]',
  secondary: 'bg-white hover:bg-[#F5F7FA] text-[#1A4B8F] border border-[#D8DEE8] hover:border-[#1A4B8F]',
  ghost: 'bg-transparent hover:bg-[#EBF1FA] text-[#1A4B8F]',
  danger: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-[0_4px_14px_rgba(220,38,38,0.25)]',
  success: 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[0_4px_14px_rgba(22,163,74,0.25)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-6 py-3 text-base h-12',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
      {iconRight && !loading && iconRight}
    </motion.button>
  );
}

// ============================
// GlassCard
// ============================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', style, hover = false, glow = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 16px 64px rgba(26,75,143,0.14)' } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        glass-card
        ${hover ? 'cursor-pointer' : ''}
        ${glow ? 'pulse-glow' : ''}
        ${className}
      `}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ============================
// MetricCard
// ============================

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: string;
}

export function MetricCard({ label, value, sub, icon, trend, color = '#1A4B8F' }: MetricCardProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-[#64748B]">{label}</span>
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
            <div style={{ color }}>{icon}</div>
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[#0F172A]">{value}</span>
        {trend && (
          <span className={`text-xs font-medium mb-0.5 ${trend.positive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-[#94A3B8] mt-1">{sub}</p>}
    </GlassCard>
  );
}

// ============================
// StatusBadge
// ============================

const statusMap: Record<string, string> = {
  submitted: 'badge-pending',
  automated_check: 'badge-active',
  under_review: 'badge-review',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  rewarded: 'badge-rewarded',
  active: 'badge-active',
  draft: 'badge-pending',
  paused: 'badge-pending',
  completed: 'badge-approved',
  cancelled: 'badge-rejected',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  automated_check: 'Checking',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  rewarded: 'Rewarded',
  active: 'Active',
  draft: 'Draft',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status] || 'badge-pending'}`}>
      {statusLabels[status] || status}
    </span>
  );
}

// ============================
// DifficultyBadge
// ============================

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls = difficulty === 'easy' ? 'badge-easy' : difficulty === 'medium' ? 'badge-medium' : 'badge-hard';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {difficulty}
    </span>
  );
}

// ============================
// RewardBadge
// ============================

export function RewardBadge({ amount, size = 'sm' }: { amount: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-lg px-4 py-1.5' : size === 'md' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${sizeClass}`}
      style={{ background: '#EBF1FA', color: '#1A4B8F', border: '1px solid #BFDBFE' }}>
      +{amount} TCR
    </span>
  );
}

// ============================
// ProgressBar
// ============================

export function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`progress-bar h-2 ${className}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ============================
// Avatar
// ============================

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeMap[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg, #1A4B8F 0%, #4F78B4 100%)' }}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

// ============================
// Input
// ============================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">{icon}</div>}
        <input
          className={`
            w-full h-10 rounded-xl border border-[#D8DEE8] bg-white px-3 text-sm text-[#0F172A]
            placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A4B8F] focus:ring-2 focus:ring-[#1A4B8F]/20
            transition-all duration-200
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-[#DC2626]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  );
}

// ============================
// Textarea
// ============================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}
      <textarea
        className={`
          w-full min-h-[80px] rounded-xl border border-[#D8DEE8] bg-white px-3 py-2.5 text-sm text-[#0F172A]
          placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A4B8F] focus:ring-2 focus:ring-[#1A4B8F]/20
          transition-all duration-200 resize-none
          ${error ? 'border-[#DC2626]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  );
}

// ============================
// Select
// ============================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}
      <select
        className={`
          w-full h-10 rounded-xl border border-[#D8DEE8] bg-white px-3 text-sm text-[#0F172A]
          focus:outline-none focus:border-[#1A4B8F] focus:ring-2 focus:ring-[#1A4B8F]/20
          transition-all duration-200
          ${error ? 'border-[#DC2626]' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  );
}

// ============================
// Modal
// ============================

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  const widthMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`relative glass-card p-6 w-full ${widthMap[size]} max-h-[90vh] overflow-y-auto`}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
            <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors" aria-label="Close">✕</button>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}

// ============================
// Tabs
// ============================

interface Tab { id: string; label: string; count?: number }

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 bg-[#F5F7FA] rounded-xl p-1 border border-[#D8DEE8]" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
            ${active === tab.id
              ? 'bg-white text-[#1A4B8F] shadow-sm border border-[#D8DEE8]'
              : 'text-[#64748B] hover:text-[#0F172A]'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === tab.id ? 'bg-[#EBF1FA] text-[#1A4B8F]' : 'bg-[#E6E9EF] text-[#64748B]'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================
// SectionHeader
// ============================

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
        {subtitle && <p className="text-sm text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ============================
// PageHeader
// ============================

export function PageHeader({ title, subtitle, action, backLabel, onBack }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  backLabel?: string;
  onBack?: () => void;
}) {
  return (
    <div className="mb-6">
      {backLabel && onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A4B8F] mb-3 transition-colors cursor-pointer">
          ← {backLabel}
        </button>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
          {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

// ============================
// EmptyState
// ============================

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-[#94A3B8] mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-[#0F172A] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#64748B] max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ============================
// LoadingState
// ============================

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#1A4B8F]" />
      <span className="text-sm text-[#64748B]">{label}</span>
    </div>
  );
}

// ============================
// StepIndicator
// ============================

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${i < current ? 'bg-[#1A4B8F] text-white' : i === current ? 'bg-[#1A4B8F] text-white ring-4 ring-[#1A4B8F]/20' : 'bg-[#E6E9EF] text-[#94A3B8]'}
            `}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${i === current ? 'text-[#1A4B8F]' : i < current ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-2 mt-[-12px] ${i < current ? 'bg-[#1A4B8F]' : 'bg-[#E6E9EF]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================
// Toast (simple)
// ============================

export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }) {
  const bgMap = { success: '#DCFCE7', error: '#FEE2E2', info: '#EBF1FA' };
  const textMap = { success: '#14532D', error: '#7F1D1D', info: '#1A4B8F' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border"
      style={{ background: bgMap[type], color: textMap[type], borderColor: textMap[type] + '33' }}
    >
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100 cursor-pointer">✕</button>
    </motion.div>
  );
}

// ============================
// VerificationBadge
// ============================

export function VerificationBadge({ verified = true }: { verified?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${verified ? 'bg-[#EBF1FA] text-[#1A4B8F] border border-[#BFDBFE]' : 'bg-[#FEE2E2] text-[#7F1D1D]'}`}>
      {verified ? '🔒 Verified' : '⚠ Unverified'}
    </span>
  );
}
