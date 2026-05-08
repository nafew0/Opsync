'use client'
import { cn } from '@/lib/utils'

const BADGE_VARIANTS = {
  default: 'border-[color:var(--ops-primary-200)] bg-[color:var(--ops-primary-100)] text-[color:var(--ops-primary)]',
  secondary: 'border-[color:var(--ops-secondary-200)] bg-[color:var(--ops-secondary-100)] text-[color:var(--ops-secondary-700)]',
  success: 'border-[oklch(0.85_0.05_150)] bg-[color:var(--ops-success-100)] text-[oklch(0.42_0.1_150)]',
  warning: 'border-[oklch(0.88_0.06_70)] bg-[color:var(--ops-warning-100)] text-[oklch(0.5_0.13_60)]',
  danger: 'border-[oklch(0.86_0.06_25)] bg-[color:var(--ops-danger-100)] text-[color:var(--ops-danger)]',
  outline: 'border-[color:var(--ops-accent-200)] bg-[color:var(--ops-accent-100)] text-[color:var(--ops-accent-700)]',
}

type BadgeVariant = keyof typeof BADGE_VARIANTS

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
        BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
