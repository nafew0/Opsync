/* BdREN OpsSync — Food Requisition + Logistics */

const { useState: useStateP2, useMemo: useMemoP2 } = React;

// =====================================================
// 4.2 FOOD REQUISITION
// =====================================================
function FoodPage() {
  const [date, setDate]       = useStateP2("2026-05-13");
  const [time, setTime]       = useStateP2("13:00");
  const [linkRef, setLinkRef] = useStateP2("BDREN-MTG-2026-00247");
  const [attendees, setAtt]   = useStateP2(14);
  const [foodTypes, setFT]    = useStateP2(["Lunch"]);
  const [perHead, setPerHead] = useStateP2(650);
  const [menu, setMenu]       = useStateP2("Standard set lunch · 2 vegetarian portions · no beef");
  const [vendor, setVendor]   = useStateP2("Madchef Catering");
  const [budget, setBudget]   = useStateP2("NetOps · OpEx-21");
  const [notes, setNotes]     = useStateP2("Working session, please serve at 12:55 sharp.");

  const total = attendees * perHead;
  const policyLimit = foodTypes.includes("Lunch") ? 800 : foodTypes.includes("Dinner") ? 1000 : 300;
  const overLimit = perHead > policyLimit;

  // Lead time check (mock — assume "now")
  const leadHours = 50;
  const leadWarn = leadHours < 6;

  const amountInWords = numToWords(total);

  return (
    <div className="page">
      <PageHead
        eyebrow="MODULE 4.2 · FOD"
        title="Meeting food requisition"
        subtitle="Request meals or refreshments for an internal meeting. Cost auto-calculates against department policy."
        actions={<>
          <button className="btn ghost">{Icons.print({ size: 13 })} Preview PDF</button>
          <button className="btn primary">{Icons.check({ size: 13 })} Submit for approval</button>
        </>}
      />
      <Stepper steps={["Submit","Line Manager","Admin Officer","Processed"]} activeIdx={0} />
      <div style={{ height: 16 }} />

      <div className="split">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Food request form</div>
            <span className="pill warning"><span className="dot" /> Lead time: {leadHours}h</span>
          </div>
          <div className="card-body">
            <FormSection num="01" title="Linked meeting" sub="Optional but recommended">
              <div className="row cols-2">
                <div className="field">
                  <div className="field-label">Booking reference</div>
                  <select className="select" value={linkRef} onChange={e => setLinkRef(e.target.value)}>
                    <option>BDREN-MTG-2026-00247 — Network design review</option>
                    <option>BDREN-MTG-2026-00231 — Vendor demo</option>
                    <option value="">— Not linked to a booking —</option>
                  </select>
                  <div className="help">System verifies the booking is approved.</div>
                </div>
                <div className="field">
                  <div className="field-label">Budget head / cost centre</div>
                  <select className="select" value={budget} onChange={e => setBudget(e.target.value)}>
                    <option>NetOps · OpEx-21</option>
                    <option>NetOps · CapEx-12</option>
                    <option>Admin · Hospitality</option>
                  </select>
                </div>
              </div>
            </FormSection>

            <FormSection num="02" title="When & how many">
              <div className="row cols-3">
                <div className="field"><div className="field-label">Meeting date</div><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div className="field"><div className="field-label">Time slot</div><input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
                <div className="field"><div className="field-label">Number of attendees</div><input className="input" type="number" value={attendees} onChange={e => setAtt(+e.target.value)} /></div>
              </div>
              {leadWarn && <div className="help warn" style={{ marginTop: 6 }}>⚠ Less than 6h notice. Submission allowed but Admin will be flagged.</div>}
            </FormSection>

            <FormSection num="03" title="Food selection">
              <div className="field" style={{ marginBottom: 10 }}>
                <div className="field-label">Food type <span className="req">*</span></div>
                <div className="chk-group">
                  {["Morning Tea","Light Snacks","Lunch","Evening Tea","Dinner"].map(t => (
                    <label key={t} className={`chk ${foodTypes.includes(t) ? "active" : ""}`}>
                      <input type="checkbox" checked={foodTypes.includes(t)} onChange={() => setFT(foodTypes.includes(t) ? foodTypes.filter(x => x !== t) : [...foodTypes, t])} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <div className="row cols-2">
                <div className="field">
                  <div className="field-label">Cost per head (BDT)</div>
                  <input className="input" type="number" value={perHead} onChange={e => setPerHead(+e.target.value)} />
                  <div className={`help ${overLimit ? "warn" : ""}`}>
                    {overLimit
                      ? `⚠ Exceeds policy (BDT ${policyLimit}). Justification required below.`
                      : `Within policy limit of BDT ${policyLimit}.`}
                  </div>
                </div>
                <div className="field">
                  <div className="field-label">Vendor preference</div>
                  <input className="input" value={vendor} onChange={e => setVendor(e.target.value)} />
                  <div className="help">Admin Officer may override.</div>
                </div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <div className="field">
                  <div className="field-label">Menu / dietary notes</div>
                  <textarea className="textarea" value={menu} onChange={e => setMenu(e.target.value)} />
                </div>
              </div>
            </FormSection>

            <FormSection num="04" title="Cost summary">
              <div style={{
                background: "var(--secondary-100)",
                border: "1px solid var(--secondary-200)",
                borderRadius: 10,
                padding: "14px 18px",
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
              }}>
                <div>
                  <div className="field-label">Attendees</div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>{attendees}</div>
                </div>
                <div>
                  <div className="field-label">× Per head</div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>BDT {perHead}</div>
                </div>
                <div>
                  <div className="field-label">Total</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "var(--accent-700)" }}>BDT {total.toLocaleString()}</div>
                </div>
                <div style={{ gridColumn: "span 3", fontSize: 12, color: "var(--ink-700)", borderTop: "1px dashed var(--secondary)", paddingTop: 10 }}>
                  <strong>In words:</strong> {amountInWords} taka only.
                </div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <div className="field-label">Special instructions</div>
                <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </FormSection>
          </div>
        </div>

        <div className="preview-col">
          <A4Frame title="Meeting Food Requisition" refCode="FOD"
            signers={[
              { label: "Requester",     name: ME.name, designation: ME.designation, signed: true },
              { label: "Line Manager",  name: "—",     designation: "—", signed: false },
              { label: "Admin Officer", name: "—",     designation: "—", signed: false },
            ]}>
            <div className="a4-section">
              <div className="a4-section-title">Requester</div>
              <div className="a4-grid">
                <A4Field label="Name" value={ME.name} />
                <A4Field label="Department" value={ME.department} />
                <A4Field label="Designation" value={ME.designation} />
                <A4Field label="Linked Booking" value={linkRef ? linkRef.split(" ")[0] : "Not linked"} />
              </div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Meeting & food</div>
              <div className="a4-grid">
                <A4Field label="Date" value={date && new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} />
                <A4Field label="Time" value={time} />
                <A4Field label="Attendees" value={attendees} />
                <A4Field label="Food type" value={foodTypes.join(", ")} />
                <A4Field label="Cost / head" value={`BDT ${perHead}`} />
                <A4Field label="Total cost" value={`BDT ${total.toLocaleString()}`} />
                <A4Field label="Vendor" value={vendor} span={2} />
                <A4Field label="Budget head" value={budget} span={2} />
              </div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Amount in words</div>
              <div style={{ fontSize: 10, padding: "3px 0", borderBottom: "1px dotted var(--ink-200)" }}>{amountInWords} taka only.</div>
              <div style={{ fontSize: 10, padding: "3px 0", color: "var(--ink-700)", fontFamily: "system-ui" }}>{numToBangla(total)} টাকা মাত্র।</div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Menu / instructions</div>
              <div style={{ fontSize: 10, lineHeight: 1.5 }}>{menu}<br/><em style={{ color: "var(--ink-500)" }}>{notes}</em></div>
            </div>
          </A4Frame>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// 4.3 LOGISTICS REQUISITION
// =====================================================
const INVENTORY = [
  { sku: "STA-001", name: "A4 Paper Ream (500 sh)",   cat: "Stationery",       uom: "Ream", stock: 12,  reorder: 25, max: 200, threshold: 10, cost: 360 },
  { sku: "STA-014", name: "Ballpoint Pen (Blue)",     cat: "Stationery",       uom: "Pc",   stock: 248, reorder: 100, max: 1000, threshold: 50, cost: 8 },
  { sku: "ITA-021", name: "USB-C to HDMI Adapter",    cat: "IT Accessories",   uom: "Pc",   stock: 4,   reorder: 6,  max: 24,  threshold: 2,  cost: 1450 },
  { sku: "ITA-008", name: "HP CF217A Toner Cartridge",cat: "IT Accessories",   uom: "Pc",   stock: 2,   reorder: 4,  max: 12,  threshold: 1,  cost: 4200 },
  { sku: "CLN-002", name: "Hand Sanitizer 500ml",     cat: "Cleaning Supplies",uom: "Btl",  stock: 38,  reorder: 20, max: 100, threshold: 10, cost: 220 },
  { sku: "ITA-031", name: "Cat6 Patch Cable 2m",      cat: "IT Accessories",   uom: "Pc",   stock: 0,   reorder: 10, max: 60,  threshold: 0,  cost: 180 },
];

function LogisticsPage() {
  const [picked, setPicked]  = useStateP2(["ITA-021", "STA-001"]);
  const [qty, setQty]        = useStateP2({ "ITA-021": 1, "STA-001": 3 });
  const [purpose, setPurp]   = useStateP2("Workstation refresh for new Network Engineer joining 18 May. A4 reams for monthly reports.");
  const [urgency, setUrg]    = useStateP2("Normal");
  const [delivery, setDel]   = useStateP2("Floor 4 · Desk 12");

  const togglePick = (sku, available) => {
    if (available <= 0) return;
    if (picked.includes(sku)) setPicked(picked.filter(x => x !== sku));
    else { setPicked([...picked, sku]); setQty({ ...qty, [sku]: qty[sku] || 1 }); }
  };

  const lineItems = picked.map(sku => {
    const item = INVENTORY.find(i => i.sku === sku);
    return { ...item, qty: qty[sku] || 1, total: (qty[sku] || 1) * item.cost };
  });
  const total = lineItems.reduce((a, b) => a + b.total, 0);

  return (
    <div className="page">
      <PageHead
        eyebrow="MODULE 4.3 · LOG"
        title="Logistics requisition"
        subtitle="Request items from the central inventory. Stock decrements automatically on dispatch."
        actions={<>
          <button className="btn ghost">{Icons.print({ size: 13 })} Preview PDF</button>
          <button className="btn primary">{Icons.check({ size: 13 })} Submit request</button>
        </>}
      />

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat"><div className="accent-bar" style={{ background: "var(--success)" }}/><div className="stat-label">Items in stock</div><div className="stat-value">142</div><div className="stat-delta">across 38 SKUs</div></div>
        <div className="stat"><div className="accent-bar" style={{ background: "var(--warning)" }}/><div className="stat-label">Below reorder</div><div className="stat-value">4</div><div className="stat-delta down">action required</div></div>
        <div className="stat"><div className="accent-bar" style={{ background: "var(--danger)" }}/><div className="stat-label">Out of stock</div><div className="stat-value">1</div><div className="stat-delta down">Cat6 cable</div></div>
        <div className="stat"><div className="accent-bar"/><div className="stat-label">My consumption (May)</div><div className="stat-value">7</div><div className="stat-delta">items received</div></div>
      </div>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Inventory · pick items</div>
              <div className="card-sub">Stock counts are live. Out-of-stock items show expected restock.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn ghost tiny">{Icons.filter({ size: 12 })} Stationery</button>
              <button className="btn ghost tiny">{Icons.filter({ size: 12 })} IT</button>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th></th>
                <th>Item</th>
                <th>Category</th>
                <th className="tbl-numeric">Stock</th>
                <th>Status</th>
                <th className="tbl-numeric">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map(it => {
                const isPicked = picked.includes(it.sku);
                const stockPct = Math.min(100, (it.stock / it.max) * 100);
                const stockStatus = it.stock === 0 ? "danger" : it.stock <= it.reorder ? "warning" : "success";
                const stockClass  = it.stock === 0 ? "crit"   : it.stock <= it.reorder ? "low"     : "";
                return (
                  <tr key={it.sku} style={isPicked ? { background: "var(--primary-50)" } : null}>
                    <td>
                      <input type="checkbox" checked={isPicked} disabled={it.stock === 0} onChange={() => togglePick(it.sku, it.stock)} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{it.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)" }}>{it.sku}</div>
                    </td>
                    <td><span className="pill neutral">{it.cat}</span></td>
                    <td className="tbl-numeric">
                      <div style={{ fontWeight: 500 }}>{it.stock} <span style={{ color: "var(--ink-400)", fontSize: 11 }}>/ {it.max} {it.uom}</span></div>
                      <div className="stock-bar" style={{ marginLeft: "auto" }}><span className={stockClass} style={{ width: `${stockPct}%` }}/></div>
                    </td>
                    <td>
                      <span className={`pill ${stockStatus}`}><span className="dot" />
                        {it.stock === 0 ? "Out · ETA 14 May" : it.stock <= it.reorder ? "Low" : "In stock"}
                      </span>
                    </td>
                    <td className="tbl-numeric">
                      {isPicked ? (
                        <input className="input" type="number" min="1" max={it.stock}
                          value={qty[it.sku] || 1}
                          onChange={e => setQty({ ...qty, [it.sku]: Math.min(it.stock, +e.target.value) })}
                          style={{ width: 70, marginLeft: "auto" }} />
                      ) : <span style={{ color: "var(--ink-400)" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="card-body" style={{ borderTop: "1px solid var(--ink-100)" }}>
            <FormSection num="01" title="Request details">
              <div className="row cols-2">
                <div className="field">
                  <div className="field-label">Urgency level</div>
                  <select className="select" value={urgency} onChange={e => setUrg(e.target.value)}>
                    <option>Normal</option><option>Urgent</option>
                  </select>
                </div>
                <div className="field">
                  <div className="field-label">Delivery location</div>
                  <select className="select" value={delivery} onChange={e => setDel(e.target.value)}>
                    <option>Floor 4 · Desk 12</option>
                    <option>Floor 4 · NetOps Lab</option>
                    <option>Reception</option>
                  </select>
                </div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <div className="field">
                  <div className="field-label">Purpose / justification</div>
                  <textarea className="textarea" value={purpose} onChange={e => setPurp(e.target.value)} />
                  <div className="help">Required for high-quantity items.</div>
                </div>
              </div>
            </FormSection>
          </div>
        </div>

        <div className="preview-col">
          <A4Frame title="Logistics & Inventory Requisition" refCode="LOG"
            signers={[
              { label: "Requester",     name: ME.name,     designation: ME.designation, signed: true },
              { label: "Admin Officer", name: "—",         designation: "—", signed: false },
              { label: "AM/DM Admin",   name: "—",         designation: "—", signed: false },
            ]}>
            <div className="a4-section">
              <div className="a4-section-title">Requester</div>
              <div className="a4-grid">
                <A4Field label="Name" value={ME.name} />
                <A4Field label="Department" value={ME.department} />
                <A4Field label="Designation" value={ME.designation} />
                <A4Field label="Urgency" value={urgency} />
                <A4Field label="Delivery" value={delivery} span={2} />
              </div>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Items requested</div>
              <table className="a4-table">
                <thead><tr><th>SKU</th><th>Item</th><th>Cat</th><th style={{textAlign:"right"}}>Qty</th><th style={{textAlign:"right"}}>Unit (BDT)</th><th style={{textAlign:"right"}}>Subtotal</th></tr></thead>
                <tbody>
                  {lineItems.length === 0 && <tr><td colSpan="6" className="empty">— No items selected —</td></tr>}
                  {lineItems.map(it => (
                    <tr key={it.sku}>
                      <td style={{fontFamily: "var(--font-mono)"}}>{it.sku}</td>
                      <td>{it.name}</td>
                      <td>{it.cat}</td>
                      <td style={{textAlign:"right"}}>{it.qty} {it.uom}</td>
                      <td style={{textAlign:"right"}}>{it.cost}</td>
                      <td style={{textAlign:"right"}}>{it.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {lineItems.length > 0 && (
                    <tr className="a4-total-row"><td colSpan="5" style={{textAlign:"right"}}>Total</td><td style={{textAlign:"right"}}>BDT {total.toLocaleString()}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="a4-section">
              <div className="a4-section-title">Justification</div>
              <div style={{ fontSize: 10, lineHeight: 1.5 }}>{purpose}</div>
            </div>
          </A4Frame>
        </div>
      </div>
    </div>
  );
}

// === Helpers ===
function numToWords(n) {
  if (n === 0) return "Zero";
  const a = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const b = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  const inWords = (num) => {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num/10)] + (num%10 ? "-"+a[num%10] : "");
    if (num < 1000) return a[Math.floor(num/100)] + " hundred" + (num%100 ? " " + inWords(num%100) : "");
    if (num < 100000) return inWords(Math.floor(num/1000)) + " thousand" + (num%1000 ? " " + inWords(num%1000) : "");
    if (num < 10000000) return inWords(Math.floor(num/100000)) + " lakh" + (num%100000 ? " " + inWords(num%100000) : "");
    return inWords(Math.floor(num/10000000)) + " crore" + (num%10000000 ? " " + inWords(num%10000000) : "");
  };
  const w = inWords(n).trim();
  return w.charAt(0).toUpperCase() + w.slice(1);
}
function numToBangla(n) {
  // simplified: convert digits to Bangla numerals
  const map = "০১২৩৪৫৬৭৮৯";
  return n.toString().split("").map(d => /\d/.test(d) ? map[+d] : d).join("");
}

Object.assign(window, { FoodPage, LogisticsPage });
