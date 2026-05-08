'use client'
import { usePathname } from 'next/navigation'

import { getCrumbs } from '@/config/opsync'
import { OpsIcon } from './OpsIcons'

interface OpsTopbarProps {
  rightSlot?: React.ReactNode
}

export default function OpsTopbar({ rightSlot }: OpsTopbarProps) {
  const pathname = usePathname() ?? ''
  const crumbs = getCrumbs(pathname)

  return (
    <div className="ops-topbar">
      {/* Breadcrumbs */}
      <div className="crumbs">
        <span>BdREN</span>
        <span className="sep">/</span>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <span className="sep">/</span>}
            {i === crumbs.length - 1
              ? <strong style={{ color: 'var(--ops-ink-900)', fontWeight: 550 }}>{c}</strong>
              : <span>{c}</span>}
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="search" style={{ marginLeft: 'auto' }}>
        <OpsIcon name="search" size={14} />
        <span style={{ flex: 1 }}>Search requests, refs, employees…</span>
        <kbd>⌘K</kbd>
      </div>

      {/* Language toggle */}
      <button className="icon-btn" title="Switch language">
        <OpsIcon name="bangla" size={16} />
      </button>

      {/* Notification bell slot — filled by NotificationBell */}
      {rightSlot}
    </div>
  )
}
