'use client'
import { CheckCircle2, FileText } from 'lucide-react'

import BrandLogo from '@/components/branding/BrandLogo'

interface Metric {
  value: string
  label: string
}

interface AuthShellProps {
  eyebrow?: string
  title?: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  showcaseTitle?: string
  showcaseDescription?: string
  metrics?: Metric[]
  highlights?: string[]
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function AuthShell({
  eyebrow = 'BdREN OpsSync',
  title = 'Continue to your workspace',
  description = 'Authentication and recovery screens now follow the main editorial OpsSync system.',
  showcaseTitle = 'Operational access framed like the rest of the product.',
  showcaseDescription = 'Auth, verification, and recovery now live on the same warm paper system as the application shell, using restrained cards and document-led cues.',
  metrics = [],
  highlights = [],
  imageSrc,
  imageAlt = '',
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="ops-auth-shell">
      <div className="ops-auth-grid">
        <section className="ops-auth-panel ops-auth-copy">
          <BrandLogo />
          <div className="mt-8">
            <div className="ops-page-eyebrow">{eyebrow}</div>
            <h1 className="ops-page-title">{showcaseTitle}</h1>
            <p className="ops-page-subtitle">{showcaseDescription}</p>
          </div>

          {metrics.length > 0 ? (
            <div className="ops-auth-metrics">
              {metrics.map((metric) => (
                <div key={metric.label} className="ops-auth-metric">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="ops-doc-card ops-auth-doc mt-6">
            {imageSrc ? (
              <div className="overflow-hidden rounded-[16px] border border-[color:var(--ops-ink-200)]">
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="h-[320px] w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                    const sibling = event.currentTarget.nextElementSibling as HTMLElement | null
                    if (sibling) {
                      sibling.style.display = 'block'
                    }
                  }}
                />
                <div className="ops-auth-doc-sheet hidden">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="ops-page-eyebrow">Access dossier</div>
                      <div className="text-[18px] font-semibold tracking-[-0.02em] text-[color:var(--ops-ink-900)]">
                        BdREN OpsSync
                      </div>
                    </div>
                    <div className="ops-auth-note-mark">
                      <FileText className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ops-auth-doc-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="mt-8 border-t border-[color:var(--ops-ink-100)] pt-4 text-[12px] text-[color:var(--ops-ink-500)]">
                    Shared design language for sign-in, recovery, verification, and platform access.
                  </div>
                </div>
              </div>
            ) : (
              <div className="ops-auth-doc-sheet">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="ops-page-eyebrow">Access dossier</div>
                    <div className="text-[18px] font-semibold tracking-[-0.02em] text-[color:var(--ops-ink-900)]">
                      BdREN OpsSync
                    </div>
                  </div>
                  <div className="ops-auth-note-mark">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="ops-auth-doc-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="mt-8 border-t border-[color:var(--ops-ink-100)] pt-4 text-[12px] text-[color:var(--ops-ink-500)]">
                  Shared design language for sign-in, recovery, verification, and platform access.
                </div>
              </div>
            )}
          </div>

          {highlights.length > 0 ? (
            <div className="ops-auth-highlights">
              {highlights.map((highlight) => (
                <div key={highlight} className="ops-auth-note">
                  <div className="ops-auth-note-mark">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="m-0 text-[13px] leading-6 text-[color:var(--ops-ink-700)]">{highlight}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="ops-auth-panel ops-auth-form">
          <div className="ops-page-eyebrow">{eyebrow}</div>
          <h2 className="ops-page-title">{title}</h2>
          <p className="ops-page-subtitle">{description}</p>

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-8 border-t border-[color:var(--ops-ink-100)] pt-6 text-[13px] text-[color:var(--ops-ink-500)]">
              {footer}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
