/* Settle statement: one design, used in two places.
   1. Inside Settle: "Download statement" puts these pages on screen and opens the print sheet (Save as PDF).
   2. The Claude skill: tools/make_statement.py loads this same file and saves a PDF.
   renderStatement(db, startDate, endDate, opts) returns HTML (A4 pages, each one fixed size). */
(function(){
const NOTES = [1000, 500, 100, 50];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PER = 10;
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const rs = (n, sign = "") => { n = Math.round(n || 0); return (n < 0 ? "−" : sign) + "Rs " + Math.abs(n).toLocaleString("en-IN"); };
const D = at => new Date(at.slice(0, 16));
const dshort = x => x.getDate() + " " + MONTHS[x.getMonth()].slice(0, 3);
const ddate = x => dshort(x) + " " + x.getFullYear();
const dtime = x => x.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const noteText = n => NOTES.filter(k => n && n[k]).map(k => `${n[k]} × ${k.toLocaleString("en-IN")}`).join(", ");
const isIn = e => e.dir === "in";

function smooth(p){
  const n = p.length; if (n < 2) return "";
  if (n === 2) return `M${p[0][0]},${p[0][1]}L${p[1][0]},${p[1][1]}`;
  const dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++){ dx[i] = (p[i+1][0] - p[i][0]) || .001; m[i] = (p[i+1][1] - p[i][1]) / dx[i]; }
  t[0] = m[0]; t[n-1] = m[n-2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i-1] * m[i] <= 0 ? 0 : (m[i-1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++){ if (m[i] === 0){ t[i] = t[i+1] = 0; continue; }
    const a = t[i] / m[i], b = t[i+1] / m[i], s = a*a + b*b; if (s > 9){ const k = 3 / Math.sqrt(s); t[i] = k*a*m[i]; t[i+1] = k*b*m[i]; } }
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++){ const h = dx[i] / 3;
    d += `C${(p[i][0]+h).toFixed(1)},${(p[i][1]+t[i]*h).toFixed(1)} ${(p[i+1][0]-h).toFixed(1)},${(p[i+1][1]-t[i+1]*h).toFixed(1)} ${p[i+1][0].toFixed(1)},${p[i+1][1].toFixed(1)}`; }
  return d;
}

function renderStatement(db, start, end, opts = {}){
  const base = opts.base || "", bank = opts.bank || "Global IME Bank", now = opts.now || new Date();
  const s0 = new Date(start.getFullYear(), start.getMonth(), start.getDate()), e0 = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
  const live = (db.entries || []).filter(e => !e.del);
  const cks = Object.entries(db.balances || {}).filter(([, b]) => !b.del).map(([mk, b]) => ({ type: "check", at: /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(b.at || "") ? b.at : mk + "-13T09:00", ms: b.u || 0, amount: b.amount }));
  const first = cks.map(c => c.at).sort()[0];
  const evs = [...cks, ...live.filter(e => first && e.at >= first).map(e => ({ type: isIn(e) ? "in" : "out", e, at: e.at, ms: e.c || 0, amount: e.amount }))]
    .sort((a, b) => a.at < b.at ? -1 : a.at > b.at ? 1 : a.ms - b.ms);
  let bal = null;
  evs.forEach(ev => { if (ev.type === "check"){ ev.diff = bal === null ? null : ev.amount - bal; bal = ev.amount; } else if (bal !== null) bal += ev.type === "in" ? ev.amount : -ev.amount; ev.bal = bal; });
  const before = evs.filter(ev => D(ev.at) < s0), opening = before.length ? before[before.length - 1].bal : null;
  const rows = evs.filter(ev => D(ev.at) >= s0 && D(ev.at) <= e0);
  const seen = new Set(rows.map(r => r.e && r.e.id));
  live.filter(e => D(e.at) >= s0 && D(e.at) <= e0 && !seen.has(e.id)).forEach(e => rows.push({ type: isIn(e) ? "in" : "out", e, at: e.at, ms: e.c || 0, amount: e.amount, bal: null }));
  rows.sort((a, b) => a.at < b.at ? -1 : a.at > b.at ? 1 : a.ms - b.ms);
  const outs = rows.filter(r => r.type === "out").map(r => r.e), ins = rows.filter(r => r.type === "in").map(r => r.e);
  const tOut = outs.reduce((s, e) => s + e.amount, 0), tIn = ins.reduce((s, e) => s + e.amount, 0);
  const withBal = rows.filter(r => r.bal !== null), closing = withBal.length ? withBal[withBal.length - 1].bal : opening;
  const paidIn = live.filter(e => !isIn(e) && e.paid && e.paidAt && D(e.paidAt) >= s0 && D(e.paidAt) <= e0).sort((a, b) => a.paidAt < b.paidAt ? -1 : 1);
  const owedEnd = live.filter(e => !isIn(e) && D(e.at) <= e0 && (!e.paid || !e.paidAt || D(e.paidAt) > e0)).sort((a, b) => a.at < b.at ? -1 : 1);
  const owedTotal = owedEnd.reduce((s, e) => s + e.amount, 0), paidTotal = paidIn.reduce((s, e) => s + e.amount, 0);
  const cashBack = outs.filter(e => e.back === "cash").reduce((s, e) => s + NOTES.reduce((t, n) => t + n * ((e.notes || {})[n] || 0), 0), 0);
  const ownMoney = rows.filter(r => r.type === "check" && r.diff).reduce((s, r) => s + r.diff, 0);
  const period = `${ddate(s0)} to ${ddate(e0)}`;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  /* ---- balance line: one point per day ---- */
  let chart = "";
  { const daily = {}; rows.forEach(r => { if (r.bal !== null) daily[D(r.at).toDateString()] = r.bal; });
    const pts = []; let cur = opening;
    for (let k = new Date(s0); k <= e0; k.setDate(k.getDate() + 1)){ if (daily[k.toDateString()] !== undefined) cur = daily[k.toDateString()]; if (cur !== null) pts.push([new Date(k), cur]); }
    if (pts.length >= 2){
      const W = 700, H = 260, top = 14, bot = 26, vs = pts.map(p => p[1]);
      let lo = Math.min(...vs), hi = Math.max(...vs); const span = (hi - lo) || hi * .05 || 1; lo -= span * .2; hi += span * .15;
      const T0 = +pts[0][0], T1 = +pts[pts.length - 1][0] || T0 + 1;
      const X = t => 8 + (t - T0) / ((T1 - T0) || 1) * (W - 16);
      const xy = pts.map(([t, v]) => [X(+t), top + (1 - (v - lo) / (hi - lo)) * (H - top - bot)]);
      const line = smooth(xy), last = xy[xy.length - 1];
      const step = Math.max(1, Math.floor(pts.length / 6)); let ticks = "";
      for (let i = 0; i < pts.length; i += step) ticks += `<text x="${xy[i][0].toFixed(1)}" y="${H - 6}" text-anchor="${i === 0 ? "start" : "middle"}">${dshort(pts[i][0])}</text>`;
      chart = `<svg viewBox="0 0 ${W} ${H}" class="s-chart"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#111" stop-opacity=".10"/><stop offset="1" stop-color="#111" stop-opacity="0"/></linearGradient></defs>
        <line x1="0" x2="${W}" y1="${H - bot}" y2="${H - bot}" stroke="#ddd" stroke-width=".8"/>
        <path d="${line} L${last[0].toFixed(1)},${H - bot} L${xy[0][0].toFixed(1)},${H - bot} Z" fill="url(#sg)"/>
        <path d="${line}" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.2" fill="#111"/>${ticks}</svg>`;
    } }
  const tally = es => { const t = {}; es.forEach(e => t[e.payee] = (t[e.payee] || 0) + e.amount); return Object.entries(t).sort((a, b) => b[1] - a[1]); };
  const bars = (items, total) => items.length ? items.slice(0, 7).map(([k, v]) => `<div class="s-bar"><span>${esc(k)}</span><span class="s-bt"><i style="width:${Math.max(2, v / (total || 1) * 100).toFixed(1)}%"></i></span><span class="s-bv">${rs(v)}</span></div>`).join("") : `<p class="s-big">Nothing in this period.</p>`;

  /* ---- transactions ---- */
  const when = x => `<b>${dshort(x)}</b><span>${dtime(x)}</span>`;
  const txRow = r => {
    const x = D(r.at), bal = r.bal !== null ? rs(r.bal) : `<span class="s-muted">n/a</span>`;
    if (r.type === "check") return `<tr class="s-ck"><td class="s-w">${when(x)}</td><td><b>Balance check-in</b><span>Real figure read from the account</span><span>${r.diff ? "Mom's own money since the last check-in: " + rs(r.diff, "+") : "Starting figure"}</span></td><td class="s-st"></td><td class="s-n"></td><td class="s-n"></td><td class="s-n s-b">${rs(r.bal)}</td></tr>`;
    const e = r.e, note = e.note ? `<span>${esc(e.note)}</span>` : "";
    if (r.type === "in") return `<tr><td class="s-w">${when(x)}</td><td><b>From ${esc(e.payee)}</b>${note || "<span>Money in</span>"}</td><td class="s-st"><em class="s-tag s-in">Money in</em></td><td class="s-n"></td><td class="s-n">${rs(e.amount, "+")}</td><td class="s-n s-b">${bal}</td></tr>`;
    const back = e.back === "cash" ? "Cash back" + (noteText(e.notes) ? " · " + noteText(e.notes) : "") : e.back === "online" ? "Sent back online" : "Nothing came back";
    const st = e.paid && e.paidAt ? `<em class="s-tag s-ok">Paid back</em><span>${dshort(D(e.paidAt))}, ${e.payback === "transfer" ? "Nabil Bank" : "cash"}</span>`
                                  : `<em class="s-tag">Owed</em><span>${e.payback === "transfer" ? "to Nabil Bank" : "in cash"}</span>`;
    return `<tr><td class="s-w">${when(x)}</td><td><b>To ${esc(e.payee)}</b><span>${back}</span>${note}</td><td class="s-st">${st}</td><td class="s-n">${rs(-e.amount)}</td><td class="s-n"></td><td class="s-n s-b">${bal}</td></tr>`;
  };
  const all = [];
  if (opening !== null) all.push(`<tr class="s-ck"><td class="s-w"><b>${dshort(s0)}</b></td><td><b>Opening balance</b><span>Carried over from before this period</span></td><td class="s-st"></td><td class="s-n"></td><td class="s-n"></td><td class="s-n s-b">${rs(opening)}</td></tr>`);
  rows.forEach(r => all.push(txRow(r)));
  all.push(`<tr class="s-ck"><td class="s-w"><b>${dshort(e0)}</b></td><td><b>Closing balance</b><span>End of this period</span></td><td class="s-st"></td><td class="s-n s-b">${rs(-tOut)}</td><td class="s-n s-b">${rs(tIn, "+")}</td><td class="s-n s-b">${closing !== null ? rs(closing) : "n/a"}</td></tr>`);
  const chunk = (a, n) => { const out = []; for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out; };
  const txHead = `<thead><tr><th>Date</th><th>Details</th><th>Status</th><th class="s-n">Out</th><th class="s-n">In</th><th class="s-n">Balance</th></tr></thead>`;

  /* ---- paying Mom back ---- */
  const noteSpan = e => e.note ? `<span>${esc(e.note)}</span>` : "";
  const paidRow = e => { const x = D(e.paidAt), o = D(e.at);
    return `<tr><td class="s-w">${when(x)}</td><td><b>For ${esc(e.payee)}</b><span>Paid on ${dshort(o)}, ${dtime(o)}</span>${noteSpan(e)}</td><td>${e.payback === "transfer" ? "To her Nabil Bank account" : "Cash, handed to her"}</td><td class="s-n s-b">${rs(e.amount)}</td></tr>`; };
  const owedRow = e => { const o = D(e.at), days = Math.max(0, Math.round((new Date(e0.getFullYear(), e0.getMonth(), e0.getDate()) - new Date(o.getFullYear(), o.getMonth(), o.getDate())) / 864e5));
    return `<tr><td class="s-w">${when(o)}</td><td><b>${esc(e.payee)}</b>${noteSpan(e)}<span>Owed for ${plural(days, "day")}</span></td><td>${e.payback === "transfer" ? "Nabil Bank" : "Cash"}</td><td class="s-n s-b">${rs(e.amount)}</td></tr>`; };
  const byTr = paidIn.filter(e => e.payback === "transfer").reduce((s, e) => s + e.amount, 0), byCa = paidTotal - byTr;
  const pHead = `<thead><tr><th>Paid back on</th><th>What it was for</th><th>How</th><th class="s-n">Amount</th></tr></thead>`;
  const oHead = `<thead><tr><th>Paid on</th><th>Paid to</th><th>How Mom gets it</th><th class="s-n">Amount</th></tr></thead>`;

  /* ---- pages ---- */
  const pages = [];
  pages.push(`<div class="s-top"><div class="s-logo">Settle.</div><div class="s-doc"><h1>Account statement</h1><p>${period}</p></div></div>
    <div class="s-meta"><div><span>Account</span><b>${esc(bank)}</b></div><div><span>Currency</span><b>Nepalese rupees</b></div><div><span>Made on</span><b>${ddate(now)}, ${dtime(now)}</b></div></div>
    ${opts.sample ? `<div class="s-sample">Sample statement filled with made-up numbers, to preview the design.</div>` : ""}
    <div class="s-sec"><h2>Summary</h2>
      <div class="s-cards">
        <div class="s-card"><span>Opening balance</span><b>${opening !== null ? rs(opening) : "n/a"}</b><small>on ${ddate(s0)}</small></div>
        <div class="s-card s-dark"><span>Closing balance</span><b>${closing !== null ? rs(closing) : "n/a"}</b><small>on ${ddate(e0)}</small></div>
        <div class="s-card"><span>Money in</span><b>${rs(tIn, "+")}</b><small>${plural(ins.length, "deposit")}</small></div>
        <div class="s-card"><span>Money out</span><b>${rs(-tOut)}</b><small>${plural(outs.length, "payment")}</small></div>
      </div>
      <div class="s-cards s-small">
        <div class="s-card"><span>Paid back to Mom</span><b>${rs(paidTotal)}</b></div>
        <div class="s-card"><span>Still owed to Mom</span><b>${rs(owedTotal)}</b></div>
        <div class="s-card"><span>Cash handed to you</span><b>${rs(cashBack)}</b><small>paid by QR, got cash</small></div>
      </div>
      ${opening === null && closing === null ? `<p class="s-big" style="margin-top:22px">No balance check-in yet, so balances show n/a. Log Mom's balance in Settle once and they fill in.</p>` : ""}
    </div>`);
  pages.push(`${chart ? `<div class="s-ph"><h2>Balance through the period</h2><span>closed at ${rs(closing)}</span></div>${chart}` : `<div class="s-ph"><h2>Balance</h2></div><p class="s-big">Log a balance check-in to see the line.</p>`}
    <div class="s-sec"><h2>Where the money went</h2>${bars(tally(outs), tOut)}</div>
    <div class="s-sec"><h2>Where the money came from</h2>${bars(tally(ins), tIn)}</div>`);
  const txChunks = chunk(all, PER);
  txChunks.forEach((c, i) => pages.push(`<div class="s-ph"><h2>Transactions</h2><span>${i + 1} of ${txChunks.length}</span></div><table class="s-tx">${txHead}<tbody>${c.join("")}</tbody></table>`));
  const pr = paidIn.map(paidRow);
  pages.push(`<div class="s-ph"><h2>Paying Mom back</h2></div>
    <div class="s-cards s-three">
      <div class="s-card"><span>Paid back this period</span><b>${rs(paidTotal)}</b><small>${plural(paidIn.length, "payment")}</small></div>
      <div class="s-card"><span>To Nabil Bank</span><b>${rs(byTr)}</b><small>bank transfer</small></div>
      <div class="s-card"><span>In cash</span><b>${rs(byCa)}</b><small>handed to her</small></div>
    </div>
    <div class="s-owedbar"><span>Still owed to Mom on ${ddate(e0)}</span><b>${rs(owedTotal)}</b></div>
    <h3>Money you gave back to Mom</h3>
    ${pr.length ? `<table class="s-tx">${pHead}<tbody>${pr.slice(0, 6).join("")}</tbody></table>` : `<p class="s-big">Nothing paid back in this period.</p>`}`);
  chunk(pr.slice(6), PER).forEach(c => pages.push(`<div class="s-ph"><h2>Paying Mom back</h2><span>continued</span></div><table class="s-tx">${pHead}<tbody>${c.join("")}</tbody></table>`));
  const oc = chunk(owedEnd.map(owedRow), PER);
  oc.forEach((c, i) => pages.push(`<div class="s-ph"><h2>Still owed to Mom</h2><span>${rs(owedTotal)} in total</span></div><table class="s-tx">${oHead}<tbody>${c.join("")}${i === oc.length - 1 ? `<tr class="s-ck"><td></td><td><b>Total still owed</b></td><td></td><td class="s-n s-b">${rs(owedTotal)}</td></tr>` : ""}</tbody></table>`));
  if (!oc.length) pages.push(`<div class="s-ph"><h2>Still owed to Mom</h2></div><p class="s-big">Nothing. Every payment up to this date has been paid back.</p>`);
  pages[pages.length - 1] += `<div class="s-foot">This is a personal record kept in the Settle app. It is not a bank statement. Balances start from the figure read from the account on each check-in, then every payment and deposit logged in Settle is added or taken off. Mom's own spending that isn't logged shows up at the next check-in${ownMoney ? `, which this period came to ${rs(ownMoney, "+")}` : ""}.</div><div class="s-end">Settle.</div>`;

  const css = STYLE.replace(/@@BASE@@/g, base);
  return `<style>${css}</style>` + pages.map((p, i) => `<section class="s-page">${p}<div class="s-pf"><span>Settle. · Account statement · ${period}</span><span>Page ${i + 1} of ${pages.length}</span></div></section>`).join("");
}

const STYLE = `
@font-face{font-family:SettleSerif;src:url(@@BASE@@fonts/instrument-serif.woff2) format("woff2")}
@font-face{font-family:SInter;font-weight:400;src:url(@@BASE@@fonts/sans-400.woff2) format("woff2")}
@font-face{font-family:SInter;font-weight:500;src:url(@@BASE@@fonts/sans-500.woff2) format("woff2")}
@font-face{font-family:SInter;font-weight:600;src:url(@@BASE@@fonts/sans-600.woff2) format("woff2")}
@page{size:A4;margin:0}
#stmt,#stmt *{box-sizing:border-box;margin:0;padding:0}
#stmt{font:10pt/1.5 SInter,-apple-system,sans-serif;color:#111;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-user-select:text;user-select:text}
#stmt .s-page{position:relative;width:210mm;height:296.5mm;padding:20mm 18mm 24mm;overflow:hidden;background:#fff;page-break-after:always;break-after:page}
#stmt .s-page:last-child{page-break-after:auto;break-after:auto}
#stmt .s-pf{position:absolute;left:18mm;right:18mm;bottom:11mm;display:flex;justify-content:space-between;font-size:7pt;color:#999}
#stmt td.s-n,#stmt .s-bv,#stmt .s-card b,#stmt .s-owedbar b{font-variant-numeric:tabular-nums}
#stmt .s-top{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:22px;border-bottom:1.5px solid #111}
#stmt .s-logo{font:400 48pt/1 SettleSerif,Georgia,serif;letter-spacing:.3px}
#stmt .s-doc{text-align:right}
#stmt h1{font:400 22pt/1.1 SettleSerif,Georgia,serif}
#stmt .s-doc p{color:#666;margin-top:6px}
#stmt .s-meta{display:grid;grid-template-columns:2fr 1fr 1fr;margin-top:22px;padding-bottom:22px;border-bottom:.6px solid #ddd}
#stmt .s-meta span{display:block;font-size:7.6pt;color:#888;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px}
#stmt .s-meta b{font-weight:500;font-size:10.5pt}
#stmt .s-sample{margin-top:18px;padding:9px 14px;border:.8px dashed #aaa;border-radius:8px;color:#666;font-size:8.5pt}
#stmt h2{font:400 20pt/1.2 SettleSerif,Georgia,serif}
#stmt h3{font:400 14pt SettleSerif,Georgia,serif;margin:34px 0 12px}
#stmt .s-ph{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px}
#stmt .s-ph span{color:#888;font-size:9pt}
#stmt .s-sec{margin-top:46px}
#stmt .s-sec h2{margin-bottom:18px}
#stmt .s-cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}
#stmt .s-cards.s-three,#stmt .s-cards.s-small{grid-template-columns:repeat(3,1fr)}
#stmt .s-cards.s-small{margin-top:14px}
#stmt .s-card{border:.6px solid #d6d6d6;border-radius:12px;padding:18px 20px}
#stmt .s-card span{display:block;font-size:8.4pt;color:#666}
#stmt .s-card b{display:block;font:400 24pt/1.2 SettleSerif,Georgia,serif;margin-top:6px}
#stmt .s-three .s-card b{font-size:19pt}
#stmt .s-small .s-card b{font:500 13pt/1.3 SInter,sans-serif}
#stmt .s-card small{display:block;color:#888;font-size:8pt;margin-top:4px}
#stmt .s-card.s-dark{background:#111;color:#fff;border-color:#111}
#stmt .s-card.s-dark span,#stmt .s-card.s-dark small{color:#aaa}
#stmt .s-owedbar{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:18px 22px;border-radius:12px;background:#111;color:#fff}
#stmt .s-owedbar span{color:#bbb;font-size:9pt}
#stmt .s-owedbar b{font:400 24pt/1 SettleSerif,Georgia,serif}
#stmt .s-chart{display:block;width:100%;height:auto}
#stmt .s-chart text{font:7.5pt SInter,sans-serif;fill:#999}
#stmt .s-bar{display:grid;grid-template-columns:110px 1fr 100px;align-items:center;gap:14px;margin:12px 0}
#stmt .s-bt{display:block;height:7px;background:#f0f0f0;border-radius:4px;overflow:hidden}
#stmt .s-bt i{display:block;height:100%;background:#111;border-radius:4px}
#stmt .s-bv{text-align:right;font-weight:500}
#stmt table{width:100%;border-collapse:collapse}
#stmt th{font-size:7.4pt;font-weight:600;color:#777;text-transform:uppercase;letter-spacing:.7px;text-align:left;padding:0 8px 10px;border-bottom:1.2px solid #111}
#stmt th.s-n,#stmt td.s-n{text-align:right;white-space:nowrap}
#stmt .s-tx td{padding:13px 8px 14px;border-bottom:.5px solid #e4e4e4;vertical-align:top}
#stmt td b{font-weight:500;display:block;font-size:10.5pt}
#stmt td span{display:block;color:#777;font-size:8.6pt;margin-top:2px}
#stmt td.s-w{white-space:nowrap;width:66px}
#stmt td.s-st{width:112px;white-space:nowrap}
#stmt td.s-b{font-weight:600}
#stmt tr.s-ck td{background:#f6f6f4}
#stmt .s-tag{display:inline-block;font-style:normal;font-size:7.6pt;font-weight:600;padding:2px 9px;border-radius:10px;border:.7px solid #bbb;color:#444;margin-bottom:2px}
#stmt .s-tag.s-ok{background:#111;color:#fff;border-color:#111}
#stmt .s-tag.s-in{border-color:#111;color:#111}
#stmt .s-muted{color:#999}
#stmt .s-big{font-size:11pt;color:#555}
#stmt .s-foot{margin-top:40px;padding-top:14px;border-top:.6px solid #ddd;color:#888;font-size:8pt;line-height:1.6}
#stmt .s-end{text-align:center;font:400 16pt SettleSerif,Georgia,serif;margin-top:22px;color:#aaa}
`;
(typeof window !== "undefined" ? window : globalThis).renderStatement = renderStatement;
})();
