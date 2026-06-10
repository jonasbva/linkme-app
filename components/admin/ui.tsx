'use client'

import Link from 'next/link'
import { useTheme } from './ThemeProvider'

// ── Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`animate-spin ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}

// ── PageLoader — used by every route's loading.tsx for instant feedback ─
export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-28 animate-fade-in">
      <Spinner size={22} className={isLight ? 'text-black/40' : 'text-white/40'} />
      <p className={`text-[12px] ${isLight ? 'text-black/35' : 'text-white/35'}`}>{label}</p>
    </div>
  )
}

// ── Skeleton block ───────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  return <div className={`animate-pulse rounded-lg ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'} ${className}`} />
}

// ── Section header ───────────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  return (
    <div className="flex items-center justify-between">
      <h2 className={`text-[13px] font-semibold uppercase tracking-wider ${isLight ? 'text-black/40' : 'text-white/40'}`}>{title}</h2>
      {action}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  const base = isLight
    ? 'bg-black/[0.02] border border-black/[0.06]'
    : 'bg-white/[0.04] border border-white/[0.08]'
  const hoverCls = hover
    ? isLight
      ? 'transition-all duration-200 hover:border-black/[0.12] hover:bg-black/[0.035] hover:shadow-sm'
      : 'transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-sm hover:shadow-black/20'
    : ''
  return <div className={`rounded-xl ${base} ${hoverCls} ${className}`}>{children}</div>
}

// ── Button ───────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'ghost' | 'subtle' | 'danger'

function buttonClasses(variant: ButtonVariant, isLight: boolean): string {
  switch (variant) {
    case 'primary':
      return isLight
        ? 'bg-black text-white hover:bg-black/85 active:scale-[0.98] shadow-sm hover:shadow-md'
        : 'bg-white text-black hover:bg-white/90 active:scale-[0.98] shadow-sm hover:shadow-md'
    case 'subtle':
      return isLight
        ? 'bg-black/[0.04] text-black/60 border border-black/[0.08] hover:text-black/90 hover:bg-black/[0.06] hover:border-black/[0.12]'
        : 'bg-white/[0.05] text-white/60 border border-white/[0.08] hover:text-white/90 hover:bg-white/[0.08] hover:border-white/[0.14]'
    case 'danger':
      return isLight
        ? 'text-red-500/80 hover:text-red-600 hover:bg-red-500/[0.08]'
        : 'text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.12]'
    case 'ghost':
    default:
      return isLight
        ? 'text-black/45 hover:text-black/80 hover:bg-black/[0.04]'
        : 'text-white/45 hover:text-white/80 hover:bg-white/[0.06]'
  }
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

export function Button({ variant = 'subtle', loading = false, disabled, children, className = '', ...rest }: ButtonProps) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses(variant, isLight)} ${className}`}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}

// Link styled like a button (for navigation actions).
export function ButtonLink({ href, variant = 'subtle', children, className = '', prefetch }: { href: string; variant?: ButtonVariant; children: React.ReactNode; className?: string; prefetch?: boolean }) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 ${buttonClasses(variant, isLight)} ${className}`}
    >
      {children}
    </Link>
  )
}
