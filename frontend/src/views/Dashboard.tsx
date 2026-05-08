'use client'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { MODULES } from '@/config/opsync'
import { OpsIcon } from '@/components/opsync/OpsIcons'

const MODULE_COLOR_MAP: Record<string, string> = {
  primary: 'var(--ops-primary)',
  secondary: 'var(--ops-secondary-700)',
  accent: 'var(--ops-accent-700)',
}
const MODULE_BG_MAP: Record<string, string> = {
  primary: 'var(--ops-primary-100)',
  secondary: 'var(--ops-secondary-100)',
  accent: 'var(--ops-accent-100)',
}

function dayGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const TODAY = new Date().toLocaleDateString('en-US', {
  month: 'long', year: 'numeric', weekday: 'long',
}).toUpperCase()

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.first_name || user?.username || 'there'

  return (
    <div>
      {/* Page head */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--ops-font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ops-accent-700)', marginBottom: 6 }}>
            {TODAY}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ops-ink-900)', margin: '0 0 4px' }}>
            {dayGreeting()}, {firstName}.
          </h1>
          <div style={{ fontSize: 13, color: 'var(--ops-ink-500)', maxWidth: '60ch' }}>
            One portal. All operations. Zero paperwork. Here&apos;s what&apos;s waiting on you.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 8,
            background: 'transparent', color: 'var(--ops-ink-700)', border: '1px solid var(--ops-ink-200)', cursor: 'pointer',
          }}>
            <OpsIcon name="download" size={13} /> Export
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'My Pending', value: '—', delta: 'across all modules', color: 'primary' },
          { label: 'Awaiting My Action', value: '—', delta: 'requests need your approval', color: 'secondary' },
          { label: 'Approved This Month', value: '—', delta: 'requests processed', color: 'success' },
          { label: 'Avg. Approval Time', value: '—', delta: 'calendar days', color: '' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--ops-surface)', border: '1px solid var(--ops-ink-200)',
            borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
              background: s.color === 'primary' ? 'var(--ops-primary)'
                : s.color === 'secondary' ? 'var(--ops-secondary)'
                : s.color === 'success' ? 'var(--ops-success)'
                : 'var(--ops-accent)',
            }} />
            <div style={{ fontSize: 11, color: 'var(--ops-ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--ops-ink-500)', marginTop: 2 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Quick submit */}
      <div style={{
        background: 'var(--ops-surface)', border: '1px solid var(--ops-ink-200)',
        borderRadius: 12, marginBottom: 18,
      }}>
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--ops-ink-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ops-ink-900)' }}>Quick submit</div>
            <div style={{ fontSize: 12, color: 'var(--ops-ink-500)', marginTop: 2 }}>
              Most-used services. Click any tile to start a new request.
            </div>
          </div>
          <span className="ops-pill ops-pill-info">
            <span className="ops-dot" /> {MODULES.length} modules
          </span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {MODULES.map((mod) => (
              <Link key={mod.key} href={mod.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--ops-surface)', border: '1px solid var(--ops-ink-200)',
                  borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
                  cursor: 'pointer', transition: 'transform .15s, box-shadow .15s, border-color .15s',
                  minHeight: 130, position: 'relative',
                }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-2px)'
                    el.style.boxShadow = 'var(--ops-shadow-md)'
                    el.style.borderColor = 'var(--ops-ink-300)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = ''
                    el.style.boxShadow = ''
                    el.style.borderColor = 'var(--ops-ink-200)'
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center',
                    background: MODULE_BG_MAP[mod.colorVar] ?? 'var(--ops-primary-100)',
                    color: MODULE_COLOR_MAP[mod.colorVar] ?? 'var(--ops-primary)',
                  }}>
                    <OpsIcon name={mod.icon} size={18} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ops-ink-900)' }}>{mod.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ops-ink-500)', lineHeight: 1.5 }}>{mod.description}</div>
                  <div style={{
                    marginTop: 'auto', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', fontSize: 11, color: 'var(--ops-ink-500)',
                    paddingTop: 6, borderTop: '1px dashed var(--ops-ink-200)',
                  }}>
                    <span style={{ fontFamily: 'var(--ops-font-mono)', fontSize: 10, letterSpacing: '0.08em' }}>
                      BDREN-{mod.code}-…
                    </span>
                    <strong style={{ color: 'var(--ops-accent-700)', fontWeight: 600 }}>Open →</strong>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* My open requests (placeholder) */}
      <div style={{
        background: 'var(--ops-surface)', border: '1px solid var(--ops-ink-200)', borderRadius: 12,
      }}>
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--ops-ink-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ops-ink-900)' }}>My open requests</div>
            <div style={{ fontSize: 12, color: 'var(--ops-ink-500)', marginTop: 2 }}>Live status across every module.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', fontSize: 12, fontWeight: 500, borderRadius: 8, background: 'transparent', color: 'var(--ops-ink-700)', border: '1px solid var(--ops-ink-200)', cursor: 'pointer' }}>
              <OpsIcon name="filter" size={12} /> Filter
            </button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Reference', 'Module', 'Title', 'Submitted', 'Status'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', fontSize: 11, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: 'var(--ops-ink-500)', fontWeight: 600,
                  padding: '10px 12px', borderBottom: '1px solid var(--ops-ink-200)',
                  background: 'var(--ops-ink-50)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--ops-ink-400)', fontSize: 13 }}>
                No open requests. Submit your first one using the tiles above →
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
