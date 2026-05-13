'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── GlassCard ────────────────────────────────────────────────────────────────
export function GlassCard({
  children,
  className,
  onClick,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass card noise glass-shimmer',
        hover && 'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  glowClass?: string;
  iconBg?: string;
  suffix?: string;
  delay?: number;
}

export function StatCard({ label, value, icon, trend, glowClass, iconBg, suffix, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('glass card noise glass-shimmer rounded-2xl', glowClass)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-600 uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-700" style={{ color: 'var(--text-primary)' }}>
              {value}
            </span>
            {suffix && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{suffix}</span>}
          </div>
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs font-500',
              trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-400' : 'text-gray-400'
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(trend)}% vs hier
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg || 'var(--glass-bg)', border: '1px solid var(--border-strong)' }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={cn('badge', cls)}>{label}</span>;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({
  src, name, size = 'md'
}: { src?: string | null; name?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={cn('rounded-xl object-cover flex-shrink-0', sizes[size])}
      />
    );
  }
  return (
    <div
      className={cn('rounded-xl flex items-center justify-center font-700 text-white flex-shrink-0', sizes[size])}
      style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)' }}
    >
      {initials}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center glass" style={{ color: 'var(--text-muted)' }}>
        {icon}
      </div>
      <p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && <p className="text-xs text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>}
    </div>
  );
}

// ─── LoadingRow ───────────────────────────────────────────────────────────────
export function SkeletonRows({ count = 5, cols = 4 }: { count?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="skeleton h-4 rounded" style={{ width: j === 0 ? '60%' : '80%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({
  page, pages, onChange
}: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const items = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(pages, page + 2);
  for (let i = start; i <= end; i++) items.push(i);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="btn-glass px-3 py-1.5 rounded-lg text-xs disabled:opacity-40"
      >
        ←
      </button>
      {start > 1 && <span className="px-2 text-xs" style={{ color: 'var(--text-muted)' }}>…</span>}
      {items.map(i => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-600',
            i === page ? 'btn-primary' : 'btn-glass'
          )}
        >
          {i}
        </button>
      ))}
      {end < pages && <span className="px-2 text-xs" style={{ color: 'var(--text-muted)' }}>…</span>}
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="btn-glass px-3 py-1.5 rounded-lg text-xs disabled:opacity-40"
      >
        →
      </button>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  open, onClose, title, children, maxWidth = 'max-w-lg',over=false
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  over?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn('glass-xl rounded-2xl p-6 relative z-10 w-full noise', maxWidth)}

      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-700 text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="btn-glass p-1.5 rounded-lg text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
        <div className={`${over && 'overflow-y-hidden'}`}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const { label, error, className, ...rest } = props;
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-600 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <input
        {...rest}
        className={cn('input-glass w-full rounded-xl px-4 py-2.5 text-sm', className)}
      />
      {error && <p className="text-xs" style={{ color: 'var(--accent-red)' }}>{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const { label, className, children, ...rest } = props;
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-600 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <select
        {...rest}
        className={cn(
          'input-glass w-full rounded-xl px-4 py-2.5 text-sm appearance-none',
          className
        )}
        style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
      >
        {children}
      </select>
    </div>
  );
}

// ─── TextArea ─────────────────────────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, className, ...rest } = props;
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-600 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <textarea
        {...rest}
        className={cn('input-glass w-full rounded-xl px-4 py-2.5 text-sm resize-none', className)}
      />
    </div>
  );
}
