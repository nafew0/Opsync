'use client'
import { useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { resolveApiAssetUrl } from '@/services/api'
import { MODULE_CODES, type ModuleKey } from '@/config/opsync'
import { OpsIcon } from '@/components/opsync/OpsIcons'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PreviewTemplate = 'meeting' | 'food' | 'logistics' | 'vehicle' | 'conveyance'

export interface SignerConfig {
  label: string
  name?: string
  designation?: string
  signed?: boolean
}

export interface FormPreviewPanelProps {
  formContent: React.ReactNode
  previewTemplate: PreviewTemplate
  previewData: Record<string, unknown>
  referenceNumber?: string
  signers?: SignerConfig[]
  onPrint?: () => void
  children?: React.ReactNode
}

// ─── Template titles ─────────────────────────────────────────────────────────

const TEMPLATE_META: Record<PreviewTemplate, { title: string; moduleKey: ModuleKey }> = {
  meeting:    { title: 'Meeting Room Booking Request',    moduleKey: 'meetings'  },
  food:       { title: 'Meeting Food Requisition',        moduleKey: 'food'      },
  logistics:  { title: 'Logistics & Inventory Requisition', moduleKey: 'logistics' },
  vehicle:    { title: 'Vehicle Requisition',             moduleKey: 'fleet'     },
  conveyance: { title: 'Local Conveyance Bill',           moduleKey: 'claims'    },
}

// ─── A4 field ────────────────────────────────────────────────────────────────

export function A4Field({
  label,
  value,
  span = 1,
}: {
  label: string
  value?: string | number | null
  span?: number
}) {
  return (
    <div style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', gap: 1, padding: '3px 0', borderBottom: '1px dotted var(--ops-ink-200)' }}>
      <div style={{ fontSize: 8, color: 'var(--ops-ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: value ? 'var(--ops-ink-900)' : 'var(--ops-ink-300)', fontStyle: value ? undefined : 'italic', minHeight: 13 }}>
        {value ?? '—'}
      </div>
    </div>
  )
}

// ─── Signature block ─────────────────────────────────────────────────────────

function SignatureBlock({ signer, signatureUrl }: { signer: SignerConfig; signatureUrl?: string }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 14 }}>
      <div style={{
        borderTop: '1px solid var(--ops-ink-700)', marginBottom: 4,
        height: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 2,
      }}>
        {signer.signed && signatureUrl ? (
          <img src={signatureUrl} alt="signature" style={{ maxHeight: 28, maxWidth: 80, objectFit: 'contain' }} />
        ) : signer.signed ? (
          <span style={{ fontFamily: 'var(--ops-font-script)', fontSize: 16, color: 'var(--ops-ink-700)', lineHeight: 1 }}>
            {signer.name}
          </span>
        ) : null}
      </div>
      <div style={{ fontSize: 8, color: 'var(--ops-ink-500)', lineHeight: 1.3 }}>
        <strong style={{ color: 'var(--ops-ink-900)', display: 'block', fontWeight: 600 }}>{signer.label}</strong>
        {signer.signed ? (
          <>{signer.name}<br />{signer.designation}</>
        ) : (
          <>—<br />Pending</>
        )}
      </div>
    </div>
  )
}

// ─── A4 document frame ───────────────────────────────────────────────────────

function A4Frame({
  title,
  refNumber,
  signers,
  signatureUrl,
  children,
}: {
  title: string
  refNumber: string
  signers: SignerConfig[]
  signatureUrl?: string
  children: React.ReactNode
}) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="ops-a4">
      {/* Subtle paper grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(80,60,30,0.025) 0.6px, transparent 0.6px)',
        backgroundSize: '3px 3px',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid var(--ops-ink-900)', paddingBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'linear-gradient(140deg, var(--ops-secondary), var(--ops-accent))',
            display: 'grid', placeItems: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--ops-ink-900)',
          }}>B</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Bangladesh Research and Education Network</div>
            <div style={{ fontSize: 8, color: 'var(--ops-ink-500)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Internal Operations · OpsSync
            </div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--ops-font-mono)', fontSize: 9, textAlign: 'right' }}>
          Ref. <span style={{ fontWeight: 600, color: 'var(--ops-accent-700)' }}>{refNumber}</span><br />
          {today}
        </div>
      </div>

      {/* Title */}
      <div style={{
        textAlign: 'center', margin: '14px 0 10px',
        fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase',
      }}>
        {title}
      </div>

      {/* Body */}
      {children}

      {/* Signatures */}
      <div style={{
        position: 'absolute', left: 30, right: 30, bottom: 80,
        display: 'grid', gridTemplateColumns: `repeat(${Math.min(signers.length, 3)}, 1fr)`, gap: 12,
      }}>
        {signers.map((s, i) => (
          <SignatureBlock key={i} signer={s} signatureUrl={s.signed && i === 0 ? signatureUrl : undefined} />
        ))}
      </div>

      {/* Seal */}
      <div style={{
        position: 'absolute', right: 30, bottom: 30,
        width: 78, height: 78, borderRadius: '50%',
        border: '2px solid var(--ops-accent)', color: 'var(--ops-accent)',
        display: 'grid', placeItems: 'center', textAlign: 'center',
        fontSize: 7, lineHeight: 1.2, letterSpacing: '0.08em', textTransform: 'uppercase',
        fontWeight: 700, transform: 'rotate(-8deg)', opacity: 0.85,
        boxShadow: 'inset 0 0 0 1px var(--ops-accent)',
      }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div>BdREN</div>
          <div style={{ fontSize: 6, opacity: 0.7 }}>★</div>
          <div>Trust</div>
        </div>
      </div>

      {/* Footer strip */}
      <div style={{
        position: 'absolute', left: 30, right: 30, bottom: 14,
        fontSize: 8, color: 'var(--ops-ink-500)',
        display: 'flex', justifyContent: 'space-between',
        borderTop: '1px solid var(--ops-ink-200)', paddingTop: 5,
      }}>
        <span>Internal use only · BdREN Trust · Admin</span>
        <span style={{ fontFamily: 'var(--ops-font-mono)' }}>Page 1 / 1</span>
      </div>
    </div>
  )
}

// ─── Section helpers ─────────────────────────────────────────────────────────

export function A4Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ops-ink-500)', marginBottom: 5 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export function A4Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
      {children}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function FormPreviewPanel({
  formContent,
  previewTemplate,
  previewData,
  referenceNumber,
  signers,
  onPrint,
  children,
}: FormPreviewPanelProps) {
  const { user } = useAuth()
  const printRef = useRef<HTMLDivElement>(null)
  void previewData

  const meta = TEMPLATE_META[previewTemplate]
  const moduleCode = MODULE_CODES[meta.moduleKey]
  const refNum = referenceNumber ?? `BDREN-${moduleCode}-PENDING`
  const signatureUrl = user?.signature ? resolveApiAssetUrl(user.signature) : undefined

  const defaultSigners: SignerConfig[] = signers ?? [
    {
      label: 'Requester',
      name: user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.username ?? '',
      designation: user?.designation ?? '',
      signed: true,
    },
    { label: 'Approver', signed: false },
    { label: 'Admin Officer', signed: false },
  ]

  const handlePrint = () => {
    if (onPrint) { onPrint(); return }
    window.print()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,0.85fr)', gap: 20, alignItems: 'start' }}>
      {/* Form column */}
      <div className="ops-form-col">{formContent}</div>

      {/* Preview column */}
      <div className="ops-preview-col" style={{ position: 'sticky', top: 0 }}>
        {/* Print button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, gap: 8 }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', fontSize: 12, fontWeight: 500,
              background: 'var(--ops-surface)', border: '1px solid var(--ops-ink-200)',
              borderRadius: 8, cursor: 'pointer', color: 'var(--ops-ink-700)',
            }}
          >
            <OpsIcon name="print" size={13} />
            Print / Save PDF
          </button>
        </div>
        <div ref={printRef}>
          <A4Frame
            title={meta.title}
            refNumber={refNum}
            signers={defaultSigners}
            signatureUrl={signatureUrl}
          >
            {children ?? (
              <div style={{ fontSize: 10, color: 'var(--ops-ink-500)', padding: '8px 0' }}>
                Fill in the form to see a live preview.
              </div>
            )}
          </A4Frame>
        </div>
        <div style={{ marginTop: 8, fontSize: 10.5, color: 'var(--ops-ink-500)', textAlign: 'center' }}>
          Use <em>Print → Save as PDF</em> to download.
        </div>
      </div>
    </div>
  )
}

export { A4Frame }
