/* BdREN OpsSync — Shell, navigation, shared chrome */

const { useState, useMemo, useEffect, useRef } = React;

// Current "user" for previews
const ME = {
  name: "Tariq Ahmed",
  initials: "TA",
  designation: "Senior Network Engineer",
  department: "Network Operations",
  role: "Requester",
};

const NAV = [
  { id: "dashboard",  label: "Dashboard",          icon: "dashboard" },
  { section: "REQUEST" },
  { id: "meeting",    label: "Meeting Booking",    icon: "calendar", code: "MTG", badge: 3 },
  { id: "food",       label: "Food Requisition",   icon: "food",     code: "FOD" },
  { id: "logistics",  label: "Logistics & Stock",  icon: "box",      code: "LOG", badge: 1 },
  { id: "vehicle",    label: "Vehicle Requisition",icon: "car",      code: "VEH" },
  { id: "conveyance", label: "Conveyance Claim",   icon: "receipt",  code: "CVY" },
  { section: "MANAGE" },
  { id: "assets",     label: "Asset Management",   icon: "asset",    muted: true },
  { id: "visitors",   label: "Visitor Log",        icon: "visitor",  muted: true },
  { id: "reports",    label: "Reports & Analytics",icon: "reports",  muted: true },
  { id: "settings",   label: "System Settings",    icon: "settings", muted: true },
];

function Sidebar({ current, onNav }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">B</div>
        <div>
          <div className="brand-name">BdREN OpsSync</div>
          <div className="brand-sub">admin.bdren.net.bd</div>
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {NAV.map((n, i) => n.section
          ? <div key={i} className="nav-section-label">{n.section}</div>
          : (
            <div
              key={n.id}
              className={`nav-item ${current === n.id ? "active" : ""}`}
              onClick={() => !n.muted && onNav(n.id)}
              style={n.muted ? { opacity: 0.55 } : null}
            >
              <span className="nav-icon">{Icons[n.icon] && Icons[n.icon]({ size: 16 })}</span>
              <span>{n.label}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
              {n.muted && <span className="nav-badge muted">soon</span>}
            </div>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">{ME.initials}</div>
        <div style={{ minWidth: 0 }}>
          <div className="user-name">{ME.name}</div>
          <div className="user-role">{ME.role} · {ME.department}</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ crumbs }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        <span>BdREN</span>
        <span className="sep">/</span>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            {i === crumbs.length - 1 ? <strong>{c}</strong> : <span>{c}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="search">
        {Icons.search({ size: 14 })}
        <span style={{ flex: 1 }}>Search requests, refs, employees…</span>
        <kbd>⌘K</kbd>
      </div>
      <button className="icon-btn" title="Switch language">
        {Icons.bangla({ size: 16 })}
      </button>
      <button className="icon-btn" title="Notifications">
        {Icons.bell({ size: 16 })}
        <span className="dot" />
      </button>
    </div>
  );
}

// === Reference number generator (deterministic per module/session) ===
const REF_COUNTERS = { MTG: 247, FOD: 412, LOG: 188, VEH: 421, CVY: 309 };
function makeRef(code) {
  const n = REF_COUNTERS[code] || 1;
  return `BDREN-${code}-2026-${String(n).padStart(5, "0")}`;
}

// === A4 preview frame ===
function A4Frame({ title, refCode, children, signers, sealText = "BdREN Trust · Admin" }) {
  const ref = makeRef(refCode);
  return (
    <div className="a4">
      <div className="a4-head">
        <div className="a4-logo">
          <div className="mark">B</div>
          <div>
            <div className="name">Bangladesh Research and Education Network</div>
            <div className="sub">Internal Operations · OpsSync</div>
          </div>
        </div>
        <div className="a4-ref">
          Ref. <span className="num">{ref}</span><br/>
          {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>
      <div className="a4-title">{title}</div>
      {children}
      <div className="a4-signatures">
        {signers.map((s, i) => (
          <div className="a4-sig" key={i}>
            <div className="a4-sig-line">
              {s.signed && <span className="a4-sig-name">{s.name}</span>}
            </div>
            <div className="a4-sig-meta">
              <strong>{s.label}</strong>
              {s.signed ? <>{s.name}<br/>{s.designation}</> : <>—<br/>Pending</>}
            </div>
          </div>
        ))}
      </div>
      <div className="a4-seal">
        <div className="seal-inner">
          <div>BdREN</div>
          <div style={{ fontSize: 6, opacity: 0.7 }}>★</div>
          <div>{sealText.split("·")[1]?.trim() || "Trust"}</div>
        </div>
      </div>
      <div className="a4-footer-strip">
        <span>Internal use only · {sealText}</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>Page 1 / 1</span>
      </div>
    </div>
  );
}

function A4Field({ label, value, span = 1 }) {
  return (
    <div className="a4-field" style={{ gridColumn: `span ${span}` }}>
      <div className="a4-field-label">{label}</div>
      <div className={`a4-field-value ${!value ? "empty" : ""}`}>{value || "—"}</div>
    </div>
  );
}

function PageHead({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        <div className="page-subtitle">{subtitle}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>
    </div>
  );
}

function Stepper({ steps, activeIdx }) {
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`step ${i < activeIdx ? "done" : ""} ${i === activeIdx ? "active" : ""}`}>
            <div className="step-num">{i < activeIdx ? "✓" : i + 1}</div>
            <div className="step-label">{s}</div>
          </div>
          {i < steps.length - 1 && <div className="step-line" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function FormSection({ num, title, sub, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="form-section-head">
        <div className="num">{num}</div>
        <h3>{title}</h3>
        {sub && <span className="sub">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, A4Frame, A4Field, PageHead, Stepper, FormSection, makeRef, ME });
