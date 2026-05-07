/* BdREN OpsSync — Dashboard + Meeting Slot Booking */

const { useState: useStateP1, useMemo: useMemoP1 } = React;

// =====================================================
// DASHBOARD
// =====================================================
function DashboardPage({ onNav }) {
  return (
    <div className="page">
      <PageHead
        eyebrow="MAY 2026 · TUESDAY"
        title={`Good afternoon, ${ME.name.split(" ")[0]}.`}
        subtitle="One portal. All operations. Zero paperwork. Here's what's waiting on you and what's moving through the system."
        actions={<>
          <button className="btn ghost">{Icons.print({ size: 13 })} Export</button>
          <button className="btn primary">{Icons.plus({ size: 13 })} New Request</button>
        </>}
      />

      <div className="stat-grid">
        <div className="stat primary">
          <div className="accent-bar" />
          <div className="stat-label">My Pending</div>
          <div className="stat-value">4</div>
          <div className="stat-delta">+1 since yesterday</div>
        </div>
        <div className="stat secondary">
          <div className="accent-bar" />
          <div className="stat-label">Awaiting My Action</div>
          <div className="stat-value">2</div>
          <div className="stat-delta down">SLA: 4h remaining</div>
        </div>
        <div className="stat success">
          <div className="accent-bar" />
          <div className="stat-label">Approved this Month</div>
          <div className="stat-value">23</div>
          <div className="stat-delta">↑ 18% vs April</div>
        </div>
        <div className="stat">
          <div className="accent-bar" />
          <div className="stat-label">Avg. Approval Time</div>
          <div className="stat-value">1.4d</div>
          <div className="stat-delta">↓ 22% vs target</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Quick submit</div>
              <div className="card-sub">Most-used services. Click any tile to start a new request.</div>
            </div>
            <span className="pill info"><span className="dot" /> 5 modules</span>
          </div>
          <div className="card-body">
            <div className="tile-grid">
              <Tile color="primary"   icon="calendar" name="Meeting Booking"  desc="Book a room. Real-time slot availability across all rooms." badge="MTG" onClick={() => onNav("meeting")} />
              <Tile color="secondary" icon="food"     name="Food Requisition" desc="Order meals or refreshments for a meeting." badge="FOD" onClick={() => onNav("food")} />
              <Tile color="accent"    icon="box"      name="Logistics"        desc="Request supplies & consumables from inventory." badge="LOG" onClick={() => onNav("logistics")} />
              <Tile color="primary"   icon="car"      name="Vehicle"          desc="Request an official vehicle with driver." badge="VEH" onClick={() => onNav("vehicle")} />
              <Tile color="secondary" icon="receipt"  name="Conveyance Claim" desc="Submit local travel reimbursement claim." badge="CVY" onClick={() => onNav("conveyance")} />
              <Tile color="accent"    icon="reports"  name="My Reports"       desc="View your activity and consumption history." muted />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Activity feed</div>
            <a className="pill neutral" style={{ cursor: "pointer" }}>View all →</a>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <FeedItem code="VEH" title="Vehicle assigned · BDREN-VEH-2026-00420" detail="Microbus DA-2-7849 · Driver: Karim Mia" time="12 min ago" status="success" />
            <FeedItem code="CVY" title="Claim approved by Finance" detail="BDT 2,340 · paid in batch BTC-MAY-08" time="1h ago" status="success" />
            <FeedItem code="LOG" title="Low-stock alert · A4 paper ream" detail="Current: 12 · Reorder at 25" time="3h ago" status="warning" />
            <FeedItem code="MTG" title="Booking awaiting Admin review" detail="Boardroom · Wed 09:30–11:00" time="5h ago" status="info" />
            <FeedItem code="FOD" title="Line Manager approved your request" detail="Lunch for 14 · BDT 9,100" time="Yesterday" status="success" />
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">My open requests</div>
            <div className="card-sub">Live status across every module.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost tiny">{Icons.filter({ size: 12 })} Filter</button>
            <button className="btn ghost tiny">{Icons.download({ size: 12 })} CSV</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Reference</th><th>Module</th><th>Title</th><th>Submitted</th><th>Pending with</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            <Row refNo="BDREN-VEH-2026-00421" mod="Vehicle"    title="Site visit — UIU Campus"           sub="Wed, 14 May · 09:00–13:00"   when="2h ago"    pend="Line Manager"   status="warning" sl="Approve · Reject" />
            <Row refNo="BDREN-MTG-2026-00247" mod="Meeting"    title="Network design review"              sub="Boardroom · Wed 09:30"        when="5h ago"    pend="Admin Officer"  status="warning" sl="Booked" />
            <Row refNo="BDREN-FOD-2026-00412" mod="Food"       title="Lunch · vendor demo"                sub="Lunch for 14 · BDT 9,100"     when="Yesterday" pend="Admin Officer"  status="info"    sl="Approved" />
            <Row refNo="BDREN-LOG-2026-00188" mod="Logistics"  title="A4 paper · 3 reams"                 sub="Floor 4 · Desk 12"            when="2 days"    pend="AM/DM"          status="info"    sl="Recommended" />
            <Row refNo="BDREN-CVY-2026-00309" mod="Conveyance" title="May claims · 6 journeys"            sub="BDT 2,340 total"              when="3 days"    pend="—"              status="success" sl="Paid" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ color = "primary", icon, name, desc, badge, muted, onClick }) {
  return (
    <div className="tile" onClick={muted ? null : onClick} style={muted ? { opacity: 0.55, cursor: "default" } : null}>
      <div className="tile-icon" style={{
        background: `var(--${color}-100)`,
        color: `var(--${color === "secondary" ? "secondary-700" : color === "accent" ? "accent-700" : "primary"})`
      }}>{Icons[icon]({ size: 18 })}</div>
      <div className="tile-name">{name}</div>
      <div className="tile-desc">{desc}</div>
      <div className="tile-meta">
        {badge ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em" }}>{`BDREN-${badge}-…`}</span> : <span>—</span>}
        <strong>{muted ? "Coming soon" : "Open →"}</strong>
      </div>
    </div>
  );
}

function FeedItem({ code, title, detail, time, status }) {
  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--ink-100)", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 7, flex: "0 0 auto",
        background: `var(--${status === "success" ? "success" : status === "warning" ? "warning" : "primary"}-100)`,
        color: `var(--${status === "success" ? "success" : status === "warning" ? "warning" : "primary"})`,
        display: "grid", placeItems: "center",
        fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700,
      }}>{code}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 2 }}>{detail}</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{time}</div>
    </div>
  );
}

function Row({ refNo, mod, title, sub, when, pend, status, sl }) {
  return (
    <tr>
      <td style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{refNo}</td>
      <td><span className="pill neutral">{mod}</span></td>
      <td>
        <div style={{ fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{sub}</div>
      </td>
      <td style={{ color: "var(--ink-500)" }}>{when}</td>
      <td>{pend}</td>
      <td><span className={`pill ${status}`}><span className="dot" /> {sl}</span></td>
      <td><span style={{ color: "var(--ink-400)" }}>{Icons.chevron({ size: 14 })}</span></td>
    </tr>
  );
}

// =====================================================
// MEETING SLOT BOOKING
// =====================================================
const ROOMS = [
  { id: "boardroom", name: "Boardroom",       capacity: 18, av: ["Projector","VC","Whiteboard"] },
  { id: "innovate",  name: "Innovate Lab",    capacity: 10, av: ["Whiteboard","TV"] },
  { id: "huddle1",   name: "Huddle Room 1",   capacity: 4,  av: ["TV"] },
  { id: "huddle2",   name: "Huddle Room 2",   capacity: 6,  av: ["TV","Whiteboard"] },
];

const TIMESLOTS = [];
for (let h = 9; h < 17; h++) {
  TIMESLOTS.push(`${String(h).padStart(2,"0")}:00`);
  TIMESLOTS.push(`${String(h).padStart(2,"0")}:30`);
}

const DAYS = [
  { d: "Mon", n: 11 }, { d: "Tue", n: 12, today: true }, { d: "Wed", n: 13 }, { d: "Thu", n: 14 }, { d: "Fri", n: 15 }
];

// Pre-seeded statuses for demo (deterministic per cell)
function seedStatus(dayIdx, slotIdx) {
  const k = (dayIdx * 17 + slotIdx * 7) % 11;
  if (k === 0) return "booked";
  if (k === 1) return "blocked";
  if (k === 2 || k === 3) return "reserved";
  return "available";
}

function MeetingPage() {
  const [room, setRoom]       = useStateP1(ROOMS[0].id);
  const [selected, setSel]    = useStateP1({ day: 2, start: 1, end: 4 }); // Wed 09:30-11:00
  const [title, setTitle]     = useStateP1("Network design review");
  const [attendees, setAtt]   = useStateP1(8);
  const [desc, setDesc]       = useStateP1("Review of next-quarter PoP design across regional hubs. External partner from UIU.");
  const [external, setExt]    = useStateP1(true);
  const [equip, setEquip]     = useStateP1(["Projector","VC"]);
  const [recur, setRecur]     = useStateP1(false);

  const roomObj = ROOMS.find(r => r.id === room);

  const cellClick = (dayIdx, slotIdx) => {
    if (selected && selected.day === dayIdx) {
      const start = Math.min(selected.start, slotIdx);
      const end   = Math.max(selected.start, slotIdx);
      setSel({ day: dayIdx, start, end });
    } else {
      setSel({ day: dayIdx, start: slotIdx, end: slotIdx });
    }
  };

  const cellStatus = (dayIdx, slotIdx) => {
    if (selected && selected.day === dayIdx && slotIdx >= selected.start && slotIdx <= selected.end) return "selected";
    return seedStatus(dayIdx, slotIdx);
  };

  const selectedRange = useMemoP1(() => {
    if (!selected) return null;
    const day = DAYS[selected.day];
    return {
      day: `${day.d} ${day.n} May 2026`,
      start: TIMESLOTS[selected.start],
      end: (() => {
        const idx = selected.end + 1;
        if (idx >= TIMESLOTS.length) return "17:00";
        return TIMESLOTS[idx];
      })(),
      duration: ((selected.end - selected.start + 1) * 30) + " min",
    };
  }, [selected]);

  return (
    <div className="page">
      <PageHead
        eyebrow="MODULE 4.1 · MTG"
        title="Book a meeting room"
        subtitle="Pick consecutive slots on the live calendar, then complete the booking form. Confirmed bookings generate an .ics file for your calendar."
        actions={<>
          <button className="btn ghost">{Icons.print({ size: 13 })} Preview PDF</button>
          <button className="btn primary">{Icons.check({ size: 13 })} Submit booking</button>
        </>}
      />

      <Stepper steps={["Select slot","Fill details","Admin review","Confirmed"]} activeIdx={1} />
      <div style={{ height: 16 }} />

      {/* Room tabs */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head" style={{ borderBottom: "none", paddingBottom: 0 }}>
          <div className="tabs">
            {ROOMS.map(r => (
              <div key={r.id} className={`tab ${room === r.id ? "active" : ""}`} onClick={() => setRoom(r.id)}>
                {r.name}<span style={{ marginLeft: 8, fontSize: 11, color: "var(--ink-400)" }}>·  {r.capacity} seats</span>
              </div>
            ))}
          </div>
          <div className="legend">
            <span className="legend-item"><span className="legend-sw" style={{ background: "oklch(0.97 0.04 150)", border: "1px solid oklch(0.85 0.04 150)" }}/>Available</span>
            <span className="legend-item"><span className="legend-sw" style={{ background: "oklch(0.95 0.07 75)" }}/>Reserved</span>
            <span className="legend-item"><span className="legend-sw" style={{ background: "oklch(0.92 0.07 25)" }}/>Booked</span>
            <span className="legend-item"><span className="legend-sw" style={{ background: "var(--ink-100)" }}/>Blocked</span>
            <span className="legend-item"><span className="legend-sw" style={{ background: "var(--primary)" }}/>Your selection</span>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="card-body" style={{ padding: 12 }}>
          <div className="cal-wrap" style={{ position: "relative" }}>
            {/* header row */}
            <div className="cal-header" style={{ background: "var(--ink-50)" }}>Time</div>
            {DAYS.map((d, i) => (
              <div key={i} className={`cal-header ${d.today ? "today" : ""}`}>
                {d.d}<span className="day-num">{d.n}</span>
              </div>
            ))}
            {/* body rows */}
            {TIMESLOTS.map((t, slotIdx) => (
              <React.Fragment key={t}>
                <div className="cal-time-col">{t}</div>
                {DAYS.map((d, dayIdx) => {
                  const st = cellStatus(dayIdx, slotIdx);
                  return (
                    <div
                      key={dayIdx}
                      className={`cal-cell ${st}`}
                      onClick={() => cellClick(dayIdx, slotIdx)}
                      title={`${d.d} ${t} · ${st}`}
                    >
                      {/* tooltip on booked */}
                      {st === "booked" && slotIdx % 4 === 0 && (
                        <div className="label">Eng All-Hands · A. Hossain</div>
                      )}
                      {st === "reserved" && slotIdx % 5 === 0 && (
                        <div className="label">Pending · S. Rahman</div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            {/* now line */}
            <div className="cal-now" style={{ top: `${42 + (TIMESLOTS.indexOf("14:30") + 1) * 38}px` }} />
          </div>

          {selected && (
            <div style={{
              marginTop: 12, padding: "10px 14px",
              background: "var(--primary-50)",
              border: "1px solid var(--primary-200)",
              borderRadius: 8,
              display: "flex", alignItems: "center", gap: 14,
              fontSize: 13,
            }}>
              {Icons.check({ size: 14 })}
              <strong>Selected:</strong>
              <span>{roomObj.name}</span>
              <span style={{ color: "var(--ink-400)" }}>·</span>
              <span>{selectedRange.day}</span>
              <span style={{ color: "var(--ink-400)" }}>·</span>
              <span>{selectedRange.start}–{selectedRange.end}</span>
              <span className="pill info" style={{ marginLeft: "auto" }}>{selectedRange.duration}</span>
              <button className="btn ghost tiny" onClick={() => setSel(null)}>Clear</button>
            </div>
          )}
        </div>
      </div>

      {/* Split: form + preview */}
      <div className="split">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Booking details</div>
            <span className="pill neutral">Auto-saved</span>
          </div>
          <div className="card-body">
            <FormSection num="01" title="Requester" sub="Auto-filled from profile">
              <div className="row cols-3">
                <div className="field"><div className="field-label">Name</div><input className="input readonly" value={ME.name} readOnly /></div>
                <div className="field"><div className="field-label">Designation</div><input className="input readonly" value={ME.designation} readOnly /></div>
                <div className="field"><div className="field-label">Department</div><input className="input readonly" value={ME.department} readOnly /></div>
              </div>
            </FormSection>

            <FormSection num="02" title="Meeting" sub="Visible on the booking record">
              <div className="row" style={{ marginBottom: 10 }}>
                <div className="field">
                  <div className="field-label">Meeting title <span className="req">*</span></div>
                  <input className="input" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} />
                  <div className="help">{title.length}/100 characters</div>
                </div>
              </div>
              <div className="row cols-2">
                <div className="field">
                  <div className="field-label">Number of attendees</div>
                  <input className="input" type="number" value={attendees} onChange={e => setAtt(+e.target.value)} />
                  {attendees > roomObj.capacity && <div className="help warn">⚠ Exceeds {roomObj.name} capacity ({roomObj.capacity}). System will warn but allow.</div>}
                </div>
                <div className="field">
                  <div className="field-label">External attendees?</div>
                  <label className="toggle"><input type="checkbox" checked={external} onChange={() => setExt(!external)} /><span className="track" /><span style={{ fontSize: 13 }}>{external ? "Yes — guests from outside BdREN" : "No"}</span></label>
                </div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <div className="field">
                  <div className="field-label">Description</div>
                  <textarea className="textarea" value={desc} onChange={e => setDesc(e.target.value)} />
                </div>
              </div>
            </FormSection>

            <FormSection num="03" title="AV / Equipment" sub="Optional">
              <div className="chk-group">
                {["Projector","Whiteboard","VC","TV","Mic","Flipchart"].map(t => (
                  <label key={t} className={`chk ${equip.includes(t) ? "active" : ""}`}>
                    <input type="checkbox" checked={equip.includes(t)} onChange={() => setEquip(equip.includes(t) ? equip.filter(x => x !== t) : [...equip, t])} />
                    {t === "Projector" && Icons.monitor({ size: 13 })}
                    {t === "VC" && Icons.video({ size: 13 })}
                    {t === "Whiteboard" && Icons.whiteboard({ size: 13 })}
                    {t}
                  </label>
                ))}
              </div>
              <div className="divider" />
              <label className="toggle"><input type="checkbox" checked={recur} onChange={() => setRecur(!recur)} /><span className="track" /><span style={{ fontSize: 13 }}>Recurring meeting (Phase 2)</span></label>
            </FormSection>
          </div>
        </div>

        <div className="preview-col">
          <A4Frame title="Meeting Room Booking Request" refCode="MTG"
            signers={[
              { label: "Requester",     name: ME.name, designation: ME.designation, signed: true },
              { label: "Admin Officer", name: "—",     designation: "—", signed: false },
              { label: "Approval Seal", name: "—",     designation: "—", signed: false },
            ]}>
            <div className="a4-section">
              <div className="a4-section-title">Requester</div>
              <div className="a4-grid">
                <A4Field label="Name" value={ME.name} />
                <A4Field label="Designation" value={ME.designation} />
                <A4Field label="Department" value={ME.department} />
                <A4Field label="Submitted" value={new Date().toLocaleDateString("en-GB")} />
              </div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Booking</div>
              <div className="a4-grid">
                <A4Field label="Meeting Title" value={title} span={2} />
                <A4Field label="Room" value={roomObj.name} />
                <A4Field label="Capacity" value={`${roomObj.capacity} seats`} />
                <A4Field label="Date" value={selectedRange?.day} />
                <A4Field label="Time" value={selectedRange ? `${selectedRange.start} – ${selectedRange.end}` : null} />
                <A4Field label="Duration" value={selectedRange?.duration} />
                <A4Field label="Attendees" value={attendees} />
                <A4Field label="External Guests" value={external ? "Yes" : "No"} />
                <A4Field label="Equipment" value={equip.join(", ")} />
              </div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Description</div>
              <div style={{ fontSize: 10, color: "var(--ink-700)", lineHeight: 1.5, padding: "4px 0" }}>
                {desc || <span style={{ color: "var(--ink-300)", fontStyle: "italic" }}>—</span>}
              </div>
            </div>
          </A4Frame>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardPage, MeetingPage });
