'use client'
import { cn } from '@/lib/utils'

interface OpsPageHeaderProps {
  eyebrow: string
  title: string
  subtitle: string
  actions?: React.ReactNode
  className?: string
}

export default function OpsPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: OpsPageHeaderProps) {
  return (
    <div className={cn('ops-page-head', className)}>
      <div>
        <div className="ops-page-eyebrow">{eyebrow}</div>
        <h1 className="ops-page-title">{title}</h1>
        <p className="ops-page-subtitle">{subtitle}</p>
      </div>
      {actions ? <div className="ops-page-actions">{actions}</div> : null}
    </div>
  )
}
