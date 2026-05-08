'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { fetchUnreadCount, fetchNotifications, markAllNotificationsRead, type Notification } from '@/services/core'
import { OpsIcon } from '@/components/opsync/OpsIcons'

const POLL_INTERVAL_MS = 30_000

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const MODULE_LABEL: Record<string, string> = {
  meetings: 'MTG', food: 'FOD', logistics: 'LOG', fleet: 'VEH', claims: 'CVY',
}

export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Poll unread count
  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const count = await fetchUnreadCount()
        if (active) setUnread(count)
      } catch {
        // ignore
      }
    }
    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => { active = false; clearInterval(id) }
  }, [])

  // Load notifications on open
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchNotifications()
      .then((data) => setNotifications(data.slice(0, 10)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setUnread(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="icon-btn"
        title="Notifications"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <OpsIcon name="bell" size={16} />
        {unread > 0 && <span className="dot" />}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 360, background: 'var(--ops-surface)',
          border: '1px solid var(--ops-ink-200)',
          borderRadius: 12, boxShadow: 'var(--ops-shadow-lg)',
          zIndex: 100, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid var(--ops-ink-100)',
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ops-ink-900)' }}>
              Notifications {unread > 0 && (
                <span style={{
                  marginLeft: 6, background: 'var(--ops-accent)', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                }}>{unread}</span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  fontSize: 11, color: 'var(--ops-primary-500)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--ops-ink-400)', fontSize: 12 }}>
                Loading…
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ops-ink-400)', fontSize: 12 }}>
                No notifications yet
              </div>
            )}
            {!loading && notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex', gap: 10, padding: '12px 16px',
                  borderBottom: '1px solid var(--ops-ink-50)',
                  background: n.is_read ? undefined : 'var(--ops-primary-50)',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flex: '0 0 auto',
                  background: 'var(--ops-primary-100)', color: 'var(--ops-primary)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 9, fontFamily: 'var(--ops-font-mono)', fontWeight: 700,
                }}>
                  {MODULE_LABEL[n.module] ?? n.module.toUpperCase().slice(0, 3)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: n.is_read ? 400 : 600, color: 'var(--ops-ink-900)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ops-ink-500)', marginTop: 2 }}>
                    {n.message.slice(0, 80)}{n.message.length > 80 ? '…' : ''}
                  </div>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setOpen(false)}
                      style={{ fontSize: 11, color: 'var(--ops-primary-500)', marginTop: 2, display: 'block' }}
                    >
                      View →
                    </Link>
                  )}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--ops-ink-400)', whiteSpace: 'nowrap' }}>
                  {timeAgo(n.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
