// ---------------------------------------------------------------------------
// NitFit screens: Dashboard, Workout, Levels, More, plus the workout preview
// and the logging screen. Bottom sheets for everything else.
// ---------------------------------------------------------------------------
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const ACT = {};
let TAB = "dashboard", PAGE = null, LOGI = null, FLIP = "front", LVRANGE = 1, RINGMODE = "program", PROGOPEN = true;
const SCROLL = {}, WARM = {}, PENDRIR = {}, DRAFT = {};
const numIn = v => { if (v == null) return null; const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
const fmtKg = k => (Math.round(k * 100) / 100).toString();
const fmtDur = ms => { const m = Math.max(0, Math.round(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + " h " + (m % 60) + " min" : m + " min"; };
const fmtClock = ms => { const t = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60; return h + ":" + pad2(m) + ":" + pad2(t % 60); };
const isStandalone = () => navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
const DAY2 = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ico = p => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
const I = {
  dash: ico('<rect x="4" y="4" width="6.5" height="9" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="5" rx="1.2"/><rect x="4" y="15.5" width="6.5" height="4.5" rx="1.2"/><rect x="13.5" y="11.5" width="6.5" height="8.5" rx="1.2"/>'),
  dumb: ico('<path d="M6.3 14.6l3.1 3.1M14.6 6.3l3.1 3.1M9.4 14.6l5.2-5.2M4.1 16.8l3.1 3.1M16.8 4.1l3.1 3.1M5.2 12.5l6.3 6.3M12.5 5.2l6.3 6.3"/>'),
  rocket: ico('<path d="M12 3c3 2.2 4.5 5.6 4.3 10.2L14.5 16h-5l-1.8-2.8C7.5 8.6 9 5.2 12 3z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M8 13.5l-2.5 2.2.7 3.3 2.8-2M16 13.5l2.5 2.2-.7 3.3-2.8-2M10.5 19.5L12 21l1.5-1.5"/>'),
  more: ico('<circle cx="12" cy="12" r="8.5"/><circle cx="8.3" cy="12" r=".6" fill="currentColor"/><circle cx="12" cy="12" r=".6" fill="currentColor"/><circle cx="15.7" cy="12" r=".6" fill="currentColor"/>'),
  plus: ico('<path d="M12 5v14M5 12h14"/>'),
  cal: ico('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
  kebab: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5.5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="18.5" r="1.9"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 9 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5l6 6-6 6"/></svg>',
  up: ico('<path d="M6 15l6-6 6 6"/>'),
  back: ico('<path d="M15 5l-7 7 7 7"/>'),
  x: ico('<path d="M6 6l12 12M18 6L6 18"/>'),
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  menu: ico('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  watch: ico('<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V10M10 3h4M18 6.5l1.3-1.3"/>'),
  wand: ico('<path d="M4 20l10.5-10.5M13 5.5l1-2.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1z"/><path d="M19 12l.6 1.4 1.4.6-1.4.6L19 16l-.6-1.4-1.4-.6 1.4-.6z"/>'),
  bars: ico('<path d="M6 20v-6M12 20V6M18 20v-9"/>'),
  target: ico('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
  swap: ico('<path d="M5 9h12l-3.5-3.5M19 15H7l3.5 3.5"/>'),
  ss: ico('<path d="M7 4L4 7l3 3M4 7h12a3 3 0 013 3M17 20l3-3-3-3M20 17H8a3 3 0 01-3-3"/>'),
  dup: ico('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>'),
  remove: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e8453c"/><path d="M7 12h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
  empty: ico('<path d="M4 5v14M8 12h12M15 7l5 5-5 5"/>'),
  hist: ico('<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>'),
  rotate: ico('<path d="M20 11a8 8 0 00-14.6-4.5M4 4v3.5h3.5M4 13a8 8 0 0014.6 4.5M20 20v-3.5h-3.5"/>'),
  info: ico('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  fire: ico('<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-4 3.6-5.4 4.2-9.8 2.6 1.6 4 4 4.3 6.4 1-.8 1.6-2 1.7-3.4 1.8 1.6 2.8 4 2.8 6.6C18.5 18.4 16 21 12 21z"/>'),
  scale: ico('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9.5a4 4 0 016 0L12.6 12"/>'),
  tape: ico('<circle cx="10" cy="11" r="6"/><circle cx="10" cy="11" r="2"/><path d="M16 11h4v6h-10"/>'),
  ruler: ico('<path d="M4 16L16 4l4 4L8 20z"/><path d="M8 12l2 2M11 9l2 2M14 6l2 2"/>'),
  clock: ico('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  cloud: ico('<path d="M7 18h10a4 4 0 00.5-8 5.5 5.5 0 00-10.7 1.5A3.3 3.3 0 007 18z"/>'),
  file: ico('<path d="M6 3.5h8l4 4V20a.5.5 0 01-.5.5h-11A.5.5 0 016 20z"/><path d="M14 3.5V8h4"/>'),
  moon: ico('<path d="M19 14.5A7.5 7.5 0 019.5 5a7.5 7.5 0 109.5 9.5z"/>'),
  bell: ico('<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15zM10 20.5a2 2 0 004 0"/>'),
  book: ico('<path d="M5 4.5h10a3 3 0 013 3V20H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h10"/>'),
};

// ----- small things -----
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2200); }
let hapticEl = null;
function haptic() {
  try {
    if (navigator.vibrate) return navigator.vibrate(8);
    if (!hapticEl) { hapticEl = document.createElement("input"); hapticEl.type = "checkbox"; hapticEl.setAttribute("switch", ""); hapticEl.style.cssText = "position:absolute;opacity:0;pointer-events:none"; document.body.appendChild(hapticEl); }
    hapticEl.checked = !hapticEl.checked;
  } catch (_) {}
}
function applyTheme() {
  const t = (S && S.settings.theme) || "dark";
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("nitfit:theme", t); } catch (_) {}
  const m = $('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#fbfbf9" : "#212121";
}

// ----- sheets -----
let SHEET = null;
function openSheet(title, sub, html, opts) {
  opts = opts || {}; SHEET = opts.name || title;
  const sh = $("#sheet");
  sh.classList.toggle("tall", !!opts.tall);
  $(".shd h3", sh).textContent = title; $(".shd p", sh).textContent = sub || ""; $(".shd p", sh).hidden = !sub;
  $(".sbody", sh).innerHTML = html; $(".sbody", sh).scrollTop = 0;
  sh.style.transform = ""; $("#scrim").classList.add("on"); sh.classList.add("on");
}
function closeSheet() { SHEET = null; $("#sheet").classList.remove("on"); $("#scrim").classList.remove("on"); $("#sheet").style.transform = ""; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
ACT.closeSheet = closeSheet;
(function sheetDrag() {
  let y0 = null, dy = 0;
  document.addEventListener("touchstart", e => { if (!e.target.closest(".grab,.shd") || !$("#sheet").classList.contains("on")) return; y0 = e.touches[0].clientY; dy = 0; $("#sheet").style.transition = "none"; }, { passive: true });
  document.addEventListener("touchmove", e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); $("#sheet").style.transform = "translateY(" + dy + "px)"; }, { passive: true });
  document.addEventListener("touchend", () => { if (y0 == null) return; y0 = null; const sh = $("#sheet"); sh.style.transition = ""; if (dy > 110) closeSheet(); else sh.style.transform = ""; });
})();

// ----- reading the plan -----
const dayKeyFor = d => DAYMAP[dow(d)];
const weekSun = d => addDays(d, -dow(d));
const exFor = it => { const e = getEx(it.ex); return e ? Object.assign({}, e, it.r ? { r: it.r } : {}) : null; };
const tagsOf = id => TAGS[id] || [(getEx(id) || {}).m || "Other"];
function itemsForDay(dk, d) { return planFor(dk).map(it => Object.assign({}, it, { n: setsFor(it, d) })); }
function ssLabels(items) { const out = [], seen = {}; items.forEach(it => { if (!it.ss) { out.push(""); return; } seen[it.ss] = (seen[it.ss] || 0) + 1; out.push(it.ss + seen[it.ss]); }); return out; }
function partnerIndex(items, i) { const it = items[i]; if (!it || !it.ss) return -1; for (let j = 0; j < items.length; j++) if (j !== i && items[j].ss === it.ss) return j; return -1; }
function lastFinishedBefore(d) { const l = sessionsSorted().filter(s => s.endTs && s.d < d); return l.length ? l[l.length - 1] : null; }
const doneOn = d => sessionsSorted().some(s => s.d === d && s.endTs && sessionSets(s.id).length);

// thumbnails: the body map, cropped, with the exercise's muscles lit up
function thumbFor(exId) {
  const tags = tagsOf(exId), lv = {}; tags.forEach((m, i) => lv[m] = i === 0 ? 1 : 0.38);
  const v = MUSCLE_VIEW[tags[0]] || ["front", "up"];
  return bodySvg(v[0], lv, { crop: v[1] });
}
function muscleThumb(m) { const v = MUSCLE_VIEW[m] || ["front", "up"], lv = {}; lv[m] = 1; return bodySvg(v[0], lv, { crop: v[1] }); }

const shortName = id => { const n = ((getEx(id) || {}).n || "").replace(/^(Dumbbell|Barbell|Cable|Machine|Smith|Standing|Seated|One-arm|Chest-supported|Weighted)\s+/i, ""); return n.length > 14 ? n.slice(0, 13) + "…" : n; };
// ----- targets for the live workout -----
const TGT = {};
function rowsFor(sess, i) {
  const it = sess.items[i], ex = exFor(it); if (!ex) return null;
  const key = sess.id + ":" + i + ":" + it.ex + ":" + it.n + ":" + (it.r || ex.r).join("-");
  const week = programWeek(sess.d), rirT = rirTargets(ex, it, week, it.n);
  if (!TGT[key]) {
    const prev = lastFinishedBefore(sess.d), gap = prev ? daysBetween(prev.d, sess.d) : 0;
    TGT[key] = smartTarget(ex, histFor(it.ex, sess.id), { sets: it.n, gap, easy: week <= 2, light: !!it.light });
  }
  const base = TGT[key], logged = loggedByIdx(sess, it.ex);
  const live = liveRows(ex, base, logged, rirT);
  return { ex, base, rirT, logged, rows: live.rows, events: live.events };
}
function loggedByIdx(sess, exId) { const out = {}; sessionSets(sess.id).filter(x => x.exId === exId).forEach(x => { out[x.idx] = x; }); return out; }
function warmLogged(sess, exId) { const out = {}; sessionAllSets(sess.id).filter(x => x.exId === exId && x.w).forEach(x => { out[x.idx] = x; }); return out; }
const autoTxt = (r, ex) => { const rr = r.lo === r.hi ? r.lo : r.lo + "-" + r.hi; return r.kg ? fmtKg(r.kg) + " kg × " + rr : rr + (ex.t ? " sec" : " reps"); };

// ===== render =====
function render() {
  if (!isStandalone() && !/dev/.test(location.search)) { $("#main").innerHTML = vInstall(); $("#tabs").hidden = true; return; }
  const m = $("#main");
  m.innerHTML = TAB === "dashboard" ? vDash() : TAB === "workout" ? vWorkoutTab() : TAB === "levels" ? vLevels() : vMore();
  m.scrollTop = SCROLL[TAB] || 0;
  $$("#tabs [data-tab]").forEach(b => b.classList.toggle("on", b.dataset.tab === TAB));
  renderPage();
}
function renderPage(keepScroll) {
  const pg = $("#page"), y = pg.scrollTop;
  if (!PAGE) { pg.classList.remove("on"); $("#tabs").hidden = false; return; }
  if (PAGE.kind === "log" && !activeSession()) { PAGE = null; return renderPage(); }
  pg.innerHTML = PAGE.kind === "preview" ? vPreview(PAGE.dayKey) : PAGE.kind === "log" ? vLog() : PAGE.kind === "history" ? vHistory() : "";
  pg.classList.add("on"); $("#tabs").hidden = true;
  if (keepScroll) pg.scrollTop = y;
  const on = $("#strip .st.on"); if (on) { const st = $("#strip"); st.scrollLeft = Math.max(0, on.offsetLeft - st.clientWidth / 2 + on.clientWidth / 2); }
}
function vInstall() {
  return '<div class="head"><div class="title">NitFit</div></div><div class="body-pad"><div class="card" style="padding:18px;margin-top:16px"><b>Open NitFit from its own icon.</b>'
    + '<ol class="ol" style="margin-top:10px"><li>Tap <b>Share</b> at the bottom of Safari.</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li><li>Open <b>NitFit</b> from the new icon.</li></ol></div></div>';
}
function head(title, eyebrow, icons) {
  return '<div class="head">' + (eyebrow ? '<div class="eyebrow">' + esc(eyebrow) + "</div>" : "") + '<div class="trow"><div class="title">' + esc(title) + '</div><div class="icons">' + (icons || "") + "</div></div>";
}

// ===== Dashboard =====
function weekStats(mode) {
  const d0 = weekSun(today()), plan = { sets: 0, ex: new Set(), mus: new Set() }, done = { sets: 0, ex: new Set(), mus: new Set() };
  for (let i = 0; i < 7; i++) { const d = addDays(d0, i), dk = dayKeyFor(d); if (!dk) continue; itemsForDay(dk, d).forEach(it => { plan.sets += it.n; plan.ex.add(it.ex); plan.mus.add(tagsOf(it.ex)[0]); }); }
  sessionsSorted().filter(s => s.d >= d0 && s.d <= addDays(d0, 6) && (mode === "all" || s.dayKey)).forEach(s => sessionSets(s.id).forEach(x => { done.sets++; done.ex.add(x.exId); done.mus.add(tagsOf(x.exId)[0]); }));
  return { plan, done };
}
function ringSvg(size, stroke, frac, color) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--chip)" stroke-width="' + stroke + '"/>'
    + '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + (c * f).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/></svg>';
}
function ring(label, val, tgt, size, color, big) {
  return '<div class="ring' + (big ? " bigr" : "") + '"><div class="rv">' + ringSvg(size, big ? 5 : 4, tgt ? val / tgt : 0, color) + "<div><b>" + val + "</b><small>" + Math.max(0, tgt - val) + " left</small></div></div>"
    + '<div class="rl">' + label + '</div><div class="rt">' + tgt + " target</div></div>";
}
function vDash() {
  const dt = new Date(), d = today();
  let h = head("Dashboard", WEEKDAYS[dt.getDay()] + ", " + MONTHS_LONG[dt.getMonth()] + " " + dt.getDate()) + "</div><div class='body-pad'>";
  if (storageBroken) h += '<div class="banner">' + esc(storageBroken) + "</div>";
  else if (!KV.token) h += '<div class="banner">Not backed up yet<button data-a="backup">Set up</button></div>';
  if (activeSession()) h += '<button class="prompt press" data-a="resume" style="width:100%;text-align:left"><div class="m"><b>' + esc(activeSession().name) + '</b><span class="small">Workout in progress</span></div><span class="ul">Resume</span></button>';
  if (!S.weights[d]) h += '<div class="prompt"><div class="m"><b>Morning weigh-in</b><span class="small">After you pee, before food</span></div><input id="wIn" inputmode="decimal" placeholder="kg" enterkeyhint="done"></div>';
  const st = weekStats(RINGMODE);
  h += "<h2>Weekly Workouts</h2><div class='rings'>" + ring("Muscles", st.done.mus.size, st.plan.mus.size, 92, "var(--blue)") + ring("Sets", st.done.sets, st.plan.sets, 132, "var(--orange)", 1) + ring("Exercises", st.done.ex.size, st.plan.ex.size, 92, "var(--teal)") + "</div>";
  h += '<div class="seg"><button class="' + (RINGMODE === "program" ? "on" : "") + '" data-a="ringMode" data-v="program">Active Program</button><button class="' + (RINGMODE === "all" ? "on" : "") + '" data-a="ringMode" data-v="all">All Workouts</button></div>';
  // insights
  const past = sessionsSorted().filter(s => s.endTs).slice(-7), sv = past.map(s => sessionSets(s.id).length);
  const tr = trendSeries(weightList()), last7 = tr.filter(x => x.d >= addDays(d, -6));
  h += "<h2>Insights &amp; Analytics</h2><div class='grid2'>"
    + '<button class="ic press" data-a="tabTo" data-tab="workout" data-sub="history"><b>Workouts</b><span class="p">Last 7 Workouts</span><div class="viz">' + barsSvg(sv, "var(--orange)") + '</div><div class="v">' + (sv.length ? sv[sv.length - 1] : 0) + "<small>sets</small></div>" + I.chev + "</button>"
    + '<button class="ic press" data-a="weightSheet"><b>Weight Trend</b><span class="p">Last 7 Days</span><div class="viz">' + dotLine(last7.map(x => x.trend), "var(--purple)") + '</div><div class="v">' + (tr.length ? tr[tr.length - 1].trend.toFixed(1) : "–") + "<small>kg</small></div>" + I.chev + "</button></div>";
  // habits
  const days30 = Array.from({ length: 30 }, (_, i) => addDays(d, i - 29)), wk0 = weekSun(d);
  const wIn = days30.map(x => !!S.weights[x]), wkIn = days30.map(doneOn);
  const thisWeekW = Object.keys(S.weights).filter(x => x >= wk0).length, thisWeekT = sessionsSorted().filter(s => s.d >= wk0 && s.endTs && sessionSets(s.id).length).length;
  h += "<h2>Habits</h2><div class='grid2'>"
    + '<button class="ic press" data-a="weightSheet"><b>Weigh-In</b><span class="p">Last 30 Days</span><div class="viz"><div class="dots">' + wIn.map(x => "<i" + (x ? ' class="g"' : "") + "></i>").join("") + '</div></div><div class="v">' + thisWeekW + "/7<small>this week</small></div>" + I.chev + "</button>"
    + '<button class="ic press" data-a="calendar"><b>Workouts</b><span class="p">Last 30 Days</span><div class="viz"><div class="dots">' + wkIn.map(x => "<i" + (x ? ' class="o"' : "") + "></i>").join("") + '</div></div><div class="v">' + thisWeekT + "<small>this week</small></div>" + I.chev + "</button></div>";
  // body metrics
  const wl = weightList().slice(-7), ws = Object.values(S.waists).sort((a, b) => a.d < b.d ? -1 : 1).slice(-7);
  h += "<h2>Body Metrics</h2><div class='grid2'>"
    + '<button class="ic press" data-a="weightSheet"><b>Scale Weight</b><span class="p">Last 7 Entries</span><div class="viz">' + dotLine(wl.map(x => x.kg), "var(--green)") + '</div><div class="v">' + (wl.length ? wl[wl.length - 1].kg.toFixed(1) : "–") + "<small>kg</small></div>" + I.chev + "</button>"
    + '<button class="ic press" data-a="waistSheet"><b>Waist</b><span class="p">Last 7 Entries</span><div class="viz">' + dotLine(ws.map(x => x.inch), "var(--green)") + '</div><div class="v">' + (ws.length ? ws[ws.length - 1].inch : "–") + "<small>in</small></div>" + I.chev + "</button></div>";
  // muscle groups
  const mv = muscleSets(7, d), top = ALL_MUSCLES.map(m => [m, mv[m] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 2);
  h += "<h2>Muscle Groups</h2><div class='grid2'>" + top.map(([m, v]) => '<button class="ic press" data-a="muscle" data-m="' + esc(m) + '"><b>' + esc(m) + '</b><span class="p">Last 7 Days</span><div class="viz"><div class="thumb" style="width:64px;height:64px">' + muscleThumb(m) + '</div></div><div class="v">' + fmtKg(v) + "<small>" + (v === 1 ? "set" : "sets") + "</small></div>" + I.chev + "</button>").join("") + "</div>";
  h += '<button class="ul see" data-a="tabTo" data-tab="levels">See All</button>';
  return h + "</div>";
}
function barsSvg(vals, color, max) {
  const W = 110, H = 56, n = Math.max(vals.length, 1), mx = max || Math.max(1, ...vals), bw = Math.min(14, W / (n * 1.6));
  const x0 = W - n * bw * 1.5;
  return '<svg width="' + W + '" height="' + H + '">' + vals.map((v, i) => { const h = Math.max(2, v / mx * (H - 4)); return '<rect x="' + (x0 + i * bw * 1.5) + '" y="' + (H - h) + '" width="' + bw + '" height="' + h + '" rx="1.5" fill="' + color + '"/>'; }).join("") + "</svg>";
}
function dotLine(vals, color) {
  if (!vals.length) return '<span class="small">No entries</span>';
  const W = 120, H = 40, lo = Math.min(...vals), hi = Math.max(...vals), sp = hi - lo || 1;
  const P = vals.map((v, i) => [vals.length === 1 ? W / 2 : 4 + i * (W - 8) / (vals.length - 1), H - 5 - (hi === lo ? 0.5 : (v - lo) / sp) * (H - 10)]);
  return '<svg width="' + W + '" height="' + H + '"><polyline points="' + P.map(p => p.join(",")).join(" ") + '" fill="none" stroke="' + color + '" stroke-width="1.6"/>' + P.map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.8" fill="var(--card)" stroke="' + color + '" stroke-width="1.5"/>').join("") + "</svg>";
}
// weighted sets per muscle over the last n days (main muscle 1, others 0.5)
function muscleSets(days, d) {
  const from = addDays(d, -(days - 1)), out = {};
  Object.values(S.sets).forEach(x => { if (x.w || x.d < from || x.d > d) return; tagsOf(x.exId).forEach((m, i) => { out[m] = (out[m] || 0) + (i === 0 ? 1 : 0.5); }); });
  return out;
}
ACT.ringMode = el => { RINGMODE = el.dataset.v; SCROLL.dashboard = $("#main").scrollTop; render(); };
ACT.tabTo = el => { SCROLL[TAB] = $("#main").scrollTop; TAB = el.dataset.tab; render(); if (el.dataset.sub === "history") ACT.history(); };

// ===== Workout tab =====
function vWorkoutTab() {
  const d = today(), d0 = weekSun(d), wk = programWeek(d);
  let h = head("Workout", "", '<button class="ib" data-a="calendar" aria-label="Calendar">' + I.cal + '</button><button class="ib" data-a="plusMenu" aria-label="Add">' + I.plus + '</button><button class="ib" data-a="history" aria-label="History">' + I.kebab + "</button>");
  h += '<div class="week">' + Array.from({ length: 7 }, (_, i) => { const x = addDays(d0, i), dk = dayKeyFor(x); return '<button class="day press' + (doneOn(x) ? " done" : "") + (x === d ? " today" : "") + '" data-a="' + (dk ? "preview" : "noop") + '" data-day="' + (dk || "") + '">' + new Date(x + "T12:00:00").getDate() + "<span>" + DAY2[i] + "</span></button>"; }).join("") + "</div></div><div class='body-pad'>";
  const act = activeSession();
  if (act) h += '<button class="prompt press" data-a="resume" style="width:100%;text-align:left"><div class="m"><b>' + esc(act.name) + '</b><span class="small">In progress · ' + sessionSets(act.id).length + (sessionSets(act.id).length === 1 ? " set" : " sets") + " logged</span></div><span class=\"ul\">Resume</span></button>";
  h += '<div class="sec"><h2>Active Program</h2><button class="ul" data-a="weeksInfo">Week ' + wk + "</button></div>";
  h += '<div class="card"><button class="prog-h" data-a="progToggle"><div class="picon">' + I.rocket + '</div><div class="m"><b>' + esc(PROGRAM_NAME) + '</b><span class="sub">6 workouts · Sunday to Friday</span></div><span class="cv' + (PROGOPEN ? "" : " closed") + '">' + I.up + "</span></button>";
  if (PROGOPEN) {
    for (let i = 0; i < 7; i++) {
      const x = addDays(d0, i), dk = dayKeyFor(x), isToday = x === d;
      if (!dk) { h += '<div class="wrow' + (isToday ? " today" : "") + '"><div class="m"><div class="dlbl">' + WEEKDAYS[i] + '</div><b>Rest Day</b></div><span class="cb' + (x < d ? " on" : "") + '">' + I.tick + "</span></div>"; continue; }
      const items = itemsForDay(dk, x), names = items.map(it => (getEx(it.ex) || {}).n).join(", ");
      const mus = []; items.forEach(it => tagsOf(it.ex).forEach(m => { if (!mus.includes(m)) mus.push(m); }));
      h += '<button class="wrow press' + (isToday ? " today" : "") + '" data-a="preview" data-day="' + dk + '"><div class="m"><div class="dlbl">' + WEEKDAYS[i] + (isToday ? " · Today" : "") + "</div><b>" + esc(DAYS[dk].name) + '</b><div class="ex">' + esc(names) + '</div><div class="tags">' + mus.slice(0, 6).map(m => '<span class="tag">' + esc(m) + "</span>").join("") + '</div></div><span class="cb' + (doneOn(x) ? " on" : "") + '">' + I.tick + "</span></button>";
    }
  }
  h += "</div><h2>More</h2><div class='card'>"
    + '<button class="mrow press" data-a="emptyWorkout"><span class="mi">' + I.empty + '</span><div class="m"><b>Empty Workout</b></div>' + I.chev + "</button>"
    + '<button class="mrow press" data-a="history"><span class="mi">' + I.hist + '</span><div class="m"><b>Workout History</b></div>' + I.chev + "</button>"
    + '<button class="mrow press" data-a="calendar"><span class="mi">' + I.cal + '</span><div class="m"><b>Calendar</b></div>' + I.chev + "</button></div>";
  return h + "</div>";
}
ACT.noop = () => toast("Saturday is your rest day");
ACT.progToggle = () => { PROGOPEN = !PROGOPEN; SCROLL.workout = $("#main").scrollTop; render(); };
ACT.weeksInfo = () => openSheet("Week " + programWeek(today()), "How your sets build up", '<div class="kv"><span>Weeks 1 and 2</span><b>2 sets, 3 RIR</b></div><div class="kv"><span>Weeks 3 and 4</span><b>Planned sets</b></div><div class="kv"><span>Week 5 on</span><b>Extra sets on priorities</b></div><p class="hint" style="margin-top:14px">RIR means reps left in the tank. 3 RIR means you stop when you could still do 3 more good reps.</p>');
ACT.resume = () => { closeSheet(); PAGE = { kind: "log" }; LOGI = null; renderPage(); };

// ===== Workout preview =====
function vPreview(dk) {
  const d = today(), items = itemsForDay(dk, d), lab = ssLabels(items), wk = programWeek(d);
  const mus = {};
  items.forEach(it => { const m = tagsOf(it.ex)[0]; mus[m] = mus[m] || { ex: 0, sets: 0 }; mus[m].ex++; mus[m].sets += it.n; });
  const sets = items.reduce((a, it) => a + it.n, 0), mins = 10 + Math.round(items.reduce((a, it) => a + it.n * ((getEx(it.ex) || {}).rest + 45), 0) / 60) + 5;
  let h = '<div class="nav"><button class="back" data-a="closePage">' + I.back + "</button><h3>" + esc(DAYS[dk].name) + '</h3><span style="width:44px"></span></div><div class="body-pad" style="padding-top:0">';
  h += '<h2 style="margin-top:8px">Target Muscles</h2><div class="tm">' + Object.keys(mus).map(m => '<button class="tmc press" data-a="muscle" data-m="' + esc(m) + '"><div class="thumb">' + muscleThumb(m) + "</div><div><b>" + esc(m) + "</b><span>" + mus[m].ex + " exercise" + (mus[m].ex > 1 ? "s" : "") + "</span><span>" + mus[m].sets + " sets</span></div></button>").join("") + "</div>";
  h += '<h2 style="margin-bottom:2px">' + (items.length + 1) + ' Exercises</h2><div class="sub" style="margin:0 4px 6px">Estimated workout time is ' + mins + " min</div>";
  h += '<div class="exlist"><div class="exr"><div class="thumb" style="margin-top:0;font-size:12px;font-weight:600;color:var(--text2);text-align:center">Back<br>fix</div><div class="m"><b>Back fix</b><div class="srow">5 moves · about 10 min</div><div class="tags">' + ["Abs", "Lower Back", "Glutes", "Neck"].map(m => '<span class="tag">' + m + "</span>").join("") + "</div></div></div>";
  items.forEach((it, i) => {
    const ex = exFor(it); if (!ex) return;
    const rt = rirTargets(ex, it, wk, it.n), rng = ex.r[0] === ex.r[1] ? ex.r[0] : ex.r[0] + "-" + ex.r[1];
    h += '<div class="exr"><div class="thumb">' + thumbFor(it.ex) + '</div><div class="m">' + (lab[i] ? '<div class="ssl">Superset ' + lab[i] + "</div>" : "") + "<b>" + esc(ex.n) + "</b>"
      + rt.map((r, k) => '<div class="srow"><span class="sn">' + (k + 1) + "</span>" + rng + (ex.t ? " sec" : " reps") + (ex.each ? " each" : "") + '<span class="rir r' + r + '">' + r + "</span></div>").join("")
      + '<div class="tags">' + tagsOf(it.ex).map(m => '<span class="tag">' + esc(m) + "</span>").join("") + '</div></div><button class="kebab" data-a="exOpts" data-i="' + i + '" data-day="' + dk + '">' + I.kebab + "</button></div>";
  });
  h += "</div></div>";
  const act = activeSession();
  h += '<div class="bottom">' + (act ? (act.dayKey === dk ? '<button class="big press" data-a="resume">Resume Workout</button>' : '<button class="big soft press" data-a="resume">Resume ' + esc(act.name) + "</button>") : '<button class="big press" data-a="start" data-day="' + dk + '">Start Workout</button>') + "</div>";
  return h;
}
ACT.preview = el => { if (!el.dataset.day) return; closeSheet(); PAGE = { kind: "preview", dayKey: el.dataset.day }; $("#page").scrollTop = 0; renderPage(); };
ACT.closePage = () => { PAGE = null; renderPage(); render(); };
ACT.start = el => {
  if (activeSession()) return ACT.resume();
  const dk = el.dataset.day, d = today();
  addEvent("session.started", { v2: 1, dayKey: dk, name: DAYS[dk].name, items: itemsForDay(dk, d) });
  haptic(); closeSheet(); PAGE = { kind: "log" }; LOGI = -1; $("#page").scrollTop = 0; renderPage();
};
ACT.emptyWorkout = () => {
  if (activeSession()) return ACT.resume();
  addEvent("session.started", { v2: 1, dayKey: null, name: "Empty Workout", items: [] });
  closeSheet(); PAGE = { kind: "log" }; LOGI = 0; renderPage(); ACT.addEx();
};

// ===== Logging screen =====
function fixDone(s, pre, n) { const done = S.fixDone[s.id] || []; return Array.from({ length: n }, (_, i) => done.includes(pre + i)); }
function exDone(s, i) { const it = s.items[i]; return Object.keys(loggedByIdx(s, it.ex)).length >= it.n; }
function pickLogi(s) {
  if (LOGI != null && LOGI >= -1 && LOGI <= s.items.length) return LOGI;
  if (!sessionSets(s.id).length && !fixDone(s, "f", BACK_FIX.length).every(Boolean)) return -1;
  for (let i = 0; i < s.items.length; i++) if (!exDone(s, i)) return i;
  return s.items.length;
}
function vLog() {
  const s = activeSession(); LOGI = pickLogi(s);
  const restOn = REST && REST.end > Date.now() - 4000;
  let h = '<div class="lg-top"><div class="lg-bar"><button class="back" data-a="logMenu" aria-label="Menu">' + I.menu + '</button><span class="clock" id="clock">' + fmtClock(Date.now() - Date.parse(s.startTs)) + "</span>"
    + '<button class="restpill' + (restOn ? (REST.rang ? " done" : " on") : "") + '" id="restpill" data-a="restSheet">' + I.watch + '<span id="restt">' + (restOn ? restLeft() : "Rest") + "</span></button></div>";
  const lab = ssLabels(s.items);
  h += '<div class="strip" id="strip"><button class="st' + (LOGI === -1 ? " on" : "") + (fixDone(s, "f", BACK_FIX.length).every(Boolean) ? " done" : "") + '" data-a="goEx" data-i="-1"><div class="thumb word">Back fix</div>' + (fixDone(s, "f", BACK_FIX.length).every(Boolean) ? '<span class="ck">' + I.tick + "</span>" : "") + "</button>"
    + s.items.map((it, i) => '<button class="st' + (LOGI === i ? " on" : "") + (exDone(s, i) ? " done" : "") + '" data-a="goEx" data-i="' + i + '"><div class="thumb">' + thumbFor(it.ex) + '</div><div class="nm">' + esc(shortName(it.ex)) + "</div>" + (lab[i] ? '<span class="ssd">' + lab[i] + "</span>" : "") + (exDone(s, i) ? '<span class="ck">' + I.tick + "</span>" : "") + "</button>").join("")
    + '<button class="st' + (LOGI === s.items.length ? " on" : "") + '" data-a="goEx" data-i="' + s.items.length + '"><div class="thumb word">Cool down</div></button>'
    + '<button class="st add" data-a="addEx"><div class="thumb">' + I.plus + "</div></button></div></div>";
  h += '<div class="lg-body">';
  if (LOGI === -1) h += vFix(s, "f", "Back fix", "10 min, before anything else", BACK_FIX);
  else if (LOGI === s.items.length) h += vFix(s, "c", "Cool down", "5 min", COOLDOWN[(DAYS[s.dayKey] || {}).cool || "legs"]) + '<div class="lg-next"><button class="big press" data-a="finish">Finish Workout</button></div>';
  else h += vExPage(s, LOGI);
  return h + "</div>";
}
function vFix(s, pre, title, sub, list) {
  const done = fixDone(s, pre, list.length);
  let h = '<div class="lg-name">' + title + '</div><div class="lg-sub">' + sub + " · " + done.filter(Boolean).length + " of " + list.length + "</div><div style='margin-top:10px'>";
  h += list.map((x, i) => '<button class="fixrow' + (done[i] ? " done" : "") + '" data-a="fix" data-k="' + pre + i + '"><div class="m"><b>' + esc(x.n) + "</b><span>" + esc(x.dose) + (x.how ? ". " + esc(x.how) : "") + '</span></div><span class="cb' + (done[i] ? " on" : "") + '">' + I.tick + "</span></button>").join("");
  h += "</div>";
  if (pre === "f") h += '<div class="lg-next"><button class="big press" data-a="goEx" data-i="0">Start first exercise</button></div>';
  return h;
}
ACT.fix = el => {
  const s = activeSession(); if (!s) return;
  const done = (S.fixDone[s.id] || []).slice(), k = el.dataset.k, i = done.indexOf(k);
  if (i >= 0) done.splice(i, 1); else done.push(k);
  addEvent("fix.done", { sessionId: s.id, done }); haptic(); renderPage(true);
};
function vExPage(s, i) {
  const it = s.items[i], R = rowsFor(s, i); if (!R) return "";
  const ex = R.ex, bw = ex.eq === "bw", nLogged = Object.keys(R.logged).length, lab = ssLabels(s.items)[i];
  const warm = WARM[s.id + ":" + i], wsets = (!bw && R.rows[0] && R.rows[0].kg) ? warmupSets(ex, R.rows[0].kg) : [], wl = warmLogged(s, it.ex);
  let h = (lab ? '<div class="ssl">Superset ' + lab + "</div>" : "") + '<div class="lg-name">' + esc(ex.n) + '</div><div class="lg-sub">Set ' + Math.min(nLogged + 1, it.n) + " of " + it.n + (exDone(s, i) ? " · done" : "") + "</div>";
  h += '<div class="pills"><button class="pl wand" data-a="smartSheet" data-i="' + i + '" aria-label="Smart Progression">' + I.wand + (R.events.length ? "<i></i>" : "") + "</button>"
    + '<button class="pl" data-a="infoSheet" data-ex="' + it.ex + '">' + I.bars + "Info</button>"
    + (wsets.length ? '<button class="pl' + (warm ? " on" : "") + '" data-a="warm" data-i="' + i + '"><span class="cnt">' + wsets.length + "</span>Warm Up</button>" : "")
    + '<button class="pl" data-a="targetsSheet" data-i="' + i + '">' + I.target + "Targets</button>"
    + '<button class="pl" data-a="swapEx" data-i="' + i + '">' + I.swap + "Swap</button>"
    + '<button class="pl" data-a="exOpts" data-i="' + i + '">' + I.kebab + "</button></div>";
  h += '<div class="tbl"><div class="th"><span>Set</span><span>Auto</span><span>' + (bw ? "" : "Kg" + (ex.each ? "" : "")) + "</span><span>" + (ex.t ? "Sec" : "Reps" + (ex.each ? "/Side" : "")) + "</span><span></span></div>";
  if (warm) wsets.forEach((w, k) => {
    const st = wl[k];
    h += '<div class="tr warm' + (st ? " done" : "") + '"><span class="sb">W</span><span class="auto">' + fmtKg(w[0]) + " kg × " + w[1] + '</span><span class="cell"><input disabled value="' + fmtKg(w[0]) + '"></span><span class="cell"><input disabled value="' + w[1] + '"></span>'
      + '<button class="cb' + (st ? " on" : "") + '" data-a="warmTick" data-i="' + i + '" data-k="' + k + '" data-kg="' + w[0] + '" data-r="' + w[1] + '">' + I.tick + "</button></div>";
  });
  R.rows.forEach((r, k) => {
    const st = R.logged[k], dk = s.id + ":" + i + ":" + k, dr = DRAFT[dk] || {}, pr = PENDRIR[s.id + ":" + i + ":" + k], rirShow = st ? (st.rir != null ? st.rir : r.rir) : (pr != null ? pr : r.rir);
    h += '<div class="tr' + (st ? " done" : "") + '" data-i="' + i + '" data-k="' + k + '"><span class="sb">' + (k + 1) + '</span><span class="auto' + (r.adjusted ? " adj" : "") + '">' + autoTxt(r, ex) + "<br>" + r.rir + " RIR</span>"
      + '<span class="cell">' + (bw ? '<div class="bw">BW</div>' : '<input inputmode="decimal" data-f="kg" placeholder="' + (r.kg != null ? fmtKg(r.kg) : "kg") + '" value="' + (st ? fmtKg(st.kg) : (dr.kg || "")) + '">') + "</span>"
      + '<span class="cell"><input inputmode="numeric" data-f="reps" placeholder="' + (r.reps != null ? r.reps : r.lo) + '" value="' + (st ? st.reps : (dr.reps || "")) + '"><button class="rir r' + Math.min(6, rirShow) + '" data-a="rirPick" data-i="' + i + '" data-k="' + k + '">' + (rirShow >= 6 ? "6+" : rirShow) + "</button></span>"
      + '<button class="cb' + (st ? " on" : "") + '" data-a="tick" data-i="' + i + '" data-k="' + k + '">' + I.tick + "</button></div>";
    if (st && bw) h += '<div class="qrow"><button class="clean' + (st.q !== "cheated" ? " on" : "") + '" data-a="q" data-id="' + st.id + '" data-v="clean">Clean</button><button class="cheated' + (st.q === "cheated" ? " on" : "") + '" data-a="q" data-id="' + st.id + '" data-v="cheated">Cheated</button></div>';
  });
  h += '<button class="addset press" data-a="addSet" data-i="' + i + '">' + I.plus + "</button></div>";
  h += '<div class="cue"><b>How to:</b> ' + esc(ex.cue) + "</div>";
  const p = partnerIndex(s.items, i), next = i + 1 < s.items.length ? i + 1 : s.items.length;
  h += '<div class="lg-next">' + (p >= 0 && lab.endsWith("1") ? '<button class="big soft press" data-a="goEx" data-i="' + p + '">Go to ' + esc((getEx(s.items[p].ex) || {}).n) + "</button>" : '<button class="big' + (exDone(s, i) ? "" : " soft") + ' press" data-a="goEx" data-i="' + next + '">' + (next >= s.items.length ? "Cool down and finish" : "Next exercise") + "</button>") + "</div>";
  return h;
}
ACT.goEx = el => { LOGI = +el.dataset.i; haptic(); $("#page").scrollTop = 0; renderPage(); const on = $("#strip .st.on"); if (on) on.scrollIntoView({ inline: "center", block: "nearest" }); };
ACT.warm = el => { const s = activeSession(), k = s.id + ":" + el.dataset.i; WARM[k] = !WARM[k]; renderPage(true); };
ACT.warmTick = el => {
  const s = activeSession(), i = +el.dataset.i, k = +el.dataset.k, it = s.items[i], st = warmLogged(s, it.ex)[k];
  if (st) addEvent("entity.deleted", { ref: st.id }); else addEvent("set.logged", { sessionId: s.id, exId: it.ex, idx: k, kg: +el.dataset.kg, reps: +el.dataset.r, w: true });
  rebuild(); haptic(); renderPage(true);
};
ACT.tick = el => {
  const s = activeSession(); if (!s) return;
  const i = +el.dataset.i, k = +el.dataset.k, it = s.items[i], R = rowsFor(s, i), ex = R.ex, row = el.closest(".tr");
  if (R.logged[k]) { addEvent("entity.deleted", { ref: R.logged[k].id }); rebuild(); haptic(); renderPage(true); return; }
  const kIn = $('input[data-f="kg"]', row), rIn = $('input[data-f="reps"]', row), r = R.rows[k];
  let kg = ex.eq === "bw" ? 0 : numIn(kIn.value); if (kg == null) kg = r.kg;
  let reps = numIn(rIn.value); if (reps == null) reps = numIn(rIn.placeholder);
  if (ex.eq !== "bw" && kg == null) { kIn.focus(); return toast("Type the weight first"); }
  if (reps == null || reps <= 0) { rIn.focus(); return toast("Type your reps"); }
  const pk = s.id + ":" + i + ":" + k, rir = PENDRIR[pk] != null ? PENDRIR[pk] : r.rir; delete PENDRIR[pk]; delete DRAFT[pk];
  addEvent("set.logged", { sessionId: s.id, exId: it.ex, item: i, idx: k, kg, reps: Math.round(reps), rir, tKg: r.kg, tReps: r.reps, tRir: r.rir, q: "clean" });
  haptic();
  const lab = ssLabels(s.items)[i], p = partnerIndex(s.items, i);
  if (p >= 0 && lab.endsWith("1") && !exDone(s, p)) { LOGI = p; toast("Superset: now " + (getEx(s.items[p].ex) || {}).n); renderPage(); return; }
  if (p >= 0 && lab.endsWith("2") && !exDone(s, p)) { startRest(ex.rest); LOGI = p; renderPage(); return; }
  if (S.settings.restOn !== false) startRest(it.light ? 60 : ex.rest);
  renderPage(true);
  const R2 = rowsFor(s, i); if (R2.events.length && R2.events[R2.events.length - 1].k === k) toast(R2.events[R2.events.length - 1].to > R2.events[R2.events.length - 1].from ? "Too easy, next sets go up" : "Too hard, next sets go down");
};
document.addEventListener("change", e => {
  const inp = e.target;
  if (inp.id === "wIn") return saveWeight(inp.value);
  const row = inp.closest && inp.closest(".tr.done"); if (!row) return;
  const s = activeSession(); if (!s) return;
  const i = +row.dataset.i, k = +row.dataset.k, st = loggedByIdx(s, s.items[i].ex)[k]; if (!st) return;
  const v = numIn(inp.value); if (v == null) return;
  addEvent("set.edited", inp.dataset.f === "kg" ? { ref: st.id, kg: v } : { ref: st.id, reps: Math.round(v) }); toast("Set updated");
});
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const inp = e.target; if (inp.id === "wIn" || inp.classList.contains("field")) { inp.blur(); return; }
  const row = inp.closest && inp.closest(".tr"); if (!row) return;
  e.preventDefault(); if (inp.dataset.f === "kg") { const r = $('input[data-f="reps"]', row); if (r) r.focus(); } else inp.blur();
});
ACT.rirPick = el => {
  const s = activeSession(), i = +el.dataset.i, k = +el.dataset.k, R = rowsFor(s, i), st = R.logged[k], key = s.id + ":" + i + ":" + k;
  const cur = st ? (st.rir != null ? st.rir : R.rows[k].rir) : (PENDRIR[key] != null ? PENDRIR[key] : R.rows[k].rir);
  openSheet("Reps in Reserve", "Set " + (k + 1) + " · target " + R.rows[k].rir + " RIR", '<p class="hint">How many more good reps could you have done?</p><div class="rirpick">' + [0, 1, 2, 3, 4, 5, 6].map(v => '<button class="' + (v === Math.min(6, cur) ? "on" : "") + '" data-a="rirSet" data-i="' + i + '" data-k="' + k + '" data-v="' + v + '">' + (v === 6 ? "6+" : v) + "</button>").join("") + '</div><p class="hint" style="margin-top:14px">0 means you could not do another rep. Smart Progression uses this to set your next targets.</p>');
};
ACT.rirSet = el => {
  const s = activeSession(), i = +el.dataset.i, k = +el.dataset.k, v = +el.dataset.v, st = rowsFor(s, i).logged[k];
  if (st) addEvent("set.rir", { ref: st.id, rir: v }); else PENDRIR[s.id + ":" + i + ":" + k] = v;
  haptic(); closeSheet(); renderPage(true);
};
ACT.q = el => { addEvent("set.q", { ref: el.dataset.id, q: el.dataset.v }); haptic(); renderPage(true); };
function editItems(fn) { const s = activeSession(), items = clone(s.items); fn(items); addEvent("session.edited", { sessionId: s.id, items }); }
ACT.addSet = el => { const i = +el.dataset.i; editItems(items => { items[i].n += 1; }); renderPage(true); };
ACT.smartSheet = el => {
  const s = activeSession(), i = +el.dataset.i, R = rowsFor(s, i);
  let h = R.events.length ? '<div class="info">' + I.info + "<div>" + esc(R.events[R.events.length - 1].text) + "</div></div>" : '<div class="info">' + I.info + "<div>" + esc(R.base.reason) + "</div></div>";
  h += '<div class="elog"><h4>Event Log</h4>';
  const sets = Object.values(R.logged).sort((a, b) => a.idx - b.idx);
  if (!sets.length && !R.events.length) h += '<p class="hint">Nothing logged yet. After each set, Smart Progression checks your reps and RIR and fixes the rest of the sets if needed.</p>';
  sets.forEach(x => { const ev = R.events.find(e => e.k === x.idx); h += '<div class="ev"><span class="t">' + new Date(x.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + '</span><div class="m">Set ' + (x.idx + 1) + ": " + (x.kg ? fmtKg(x.kg) + " kg × " : "") + x.reps + (x.rir != null ? " at " + x.rir + " RIR" : "") + (ev ? '<br><span style="color:var(--blue)">' + esc(ev.text) + "</span>" : "") + "</div></div>"; });
  openSheet("Smart Progression", R.ex.n, h + "</div>");
};
ACT.targetsSheet = el => {
  const s = activeSession(), i = +el.dataset.i, it = s.items[i], ex = exFor(it), rt = rirTargets(ex, it, programWeek(s.d), it.n);
  let h = rt.map((r, k) => '<div class="kv"><span>Set ' + (k + 1) + "</span><b>" + ex.r[0] + "-" + ex.r[1] + ' reps · <span class="rir r' + r + '" style="display:inline-grid;vertical-align:middle">' + r + "</span></b></div>").join("");
  h += '<div class="sl">Sets</div><div class="tg"><button data-a="setsN" data-i="' + i + '" data-v="-1">− 1 set</button><button data-a="setsN" data-i="' + i + '" data-v="1">+ 1 set</button></div>';
  h += '<div class="sl">Rep range</div><div class="tg"><button data-a="repR" data-i="' + i + '" data-v="-1">Lower</button><button data-a="repR" data-i="' + i + '" data-v="1">Higher</button></div><p class="hint">Changes today only. Weeks 1 and 2 aim for 3 RIR so you ease back in.</p>';
  openSheet("Targets", ex.n, h);
};
ACT.setsN = el => { const i = +el.dataset.i; editItems(items => { items[i].n = Math.max(1, items[i].n + +el.dataset.v); }); ACT.targetsSheet(el); renderPage(true); };
ACT.repR = el => { const i = +el.dataset.i, d = +el.dataset.v; editItems(items => { const ex = getEx(items[i].ex), r = (items[i].r || ex.r).slice(); items[i].r = [Math.max(1, r[0] + d * 2), Math.max(2, r[1] + d * 2)]; }); ACT.targetsSheet(el); renderPage(true); };

// exercise options (preview: changes the plan, in a workout: asks)
ACT.exOpts = el => {
  const i = +el.dataset.i, inLog = !el.dataset.day, dk = el.dataset.day || (activeSession() || {}).dayKey;
  const it = inLog ? activeSession().items[i] : planFor(dk)[i], ex = getEx(it.ex), items = inLog ? activeSession().items : planFor(dk), p = partnerIndex(items, i);
  const ctx = ' data-i="' + i + '"' + (inLog ? "" : ' data-day="' + dk + '"');
  openSheet("Exercise Options", ex.n, '<button class="opt" data-a="infoSheet" data-ex="' + it.ex + '"><span class="oi">' + I.bars + '</span><div class="m"><b>Info</b><span>Learn about the exercise</span></div>' + I.chev + "</button>"
    + (inLog ? '<button class="opt" data-a="targetsSheet"' + ctx + '><span class="oi">' + I.target + '</span><div class="m"><b>Targets</b><span>' + it.n + " sets</span></div>" + I.chev + "</button>" : '<div class="opt"><span class="oi">' + I.target + '</span><div class="m"><b>Targets</b><span>' + it.sets + " sets" + (it.p5 ? ", " + it.p5 + " from week 5" : "") + "</span></div></div>")
    + '<button class="opt" data-a="ssPick"' + ctx + '><span class="oi">' + I.ss + '</span><div class="m"><b>Superset</b><span>' + (p >= 0 ? "With " + esc((getEx(items[p].ex) || {}).n) : "Manage superset settings") + "</span></div>" + I.chev + "</button>"
    + '<button class="opt" data-a="swapEx"' + ctx + '><span class="oi">' + I.swap + '</span><div class="m"><b>Swap</b><span>Replace with an alternate</span></div>' + I.chev + "</button>"
    + '<button class="opt" data-a="dupEx"' + ctx + '><span class="oi">' + I.dup + '</span><div class="m"><b>Duplicate Exercise</b></div></button>'
    + '<button class="opt red" data-a="removeEx"' + ctx + '><span class="oi">' + I.remove + '</span><div class="m"><b>Remove from workout</b></div></button>');
};
let PENDING = null;
function pickerHtml(act, prefer) {
  const by = {}; EXERCISES.forEach(e => { const m = tagsOf(e.id)[0]; (by[m] = by[m] || []).push(e); });
  const order = ALL_MUSCLES.filter(m => by[m]); if (prefer) order.sort((a, b) => (b === prefer) - (a === prefer));
  return '<div style="position:sticky;top:-6px;background:var(--top);padding:6px 0 8px;z-index:2"><input class="field" id="exSearch" placeholder="Search exercises" autocomplete="off"></div>'
    + order.map(m => '<div class="sl" data-m>' + esc(m) + '</div><div data-g>' + by[m].map(e => '<button class="opt" data-a="' + act + '" data-ex="' + e.id + '" data-name="' + esc(e.n.toLowerCase()) + '"><div class="thumb" style="width:44px;height:44px">' + thumbFor(e.id) + '</div><div class="m"><b>' + esc(e.n) + "</b><span>" + esc(tagsOf(e.id).join(", ")) + "</span></div></button>").join("") + "</div>").join("");
}
document.addEventListener("input", e => {
  const tr = e.target.closest && e.target.closest(".tr:not(.done)");
  if (tr && e.target.dataset.f && activeSession()) { const k = activeSession().id + ":" + tr.dataset.i + ":" + tr.dataset.k; (DRAFT[k] = DRAFT[k] || {})[e.target.dataset.f] = e.target.value; return; }
  if (e.target.id !== "exSearch") return;
  const q = e.target.value.trim().toLowerCase();
  $$("#sheet [data-g]").forEach(g => { let any = false; $$(".opt", g).forEach(r => { const on = !q || r.dataset.name.includes(q); r.hidden = !on; any = any || on; }); g.hidden = !any; const l = g.previousElementSibling; if (l) l.hidden = !any; });
});
const ctxOf = el => ({ i: el.dataset.i != null ? +el.dataset.i : null, day: el.dataset.day || null });
ACT.swapEx = el => { const c = ctxOf(el), items = c.day ? planFor(c.day) : activeSession().items; PENDING = Object.assign({ kind: "swap" }, c); openSheet("Swap", "Replace " + (getEx(items[c.i].ex) || {}).n, pickerHtml("picked", tagsOf(items[c.i].ex)[0]), { tall: true }); };
ACT.addEx = () => { PENDING = { kind: "add", i: null, day: null }; openSheet("Add Exercise", "", pickerHtml("picked"), { tall: true }); };
ACT.dupEx = el => { PENDING = Object.assign({ kind: "dup" }, ctxOf(el)); applyOrAsk(); };
ACT.removeEx = el => { PENDING = Object.assign({ kind: "remove" }, ctxOf(el)); applyOrAsk(); };
ACT.picked = el => { PENDING.ex = el.dataset.ex; applyOrAsk(); };
ACT.ssPick = el => {
  const c = ctxOf(el), items = c.day ? planFor(c.day) : activeSession().items;
  PENDING = Object.assign({ kind: "ss" }, c);
  openSheet("Superset", (getEx(items[c.i].ex) || {}).n, '<p class="hint">Pick the exercise to pair it with. You go straight from one to the other, then rest.</p>'
    + items.map((it, j) => j === c.i ? "" : '<button class="opt" data-a="ssWith" data-j="' + j + '"><div class="thumb" style="width:44px;height:44px">' + thumbFor(it.ex) + '</div><div class="m"><b>' + esc((getEx(it.ex) || {}).n) + "</b></div></button>").join("")
    + (items[c.i].ss ? '<button class="opt red" data-a="ssWith" data-j="-1"><span class="oi">' + I.remove + '</span><div class="m"><b>Remove from superset</b></div></button>' : ""));
};
ACT.ssWith = el => { PENDING.j = +el.dataset.j; applyOrAsk(); };
function applyEditTo(items, P) {
  if (P.kind === "swap") items[P.i] = Object.assign({}, items[P.i], { ex: P.ex, r: null });
  if (P.kind === "add") items.push({ ex: P.ex, sets: 3, n: programWeek(today()) <= 2 ? 2 : 3 });
  if (P.kind === "dup") items.splice(P.i + 1, 0, Object.assign({}, items[P.i], { ss: null }));
  if (P.kind === "remove") items.splice(P.i, 1);
  if (P.kind === "ss") {
    const old = items[P.i].ss; if (old) items.forEach(x => { if (x.ss === old) x.ss = null; });
    if (P.j >= 0) { const used = new Set(items.map(x => x.ss).filter(Boolean)); const L = "ABCDEFGH".split("").find(c => !used.has(c)); if (items[P.j].ss) { const o2 = items[P.j].ss; items.forEach(x => { if (x.ss === o2) x.ss = null; }); } items[P.i].ss = L; items[P.j].ss = L; }
  }
  return items;
}
function applyOrAsk() {
  const P = PENDING;
  if (P.day) { const items = applyEditTo(clone(planFor(P.day)), P).map(x => { const o = Object.assign({}, x); delete o.n; return o; }); addEvent("program.upserted", { dayKey: P.day, items }); closeSheet(); toast("Plan updated"); renderPage(true); return; }
  const s = activeSession();
  if (P.kind === "add" || !s.dayKey) return ACT.applyEdit({ dataset: { scope: "today" } });
  openSheet(P.kind === "swap" ? "Swap" : P.kind === "remove" ? "Remove" : P.kind === "dup" ? "Duplicate" : "Superset", "Where should this change go?",
    '<button class="opt" data-a="applyEdit" data-scope="today"><div class="m"><b>Just this workout</b><span>Next ' + esc(s.name) + " goes back to the plan</span></div></button>"
    + '<button class="opt" data-a="applyEdit" data-scope="always"><div class="m"><b>Every ' + esc(s.name) + '</b><span>Changes your plan from now</span></div></button>');
}
ACT.applyEdit = el => {
  const s = activeSession(), P = PENDING; if (!s || !P) return;
  editItems(items => applyEditTo(items, P));
  if (el.dataset.scope === "always" && s.dayKey) addEvent("program.upserted", { dayKey: s.dayKey, items: activeSession().items.map(x => { const o = Object.assign({}, x); o.sets = o.sets || o.n; delete o.n; return o; }) });
  if (P.kind === "add") LOGI = activeSession().items.length - 1;
  if (P.kind === "remove" && LOGI >= activeSession().items.length) LOGI = activeSession().items.length;
  PENDING = null; closeSheet(); haptic(); renderPage(); toast(el.dataset.scope === "always" ? "Plan updated" : "Changed for this workout");
};

// menu, finish, discard
ACT.logMenu = () => openSheet("Workout", activeSession().name, '<button class="opt" data-a="minimize"><span class="oi">' + I.back + '</span><div class="m"><b>Back to app</b><span>The workout keeps running</span></div></button>'
  + '<button class="opt" data-a="addEx"><span class="oi">' + I.plus + '</span><div class="m"><b>Add exercise</b></div></button>'
  + '<button class="opt" data-a="finish"><span class="oi">' + I.tick + '</span><div class="m"><b>Finish workout</b></div></button>'
  + '<button class="opt red" data-a="discard"><span class="oi">' + I.remove + '</span><div class="m"><b>Discard workout</b><span>Deletes every set in it</span></div></button>');
ACT.minimize = () => { closeSheet(); PAGE = null; renderPage(); render(); };
ACT.finish = () => {
  const s = activeSession(); if (!s) return;
  const sets = sessionSets(s.id);
  if (!sets.length) return openSheet("Finish workout?", "No sets logged yet", '<button class="opt red" data-a="discard"><span class="oi">' + I.remove + '</span><div class="m"><b>Delete this workout</b></div></button><button class="opt" data-a="closeSheet"><div class="m"><b>Keep going</b></div></button>');
  addEvent("session.finished", { sessionId: s.id }); stopRest(); haptic(); syncNow();
  PAGE = null; LOGI = null; TAB = "dashboard"; render();
  ACT.viewSession({ dataset: { id: s.id } }, true);
};
ACT.discard = el => {
  if (el && el.dataset && el.dataset.sure !== "1" && el.classList) { el.dataset.sure = "1"; $("b", el).textContent = "Tap again to delete"; return; }
  const s = activeSession(); if (s) addEvent("entity.deleted", { ref: s.id }); rebuild(); closeSheet(); stopRest(); PAGE = null; render();
};
ACT.viewSession = (el, justDone) => {
  const s = S.sessions[el.dataset.id]; if (!s) return;
  const sets = sessionSets(s.id), by = {}; sets.forEach(x => (by[x.exId] = by[x.exId] || []).push(x));
  const vol = sets.reduce((a, x) => a + (x.kg || 0) * x.reps, 0), dur = s.endTs ? Date.parse(s.endTs) - Date.parse(s.startTs) : 0;
  let h = '<div class="grid2" style="margin-top:6px"><div class="ic" style="min-height:0"><span class="p">Duration</span><div class="v">' + fmtDur(dur) + '</div></div><div class="ic" style="min-height:0"><span class="p">Sets</span><div class="v">' + sets.length + '</div></div><div class="ic" style="min-height:0"><span class="p">Volume</span><div class="v">' + Math.round(vol).toLocaleString() + '<small>kg</small></div></div><div class="ic" style="min-height:0"><span class="p">Exercises</span><div class="v">' + Object.keys(by).length + "</div></div></div>";
  Object.keys(by).forEach(id => { const e = getEx(id); h += '<div class="hist-d">' + esc(e ? e.n : id) + '</div><div class="hist-s">' + by[id].sort((a, b) => a.idx - b.idx).map(setChip).join("") + "</div>"; });
  if (!justDone) h += '<button class="big red" style="margin-top:18px" data-a="delSession" data-id="' + s.id + '">Delete workout</button>';
  else h += '<button class="big" style="margin-top:20px" data-a="closeSheet">Done</button>';
  openSheet(justDone ? "Workout Complete" : s.name, justDone ? s.name + ". Go and eat." : niceDate(s.d), h, { tall: !justDone });
};
const setChip = x => "<span>" + (x.kg ? fmtKg(x.kg) + " × " : "") + x.reps + (x.rir != null ? ' <i class="rir r' + Math.min(6, x.rir) + '" style="font-style:normal">' + x.rir + "</i>" : "") + (x.q === "cheated" ? ' <b style="color:var(--red);font-size:11px">cheat</b>' : "") + "</span>";
ACT.delSession = el => { if (el.dataset.sure !== "1") { el.dataset.sure = "1"; el.textContent = "Tap again to delete"; return; } addEvent("entity.deleted", { ref: el.dataset.id }); rebuild(); closeSheet(); render(); toast("Workout deleted"); };

// info sheet
ACT.infoSheet = el => {
  const id = el.dataset.ex, e = getEx(id), hist = histFor(id);
  const best = hist.length ? hist.map(h => h.sets.reduce((a, s) => e1rm(s.kg || 0, s.reps) > e1rm(a.kg || 0, a.reps) ? s : a, h.sets[0])).reduce((a, s) => e1rm(s.kg || 0, s.reps) > e1rm(a.kg || 0, a.reps) ? s : a) : null;
  let h = '<div style="display:flex;gap:14px;align-items:center;margin-top:8px"><div class="thumb" style="width:84px;height:84px">' + thumbFor(id) + '</div><div><div class="tags" style="flex-wrap:wrap;-webkit-mask-image:none;mask-image:none">' + tagsOf(id).map(m => '<span class="tag">' + esc(m) + "</span>").join("") + "</div></div></div>";
  h += '<div class="cue" style="margin-top:14px"><b>How to:</b> ' + esc(e.cue) + "</div>";
  h += '<div class="kv"><span>Rep range</span><b>' + e.r[0] + "-" + e.r[1] + (e.t ? " sec" : "") + '</b></div><div class="kv"><span>Rest</span><b>' + Math.round(e.rest / 6) / 10 + " min</b></div>";
  if (best) h += '<div class="kv"><span>Best set</span><b>' + (best.kg ? fmtKg(best.kg) + " kg × " : "") + best.reps + '</b></div><div class="kv"><span>Estimated max</span><b>' + (best.kg ? fmtKg(Math.round(e1rm(best.kg, best.reps) * 2) / 2) + " kg" : best.reps + " reps") + '</b></div><div class="kv"><span>Workouts</span><b>' + hist.length + "</b></div>";
  if (hist.length > 1) h += '<div class="sl">Estimated max over time</div><div class="chart">' + lineChart(hist.map(x => ({ d: x.d, v: Math.max(...x.sets.map(s => e1rm(s.kg || 0, s.reps))) }))) + "</div>";
  if (hist.length) h += '<div class="sl">History</div>' + hist.slice().reverse().slice(0, 12).map(x => '<div class="hist-d">' + niceDate(x.d) + '</div><div class="hist-s">' + x.sets.map(setChip).join("") + "</div>").join("");
  else h += '<p class="hint" style="margin-top:14px">No history yet. Your sets show up here after you log them.</p>';
  openSheet(e.n, "Info", h, { tall: true });
};

// ----- rest timer -----
let REST = null, restIv = null, AC = null, wake = null;
const restLeft = () => { const t = Math.max(0, Math.ceil((REST.end - Date.now()) / 1000)); return Math.floor(t / 60) + ":" + pad2(t % 60); };
function ensureAudio() { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (_) {} }
function beep() {
  try { ensureAudio(); if (!AC) return; const now = AC.currentTime, vol = S.settings.vol == null ? 0.6 : S.settings.vol;
    [0, 0.22].forEach((dt, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.value = i ? 880 : 660;
      g.gain.setValueAtTime(0.0001, now + dt); g.gain.exponentialRampToValueAtTime(0.25 * vol + 0.001, now + dt + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, now + dt + 0.5);
      o.connect(g).connect(AC.destination); o.start(now + dt); o.stop(now + dt + 0.55); }); } catch (_) {}
}
function startRest(sec) { ensureAudio(); REST = { end: Date.now() + sec * 1000, total: sec * 1000, rang: false }; try { localStorage.setItem("nitfit:rest", JSON.stringify(REST)); } catch (_) {} clearInterval(restIv); restIv = setInterval(paintRest, 250); paintRest(); wakeOn(); }
function stopRest() { REST = null; clearInterval(restIv); try { localStorage.removeItem("nitfit:rest"); } catch (_) {} paintRest(); wakeOff(); }
function paintRest() {
  const pill = $("#restpill"), t = $("#restt");
  if (!REST) { if (pill) { pill.className = "restpill"; t.textContent = "Rest"; } return; }
  const left = REST.end - Date.now();
  if (left <= 0 && !REST.rang) { REST.rang = true; beep(); haptic(); setTimeout(() => { if (REST && REST.rang) stopRest(); }, 5000); }
  if (pill) { pill.className = "restpill " + (REST.rang ? "done" : "on"); t.textContent = REST.rang ? "Go" : restLeft(); }
  if (SHEET === "rest") { const x = $("#restBig"); if (x) x.textContent = REST.rang ? "0:00" : restLeft(); }
}
ACT.restSheet = () => openSheet("Rest Timer", "Soft chime when it ends", '<div id="restBig" style="font-size:56px;font-weight:500;text-align:center;margin:14px 0;font-variant-numeric:tabular-nums">' + (REST ? restLeft() : "0:00") + '</div><div class="tg"><button data-a="restAdd" data-v="-15">− 15 s</button><button data-a="restAdd" data-v="15">+ 15 s</button><button data-a="restSkip">Skip</button></div>', { name: "rest" });
ACT.restAdd = el => { if (!REST) startRest(0); REST.end += +el.dataset.v * 1000; REST.total = Math.max(REST.total, REST.end - Date.now()); REST.rang = false; paintRest(); };
ACT.restSkip = () => { stopRest(); closeSheet(); };
async function wakeOn() { try { if ("wakeLock" in navigator && !wake) wake = await navigator.wakeLock.request("screen"); } catch (_) {} }
function wakeOff() { try { if (wake) wake.release(); } catch (_) {} wake = null; }

// ===== history, calendar, plus =====
function vHistory() {
  const past = sessionsSorted().filter(s => s.endTs).reverse();
  let h = '<div class="nav"><button class="back" data-a="closePage">' + I.back + '</button><h3>Workout History</h3><span style="width:44px"></span></div><div class="body-pad">';
  if (!past.length) h += '<div class="card" style="padding:24px;text-align:center;margin-top:10px"><b>No workouts yet</b><p class="small">Your finished workouts show up here.</p></div>';
  else h += '<div class="card">' + past.map(s => '<button class="mrow press" data-a="viewSession" data-id="' + s.id + '"><div class="m"><b>' + esc(s.name) + "</b><span>" + niceDate(s.d) + " · " + sessionSets(s.id).length + " sets · " + fmtDur(Date.parse(s.endTs) - Date.parse(s.startTs)) + "</span></div>" + I.chev + "</button>").join("") + "</div>";
  return h + "</div>";
}
ACT.history = () => { closeSheet(); PAGE = { kind: "history" }; $("#page").scrollTop = 0; renderPage(); };
let CALM = null;
ACT.calendar = el => {
  if (!CALM || !(el && el.dataset && el.dataset.m)) CALM = today().slice(0, 7);
  if (el && el.dataset && el.dataset.m) CALM = el.dataset.m;
  const [y, m] = CALM.split("-").map(Number), first = new Date(y, m - 1, 1), start = addDays(dstr(first), -first.getDay()), t = today();
  const prev = dstr(new Date(y, m - 2, 1)).slice(0, 7), next = dstr(new Date(y, m, 1)).slice(0, 7);
  let h = '<div class="calnav"><button class="ib" data-a="calendar" data-m="' + prev + '">' + I.back + "</button><b>" + MONTHS_LONG[m - 1] + " " + y + '</b><button class="ib" data-a="calendar" data-m="' + next + '" style="transform:scaleX(-1)">' + I.back + "</button></div>";
  h += '<div class="calh">' + DAY2.map(x => "<span>" + x + "</span>").join("") + '</div><div class="cal">';
  for (let i = 0; i < 42; i++) { const x = addDays(start, i), out = x.slice(0, 7) !== CALM; h += '<div class="' + (out ? "out" : "") + (doneOn(x) ? " done" : "") + (x === t ? " today" : "") + '">' + +x.slice(8) + "</div>"; }
  h += '</div><div style="display:flex;gap:22px;justify-content:center;margin-top:16px;font-size:14px"><span style="display:flex;gap:8px;align-items:center"><i class="dotc" style="box-shadow:inset 0 0 0 2px var(--orange)"></i>Tracked</span><span style="display:flex;gap:8px;align-items:center"><i class="dotc" style="box-shadow:inset 0 0 0 1.5px var(--line)"></i>Untracked</span></div>';
  openSheet("Calendar", "", h, { name: "cal" });
};
ACT.plusMenu = () => {
  const act = activeSession(), dk = dayKeyFor(today());
  openSheet("Quick Add", "", (act ? '<button class="opt" data-a="resume"><span class="oi">' + I.dumb + '</span><div class="m"><b>Resume ' + esc(act.name) + "</b></div></button>"
    : (dk ? '<button class="opt" data-a="preview" data-day="' + dk + '"><span class="oi">' + I.dumb + '</span><div class="m"><b>Today: ' + esc(DAYS[dk].name) + "</b><span>Start your planned workout</span></div></button>" : ""))
    + '<button class="opt" data-a="weightSheet"><span class="oi">' + I.scale + '</span><div class="m"><b>Log weight</b></div></button>'
    + '<button class="opt" data-a="waistSheet"><span class="oi">' + I.tape + '</span><div class="m"><b>Log waist</b></div></button>'
    + '<button class="opt" data-a="measureSheet"><span class="oi">' + I.ruler + '</span><div class="m"><b>Log measurements</b><span>Arms, calf, neck, thigh, chest</span></div></button>'
    + (act ? "" : '<button class="opt" data-a="pickDay"><span class="oi">' + I.cal + '</span><div class="m"><b>Train a different day</b></div></button><button class="opt" data-a="emptyWorkout"><span class="oi">' + I.empty + '</span><div class="m"><b>Empty workout</b></div></button>'));
};
ACT.pickDay = () => openSheet("Which workout?", "", DAY_KEYS.map(k => '<button class="opt" data-a="preview" data-day="' + k + '"><div class="m"><b>' + esc(DAYS[k].name) + "</b><span>" + esc(DAYS[k].sub) + "</span></div>" + I.chev + "</button>").join(""));

// ===== body: weight, waist, measurements =====
function saveWeight(v) { const kg = numIn(v); if (kg == null) return; if (kg < 35 || kg > 150) return toast("Type it in kg"); addEvent("weight.logged", { kg: Math.round(kg * 10) / 10 }); haptic(); toast("Weight saved"); closeSheet(); render(); }
function saveWaist(v) { const inch = numIn(v); if (inch == null) return; if (inch < 20 || inch > 50) return toast("Type it in inches"); addEvent("waist.logged", { inch: Math.round(inch * 4) / 4 }); haptic(); toast("Waist saved"); closeSheet(); render(); }
ACT.weightSheet = () => {
  const w = S.weights[today()], tr = trendSeries(weightList());
  let h = '<input class="field" id="wEdit" inputmode="decimal" placeholder="Today in kg" value="' + (w ? w.kg : "") + '"><button class="big" style="margin-top:10px" data-a="saveW">Save</button><p class="hint">Morning, after you pee, before food or water. Same clothes, same scale.</p>';
  if (tr.length > 1) h += '<div class="sl">Trend</div><div class="chart">' + lineChart(tr.slice(-60).map(x => ({ d: x.d, v: x.trend, raw: x.kg }))) + "</div>";
  h += weightList().slice(-10).reverse().map(x => '<div class="kv"><span>' + niceDate(x.d) + "</span><b>" + x.kg.toFixed(1) + " kg</b></div>").join("");
  openSheet("Weight", tr.length ? "Trend " + tr[tr.length - 1].trend.toFixed(1) + " kg" : "Weigh in every morning", h, { tall: true });
};
ACT.saveW = () => saveWeight($("#wEdit").value);
ACT.waistSheet = () => {
  const ws = Object.values(S.waists).sort((a, b) => a.d < b.d ? 1 : -1);
  openSheet("Waist", "Every Saturday morning", '<input class="field" id="waEdit" inputmode="decimal" placeholder="Inches at the belly button"><button class="big" style="margin-top:10px" data-a="saveWa">Save</button>'
    + '<ol class="ol" style="margin-top:12px"><li>Morning, after you pee, before food.</li><li>Stand relaxed, breathe out normally. Don\'t suck in.</li><li>Tape at the belly button, level, snug not squeezing.</li></ol>'
    + ws.slice(0, 10).map(x => '<div class="kv"><span>' + niceDate(x.d) + "</span><b>" + x.inch + " in</b></div>").join(""));
};
ACT.saveWa = () => saveWaist($("#waEdit").value);
const MEAS = [["armR", "Arm, relaxed"], ["armF", "Arm, flexed"], ["calf", "Calf"], ["neck", "Neck"], ["thigh", "Thigh"], ["chest", "Chest"]];
ACT.measureSheet = () => {
  const last = Object.values(S.measures).sort((a, b) => a.d < b.d ? 1 : -1)[0] || {};
  openSheet("Measurements", "Inches, once a month", MEAS.map(([k, n]) => '<div class="kv" style="align-items:center"><span>' + n + '</span><input class="field" style="width:110px;height:42px;text-align:right" data-m="' + k + '" inputmode="decimal" placeholder="' + (last[k] || "in") + '"></div>').join("") + '<button class="big" style="margin-top:14px" data-a="saveMeas">Save</button>');
};
ACT.saveMeas = () => { const p = {}; $$("#sheet [data-m]").forEach(i => { const v = numIn(i.value); if (v != null) p[i.dataset.m] = v; }); if (!Object.keys(p).length) return toast("Type at least one"); addEvent("measure.logged", p); closeSheet(); toast("Saved"); render(); };

// ===== Levels =====
function vLevels() {
  const d = today(), mv = muscleSets(7 * LVRANGE, d), lv = {};
  ALL_MUSCLES.forEach(m => { const v = (mv[m] || 0) / LVRANGE; lv[m] = v > 0 ? Math.min(1, 0.15 + v / 18) : 0; });
  let h = head("Levels") + "</div><div class='body-pad'>";
  h += '<div class="bodywrap">' + bodySvg(FLIP, lv) + '<button class="ib rot" data-a="flip" aria-label="Turn around">' + I.rotate + "</button></div>";
  h += '<div class="legend"><i></i>Average weekly sets over <button data-a="lvRange">' + LVRANGE + "-week</button></div>";
  ["Upper", "Lower"].forEach(g => {
    h += "<h2>" + g + ' Body Levels</h2><div class="card">' + MUSCLE_GROUPS[g].map(m => { const v = (mv[m] || 0) / LVRANGE; return '<button class="lvrow press" data-a="muscle" data-m="' + esc(m) + '"><div class="thumb">' + muscleThumb(m) + '</div><div class="m"><b>' + esc(m) + "</b><span>" + fmtKg(Math.round(v * 10) / 10) + " sets</span></div>" + I.chev + "</button>"; }).join("") + "</div>";
  });
  return h + "</div>";
}
ACT.flip = () => { FLIP = FLIP === "front" ? "back" : "front"; SCROLL.levels = $("#main").scrollTop; render(); };
ACT.lvRange = () => { LVRANGE = LVRANGE === 1 ? 4 : 1; SCROLL.levels = $("#main").scrollTop; render(); };
ACT.muscle = el => {
  const m = el.dataset.m, d = today(), weeks = [];
  for (let w = 7; w >= 0; w--) { const end = addDays(d, -7 * w), v = muscleSets(7, end)[m] || 0; weeks.push(v); }
  const exs = EXERCISES.filter(e => tagsOf(e.id).includes(m));
  let h = '<div style="display:flex;gap:14px;align-items:center;margin-top:8px"><div class="thumb" style="width:84px;height:84px">' + muscleThumb(m) + '</div><div><div class="v" style="font-size:26px;font-weight:500">' + fmtKg(weeks[7]) + ' <small class="sub">sets this week</small></div><p class="small">Most growth happens between 10 and 20 hard sets a week.</p></div></div>';
  h += '<div class="sl">Last 8 weeks</div><div style="display:flex;justify-content:center">' + barsSvg(weeks, "var(--blue)", Math.max(20, ...weeks)).replace('width="110"', 'width="320"').replace(/height="56"/g, 'height="110"') + "</div>";
  h += '<div class="sl">Exercises for ' + esc(m) + "</div>" + exs.map(e => '<button class="opt" data-a="infoSheet" data-ex="' + e.id + '"><div class="thumb" style="width:44px;height:44px">' + thumbFor(e.id) + '</div><div class="m"><b>' + esc(e.n) + "</b><span>" + (tagsOf(e.id)[0] === m ? "Main muscle" : "Helps") + "</span></div>" + I.chev + "</button>").join("");
  openSheet(m, "Levels", h, { tall: true });
};

// ===== More =====
function vMore() {
  const st = syncStatus(), t = S.settings.theme || "dark";
  let h = head("More") + "</div><div class='body-pad'>";
  h += "<h2>Body</h2><div class='card'>"
    + '<button class="mrow press" data-a="weightSheet"><span class="mi">' + I.scale + '</span><div class="m"><b>Weight</b></div><span class="r">' + (weightList().length ? weightList().slice(-1)[0].kg.toFixed(1) + " kg" : "") + "</span>" + I.chev + "</button>"
    + '<button class="mrow press" data-a="waistSheet"><span class="mi">' + I.tape + '</span><div class="m"><b>Waist</b></div>' + I.chev + "</button>"
    + '<button class="mrow press" data-a="measureSheet"><span class="mi">' + I.ruler + '</span><div class="m"><b>Measurements</b></div>' + I.chev + "</button></div>";
  h += "<h2>Plan</h2><div class='card'>"
    + '<button class="mrow press" data-a="routine"><span class="mi">' + I.clock + '</span><div class="m"><b>Daily routine</b></div>' + I.chev + "</button>"
    + '<button class="mrow press" data-a="weeksInfo"><span class="mi">' + I.book + '</span><div class="m"><b>Program weeks</b><span>Week ' + programWeek(today()) + "</span></div>" + I.chev + "</button>"
    + '<button class="mrow press" data-a="toggleRest"><span class="mi">' + I.bell + '</span><div class="m"><b>Rest timer</b><span>Starts after each set</span></div><span class="r">' + (S.settings.restOn === false ? "Off" : "On") + "</span></button></div>";
  h += "<h2>Data</h2><div class='card'>"
    + '<button class="mrow press" data-a="backup"><span class="mi">' + I.cloud + '</span><div class="m"><b>Backup</b><span>' + esc(st.t) + '</span></div><span class="dotc" style="background:var(--' + (st.c === "green" ? "green" : st.c === "amber" ? "gold" : "red") + ')"></span></button>'
    + '<button class="mrow press" data-a="exportFile"><span class="mi">' + I.file + '</span><div class="m"><b>Save a backup file</b></div></button>'
    + '<button class="mrow press" data-a="importFile"><span class="mi">' + I.file + '</span><div class="m"><b>Load a backup file</b></div></button></div>';
  h += '<h2>Appearance</h2><div class="card" style="padding:12px"><div class="tg" style="margin:0"><button class="' + (t === "dark" ? "on" : "") + '" data-a="theme" data-v="dark">Dark</button><button class="' + (t === "light" ? "on" : "") + '" data-a="theme" data-v="light">Light</button></div></div>';
  h += '<p class="hint" style="text-align:center;margin-top:24px">NitFit ' + APP_VERSION + " · " + EV.length + " entries saved</p>";
  return h + "</div>";
}
ACT.theme = el => { addEvent("settings.upserted", { theme: el.dataset.v }); applyTheme(); haptic(); render(); };
ACT.toggleRest = () => { addEvent("settings.upserted", { restOn: S.settings.restOn === false }); render(); };
ACT.routine = () => { const dt = new Date(), now = dt.getHours() * 60 + dt.getMinutes(); openSheet("Daily Routine", "Your day", ROUTINE.map(r => { const mm = +r.t.slice(0, 2) * 60 + +r.t.slice(3); return '<div class="kv"><span style="' + (mm <= now ? "" : "color:var(--text)") + '">' + r.t + '</span><b style="text-align:right;font-weight:' + (mm <= now ? 400 : 500) + '">' + esc(r.n) + "</b></div>"; }).join("")); };
ACT.backup = () => {
  const st = syncStatus();
  let h = '<div class="kv"><span>Status</span><b>' + esc(st.t) + '</b></div><div class="kv"><span>Private repo</span><b>' + esc(repoName()) + "</b></div>";
  if (KV.token) h += '<button class="big" style="margin-top:14px" data-a="syncNow">Back up now</button><button class="big soft" style="margin-top:10px" data-a="newKey">Change key</button>';
  else h += keySteps();
  openSheet("Backup", "Saves to GitHub automatically", h, { name: "backup" });
};
function keySteps() {
  return '<ol class="ol" style="margin-top:12px"><li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank">github.com/settings/personal-access-tokens/new</a></li><li>Name: <b>NitFit backup</b>. Expiration: <b>No expiration</b>.</li><li>Repository access: <b>Only select repositories</b>, then <b>nitfit-data</b>.</li><li>Permissions: <b>Contents</b>, set to <b>Read and write</b>. Tap <b>Generate token</b> and copy it.</li></ol>'
    + '<input class="field" id="keyIn" placeholder="Paste the key here" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="big" style="margin-top:10px" data-a="connect">Connect</button><p class="hint" id="keyErr"></p>';
}
ACT.newKey = () => openSheet("Change key", "", keySteps());
ACT.connect = async el => { const err = $("#keyErr"); el.textContent = "Connecting..."; err.textContent = ""; try { await connectKey($("#keyIn").value); toast("Backed up"); closeSheet(); render(); } catch (e) { err.textContent = e.message; err.classList.add("err"); el.textContent = "Connect"; } };
ACT.syncNow = async () => { toast("Backing up..."); const ok = await syncNow(true); toast(ok ? "Backed up" : (KV.syncErr || "Could not back up")); if (SHEET === "backup") ACT.backup(); };
function syncPaint() {}
ACT.exportFile = () => { const blob = new Blob([JSON.stringify(buildExport())], { type: "application/json" }), a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "nitfit-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove(); };
ACT.importFile = () => $("#importIn").click();

// ----- charts -----
function lineChart(pts) {
  const W = 340, H = 140, pl = 4, pr = 34, pt = 8, pb = 20;
  let vs = pts.map(p => p.v).concat(pts.filter(p => p.raw != null).map(p => p.raw)), lo = Math.min(...vs), hi = Math.max(...vs);
  if (hi - lo < 1) { lo -= 0.5; hi += 0.5; } const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const t0 = dayNum(pts[0].d), t1 = Math.max(t0 + 1, dayNum(pts[pts.length - 1].d));
  const X = d => pl + (dayNum(d) - t0) / (t1 - t0) * (W - pl - pr), Y = v => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const P = pts.map(p => [X(p.d), Y(p.v)]);
  let d = "M" + P[0][0].toFixed(1) + " " + P[0][1].toFixed(1);
  for (let i = 1; i < P.length; i++) { const a = P[i - 2] || P[i - 1], b = P[i - 1], c = P[i], e = P[i + 1] || c; d += " C" + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + " " + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + " " + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + " " + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + " " + c[0].toFixed(1) + " " + c[1].toFixed(1); }
  let s = '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none">';
  [hi - pad, lo + pad].forEach(v => { s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="var(--line)" stroke-dasharray="2 4"/><text x="' + (W - pr + 6) + '" y="' + (Y(v) + 4).toFixed(1) + '">' + Math.round(v * 10) / 10 + "</text>"; });
  pts.forEach(p => { if (p.raw != null) s += '<circle cx="' + X(p.d).toFixed(1) + '" cy="' + Y(p.raw).toFixed(1) + '" r="2" fill="var(--text3)"/>'; });
  s += '<path d="' + d + '" fill="none" stroke="var(--blue)" stroke-width="2.4" stroke-linecap="round" vector-effect="non-scaling-stroke"/>';
  s += '<text x="' + pl + '" y="' + (H - 3) + '">' + niceDate(pts[0].d) + '</text><text x="' + (W - pr) + '" y="' + (H - 3) + '" text-anchor="end">' + niceDate(pts[pts.length - 1].d) + "</text>";
  return s + "</svg>";
}

// ----- tabs and taps -----
ACT.tab = el => { const t = el.dataset.tab; SCROLL[TAB] = $("#main").scrollTop; if (t === TAB) { $("#main").scrollTo({ top: 0, behavior: "smooth" }); return; } TAB = t; haptic(); render(); };
document.addEventListener("click", e => { const el = e.target.closest("[data-a]"); if (!el) return; const f = ACT[el.dataset.a]; if (f) { e.preventDefault(); f(el, e); } });
document.addEventListener("DOMContentLoaded", () => {
  $("#importIn").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { const n = await importExport(JSON.parse(await f.text())); toast(n + " entries loaded"); render(); } catch (er) { toast(er.message || "Could not read that file"); } e.target.value = ""; });
});

// ----- boot -----
async function boot() {
  try { await coreBoot(); } catch (e) { $("#main").innerHTML = '<div class="head"><div class="title">NitFit</div></div><p class="hint" style="padding:20px">NitFit could not open its storage. Close it and open it again.</p>'; return; }
  applyTheme(); render();
  try { const r = JSON.parse(localStorage.getItem("nitfit:rest") || "null"); if (r && r.end > Date.now()) { REST = r; restIv = setInterval(paintRest, 250); } } catch (_) {}
  if (activeSession()) { PAGE = { kind: "log" }; renderPage(); }
  if (KV.token) syncNow(true);
  if ("serviceWorker" in navigator && isStandalone()) navigator.serviceWorker.register("sw.js").catch(() => {});
  setInterval(() => { const s = activeSession(), el = $("#clock"); if (s && el) el.textContent = fmtClock(Date.now() - Date.parse(s.startTs)); }, 1000);
  let lastDay = today();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "visible") return; if (today() !== lastDay) { lastDay = today(); render(); } if (KV.token) syncNow(); if (REST) paintRest(); });
}
boot();
