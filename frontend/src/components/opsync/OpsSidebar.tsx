'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import { resolveApiAssetUrl } from '@/services/api'
import { NAV_ENTRIES, ADMIN_NAV_ENTRIES, isNavSection, type NavEntry } from '@/config/opsync'
import { OpsIcon } from './OpsIcons'

function NavLink({ entry, current }: { entry: Extract<NavEntry, { id: string }>; current: string }) {
  const isActive = current === entry.href || (entry.href !== '/dashboard' && current.startsWith(entry.href))
  return (
    <Link
      href={entry.soon ? '#' : entry.href}
      className="nav-item"
      data-active={isActive || undefined}
      data-muted={entry.soon || undefined}
      style={entry.soon ? { opacity: 0.55, pointerEvents: 'none' } : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="nav-icon">
        <OpsIcon name={entry.icon} size={16} />
      </span>
      <span>{entry.label}</span>
      {entry.soon && (
        <span className="nav-badge muted" style={{ marginLeft: 'auto' }}>soon</span>
      )}
    </Link>
  )
}

export default function OpsSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname() ?? ''
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() ?? 'U'

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
    : user?.username ?? ''

  const roleLabel = user?.opsync_role
    ? user.opsync_role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Employee'

  const deptLabel = user?.department_name ?? ''

  return (
    <aside className="ops-sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">B</div>
        <div>
          <div className="brand-name">BdREN OpsSync</div>
          <div className="brand-sub">admin.bdren.net.bd</div>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV_ENTRIES.map((entry, i) =>
          isNavSection(entry)
            ? <div key={i} className="nav-section-label">{entry.section}</div>
            : <NavLink key={entry.id} entry={entry} current={pathname} />
        )}
      </nav>

      {/* Admin nav (only for admin roles) */}
      {(user?.is_superuser || ['admin_officer', 'am_dm', 'system_admin'].includes(user?.opsync_role ?? '')) && (
        <>
          <div className="nav-section-label">ADMIN</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ADMIN_NAV_ENTRIES.map((entry, i) =>
              isNavSection(entry)
                ? <div key={i} className="nav-section-label">{entry.section}</div>
                : <NavLink key={entry.id} entry={entry} current={pathname} />
            )}
          </nav>
        </>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        {user?.avatar ? (
          <img
            src={resolveApiAssetUrl(user.avatar)}
            alt={displayName}
            className="avatar"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="avatar">{initials}</div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="user-name">{displayName}</div>
          <div className="user-role">{roleLabel}{deptLabel ? ` · ${deptLabel}` : ''}</div>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'oklch(0.65 0.01 80)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <OpsIcon name="logout" size={15} />
        </button>
      </div>
    </aside>
  )
}
