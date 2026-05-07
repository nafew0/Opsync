/* BdREN OpsSync — Vehicle + Conveyance */

const { useState: useStateP3, useMemo: useMemoP3 } = React;

// =====================================================
// 4.4 VEHICLE REQUISITION
// =====================================================
const FLEET = [
  { id: "DA-2-7849", type: "Microbus",  cap: 12, status: "Available",      driver: "Karim Mia",   km: 84210, ins: "12 Jul 2026" },
  { id: "DA-1-1124", type: "Sedan",     cap: 4,  status: "On Trip",        driver: "Rashed Khan", km: 162410, ins: "08 Sep 2026" },
  { id: "DA-3-2245", type: "SUV",       cap: 6,  status: "Available",      driver: "Mizan Ali",   km: 41020,  ins: "21 Mar 2027" },
  { id: "DA-2-9981", type: "Microbus",  cap: 12, status: "Maintenance",    driver: "—",           km: 119840, ins: "05 Jun 2026" },
];

function VehiclePage() {
  const [date, setDate]    = useStateP3("2026-05-14");
  const [dep, setDep]      = useStateP3("09:00");
  const [ret, setRet]      = useStateP3("13:00");
  const [pickup, setPickup]= useStateP3("BdREN HQ · Plot 5/A, Banani");
  const [dest, setDest]    = useStateP3("UIU Campus, United City, Madani Avenue");
  const [purpose, setPurp] = useStateP3("Joint network design review with UIU campus IT team. Carrying demo equipment.");
  const [pax, setPax]      = useStateP3(4);
  const [pri, setPri]      = useStateP3("Official Meeting");
  const [vehicle, setVeh]  = useStateP3("DA-3-2245");

  const veh = FLEET.find(f => f.id === vehicle);

  return (
    <div className="page">
      <PageHead
        eyebrow="MODULE 4.4 · VEH"
        title="Vehicle requisition"
        subtitle="Request an official vehicle and driver. Routes through Supervisor → Line Manager → Admin assignment."
        actions={<>
          <button className="btn ghost">{Icons.print({ size: 13 })} Preview PDF</button>
          <button className="btn primary">{Icons.check({ size: 13 })} Submit request</button>
        </>}
      />

      <Stepper steps={["Submit","Supervisor","Line Manager","Admin assigns","On trip"]} activeIdx={0} />
      <div style={{ height: 16 }} />

      {/* Fleet snapshot */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Fleet status · today</div>
            <div className="card-sub">Real-time availability. Tap a vehicle to preselect for assignment.</div>
          </div>
          <span className="pill info"><span className="dot" /> 2 of 4 available</span>
        </div>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {FLEET.map(v => {
            const isSel = v.id === vehicle;
            const isAvail = v.status === "Available";
            return (
              <div key={v.id}
                onClick={() => isAvail && setVeh(v.id)}
                style={{
                  border: `1px solid ${isSel ? "var(--primary-500)" : "var(--ink-200)"}`,
                  background: isSel ? "var(--primary-50)" : "var(--surface)",
                  borderRadius: 10, padding: 12, cursor: isAvail ? "pointer" : "not-allowed",
                  opacity: isAvail ? 1 : 0.65,
                  position: "relative",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 }}>{v.id}</span>
                  <span className={`pill ${v.status === "Available" ? "success" : v.status === "On Trip" ? "warning" : "neutral"}`}>
                    <span className="dot" /> {v.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, marginTop: 6, fontWeight: 500 }}>{v.type} · {v.cap} seats</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 2 }}>Driver: {v.driver}</div>
                <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>{v.km.toLocaleString()} km</span>
                  <span>Ins. {v.ins}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Trip details</div>
            <span className="pill warning"><span className="dot" /> SLA: Supervisor reviews in 4h</span>
          </div>
          <div className="card-body">
            <FormSection num="01" title="Requester">
              <div className="row cols-3">
                <div className="field"><div className="field-label">Name</div><input className="input readonly" value={ME.name} readOnly /></div>
                <div className="field"><div className="field-label">Designation</div><input className="input readonly" value={ME.designation} readOnly /></div>
                <div className="field"><div className="field-label">Department</div><input className="input readonly" value={ME.department} readOnly /></div>
              </div>
            </FormSection>

            <FormSection num="02" title="Journey">
              <div className="row cols-3">
                <div className="field"><div className="field-label">Date of journey <span className="req">*</span></div><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div className="field"><div className="field-label">Departure <span className="req">*</span></div><input className="input" type="time" value={dep} onChange={e => setDep(e.target.value)} /></div>
                <div className="field"><div className="field-label">Estimated return</div><input className="input" type="time" value={ret} onChange={e => setRet(e.target.value)} /></div>
              </div>
              <div className="row cols-2" style={{ marginTop: 10 }}>
                <div className="field">
                  <div className="field-label">Pickup location</div>
                  <div style={{ position: "relative" }}>
                    <input className="input" style={{ paddingLeft: 30 }} value={pickup} onChange={e => setPickup(e.target.value)} />
                    <span style={{ position: "absolute", left: 8, top: 9, color: "var(--success)" }}>{Icons.pin({ size: 14 })}</span>
                  </div>
                </div>
                <div className="field">
                  <div className="field-label">Destination</div>
                  <div style={{ position: "relative" }}>
                    <input className="input" style={{ paddingLeft: 30 }} value={dest} onChange={e => setDest(e.target.value)} />
                    <span style={{ position: "absolute", left: 8, top: 9, color: "var(--accent)" }}>{Icons.pin({ size: 14 })}</span>
                  </div>
                </div>
              </div>
              <div className="row cols-2" style={{ marginTop: 10 }}>
                <div className="field">
                  <div className="field-label">Number of passengers</div>
                  <input className="input" type="number" value={pax} onChange={e => setPax(+e.target.value)} />
                  {veh && pax > veh.cap && <div className="help warn">⚠ Exceeds {veh.id} capacity ({veh.cap}).</div>}
                </div>
                <div className="field">
                  <div className="field-label">Priority / nature</div>
                  <select className="select" value={pri} onChange={e => setPri(e.target.value)}>
                    <option>Official Meeting</option>
                    <option>Site Visit</option>
                    <option>Airport Drop/Pickup</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <div className="field">
                  <div className="field-label">Purpose of journey</div>
                  <textarea className="textarea" value={purpose} onChange={e => setPurp(e.target.value)} />
                </div>
              </div>
            </FormSection>

            <FormSection num="03" title="Suggested vehicle" sub="Admin officer makes final assignment">
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: 12,
                background: "var(--primary-50)", border: "1px solid var(--primary-200)",
                borderRadius: 10,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center" }}>
                  {Icons.car({ size: 20 })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{veh.id} · {veh.type}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{veh.cap} seats · Driver {veh.driver} · {veh.km.toLocaleString()} km</div>
                </div>
                <span className="pill success"><span className="dot" /> Available</span>
              </div>
            </FormSection>
          </div>
        </div>

        <div className="preview-col">
          <A4Frame title="Vehicle Requisition" refCode="VEH"
            signers={[
              { label: "Requester",     name: ME.name, designation: ME.designation, signed: true },
              { label: "Supervisor",    name: "—", designation: "—", signed: false },
              { label: "Line Manager",  name: "—", designation: "—", signed: false },
            ]}>
            <div className="a4-section">
              <div className="a4-section-title">Requester</div>
              <div className="a4-grid">
                <A4Field label="Name" value={ME.name} />
                <A4Field label="Department" value={ME.department} />
                <A4Field label="Designation" value={ME.designation} />
                <A4Field label="Priority" value={pri} />
              </div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Journey</div>
              <div className="a4-grid">
                <A4Field label="Date" value={date && new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} />
                <A4Field label="Departure → Return" value={`${dep} → ${ret}`} />
                <A4Field label="Pickup" value={pickup} span={2} />
                <A4Field label="Destination" value={dest} span={2} />
                <A4Field label="Passengers" value={pax} />
                <A4Field label="Suggested Vehicle" value={`${veh.id} (${veh.type})`} />
              </div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Purpose</div>
              <div style={{ fontSize: 10, lineHeight: 1.5 }}>{purpose}</div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Trip log (filled post-trip)</div>
              <table className="a4-table">
                <thead><tr><th>Departure km</th><th>Arrival km</th><th>Distance</th><th>Fuel (L)</th><th>Cost (BDT)</th></tr></thead>
                <tbody><tr><td className="empty">—</td><td className="empty">—</td><td className="empty">—</td><td className="empty">—</td><td className="empty">—</td></tr></tbody>
              </table>
            </div>
          </A4Frame>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// 4.5 CONVEYANCE BILL CLAIM
// =====================================================
function ConveyancePage() {
  const [period, setPeriod] = useStateP3({ from: "2026-05-01", to: "2026-05-07" });
  const [rows, setRows] = useStateP3([
    { date: "2026-05-02", from: "BdREN HQ", to: "BTRC Office, Sher-e-Bangla Nagar", dep: "10:30", arr: "11:15", purpose: "License renewal docs",   mode: "CNG",        trip: "two-way", amount: 480 },
    { date: "2026-05-03", from: "BdREN HQ", to: "Daffodil Smart City, Ashulia",     dep: "09:00", arr: "10:45", purpose: "Campus connectivity check", mode: "Uber/Pathao",trip: "two-way", amount: 920 },
    { date: "2026-05-05", from: "BdREN HQ", to: "ICT Tower, Agargaon",              dep: "14:00", arr: "14:25", purpose: "Vendor meeting",            mode: "Rickshaw",   trip: "one-way", amount: 120 },
    { date: "2026-05-06", from: "Home (Mirpur)", to: "BdREN HQ",                    dep: "07:30", arr: "08:30", purpose: "Emergency switch repair",   mode: "Uber/Pathao",trip: "one-way", amount: 320 },
    { date: "2026-05-07", from: "BdREN HQ", to: "NSU Campus, Bashundhara",          dep: "11:00", arr: "12:30", purpose: "Edge router commissioning", mode: "Uber/Pathao",trip: "two-way", amount: 500 },
  ]);
  const [remarks, setRemarks] = useStateP3("All trips logged in Google Maps timeline; receipts available on request.");

  const total = rows.reduce((a, r) => a + (+r.amount || 0), 0);
  const avg = rows.length ? Math.round(total / rows.length) : 0;
  const highRow = rows.find(r => r.amount > avg * 1.7);

  const updateRow = (i, k, v) => {
    const next = rows.slice(); next[i] = { ...next[i], [k]: v }; setRows(next);
  };
  const addRow = () => setRows([...rows, { date: "", from: "", to: "", dep: "", arr: "", purpose: "", mode: "CNG", trip: "one-way", amount: 0 }]);
  const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  return (
    <div className="page">
      <PageHead
        eyebrow="MODULE 4.5 · CVY"
        title="Local conveyance bill claim"
        subtitle="Itemise each official local trip. Routes through Supervisor → Finance → Admin payment."
        actions={<>
          <button className="btn ghost">{Icons.download({ size: 13 })} Save draft</button>
          <button className="btn primary">{Icons.check({ size: 13 })} Submit claim</button>
        </>}
      />

      <Stepper steps={["Submit","Supervisor","Finance","Admin pays"]} activeIdx={0} />
      <div style={{ height: 16 }} />

      <div className="split" style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)" }}>
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-head">
              <div className="card-title">Claim period & claimant</div>
              <span className="pill info"><span className="dot" /> Designation band: SE-2 · cap BDT 8,000/mo</span>
            </div>
            <div className="card-body">
              <div className="row cols-4">
                <div className="field"><div className="field-label">From</div><input className="input" type="date" value={period.from} onChange={e => setPeriod({ ...period, from: e.target.value })} /></div>
                <div className="field"><div className="field-label">To</div><input className="input" type="date" value={period.to} onChange={e => setPeriod({ ...period, to: e.target.value })} /></div>
                <div className="field"><div className="field-label">Claimant</div><input className="input readonly" value={ME.name} readOnly /></div>
                <div className="field"><div className="field-label">Department</div><input className="input readonly" value={ME.department} readOnly /></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Journey entries</div>
                <div className="card-sub">{rows.length} {rows.length === 1 ? "trip" : "trips"} · auto-totalled below</div>
              </div>
              <button className="btn primary tiny" onClick={addRow}>{Icons.plus({ size: 12 })} Add journey</button>
            </div>
            <div className="card-body">
              {/* header row */}
              <div className="journey-row" style={{ background: "var(--ink-50)", border: "1px dashed var(--ink-200)" }}>
                <div className="field-label">Date</div>
                <div className="field-label">From → To</div>
                <div className="field-label">Purpose</div>
                <div className="field-label">Mode</div>
                <div className="field-label">Trip</div>
                <div className="field-label" style={{ textAlign: "right" }}>Amount (BDT)</div>
                <div></div>
              </div>
              {rows.map((r, i) => (
                <div className="journey-row" key={i}>
                  <input className="input" type="date" value={r.date} onChange={e => updateRow(i, "date", e.target.value)} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <input className="input" placeholder="From" value={r.from} onChange={e => updateRow(i, "from", e.target.value)} />
                    <input className="input" placeholder="To" value={r.to} onChange={e => updateRow(i, "to", e.target.value)} />
                  </div>
                  <input className="input" placeholder="Purpose" value={r.purpose} onChange={e => updateRow(i, "purpose", e.target.value)} />
                  <select className="select" value={r.mode} onChange={e => updateRow(i, "mode", e.target.value)}>
                    <option>CNG</option><option>Rickshaw</option><option>Uber/Pathao</option><option>Bus</option><option>Other</option>
                  </select>
                  <select className="select" value={r.trip} onChange={e => updateRow(i, "trip", e.target.value)}>
                    <option value="one-way">One-way</option>
                    <option value="two-way">Two-way</option>
                  </select>
                  <input className="input tbl-numeric" type="number" value={r.amount} onChange={e => updateRow(i, "amount", +e.target.value)} style={{ textAlign: "right" }} />
                  <span className="icon-trash" onClick={() => delRow(i)}>{Icons.trash({ size: 14 })}</span>
                </div>
              ))}

              {highRow && (
                <div style={{ marginTop: 6, padding: "8px 12px", background: "var(--warning-100)", border: "1px solid oklch(0.88 0.06 70)", borderRadius: 8, fontSize: 12 }}>
                  ⚠ <strong>Anomaly flag:</strong> trip on {highRow.date} (BDT {highRow.amount}) is higher than your historical average. Finance may request justification.
                </div>
              )}

              <div className="divider" />
              <div className="row cols-2">
                <div className="field">
                  <div className="field-label">Total amount</div>
                  <div style={{
                    background: "var(--accent-100)", border: "1px solid var(--accent-200)",
                    padding: "10px 14px", borderRadius: 8, color: "var(--accent-700)",
                    fontSize: 22, fontWeight: 600,
                  }}>BDT {total.toLocaleString()}</div>
                </div>
                <div className="field">
                  <div className="field-label">Amount in words</div>
                  <div style={{ background: "var(--ink-50)", padding: "10px 14px", borderRadius: 8, fontSize: 12, lineHeight: 1.5 }}>
                    {numToWords(total)} taka only.<br/>
                    <span style={{ color: "var(--ink-500)" }}>{numToBangla(total)} টাকা মাত্র।</span>
                  </div>
                </div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <div className="field">
                  <div className="field-label">Remarks / supporting docs</div>
                  <textarea className="textarea" value={remarks} onChange={e => setRemarks(e.target.value)} />
                  <div className="help">Attach receipts (PDF/JPG) — optional.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-col">
          <A4Frame title="Local Conveyance Bill" refCode="CVY"
            signers={[
              { label: "Claimant",   name: ME.name, designation: ME.designation, signed: true },
              { label: "Supervisor", name: "—", designation: "—", signed: false },
              { label: "Finance",    name: "—", designation: "—", signed: false },
            ]}>
            <div className="a4-section">
              <div className="a4-section-title">Claimant</div>
              <div className="a4-grid">
                <A4Field label="Name" value={ME.name} />
                <A4Field label="Designation" value={ME.designation} />
                <A4Field label="Department" value={ME.department} />
                <A4Field label="Period" value={`${new Date(period.from).toLocaleDateString("en-GB")} – ${new Date(period.to).toLocaleDateString("en-GB")}`} />
              </div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Journeys</div>
              <table className="a4-table">
                <thead>
                  <tr>
                    <th>Date</th><th>From → To</th><th>Mode</th><th>Trip</th>
                    <th style={{textAlign: "right"}}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan="5" className="empty">— No journeys —</td></tr>}
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date && new Date(r.date).toLocaleDateString("en-GB")}</td>
                      <td>{r.from} → {r.to}</td>
                      <td>{r.mode}</td>
                      <td>{r.trip === "two-way" ? "2-way" : "1-way"}</td>
                      <td style={{textAlign: "right"}}>{(+r.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="a4-total-row">
                    <td colSpan="4" style={{textAlign: "right"}}>Total</td>
                    <td style={{textAlign: "right"}}>BDT {total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Amount in words</div>
              <div style={{ fontSize: 10, padding: "3px 0", borderBottom: "1px dotted var(--ink-200)" }}>{numToWords(total)} taka only.</div>
              <div style={{ fontSize: 10, padding: "3px 0", color: "var(--ink-700)" }}>{numToBangla(total)} টাকা মাত্র।</div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Remarks</div>
              <div style={{ fontSize: 10, lineHeight: 1.5 }}>{remarks}</div>
            </div>
          </A4Frame>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VehiclePage, ConveyancePage });
