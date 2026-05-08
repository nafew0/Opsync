'use client'
import Link from 'next/link'

import { PLACEHOLDER_PAGES, type PlaceholderPageConfig } from '@/config/opsync'
import { OpsIcon } from './OpsIcons'
import OpsPageHeader from './OpsPageHeader'

const ACCENT_CLASS_MAP: Record<'primary' | 'secondary' | 'accent', string> = {
  primary: 'ops-placeholder-mark-primary',
  secondary: 'ops-placeholder-mark-secondary',
  accent: 'ops-placeholder-mark-accent',
}

interface OpsPlaceholderPageProps {
  route: keyof typeof PLACEHOLDER_PAGES
}

export default function OpsPlaceholderPage({ route }: OpsPlaceholderPageProps) {
  const config = PLACEHOLDER_PAGES[route] as PlaceholderPageConfig

  return (
    <div className="ops-stack">
      <OpsPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        subtitle={config.subtitle}
        actions={(
          <span className="ops-pill ops-pill-neutral">
            <span className="ops-dot" />
            {config.badge}
          </span>
        )}
      />

      <section className="ops-card">
        <div className="ops-card-head">
          <div>
            <h2 className="ops-card-title">Implementation frame</h2>
            <p className="ops-card-subtitle">This route is wired into the final shell and ready for the Phase 2 workflow.</p>
          </div>
          {config.code ? (
            <span className="ops-module-tag">{config.code}</span>
          ) : null}
        </div>
        <div className="ops-card-body">
          <div className="ops-placeholder-grid">
            <div className="ops-placeholder-sheet">
              <div className={`ops-placeholder-mark ${ACCENT_CLASS_MAP[config.accent]}`}>
                <OpsIcon name={config.icon} size={20} />
              </div>
              <div className="ops-placeholder-rule" />
              <div className="ops-placeholder-lines">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="ops-placeholder-footer">
                <span>BdREN OpsSync document preview</span>
                <span>{config.badge}</span>
              </div>
            </div>

            <div className="ops-note-panel">
              <div>
                <div className="ops-note-label">Next implementation slice</div>
                <h3>{config.title}</h3>
              </div>
              <ul className="ops-note-list">
                {config.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="ops-inline-link">
                Return to dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
