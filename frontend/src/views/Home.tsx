'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import { startSocialLogin } from '@/services/auth'
import './home.css'

// ── Inline SVG helpers ────────────────────────────────────────
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>
  </svg>
)
const LoginIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>
  </svg>
)
// ── Orbiting card data ────────────────────────────────────────
// radiusFrac: fraction of orb half-width; speed: degrees/sec (positive = CW)
const ORBITERS = [
  {
    startDeg: 20, radiusFrac: 0.36, speed: 11,
    icBg: 'oklch(0.94 0.025 205)', icFg: 'var(--primary)',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18"/><path d="M7 3v4"/><path d="M17 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/></svg>,
    label: 'Boardroom · Wed 09:30', ref: 'BDREN-MTG-2026-00247',
  },
  {
    startDeg: 200, radiusFrac: 0.36, speed: 11,
    icBg: 'oklch(0.96 0.04 80)', icFg: 'var(--secondary-700)',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21h16"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 7V4"/></svg>,
    label: 'Lunch · 14 attendees', ref: 'BDREN-FOD-2026-00412',
  },
  {
    startDeg: 80, radiusFrac: 0.46, speed: -7.5,
    icBg: 'oklch(0.95 0.03 38)', icFg: 'var(--accent-700)',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H4a1 1 0 0 1-1-1v-3l2-5h14l2 5v3a1 1 0 0 1-1 1h-1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
    label: 'Microbus · UIU Site Visit', ref: 'BDREN-VEH-2026-00421',
  },
  {
    startDeg: 260, radiusFrac: 0.46, speed: -7.5,
    icBg: 'oklch(0.94 0.04 150)', icFg: 'oklch(0.42 0.1 150)',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/></svg>,
    label: 'A4 Paper · 3 reams', ref: 'BDREN-LOG-2026-00188',
  },
  {
    startDeg: 140, radiusFrac: 0.56, speed: 5,
    icBg: 'var(--ink-100)', icFg: 'var(--ink-700)',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z"/><path d="M9 8h6"/><path d="M9 12h6"/></svg>,
    label: 'Conveyance · BDT 2,340', ref: 'BDREN-CVY-2026-00309 · paid',
  },
]

// ── Module card data ──────────────────────────────────────────
const MODULES_DATA = [
  {
    code: '4.1 · MTG', featured: true, href: '/meetings',
    icBg: 'var(--primary-100)', icFg: 'var(--primary)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18"/><path d="M7 3v4"/><path d="M17 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/></svg>,
    title: 'Meeting Slot Booking',
    desc: 'Calendar-centric booking with real-time slot availability across every room. Drag to select consecutive slots, auto-prevent double-bookings, and ship .ics to your calendar.',
    previewContent: (
      <>
        <span style={{ color: 'var(--success)' }}>●</span>
        <span>Boardroom · Wed 09:30–11:00</span>
        <span className="hp-pill go">Available</span>
        <span style={{ color: 'oklch(0.7 0.13 70)' }}>●</span>
        <span>Innovate Lab · Thu 14:00</span>
        <span className="hp-pill ye">Reserved</span>
      </>
    ),
    previewCols: 'auto 1fr auto auto 1fr auto',
    arr: 'Open the booking calendar →',
  },
  {
    code: '4.2 · FOD', featured: true, href: '/food',
    icBg: 'oklch(0.96 0.04 80)', icFg: 'var(--secondary-700)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21h16"/><path d="M4 17h16"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 7V4"/><path d="M9 4h6"/></svg>,
    title: 'Meeting Food Requisition',
    desc: 'Order meals or refreshments with auto-calculated totals, policy-limit enforcement per food type, and live English + Bangla amount-in-words on the official requisition.',
    previewContent: (
      <>
        <span style={{ fontWeight: 600 }}>Lunch · 14 ppl</span>
        <span>BDT 9,100 · within policy</span>
        <span className="hp-pill go">Approved</span>
      </>
    ),
    previewCols: 'auto 1fr auto',
    arr: 'Open the food form →',
  },
  {
    code: '4.3 · LOG', featured: false, href: '/logistics',
    icBg: 'var(--accent-100)', icFg: 'var(--accent-700)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>,
    title: 'Logistics & Inventory',
    desc: 'Live stock visibility, low-stock alerts, per-user consumption history, and AM/DM approval flow.',
    previewContent: null, previewCols: '',
    arr: 'Open inventory →',
  },
  {
    code: '4.4 · VEH', featured: false, href: '/vehicles',
    icBg: 'var(--primary-100)', icFg: 'var(--primary)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H4a1 1 0 0 1-1-1v-3l2-5h14l2 5v3a1 1 0 0 1-1 1h-1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 13h14"/></svg>,
    title: 'Vehicle Requisition',
    desc: 'Fleet calendar, driver roster, conflict detection, and post-trip log with km + fuel tracking.',
    previewContent: null, previewCols: '',
    arr: 'Open fleet →',
  },
  {
    code: '4.5 · CVY', featured: false, href: '/conveyance',
    icBg: 'oklch(0.96 0.04 80)', icFg: 'var(--secondary-700)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>,
    title: 'Conveyance Bill Claim',
    desc: 'Repeating journey rows with anomaly flags, two-stage approval, and batch payment processing.',
    previewContent: null, previewCols: '',
    arr: 'Open claims →',
  },
]

const FLOW_STEPS = [
  { num: '01', title: 'Submit', desc: 'Auto-filled from your BdREN profile — under 3 minutes.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg> },
  { num: '02', title: 'Recommend', desc: 'Supervisor signs off within the SLA window.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 7v5l3 2"/></svg> },
  { num: '03', title: 'Approve', desc: 'Line Manager / Finance / AM/DM as the matrix dictates.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg> },
  { num: '04', title: 'Process', desc: 'Admin Officer acts — assign, dispatch, or pay.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4"/><path d="M3 7v10l9 4 9-4V7"/></svg> },
  { num: '05', title: 'Sealed', desc: 'Final document with all signatures, seal, and ref number.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h14v14H5z"/><path d="M9 9h6v6H9z"/></svg> },
]

const FEATURES = [
  { title: 'Live A4 preview', desc: 'Every form renders a print-ready document on the right as you type — with signatures, seal, ref number.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z"/></svg> },
  { title: 'BdREN SSO', desc: 'Single sign-on with your existing BdREN directory account. No new passwords. No new accounts.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1l9 4v6c0 5-4 9-9 11-5-2-9-6-9-11V5l9-4z"/></svg> },
  { title: 'English & বাংলা', desc: 'Full UI toggle, with amount-in-words rendered in both languages on every claim.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5l5 14"/><path d="M14 5h4"/><path d="M14 12h3"/><path d="M14 19h4"/></svg> },
  { title: 'Role-aware permissions', desc: 'Requester, Supervisor, Line Manager, Admin, AM/DM, Finance, Sys Admin — each sees only their relevant queues.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg> },
  { title: 'Three-tier dashboards', desc: 'Personal, Operational, Executive — each role lands on a dashboard tuned to the decisions they need to make.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg> },
  { title: 'Live SLAs & escalation', desc: "Every stage has a clock. Auto-escalation kicks in at 48h to keep nothing stuck on someone's desk.", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><path d="M12 7v5l3 2"/></svg> },
]

const MARQUEE_ITEMS = [
  'BdREN HQ · Banani', 'Network Operations', 'Member Universities · 122',
  'Finance Division', 'Admin Division', 'Trust & Compliance', 'Engineering · Fibre & PoP',
]

// ── Animated counter ──────────────────────────────────────────
function StatCounter({ value, suffix = '', display }: { value: number | null; suffix?: string; display?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || value === null) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const start = performance.now()
        const dur = 1400
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          el.textContent = `${Math.round(value * eased)}${suffix}`
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.unobserve(el)
      })
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, suffix])

  if (display) return <div className="hp-trust-num"><em>{display}</em></div>
  return <div className="hp-trust-num" ref={ref}>{value}{suffix}</div>
}

// ── Main ──────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const anglesRef = useRef(ORBITERS.map((o) => o.startDeg))
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const animate = () => {
      const orb = orbRef.current
      if (!orb) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }
      const size = orb.offsetWidth
      const cx = size / 2
      const cy = size / 2
      const now = performance.now()
      ORBITERS.forEach((o, i) => {
        const card = cardRefs.current[i]
        if (!card) return
        const elapsed = now / 1000
        const deg = o.startDeg + o.speed * elapsed
        anglesRef.current[i] = deg
        const rad = (deg * Math.PI) / 180
        const radius = cx * o.radiusFrac
        const x = cx + Math.sin(rad) * radius
        const y = cy - Math.cos(rad) * radius
        card.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    root.querySelectorAll('.hp-reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const handleSignIn = async () => {
    if (isAuthenticated) {
      router.push('/dashboard')
      return
    }

    setSigningIn(true)
    setSignInError('')
    try {
      const response = await startSocialLogin('bdren', { next: '/dashboard' })
      const authorizationUrl = (response as { authorization_url?: string }).authorization_url
      if (!authorizationUrl) {
        throw new Error('BdREN authorization URL missing from the server response.')
      }
      window.location.assign(authorizationUrl)
    } catch (error: unknown) {
      const detail =
        (error as { response?: { data?: { detail?: string } }; message?: string })
          ?.response?.data?.detail ||
        (error as { message?: string })?.message ||
        'BdREN sign-in could not be started right now.'
      setSignInError(detail)
      setSigningIn(false)
    }
  }

  return (
    <div className="hp-root" ref={rootRef}>

      {/* NAV */}
      <header className="hp-nav">
        <div className="hp-nav-inner">
          <a className="hp-logo" href="#top">
            <img src="/branding/opssynclogo.png" className="hp-logo-img" alt="OpsSync" />
            <div className="hp-logo-name">BdREN OpsSync</div>
          </a>
          <nav className="hp-nav-links">
            <a className="hp-nav-link" href="#modules">Modules</a>
            <a className="hp-nav-link" href="#workflow">How it works</a>
            <a className="hp-nav-link" href="#why">Why OpsSync</a>
            <a className="hp-nav-link" href="#help">Help</a>
          </nav>
          <div className="hp-nav-cta">
            <button className="hp-btn primary" onClick={handleSignIn} disabled={signingIn}>
              {signingIn ? 'Connecting...' : 'Sign in with BdREN ID'} <ArrowRight />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="hp-hero">
        <div className="hp-container">
          <div className="hp-hero-grid">
            <div>
              <div className="hp-eyebrow hp-reveal">
                <span className="hp-ping" />
                v1.0 · Internal Operations Portal
              </div>
              <h1 className="hp-h1 hp-reveal d1">
                One portal.<br />
                <span className="hp-scribe">All operations.</span><br />
                <em>Zero paperwork.</em>
              </h1>
              <p className="hp-lead hp-reveal d2">
                BdREN OpsSync digitises every administrative workflow at the Bangladesh Research and Education Network — meeting bookings, food, logistics, vehicles, and conveyance claims — into a single, role-aware portal. Submit a request in under three minutes. Watch every approval step in real time.
              </p>
              <div className="hp-hero-actions hp-reveal d3">
                <button className="hp-btn primary large" onClick={handleSignIn} disabled={signingIn}>
                  <LoginIcon />
                  {isAuthenticated ? 'Open workspace' : signingIn ? 'Connecting to BdREN...' : 'Sign in with BdREN ID'}
                </button>
                <a className="hp-btn ghost large" href="#workflow">
                  See how it works <ArrowRight />
                </a>
              </div>
              {signInError ? (
                <p className="hp-signin-error" role="alert">{signInError}</p>
              ) : null}
            </div>

            {/* ORB */}
            <div className="hp-orb hp-reveal d2" ref={orbRef}>
              <div className="hp-orb-rings">
                <div className="hp-orb-ring r1" />
                <div className="hp-orb-ring r2" />
                <div className="hp-orb-ring r3" />
              </div>
              <div className="hp-orb-core">
                <div>
                  <div className="hp-orb-core-label">OpsSync</div>
                  <div className="hp-orb-core-big">5 modules · 1 portal</div>
                  <div className="hp-orb-core-ref">BDREN-2026</div>
                </div>
              </div>
              {ORBITERS.map((o, i) => (
                <div
                  key={i}
                  ref={(el) => { cardRefs.current[i] = el }}
                  className="hp-orbiter-card"
                  style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform' }}
                >
                  <div className="hp-orbiter-ic" style={{ background: o.icBg, color: o.icFg }}>{o.icon}</div>
                  <div className="hp-orbiter-lbl">
                    <span>{o.label}</span>
                    <span className="hp-orbiter-ref">{o.ref}</span>
                  </div>
                </div>
              ))}
              <div className="hp-orb-pulse" style={{ transform: 'translate(60px, -160px)', animation: 'hp-blip 2.4s ease-in-out infinite 0s' }} />
              <div className="hp-orb-pulse" style={{ transform: 'translate(-120px, 90px)', animation: 'hp-blip 2.4s ease-in-out infinite 0.8s' }} />
              <div className="hp-orb-pulse" style={{ transform: 'translate(140px, 60px)', animation: 'hp-blip 2.4s ease-in-out infinite 1.6s', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
              <div className="hp-ticker">
                <span className="hp-ticker-blip" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-500)', letterSpacing: '0.06em' }}>LIVE</span>
                <span style={{ color: 'var(--ink-700)' }}><strong>23</strong> requests approved today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="hp-trust">
        <div className="hp-container hp-trust-inner">
          <span className="hp-trust-label">By the numbers</span>
          <div className="hp-trust-stats">
            {[
              { value: 200, suffix: '+', label: 'BdREN employees served' },
              { value: 100, suffix: '%', label: 'paperless target by Q4' },
              { value: 60, suffix: '%', label: 'faster approval cycles' },
              { value: 3, suffix: ' min', label: 'to submit any request' },
              { value: null, display: '99.5%', label: 'uptime SLA' },
            ].map((s) => (
              <div key={s.label}>
                <StatCounter value={s.value ?? null} suffix={s.suffix} display={s.display} />
                <div className="hp-trust-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="hp-section" id="modules">
        <div className="hp-container">
          <div className="hp-section-head">
            <div className="hp-section-eyebrow hp-reveal">§4 — Module Specifications</div>
            <h2 className="hp-reveal d1">Five services, <em>one signature</em>.</h2>
            <p className="hp-section-lead hp-reveal d2">Every workflow your team runs on paper today, rebuilt as a structured digital request with the right approval chain, real-time status, and an audit-grade trail.</p>
          </div>
          <div className="hp-mods">
            {MODULES_DATA.map((mod, i) => (
              <Link
                key={mod.code}
                href={isAuthenticated ? mod.href : '#'}
                onClick={!isAuthenticated ? (e) => { e.preventDefault(); handleSignIn() } : undefined}
                className={`hp-mod${mod.featured ? ' featured' : ''} hp-reveal${i > 0 ? ` d${Math.min(i, 4)}` : ''}`}
              >
                <span className="hp-mod-code">{mod.code}</span>
                <div className="hp-icbox" style={{ background: mod.icBg, color: mod.icFg }}>{mod.icon}</div>
                <h3>{mod.title}</h3>
                <p>{mod.desc}</p>
                {mod.previewContent && (
                  <div className="hp-mod-preview" style={{ gridTemplateColumns: mod.previewCols }}>
                    {mod.previewContent}
                  </div>
                )}
                <div className="hp-mod-arr">{mod.arr}</div>
              </Link>
            ))}
          </div>
          <div className="hp-marquee" style={{ marginTop: 64 }}>
            <div className="hp-marquee-track">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="hp-marquee-item">
                  <span className="hp-marquee-dot" />{item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="hp-workflow" id="workflow">
        <div className="hp-container">
          <div className="hp-section-head hp-reveal">
            <div className="hp-section-eyebrow">Workflow</div>
            <h2>Every request, <em>traced like a packet</em>.</h2>
            <p className="hp-section-lead">Every approval step is logged with timestamp, IP, and approver identity — constituting a legal-grade audit trail.</p>
          </div>
          <div className="hp-flow-stages">
            <div className="hp-flow-packet" />
            {FLOW_STEPS.map((step) => (
              <div key={step.num} className="hp-flow-stage">
                <div className="hp-flow-num">{step.num}</div>
                <div className="hp-flow-bubble">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="hp-sla-grid">
            {[
              { tag: 'SLA', val: '≤ 4 hours', desc: 'average approval window' },
              { tag: 'ESCALATION', val: '48 h', desc: "auto-escalates to supervisor's supervisor" },
              { tag: 'RETENTION', val: '3 yrs', desc: 'immutable audit log retained per policy' },
            ].map((s) => (
              <div key={s.tag} className="hp-sla-card">
                <div className="hp-sla-tag">{s.tag}</div>
                <div className="hp-sla-val">{s.val}</div>
                <div className="hp-sla-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="hp-section" id="why">
        <div className="hp-container">
          <div className="hp-section-head">
            <div className="hp-section-eyebrow hp-reveal">Why OpsSync</div>
            <h2 className="hp-reveal d1">Built around the way <em>BdREN already works</em>.</h2>
            <p className="hp-section-lead hp-reveal d2">No retraining required. Every form mirrors the paper version your team already signs — only faster, signed digitally, and printable to A4.</p>
          </div>
          <div className="hp-features">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`hp-feat hp-reveal${i % 3 !== 0 ? ` d${i % 3}` : ''}`}>
                <div className="hp-feat-icb">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="hp-quote-band">
        <div className="hp-container">
          <div className="hp-quote-card hp-reveal">
            <blockquote>
              Before OpsSync, a single vehicle requisition could lose two days passing through three desks. Now the same request is approved before lunch — and the trip log writes itself.
            </blockquote>
            <div className="hp-quote-author">
              <div className="hp-quote-av">SR</div>
              <div>
                <strong>Shahriar Rahman</strong>
                <span>Admin Officer · BdREN Operations Division</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta" id="help">
        <div className="hp-cta-inner hp-container">
          <h2 className="hp-reveal">Sign in. Submit a request. Done before your tea cools.</h2>
          <p className="hp-reveal d1">Use your existing BdREN directory credentials — no new account needed. Your role and department are picked up from HR automatically.</p>
          <div className="hp-reveal d2">
            <button className="hp-btn primary large" onClick={handleSignIn} disabled={signingIn}>
              <LoginIcon />
              {isAuthenticated ? 'Open workspace' : signingIn ? 'Connecting to BdREN...' : 'Sign in with BdREN ID'}
            </button>
            <a className="hp-btn ghost large" href="mailto:opssync@bdren.net.bd" style={{ marginLeft: 12 }}>
              Contact admin
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <div className="hp-container">
          <div className="hp-footer-grid">
            <div>
              <div className="hp-logo" style={{ marginBottom: 14 }}>
                <img src="/branding/opssynclogo.png" className="hp-logo-img" alt="OpsSync" />
                <div className="hp-logo-name" style={{ color: '#fff' }}>BdREN OpsSync</div>
              </div>
              <p className="hp-footer-desc">
                Bangladesh Research and Education Network · Internal use only. Designed for the Administration Division to digitise five core operational workflows.
              </p>
            </div>
            <div>
              <h5>Modules</h5>
              <ul>
                {[['Meeting Booking','/meetings'],['Food Requisition','/food'],['Logistics & Inventory','/logistics'],['Vehicle Requisition','/vehicles'],['Conveyance Claims','/conveyance']].map(([label, href]) => (
                  <li key={label}><a href={href}>{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5>Help</h5>
              <ul>
                {['User guide','Approver handbook','Policy reference','Release notes'].map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5>BdREN</h5>
              <ul>
                <li><a href="https://bdren.net.bd">bdren.net.bd</a></li>
                <li><a href="mailto:opssync@bdren.net.bd">opssync@bdren.net.bd</a></li>
                <li><a href="#">+880 2 5550 4101</a></li>
                <li><a href="#">Plot 5/A · Banani</a></li>
              </ul>
            </div>
          </div>
          <div className="hp-footer-bottom">
            <span>© 2026 Bangladesh Research and Education Network. Internal use only.</span>
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>v1.0 · admin.bdren.net.bd</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
