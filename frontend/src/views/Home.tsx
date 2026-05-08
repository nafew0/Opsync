'use client'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import BrandLogo from '@/components/branding/BrandLogo'
import { Button } from '@/components/ui/button'
import { MODULES } from '@/config/opsync'
import { useAuth } from '@/contexts/AuthContext'
import { OpsIcon } from '@/components/opsync/OpsIcons'

const ACCENT_STYLES = {
  primary: {
    bg: 'var(--ops-primary-100)',
    fg: 'var(--ops-primary)',
  },
  secondary: {
    bg: 'var(--ops-secondary-100)',
    fg: 'var(--ops-secondary-700)',
  },
  accent: {
    bg: 'var(--ops-accent-100)',
    fg: 'var(--ops-accent-700)',
  },
}

const PRINCIPLES = [
  'One workspace for requests, approvals, and administrative controls.',
  'Document-first forms and printable previews instead of fragmented flows.',
  'Config-driven modules and navigation ready for Phase 2 implementation.',
]

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="ops-public-shell">
      <section className="ops-public-hero">
        <div className="ops-home-grid">
          <div className="ops-doc-card">
            <BrandLogo />
            <div className="mt-10">
              <div className="ops-page-eyebrow">BdREN internal operations</div>
              <h1 className="ops-page-title" style={{ fontSize: 'clamp(2.8rem, 7vw, 4.8rem)', lineHeight: 0.95 }}>
                Requests, approvals, and admin control in one restrained workspace.
              </h1>
              <p className="ops-page-subtitle" style={{ fontSize: 16 }}>
                BdREN OpsSync brings meetings, food, logistics, vehicles, conveyance, and admin oversight into a single operational shell with document-led interactions.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={isAuthenticated ? '/dashboard' : '/register'}>
                <Button size="lg" className="rounded-full px-6">
                  {isAuthenticated ? 'Open workspace' : 'Create account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={isAuthenticated ? '/profile' : '/login'}>
                <Button variant="outline" size="lg" className="rounded-full px-6">
                  {isAuthenticated ? 'View profile' : 'Sign in'}
                </Button>
              </Link>
            </div>

            <div className="ops-home-kpis">
              <div className="ops-home-kpi">
                <strong>5</strong>
                <span>Core modules</span>
              </div>
              <div className="ops-home-kpi">
                <strong>1</strong>
                <span>Unified shell</span>
              </div>
              <div className="ops-home-kpi">
                <strong>Phase 2</strong>
                <span>Workflow rollout</span>
              </div>
            </div>
          </div>

          <div className="ops-card">
            <div className="ops-card-head">
              <div>
                <h2 className="ops-card-title">Operational modules</h2>
                <p className="ops-card-subtitle">The same design language now frames every current and planned surface.</p>
              </div>
            </div>
            <div className="ops-card-body">
              <div className="ops-module-grid">
                {MODULES.map((module) => {
                  const accent = ACCENT_STYLES[module.colorVar as keyof typeof ACCENT_STYLES]
                  return (
                    <Link key={module.key} href={module.href} className="ops-module-card">
                      <div className="ops-module-icon" style={{ background: accent.bg, color: accent.fg }}>
                        <OpsIcon name={module.icon} size={18} />
                      </div>
                      <div>
                        <h3>{module.label}</h3>
                        <p>{module.description}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-[color:var(--ops-ink-200)] pt-3 text-[11px] text-[color:var(--ops-ink-500)]">
                        <span className="ops-module-tag">{module.code}</span>
                        <strong className="text-[color:var(--ops-accent-700)]">Open →</strong>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="ops-surface-grid mt-6">
          <section className="ops-card">
            <div className="ops-card-head">
              <div>
                <h2 className="ops-card-title">Design direction now applied project-wide</h2>
                <p className="ops-card-subtitle">Warm paper background, editorial cards, document previews, and a unified shell for all authenticated routes.</p>
              </div>
            </div>
            <div className="ops-card-body">
              <div className="grid gap-4 md:grid-cols-3">
                {PRINCIPLES.map((item) => (
                  <div key={item} className="ops-auth-note">
                    <div className="ops-auth-note-mark">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="m-0 text-[13px] leading-6 text-[color:var(--ops-ink-700)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
