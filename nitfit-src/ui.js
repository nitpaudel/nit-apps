// ---------------------------------------------------------------------------
// The whole interface.
//
// Three screens and nothing else. Open it, log your sets, see if the numbers
// are going up. Anything that is not one of those three things does not
// belong in here.
//
// Speed rule: tapping a set never rebuilds the screen. It changes that one
// row and nothing more. Full redraws only happen when the screen changes.
// ---------------------------------------------------------------------------

const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

let TAB = "today";
let LOG = null;                 // the exercise open on the logging screen
const UI = {};
const ACT = {};
const DRAFT = {};               // what is typed but not ticked yet

const numIn = v => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
const dayLabel = n => { const t = new Date(n * 864e5); return t.getUTCDate() + " " + MONTHS[t.getUTCMonth()]; };

const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CHEV = '<svg viewBox="0 0 8 13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5L6.5 6.5L1.5 11.5"/></svg>';
const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5L8 12l6.5 7"/></svg>';

// ----- small things -----

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2000);
}
let hapticEl = null;
function haptic() {
  try {
    if (navigator.vibrate) return navigator.vibrate(8);
    if (!hapticEl) {
      hapticEl = document.createElement("input");
      hapticEl.type = "checkbox"; hapticEl.setAttribute("switch", "");
      hapticEl.style.cssText = "position:absolute;opacity:0;pointer-events:none";
      document.body.appendChild(hapticEl);
    }
    hapticEl.checked = !hapticEl.checked;
  } catch (_) {}
}
function openSheet(html) { $("#sheet .in").innerHTML = html; $("#sheet").classList.add("on"); $("#sheet .pn").scrollTop = 0; }
function closeSheet() { $("#sheet").classList.remove("on"); }
ACT.closeSheet = closeSheet;

function applyTheme() {
  const want = (S && S.settings.theme) || "light";
  const dark = want === "dark" || (want === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const m = $('meta[name="theme-color"]'); if (m) m.content = dark ? "#000000" : "#F2F2F5";
}
ACT.theme = el => { addEvent("settings.upserted", { theme: el.dataset.v }); applyTheme(); render(); };

// ----- reading the day -----

const dayKeyFor = d => S.dayMap[dow(d)];
const ctxNow = () => ({ flags: 0, deload: weekInfo(today()).easy, gap: 0 });

// Target for one exercise today, worked out once and kept.
const TGT = {};
function targetFor(exId, sets) {
  const ex = getEx(exId);
  if (!TGT[exId]) TGT[exId] = coachTarget(ex, histFor(exId, (activeSession() || {}).id), Object.assign({ sets }, ctxNow()));
  return TGT[exId];
}
function tgtTxt(t, ex) {
  if (t.kg == null) return t.sets + " sets, find your " + (ex.eq === "bw" ? "level" : "weight");
  const r = t.reps, same = r.every(x => x === r[0]);
  return t.sets + " x " + (t.kg ? kgTxt(t.kg) + " kg x " : "") + (same ? r[0] : r.join(", ")) + unit(ex);
}
function todayItems() {
  const s = activeSession();
  return s ? s.items : (S.plan[dayKeyFor(today())] || []);
}
function doneCount(exId) {
  const s = activeSession();
  return s ? sessionSets(s.id).filter(x => x.exId === exId).length : 0;
}

// ----- screen: Today -----

function vToday() {
  const d = today(), dt = new Date(), dk = dayKeyFor(d);
  const items = todayItems(), sess = activeSession();
  const finished = sessionsSorted().filter(x => x.d === d && x.endTs);
  const w = S.weights[d], tr = trendSeries(weightList());
  const trend = tr.length ? tr[tr.length - 1].trend : null;

  let h = '<div class="top"><div><div class="eyebrow">' + WEEKDAYS[dt.getDay()] + ", " + dt.getDate() + " " + MONTHS[dt.getMonth()]
    + '</div><h1>' + esc(DAY_NAMES[dk] || "Today") + "</h1></div>"
    + '<button class="gear" data-a="tab" data-tab="more" aria-label="Settings">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h8M17 7h3M4 12h3M12 12h8M4 17h11M20 17h0"/><circle cx="14.5" cy="7" r="2.1"/><circle cx="9.5" cy="12" r="2.1"/><circle cx="17.5" cy="17" r="2.1"/></svg></button></div>';

  if (storageBroken) h += '<div class="banner">' + esc(storageBroken) + "</div>";
  else if (!KV.token) h += '<div class="banner">Not backed up yet. <button data-a="keySetup">Set it up</button></div>';

  // weight, one line
  h += '<div class="card wrow"><div class="grow"><div class="t">Weight today</div>'
    + '<div class="s">' + (trend ? "Trend " + trend.toFixed(1) + " kg" : "Before food, before clothes") + "</div></div>"
    + (w ? '<button class="big num" data-a="editWeight">' + w.kg.toFixed(1) + '<span class="u"> kg</span></button>'
        : '<input class="inp num wk" id="wIn" inputmode="decimal" placeholder="kg" enterkeyhint="done">') + "</div>";

  if (finished.length && !sess) {
    const n = sessionSets(finished[0].id).length;
    h += '<div class="card done"><div class="grow"><div class="t">Done today</div><div class="s">'
      + n + " sets logged</div></div>" + TICK.replace("<svg", '<svg class="dtick"') + "</div>";
  }

  if (!items.length) {
    h += '<div class="card empty"><p>Nothing set for today.</p>'
      + '<button class="btn ghost sm" data-a="pickDay">Train another day</button></div>';
    return h;
  }

  h += '<h2>' + (sess ? "In progress" : "Today") + "</h2>";
  h += '<div class="card flush">' + items.map(it => {
    const ex = getEx(it.ex); if (!ex) return "";
    const t = targetFor(it.ex, it.sets), done = doneCount(it.ex), all = done >= t.sets;
    return '<button class="row' + (all ? " ok" : "") + '" data-a="open" data-ex="' + it.ex + '">'
      + '<div class="grow"><div class="t">' + esc(ex.n) + '</div>'
      + '<div class="s num">' + esc(tgtTxt(t, ex).replace(/, find your.*/, "")) + "</div></div>"
      + (done ? '<div class="cnt num' + (all ? " ok" : "") + '">' + done + "/" + t.sets + "</div>" : "")
      + '<span class="chev">' + CHEV + "</span></button>";
  }).join("") + "</div>";

  if (sess) h += '<button class="btn" data-a="finish" style="margin-top:14px">Finish workout</button>';
  else h += '<button class="btn ghost sm" data-a="pickDay" style="margin-top:14px">Train another day</button>';
  return h;
}

ACT.pickDay = () => openSheet("<h3>Train another day</h3><p>A day you miss is skipped, not moved.</p>"
  + '<div class="card flush">' + DAY_ORDER.map(k =>
    '<button class="row" data-a="setDay" data-day="' + k + '"><div class="grow"><div class="t">' + esc(DAY_NAMES[k])
    + '</div><div class="s">' + (S.plan[k] || []).length + ' exercises</div></div><span class="chev">' + CHEV + "</span></button>").join("")
  + "</div>");
ACT.setDay = el => {
  const k = el.dataset.day, s = activeSession();
  if (s) addEvent("session.edited", { sessionId: s.id, items: clone(S.plan[k] || []) });
  else { UI.forceDay = k; }
  closeSheet(); render();
};

ACT.editWeight = () => openSheet('<h3>Weight today</h3><div class="field">'
  + '<input class="inp num" id="wIn2" inputmode="decimal" value="' + (S.weights[today()] || {}).kg + '">'
  + '<button class="btn" style="width:auto;padding:0 20px" data-a="saveWeight2">Save</button></div>');
ACT.saveWeight2 = () => {
  const v = numIn($("#wIn2").value);
  if (!(v > 25 && v < 250)) return toast("Type your weight in kg.");
  addEvent("weight.logged", { kg: v }); closeSheet(); render();
};

// ----- screen: logging one exercise -----

function ensureSession() {
  let s = activeSession();
  if (s) return s;
  const d = today(), dk = UI.forceDay || dayKeyFor(d);
  if (!S.settings.blockStart) addEvent("settings.upserted", { blockStart: d });
  addEvent("session.started", { dayKey: dk, items: clone(S.plan[dk] || []), flags: 0, deload: weekInfo(d).easy, gap: 0 });
  UI.forceDay = null;
  return activeSession();
}

ACT.open = el => { LOG = el.dataset.ex; ensureAudio(); render(); window.scrollTo(0, 0); };
ACT.closeLog = () => { LOG = null; render(); window.scrollTo(0, 0); };

function vLog() {
  const ex = getEx(LOG); if (!ex) { LOG = null; return vToday(); }
  const it = todayItems().find(x => x.ex === LOG) || { ex: LOG, sets: 3 };
  const t = targetFor(LOG, it.sets);
  const sess = activeSession();
  const logged = sess ? sessionSets(sess.id).filter(x => x.exId === LOG) : [];
  const hist = histFor(LOG, (sess || {}).id);
  const last = hist.length ? hist[hist.length - 1] : null;
  const rows = Math.max(t.sets, logged.length ? Math.max(...logged.map(s => s.idx)) + 1 : 0, 1) + (UI.extra || 0);

  let h = '<div class="loghead"><button class="back" data-a="closeLog">' + BACK + "</button>"
    + '<div class="grow"><div class="ln">' + esc(ex.n) + '</div><div class="lt num">' + esc(tgtTxt(t, ex)) + "</div></div></div>";

  h += '<div class="card why"><p>' + esc(t.reason) + "</p>"
    + (ex.cue ? '<p class="cue">' + esc(ex.cue) + "</p>" : "") + "</div>";

  h += '<h2>Sets</h2><div class="card flush setlist">';
  for (let i = 0; i < rows; i++) h += setRow(ex, t, logged, i, last);
  h += "</div>";

  h += '<div class="btns" style="margin-top:14px">'
    + '<button class="btn ghost sm" data-a="addRow">Add a set</button>'
    + '<button class="btn sm" data-a="closeLog">Done</button></div>';
  return h;
}

function setRow(ex, t, logged, i, last) {
  const lg = logged.find(s => s.idx === i), dr = DRAFT[LOG + "|" + i] || {};
  const prevLogged = logged.slice().sort((a, b) => b.idx - a.idx)[0];
  const pv = last && last.sets[Math.min(i, last.sets.length - 1)];
  const kgV = lg ? lg.kg : dr.kg != null ? dr.kg : prevLogged ? prevLogged.kg : t.kg != null ? t.kg : "";
  const tr = t.reps[Math.min(i, t.reps.length - 1)];
  const rV = lg ? lg.reps : dr.reps != null ? dr.reps : tr != null ? tr : "";
  return '<div class="sr' + (lg ? " ok" : "") + '" data-row="' + i + '">'
    + '<div class="i num">' + (i + 1) + "</div>"
    + '<div class="prev num">' + (pv ? (pv.kg ? kgTxt(pv.kg) + " x " : "") + pv.reps + unit(ex) : "") + "</div>"
    + '<input class="num" inputmode="decimal" data-f="kg" data-i="' + i + '" value="' + (kgV === "" ? "" : kgTxt(kgV)) + '" placeholder="' + (ex.eq === "bw" ? "0" : "kg") + '"' + (lg ? " readonly" : "") + ">"
    + '<input class="num" inputmode="numeric" data-f="reps" data-i="' + i + '" value="' + rV + '" placeholder="' + (ex.t ? "sec" : "reps") + '"' + (lg ? " readonly" : "") + ">"
    + '<button class="tick" data-a="tick" data-i="' + i + '">' + TICK + "</button></div>";
}

ACT.addRow = () => { UI.extra = (UI.extra || 0) + 1; render(); };

// The fast path. One row changes, the screen does not.
ACT.tick = el => {
  const i = +el.dataset.i, box = el.closest(".sr"), ex = getEx(LOG);
  const sess0 = activeSession();
  const lg = sess0 && sessionSets(sess0.id).find(s => s.exId === LOG && s.idx === i);

  if (lg) {                                    // untick
    addEvent("entity.deleted", { ref: lg.id });
    DRAFT[LOG + "|" + i] = { kg: lg.kg, reps: lg.reps };
    box.classList.remove("ok");
    $$("input", box).forEach(inp => inp.removeAttribute("readonly"));
    paintCount(); haptic();
    return;
  }

  const kg = numIn($('[data-f="kg"]', box).value) || 0;
  const reps = Math.round(numIn($('[data-f="reps"]', box).value) || 0);
  if (!(reps > 0)) return toast(ex.t ? "Type the seconds." : "Type your reps.");
  if (ex.eq !== "bw" && !(kg > 0)) return toast("Type the weight.");

  const sess = ensureSession();
  const it = todayItems().find(x => x.ex === LOG) || { sets: 3 };
  const t = targetFor(LOG, it.sets);
  addEvent("set.logged", { sessionId: sess.id, exId: LOG, idx: i, kg, reps, tKg: t.kg, tReps: t.reps[Math.min(i, t.reps.length - 1)] });
  delete DRAFT[LOG + "|" + i];

  box.classList.add("ok");
  $$("input", box).forEach(inp => inp.setAttribute("readonly", ""));
  paintCount(); haptic();

  const n = sessionSets(sess.id).filter(s => s.exId === LOG).length;
  if (n < t.sets) startRest(ex.rest);
  else { stopRest(); setTimeout(() => { if (LOG) ACT.closeLog(); }, 450); }
};

// keeps the little "2/4" in step without a redraw
function paintCount() {
  const el = $("#logcount"); if (!el || !LOG) return;
  const s = activeSession();
  el.textContent = (s ? sessionSets(s.id).filter(x => x.exId === LOG).length : 0) + " logged";
}

document.addEventListener("input", e => {
  const el = e.target;
  if (el.dataset && el.dataset.f && LOG) {
    const k = LOG + "|" + el.dataset.i;
    (DRAFT[k] = DRAFT[k] || {})[el.dataset.f] = el.value === "" ? null : numIn(el.value);
  }
});
document.addEventListener("focusin", e => {
  if (e.target.matches && e.target.matches(".sr input:not([readonly])")) setTimeout(() => { try { e.target.select(); } catch (_) {} }, 0);
});

ACT.finish = () => {
  const s = activeSession(); if (!s) return;
  const n = sessionSets(s.id).length;
  if (!n) { addEvent("entity.deleted", { ref: s.id }); stopRest(); return render(); }
  addEvent("session.finished", { sessionId: s.id });
  stopRest();
  for (const k in TGT) delete TGT[k];
  UI.extra = 0;
  haptic(); render(); syncNow();
  toast(n + " sets logged. Go and eat.");
};

// ----- screen: Progress -----

const scoreOf = h => Math.max(...h.sets.map(s => e1rm(s.kg, s.reps)));
const bestSet = h => h.sets.reduce((a, s) => e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a, h.sets[0]);

function vProgress() {
  let h = '<div class="top"><div><div class="eyebrow">Are the numbers going up</div><h1>Progress</h1></div></div>';
  const tr = trendSeries(weightList());

  if (tr.length > 1) {
    const now = tr[tr.length - 1];
    const t7 = tr.filter(x => dayNum(x.d) <= dayNum(now.d) - 7).pop();
    const wk = t7 ? (now.trend - t7.trend) / ((dayNum(now.d) - dayNum(t7.d)) / 7) : null;
    h += '<div class="card"><div class="top" style="margin-bottom:4px">'
      + '<div><div class="eyebrow">Bodyweight</div><div class="display num">' + now.trend.toFixed(1) + '<span class="u"> kg</span></div></div>'
      + '<div style="text-align:right"><div class="eyebrow">Per week</div><div class="num perwk">'
      + (wk == null ? "..." : (wk >= 0 ? "+" : "") + wk.toFixed(2)) + "</div></div></div>"
      + (wk == null ? "" : '<p class="tiny">' + esc(paceLine(wk)) + "</p>")
      + chart([{ pts: tr.map(x => [dayNum(x.d), x.kg]), color: "var(--t3)", dotsOnly: true, r: 2 },
               { pts: tr.map(x => [dayNum(x.d), x.trend]), color: "var(--t0)", w: 2.6 }], { xf: dayLabel, h: 175 })
      + "</div>";
  } else {
    h += '<div class="card empty"><p>Weigh in every morning. After a week this shows whether you are actually gaining.</p></div>';
  }

  const list = Object.keys(S.byEx).map(id => ({ ex: getEx(id), hist: histFor(id) }))
    .filter(x => x.ex && x.hist.length)
    .sort((a, b) => a.hist[a.hist.length - 1].d < b.hist[b.hist.length - 1].d ? 1 : -1);

  if (!list.length) return h + '<h2>Lifts</h2><div class="card empty"><p>Log a workout and every exercise gets a graph here.</p></div>';

  h += "<h2>Lifts</h2>" + '<div class="card flush">' + list.map(x => {
    const last = x.hist[x.hist.length - 1], b = bestSet(last);
    return '<button class="row" data-a="graph" data-ex="' + x.ex.id + '"><div class="grow"><div class="t">' + esc(x.ex.n) + "</div>"
      + '<div class="s num">' + (b.kg ? kgTxt(b.kg) + " kg x " : "") + b.reps + unit(x.ex) + ", " + niceDate(last.d)
      + (stalled(x.hist) ? ' <span class="tag hot">Stuck</span>' : "") + "</div></div>"
      + spark(x.hist.slice(-12).map(scoreOf)) + "</button>";
  }).join("") + "</div>";
  return h;
}

function paceLine(wk) {
  if (wk < -0.05) return "Losing weight. You cannot build muscle like this. Eat more, starting today.";
  if (wk < 0.05) return "Flat. Nothing is being built at this rate. Eat more.";
  if (wk > 0.35) return "Too fast. Past 0.35 kg a week most of it is fat. Pull the food back a little.";
  return "Good pace. Slow gain is mostly muscle. Hold it here.";
}

ACT.graph = el => {
  const ex = getEx(el.dataset.ex), hist = histFor(ex.id);
  const best = hist.reduce((a, h) => scoreOf(h) > scoreOf(a) ? h : a, hist[0]), b = bestSet(best);
  openSheet("<h3>" + esc(ex.n) + "</h3>"
    + '<p>Strength score. A fair guess at the most you could lift once. Up means stronger.</p>'
    + '<div class="card">' + chart([{ pts: hist.map(h => [dayNum(h.d), scoreOf(h)]), color: "var(--t0)", dots: true, w: 2.4 }],
        { xf: dayLabel, h: 175, yf: v => Math.round(v) })
    + '<div class="bestline"><span>Best ever</span><b class="num">' + (b.kg ? kgTxt(b.kg) + " kg x " : "") + b.reps + unit(ex) + "</b></div></div>"
    + '<h2>Every session</h2><div class="card flush">' + hist.slice(-24).reverse().map(h =>
        '<div class="row"><div class="grow"><div class="t num" style="font-size:15px">'
        + (h.sets[0].kg ? kgTxt(h.sets[0].kg) + " kg x " : "") + h.sets.map(s => s.reps).join(", ") + unit(ex)
        + '</div></div><div class="r">' + niceDate(h.d) + "</div></div>").join("") + "</div>");
};

// ----- charts -----

function chart(series, o) {
  o = o || {}; const W = 340, H = o.h || 170, L = 34, R = 6, T = 10, B = 20;
  const all = series.flatMap(s => s.pts);
  if (!all.length) return "";
  let x0 = Math.min(...all.map(p => p[0])), x1 = Math.max(...all.map(p => p[0]));
  let y0 = Math.min(...all.map(p => p[1])), y1 = Math.max(...all.map(p => p[1]));
  if (x1 === x0) { x0 -= 1; x1 += 1; }
  const pad = (y1 - y0) * 0.14 || Math.max(1, y1 * 0.05); y0 -= pad; y1 += pad;
  const X = x => L + (x - x0) / (x1 - x0) * (W - L - R);
  const Y = y => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  const yf = o.yf || (v => Math.round(v * 10) / 10);
  let g = "";
  for (let i = 0; i < 3; i++) {
    const v = y0 + (y1 - y0) * (0.12 + 0.38 * i), y = Y(v).toFixed(1);
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)" stroke-width="1"/>'
      + '<text x="' + (L - 6) + '" y="' + (+y + 4) + '" text-anchor="end" font-size="10" font-weight="600" fill="var(--t2)">' + yf(v) + "</text>";
  }
  g += '<text x="' + L + '" y="' + (H - 3) + '" font-size="10" font-weight="600" fill="var(--t2)">' + esc(o.xf(x0)) + "</text>"
    + '<text x="' + (W - R) + '" y="' + (H - 3) + '" text-anchor="end" font-size="10" font-weight="600" fill="var(--t2)">' + esc(o.xf(x1)) + "</text>";
  for (const s of series) {
    if (!s.pts.length) continue;
    if (!s.dotsOnly) g += '<polyline fill="none" stroke="' + s.color + '" stroke-width="' + (s.w || 2.4)
      + '" stroke-linejoin="round" stroke-linecap="round" points="' + s.pts.map(p => X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join(" ") + '"/>';
    if (s.dots || s.dotsOnly) g += s.pts.map(p => '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="' + (s.r || 2.4) + '" fill="' + s.color + '"/>').join("");
  }
  return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '">' + g + "</svg>";
}

function spark(vals) {
  if (vals.length < 2) return '<svg class="spark"></svg>';
  const a = Math.min(...vals), b = Math.max(...vals), sp = (b - a) || 1;
  return '<svg class="spark" viewBox="0 0 70 24"><polyline fill="none" stroke="var(--t2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="'
    + vals.map((v, i) => (3 + i * 64 / (vals.length - 1)).toFixed(1) + "," + (21 - (v - a) / sp * 18).toFixed(1)).join(" ") + '"/></svg>';
}

// ----- rest timer -----

let REST = null, restIv = null, AC = null, wake = null;

function ensureAudio() {
  try {
    if ("audioSession" in navigator) navigator.audioSession.type = "ambient";
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state !== "running") AC.resume();
  } catch (_) {}
}
function beep() {
  if (!AC || !S.settings.vol) return;
  try {
    const t = AC.currentTime + 0.02, v = S.settings.vol;
    [[659.25, 0], [880, 0.17], [1318.5, 0.34]].forEach(([f, o]) => {
      const osc = AC.createOscillator(), g = AC.createGain();
      osc.type = "sine"; osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + o);
      g.gain.linearRampToValueAtTime(v * 0.5, t + o + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + o + 0.48);
      osc.connect(g); g.connect(AC.destination);
      osc.start(t + o); osc.stop(t + o + 0.5);
    });
  } catch (_) {}
}
function startRest(sec) {
  if (!S.settings.restOn || !(sec > 0)) return;
  REST = { end: Date.now() + sec * 1000, total: sec, fired: false };
  try { localStorage.setItem("nitfit:rest", JSON.stringify(REST)); } catch (_) {}
  if (!restIv) restIv = setInterval(paintRest, 250);
  paintRest(); wakeOn();
}
function stopRest() { REST = null; try { localStorage.removeItem("nitfit:rest"); } catch (_) {} paintRest(); wakeOff(); }
function paintRest() {
  const el = $("#rest");
  if (!REST) { el.classList.remove("on", "go"); clearInterval(restIv); restIv = null; return; }
  const left = (REST.end - Date.now()) / 1000;
  el.classList.add("on");
  if (left <= 0) {
    if (!REST.fired) { REST.fired = true; if (left > -3) { beep(); haptic(); } }
    el.classList.add("go");
    $("#rest .time").textContent = "GO";
    $("#rest .bar i").style.width = "100%";
    if (left < -20) stopRest();
    return;
  }
  el.classList.remove("go");
  const s = Math.ceil(left);
  $("#rest .time").textContent = Math.floor(s / 60) + ":" + pad2(s % 60);
  $("#rest .bar i").style.width = ((1 - left / REST.total) * 100).toFixed(1) + "%";
}
ACT.restAdd = el => {
  if (!REST) return;
  const dlt = +el.dataset.v * 1000;
  REST.end = Math.max(Date.now() + 1000, REST.end + dlt);
  REST.total = Math.max(5, REST.total + dlt / 1000);
  REST.fired = false;
  try { localStorage.setItem("nitfit:rest", JSON.stringify(REST)); } catch (_) {}
  haptic(); paintRest();
};
ACT.restSkip = () => { haptic(); stopRest(); };

async function wakeOn() { try { if ("wakeLock" in navigator && !wake) wake = await navigator.wakeLock.request("screen"); } catch (_) {} }
function wakeOff() { try { if (wake) wake.release(); } catch (_) {} wake = null; }

// ----- screen: Settings -----

function vMore() {
  const st = S.settings, s = syncStatus();
  let h = '<div class="top"><div><div class="eyebrow">NitFit ' + APP_VERSION + '</div><h1>Settings</h1></div></div>';

  h += '<h2>Look</h2><div class="card"><div class="seg">'
    + [["light", "Light"], ["dark", "Dark"], ["system", "Auto"]].map(t =>
      '<button class="' + ((st.theme || "light") === t[0] ? "on" : "") + '" data-a="theme" data-v="' + t[0] + '">' + t[1] + "</button>").join("")
    + "</div></div>";

  h += '<h2>Backup</h2><div class="card">'
    + '<div class="wrow" style="padding:0 0 14px"><div class="grow"><div class="t" style="display:flex;align-items:center;gap:8px">'
    + '<span class="dot ' + s.c + '"></span>' + esc(s.t) + '</div><div class="s">' + EV.length + " entries on this phone</div></div></div>"
    + (KV.token
      ? '<div class="btns"><button class="btn sm" data-a="syncNow">Save now</button><button class="btn ghost sm" data-a="restore">Pull it back</button></div>'
      : '<button class="btn" data-a="keySetup">Set up the backup</button>')
    + '<div class="btns" style="margin-top:10px"><button class="btn ghost sm" data-a="exportAll">Export a file</button>'
    + '<button class="btn ghost sm" data-a="importAll">Import a file</button></div></div>';

  h += '<h2>Your week</h2><div class="card flush">' + DAY_ORDER.map(k =>
    '<button class="row" data-a="planDay" data-day="' + k + '"><div class="grow"><div class="t">' + esc(DAY_NAMES[k]) + "</div>"
    + '<div class="s">' + WEEKDAYS[S.dayMap.indexOf(k)] + ", " + (S.plan[k] || []).length + ' exercises</div></div>'
    + '<span class="chev">' + CHEV + "</span></button>").join("") + "</div>";

  h += '<h2>Rest timer</h2><div class="card flush">'
    + '<div class="row"><div class="grow"><div class="t">Rest timer</div><div class="s">Starts when you tick a set</div></div>'
    + '<button class="chip' + (st.restOn ? " on" : "") + '" data-a="setFlag" data-k="restOn">' + (st.restOn ? "On" : "Off") + "</button></div>"
    + '<div class="row"><div class="grow"><div class="t">Sound</div></div>'
    + '<input type="range" id="volIn" min="0" max="1" step="0.1" value="' + st.vol + '"></div></div>';

  return h;
}

ACT.setFlag = el => { addEvent("settings.upserted", { [el.dataset.k]: !S.settings[el.dataset.k] }); haptic(); render(); };
ACT.syncNow = async () => { toast("Saving..."); const ok = await syncNow(); toast(ok ? "Saved to GitHub" : (KV.syncErr || "Could not save")); render(); };
ACT.restore = async () => { toast("Pulling it back..."); const ok = await syncNow(true); toast(ok ? "All here. " + EV.length + " entries." : (KV.syncErr || "Could not reach GitHub")); render(); };
ACT.keySetup = () => openSheet('<h3>Set up the backup</h3><p>This key lets NitFit save into your private box on GitHub. One time, about three minutes. Easier on a laptop.</p>'
  + '<ol class="steps"><li><a href="https://github.com/settings/personal-access-tokens/new?name=NitFit&expires_in=none&contents=write" target="_blank" rel="noopener">Open the key page</a> and sign in.</li>'
  + "<li><b>Expiration:</b> choose <b>No expiration</b>.</li>"
  + "<li><b>Repository access:</b> <b>Only select repositories</b>, then pick your data repo.</li>"
  + "<li><b>Permissions:</b> add <b>Contents</b>, set to <b>Read and write</b>.</li>"
  + "<li><b>Generate token</b>, copy the long code, paste it here.</li></ol>"
  + '<input class="inp" id="keyIn" placeholder="github_pat_..." autocomplete="off" autocapitalize="off" spellcheck="false">'
  + '<div class="err" id="keyErr"></div><button class="btn" data-a="keyConnect">Connect</button>'
  + '<div style="height:10px"></div><button class="btn ghost" data-a="keyLater">Later</button>');
ACT.keyLater = () => { kvSet("skipSetup", true); closeSheet(); render(); };
ACT.keyConnect = async el => {
  const err = $("#keyErr"); err.textContent = ""; el.disabled = true; el.textContent = "Connecting...";
  try { await connectKey($("#keyIn").value); closeSheet(); toast("Connected."); render(); }
  catch (e) { err.textContent = e.message || "Could not connect."; el.disabled = false; el.textContent = "Connect"; }
};
ACT.exportAll = async () => {
  const name = "nitfit-backup-" + today() + ".json";
  const file = new File([JSON.stringify(buildExport())], name, { type: "application/json" });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file] }); }
  catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
};
ACT.importAll = () => { const i = $("#importIn"); i.value = ""; i.click(); };

// plan editor
ACT.planDay = el => { UI.planDraft = clone(S.plan); UI.planK = el.dataset.day; planSheet(); };
function planSheet() {
  const k = UI.planK, items = UI.planDraft[k] || (UI.planDraft[k] = []);
  openSheet("<h3>" + esc(DAY_NAMES[k]) + "</h3><p>Keep your first big lift the same for six weeks. That is how you see progress.</p>"
    + '<div class="card flush">' + items.map((it, i) => {
      const ex = getEx(it.ex);
      return '<div class="row"><div class="grow"><div class="t">' + esc(ex ? ex.n : it.ex) + '</div><div class="s">'
        + '<button data-a="planMove" data-i="' + i + '" data-v="-1">Up</button> &#183; '
        + '<button data-a="planMove" data-i="' + i + '" data-v="1">Down</button> &#183; '
        + '<button class="rm" data-a="planDel" data-i="' + i + '">Remove</button></div></div>'
        + '<div class="chips"><button class="chip" data-a="planSets" data-i="' + i + '" data-v="-1">&#8722;</button>'
        + '<span class="num setn">' + it.sets + "</span>"
        + '<button class="chip" data-a="planSets" data-i="' + i + '" data-v="1">+</button></div></div>';
    }).join("") + "</div>"
    + '<div style="height:12px"></div><button class="btn ghost" data-a="planAddPick">Add an exercise</button>'
    + '<div style="height:10px"></div><button class="btn" data-a="planSave">Save</button>');
}
ACT.planSets = el => { const it = UI.planDraft[UI.planK][+el.dataset.i]; it.sets = Math.max(1, Math.min(8, it.sets + +el.dataset.v)); planSheet(); };
ACT.planMove = el => {
  const a = UI.planDraft[UI.planK], i = +el.dataset.i, j = i + +el.dataset.v;
  if (j < 0 || j >= a.length) return;
  const t = a[i]; a[i] = a[j]; a[j] = t; planSheet();
};
ACT.planDel = el => { UI.planDraft[UI.planK].splice(+el.dataset.i, 1); planSheet(); };
ACT.planAddPick = () => {
  const by = {};
  allExercises().forEach(e => (by[e.m] = by[e.m] || []).push(e));
  openSheet("<h3>Add to " + esc(DAY_NAMES[UI.planK]) + "</h3>" + MUSCLES.filter(m => by[m]).map(m =>
    "<h2>" + m + '</h2><div class="card flush">' + by[m].map(e =>
      '<button class="row" data-a="planAdd" data-ex="' + e.id + '"><div class="grow"><div class="t">' + esc(e.n) + "</div></div></button>").join("") + "</div>").join(""));
};
ACT.planAdd = el => { const a = UI.planDraft[UI.planK]; if (!a.some(x => x.ex === el.dataset.ex)) a.push({ ex: el.dataset.ex, sets: 3 }); planSheet(); };
ACT.planSave = () => { addEvent("plan.upserted", { plan: UI.planDraft }); for (const k in TGT) delete TGT[k]; closeSheet(); toast("Saved"); render(); };

// ----- router -----

const VIEWS = { today: vToday, progress: vProgress, more: vMore };
function render() {
  if (!S) return;
  $("#app").innerHTML = LOG ? vLog() : VIEWS[TAB]();
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === TAB));
  $("#tabs").style.display = LOG ? "none" : "";
}
ACT.tab = el => {
  if (TAB === el.dataset.tab && !LOG) return;
  TAB = el.dataset.tab; LOG = null; haptic(); render(); window.scrollTo(0, 0);
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]");
  if (el) { const f = ACT[el.dataset.a]; if (f) f(el, e); }
});
document.addEventListener("change", async e => {
  const el = e.target;
  if (el.id === "volIn") { addEvent("settings.upserted", { vol: +el.value }); ensureAudio(); beep(); }
  if (el.id === "importIn" && el.files[0]) {
    try { const n = await importExport(JSON.parse(await el.files[0].text())); toast(n ? n + " entries added" : "Nothing new"); render(); }
    catch (err) { toast("Could not read that file"); }
  }
});
// weight typed on the Today screen
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id === "wIn") {
    const v = numIn(e.target.value);
    if (!(v > 25 && v < 250)) return toast("Type your weight in kg.");
    addEvent("weight.logged", { kg: v }); e.target.blur(); haptic(); render();
  }
});
document.addEventListener("focusout", e => {
  if (e.target.id === "wIn" && e.target.value) {
    const v = numIn(e.target.value);
    if (v > 25 && v < 250) { addEvent("weight.logged", { kg: v }); render(); }
  }
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) { paintRest(); if (KV.token) syncNow(); }
});

// ----- start -----

async function boot() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  if (ios && !standalone) {
    $("#tabs").style.display = "none";
    $("#app").innerHTML = '<div class="center"><h1>Add NitFit to your Home Screen</h1>'
      + '<p class="sub">It only runs from its own icon. That is what keeps your workouts safe in one place.</p>'
      + '<div class="card" style="text-align:left"><ol class="steps" style="margin:0">'
      + "<li>Tap <b>Share</b>, the square with the arrow.</li>"
      + "<li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li>"
      + "<li>Open <b>NitFit</b> from the new icon.</li></ol></div></div>";
    return;
  }
  try { await coreBoot(); }
  catch (e) {
    $("#app").innerHTML = '<div class="center"><h1>Storage is blocked</h1><p class="sub">Close NitFit and open it again. If Private Browsing is on, turn it off.</p></div>';
    return;
  }
  applyTheme();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (S.settings.theme === "system") applyTheme(); });
  try { if (navigator.storage && navigator.storage.persist && KV.persist == null) kvSet("persist", await navigator.storage.persist()); } catch (_) {}
  try {
    const r = JSON.parse(localStorage.getItem("nitfit:rest") || "null");
    if (r && r.end > Date.now() - 15000) { REST = r; REST.fired = REST.end < Date.now(); restIv = setInterval(paintRest, 250); }
  } catch (_) {}
  render();
  if (KV.token) syncNow();
  setInterval(() => { if (!document.hidden && KV.token) syncNow(); }, 5 * 60e3);
  addEventListener("online", () => syncNow());
  let lastDay = today();
  setInterval(() => { if (today() !== lastDay) { lastDay = today(); for (const k in TGT) delete TGT[k]; render(); } }, 60e3);
}
boot();
