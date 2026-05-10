'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import StatusBadge from '@/components/StatusBadge'
import { OpsIcon } from '@/components/opsync/OpsIcons'
import { MODULES } from '@/config/opsync'
import { useAuth } from '@/contexts/AuthContext'
import { fetchMeetingBookingDashboardSummary } from '@/services/meetings'
import { formatDateLabel, formatTimeLabel } from '@/views/meetings/meeting-helpers'

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
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatMetricValue(value: number | null | undefined, suffix = '') {
  if (typeof value !== 'number') {
    return '—'
  }
  return `${value}${suffix}`
}

const TODAY = new Date().toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
  weekday: 'long',
}).toUpperCase()

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.first_name || user?.username || 'there'
  const { data: meetingSummary, isLoading, error } = useQuery({
    queryKey: ['meeting-booking-dashboard-summary'],
    queryFn: fetchMeetingBookingDashboardSummary,
    staleTime: 60_000,
  })

  const stats = [
    {
      label: 'My Pending',
      value: isLoading ? '…' : formatMetricValue(meetingSummary?.my_pending_count),
      delta: 'meeting requests right now',
      color: 'primary',
    },
    {
      label: 'Awaiting My Action',
      value: isLoading ? '…' : formatMetricValue(meetingSummary?.awaiting_my_action_count),
      delta: 'booking approvals in queue',
      color: 'secondary',
    },
    {
      label: 'Approved This Month',
      value: isLoading ? '…' : formatMetricValue(meetingSummary?.approved_this_month_count),
      delta: 'meeting bookings approved',
      color: 'success',
    },
    {
      label: 'Avg. Approval Time',
      value: isLoading ? '…' : formatMetricValue(meetingSummary?.avg_approval_time_days, 'd'),
      delta: 'average calendar days',
      color: 'accent',
    },
  ]

  const recentRequests = meetingSummary?.recent_requests ?? []

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--ops-font-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ops-accent-700)',
              marginBottom: 6,
            }}
          >
            {TODAY}
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--ops-ink-900)',
              margin: '0 0 4px',
            }}
          >
            {dayGreeting()}, {firstName}.
          </h1>
          <div style={{ fontSize: 13, color: 'var(--ops-ink-500)', maxWidth: '60ch' }}>
            One portal. All operations. Zero paperwork. Here&apos;s what&apos;s waiting on you.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/meetings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--ops-ink-700)',
              border: '1px solid var(--ops-ink-200)',
              textDecoration: 'none',
            }}
          >
            <OpsIcon name="calendar" size={13} /> Open calendar
          </Link>
        </div>
      </div>

      {error ? (
        <div
          style={{
            marginBottom: 16,
            borderRadius: 12,
            border: '1px solid oklch(0.88 0.05 25)',
            background: 'var(--ops-danger-100)',
            padding: '12px 14px',
            fontSize: 13,
            color: 'var(--ops-danger)',
          }}
        >
          The dashboard could not refresh the live meeting summary right now.
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 22,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--ops-surface)',
              border: '1px solid var(--ops-ink-200)',
              borderRadius: 12,
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                background:
                  stat.color === 'primary'
                    ? 'var(--ops-primary)'
                    : stat.color === 'secondary'
                      ? 'var(--ops-secondary)'
                      : stat.color === 'success'
                        ? 'var(--ops-success)'
                        : 'var(--ops-accent)',
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: 'var(--ops-ink-500)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              {stat.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ops-ink-500)', marginTop: 2 }}>{stat.delta}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--ops-surface)',
          border: '1px solid var(--ops-ink-200)',
          borderRadius: 12,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--ops-ink-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
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
                <div
                  style={{
                    background: 'var(--ops-surface)',
                    border: '1px solid var(--ops-ink-200)',
                    borderRadius: 12,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'transform .15s, box-shadow .15s, border-color .15s',
                    minHeight: 130,
                    position: 'relative',
                  }}
                  onMouseEnter={(event) => {
                    const element = event.currentTarget as HTMLElement
                    element.style.transform = 'translateY(-2px)'
                    element.style.boxShadow = 'var(--ops-shadow-md)'
                    element.style.borderColor = 'var(--ops-ink-300)'
                  }}
                  onMouseLeave={(event) => {
                    const element = event.currentTarget as HTMLElement
                    element.style.transform = ''
                    element.style.boxShadow = ''
                    element.style.borderColor = 'var(--ops-ink-200)'
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      display: 'grid',
                      placeItems: 'center',
                      background: MODULE_BG_MAP[mod.colorVar] ?? 'var(--ops-primary-100)',
                      color: MODULE_COLOR_MAP[mod.colorVar] ?? 'var(--ops-primary)',
                    }}
                  >
                    <OpsIcon name={mod.icon} size={18} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ops-ink-900)' }}>{mod.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ops-ink-500)', lineHeight: 1.5 }}>{mod.description}</div>
                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 11,
                      color: 'var(--ops-ink-500)',
                      paddingTop: 6,
                      borderTop: '1px dashed var(--ops-ink-200)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--ops-font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.08em',
                      }}
                    >
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

      <div
        style={{
          background: 'var(--ops-surface)',
          border: '1px solid var(--ops-ink-200)',
          borderRadius: 12,
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--ops-ink-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ops-ink-900)' }}>My recent meeting requests</div>
            <div style={{ fontSize: 12, color: 'var(--ops-ink-500)', marginTop: 2 }}>
              Live status from the meeting booking workflow.
            </div>
          </div>
          <Link
            href="/meetings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 9px',
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--ops-ink-700)',
              border: '1px solid var(--ops-ink-200)',
              textDecoration: 'none',
            }}
          >
            <OpsIcon name="calendar" size={12} /> Open module
          </Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Reference', 'Module', 'Title', 'Submitted', 'Status'].map((heading) => (
                <th
                  key={heading}
                  style={{
                    textAlign: 'left',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--ops-ink-500)',
                    fontWeight: 600,
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--ops-ink-200)',
                    background: 'var(--ops-ink-50)',
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentRequests.length > 0 ? (
              recentRequests.map((request) => (
                <tr key={request.id}>
                  <td style={{ padding: '14px 12px', borderTop: '1px solid var(--ops-ink-100)', verticalAlign: 'top' }}>
                    <Link
                      href={`/meetings/${request.id}`}
                      style={{ color: 'var(--ops-primary)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      {request.reference_number}
                    </Link>
                  </td>
                  <td style={{ padding: '14px 12px', borderTop: '1px solid var(--ops-ink-100)', verticalAlign: 'top' }}>
                    <span className="ops-pill ops-pill-info">
                      <span className="ops-dot" />
                      Meeting Booking
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', borderTop: '1px solid var(--ops-ink-100)', verticalAlign: 'top' }}>
                    <div style={{ color: 'var(--ops-ink-900)', fontWeight: 600 }}>{request.title}</div>
                    <div style={{ marginTop: 4, color: 'var(--ops-ink-500)', fontSize: 12 }}>
                      {request.room_name}
                      {request.has_external_attendees ? ' · External guests' : ''}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', borderTop: '1px solid var(--ops-ink-100)', verticalAlign: 'top' }}>
                    <div style={{ color: 'var(--ops-ink-900)' }}>{formatDateLabel(request.date)}</div>
                    <div style={{ marginTop: 4, color: 'var(--ops-ink-500)', fontSize: 12 }}>
                      {formatTimeLabel(request.start_time)} - {formatTimeLabel(request.end_time)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', borderTop: '1px solid var(--ops-ink-100)', verticalAlign: 'top' }}>
                    <StatusBadge status={request.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: '32px 12px',
                    textAlign: 'center',
                    color: 'var(--ops-ink-400)',
                    fontSize: 13,
                  }}
                >
                  No meeting requests yet. Open the meeting calendar to submit your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
