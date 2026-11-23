// ---------------------------------------------------------------------------
// NitFit screens: Dashboard, Workout, Levels, More, plus the workout preview
// and the logging screen. Bottom sheets for everything else.
// ---------------------------------------------------------------------------
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const ACT = {};
let TAB = "dashboard", PAGE = null, LOGI = null, FLIP = "front", LVRANGE = 1, RINGMODE = "program", PROGOPEN = true;
const SCROLL = {}, WARM = {}, PENDRIR = {}, DRAFT = {};
let STACK = [], CALOPEN = false, LIBOPEN = true, INFOTAB = "Instructions", INFO_ID = null, TED = null, ENTRY_D = null;
const RNG = {}, AVG = {}, PTAB = {}, CALM2 = {};
const setOn = (k, def) => { const v = S.settings[k]; return v == null ? (def == null ? true : def) : v !== false; };
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
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 001.5.9l10-6.5a1 1 0 000-1.7l-10-6.5A1 1 0 008 5.5z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="6.5" width="11" height="11" rx="2"/></svg>',
  flag: ico('<path d="M6 21V4M6 4.5h10.5l-2 4 2 4H6"/>'),
  gear: ico('<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>'),
  mini: ico('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 15.5h8"/>'),
  sliders: ico('<path d="M5 7h9M18 7h1M5 12h3M12 12h7M5 17h11M20 17h-1"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="17" r="2"/>'),
  trash: ico('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>'),
  pencil: ico('<path d="M4 20l1-4L16 5l3 3L8 19z"/>'),
  sun: ico('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  next: ico('<path d="M6 6l6 6-6 6M13 6l6 6-6 6"/>'),
  gym: ico('<path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6"/>'),
  down: '<svg class="dn" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l3 3 3-3"/></svg>',
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
  const t = (S && S.settings.theme) || "dark", r = t === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : t;
  document.documentElement.dataset.theme = r;
  try { localStorage.setItem("nitfit:theme", r); } catch (_) {}
  const m = $('meta[name="theme-color"]'); if (m) m.content = r === "light" ? "#fbfbf9" : "#181818";
}

// ----- sheets -----
let SHEET = null;
function openSheet(title, sub, html, opts) {
  opts = opts || {}; SHEET = opts.name || title;
  const sh = $("#sheet");
  sh.classList.toggle("tall", !!opts.tall);
  if (opts.titleHtml) $(".shd h3", sh).innerHTML = opts.titleHtml; else $(".shd h3", sh).textContent = title;
  $(".shd p", sh).textContent = sub || ""; $(".shd p", sh).hidden = !sub;
  $(".shd .shr", sh).innerHTML = opts.right || "";
  $(".sbody", sh).innerHTML = html; if (!opts.keep) $(".sbody", sh).scrollTop = 0;
  sh.style.transform = ""; $("#scrim").classList.add("on"); sh.classList.add("on");
}
function closeSheet() { if (GP) gpClose(); SHEET = null; $("#sheet").classList.remove("on"); $("#scrim").classList.remove("on"); $("#sheet").style.transform = ""; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
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
function thumbFor(exId) { return '<img class="ti" loading="lazy" decoding="async" alt="" src="thumbs-v3/e-' + exId + '.webp">'; }
function muscleThumb(m) { return '<img class="ti" loading="lazy" decoding="async" alt="" src="thumbs-v3/m-' + encodeURIComponent(m) + '.webp">'; }

const shortName = id => { let n = ((getEx(id) || {}).n || "").split(",")[0].trim(); const t = n.replace(/^(Dumbbell|Barbell|Cable|Machine|Smith|Standing|Seated|One-arm|Chest-supported|Weighted|Single-arm)\s+/i, ""); if (t.split(" ").length >= 2) n = t; n = n.charAt(0).toUpperCase() + n.slice(1); return n.length > 13 ? n.slice(0, 12) + "…" : n; };
function rirFor(ex, it, week, n) { const d = rirTargets(ex, it, week, n); if (it.rirs) for (let k = 0; k < n; k++) if (it.rirs[k] != null) d[k] = it.rirs[k]; return d; }
// first-time starting weights (kg; dumbbells are per hand). Light on purpose: week 1 and 2 stop with 3 reps left.
const START = { squat: 40, smith_squat: 30, leg_press: 60, leg_press_high: 50, bulgarian: 8, leg_ext: 25, leg_curl: 25, rdl: 40, good_morning: 20, hip_thrust: 40, abductor: 30, calf_standing: 30, calf_seated: 20, lunge: 8, neck_flex: 5, neck_side: 2.5,
  inc_smith_press: 30, inc_db_press: 14, flat_db_press: 16, mach_inc_press: 30, mach_inc_fly: 25, cable_fly_low: 7.5, pec_deck: 25, flat_smith: 35, preacher_curl: 8, incline_curl: 7.5, db_curl: 10, rope_hammer: 15, cable_curl: 15, hammer_curl: 10,
  tri_overhead: 15, tri_pushdown: 20, rope_pushdown: 17.5, skullcrusher: 8, reverse_curl: 6, wrist_curl: 8, pulldown: 40, pulldown_close: 40, rope_pullover: 15, chest_sup_row: 14, cable_row: 40, db_row: 18, straight_arm: 15, y_raise: 2.5, shrug: 16,
  cable_ohp_1arm: 7.5, bb_ohp: 25, db_ohp: 12, cable_lat_raise: 5, db_lat_raise: 6, rev_pec_deck: 20, face_pull: 15, cable_crunch: 25 };
// how many reps you can do at kg, leaving rir in the tank, from a set you already did (Epley)
function repsAt(kg, ref, refRir, rir) { if (!kg || !ref.kg) return null; const e1 = ref.kg * (1 + (ref.reps + refRir) / 30); return Math.floor(30 * (e1 / kg - 1) + 0.25) - rir; }
// ----- targets for the live workout -----
const TGT = {};
function rowsFor(sess, i) {
  const it = sess.items[i], ex = exFor(it); if (!ex) return null;
  const key = sess.id + ":" + i + ":" + it.ex + ":" + it.n + ":" + (it.r || ex.r).join("-");
  const week = programWeek(sess.d), rirT = rirFor(ex, it, week, it.n);
  if (!TGT[key]) {
    const prev = lastFinishedBefore(sess.d), gap = prev ? daysBetween(prev.d, sess.d) : 0;
    let b = smartTarget(ex, histFor(it.ex, sess.id), { sets: it.n, gap, easy: week <= 2, light: !!it.light });
    if (b.kg == null && ex.eq !== "bw" && START[it.ex]) b = Object.assign({}, b, { kg: START[it.ex], guess: true, reason: "First time on this one. Start at " + fmtKg(START[it.ex]) + " kg" + (ex.eq === "db" ? " in each hand" : "") + ". If that is clearly too light or too heavy, type what you really used and the next sets fix themselves." });
    TGT[key] = b;
  }
  const base = TGT[key], logged = loggedByIdx(sess, it.ex);
  const live = liveRows(ex, base, logged, rirT);
  if (!setOn("smart")) { live.rows.forEach(r => { if (!r.done) { r.kg = base.kg; r.adjusted = false; } }); live.events = []; }
  if (it.rr) live.rows.forEach((r, k) => { if (it.rr[k]) { r.lo = it.rr[k][0]; r.hi = it.rr[k][1]; } });
  // exact reps for every set still to do
  const done = Object.values(logged).filter(x => x.reps > 0).sort((a, b) => a.idx - b.idx), ref = done[done.length - 1];
  live.rows.forEach((r, k) => {
    if (r.done) { const st = logged[k]; if (st && st.tReps != null) { r.reps = st.tReps; if (st.tKg != null) r.kg = st.tKg; } return; }
    let n = null;
    if (ref) {
      const refRir = ref.rir != null ? ref.rir : (rirT[ref.idx] != null ? rirT[ref.idx] : 2), extra = Math.floor(Math.max(0, k - ref.idx - 1) / 2);
      n = ex.eq === "bw" || !r.kg ? ref.reps + (refRir - r.rir) - extra : repsAt(r.kg, ref, refRir, r.rir);
      if (n != null) n -= ex.eq === "bw" || !r.kg ? 0 : extra;
    } else if (r.reps != null) n = r.reps;
    if (n == null) n = Math.round((r.lo + r.hi) / 2);
    r.reps = Math.max(r.lo, Math.min(r.hi, n));
  });
  return { ex, base, rirT, logged, rows: live.rows, events: live.events };
}
function loggedByIdx(sess, exId) { const out = {}; sessionSets(sess.id).filter(x => x.exId === exId).forEach(x => { out[x.idx] = x; }); return out; }
function warmLogged(sess, exId) { const out = {}; sessionAllSets(sess.id).filter(x => x.exId === exId && x.w).forEach(x => { out[x.idx] = x; }); return out; }
const autoTxt = (r, ex) => (r.kg ? fmtKg(r.kg) + " kg × " : "") + (r.reps != null ? r.reps : (r.lo === r.hi ? r.lo : r.lo + "-" + r.hi)) + (r.kg ? "" : ex.t ? " sec" : " reps");

// ===== render =====
function blurAll() { const a = document.activeElement; if (a && a !== document.body && a.blur && !(a.closest && a.closest("#sheet"))) a.blur(); }
function render() {
  blurAll(); if (GP && !SHEET) gpClose();
  if (!isStandalone() && !/dev/.test(location.search)) { $("#main").innerHTML = vInstall(); $("#tabs").hidden = true; return; }
  const m = $("#main");
  const keep = m.dataset.tab === TAB ? m.scrollTop : (SCROLL[TAB] || 0);
  m.innerHTML = TAB === "dashboard" ? vDash() : TAB === "workout" ? vWorkoutTab() : TAB === "levels" ? vLevels() : vProfile();
  m.dataset.tab = TAB; if (TAB === "levels") attachBody2d(); m.scrollTop = keep; LASTY = m.scrollTop; ACC = 0; FOLDLOCK = Date.now() + 400; if (keep < 40) document.body.classList.remove("tsmall");
  $$("#tabs [data-tab]").forEach(b => b.classList.toggle("on", b.dataset.tab === TAB)); tabsPill();
  const pg = $("#pager"); if (pg) pg.addEventListener("scroll", () => { const i = Math.round(pg.scrollLeft / pg.clientWidth); $$(".pdots i").forEach((d, k) => d.classList.toggle("on", k === i)); }, { passive: true });
  renderPage();
}
function renderPage(keepScroll) {
  const pg = $("#page"), y = pg.scrollTop; blurAll();
  if (KP && (!PAGE || PAGE.kind !== "log" || !activeSession())) { KP = null; document.body.classList.remove("kpon"); $("#kp").classList.remove("on"); }
  document.body.classList.toggle("pageon", !!PAGE);
  if (!PAGE) { pg.classList.remove("on"); $("#tabs").hidden = false; paintMini(); return; }
  if (PAGE.kind === "log" && !activeSession()) { PAGE = null; STACK = []; return renderPage(); }
  const K = PAGE.kind;
  pg.innerHTML = K === "preview" ? vPreview(PAGE.dayKey) : K === "log" ? vLog() : K === "history" ? vHistory() : K === "wset" ? vWset()
    : K === "workouts" ? vWorkouts() : K === "muscle" ? vMuscle(PAGE.m) : K === "exercise" ? vExercise(PAGE.ex) : K === "wtrend" ? vWTrend()
    : K === "scale" ? vScale("weights") : K === "waist" ? vScale("waists") : K === "weighin" ? vHabit("weights") : K === "wohabit" ? vHabit("workouts")
    : K === "exlist" ? vExList() : K === "dashcust" ? vDashCust() : K === "settings" ? vSettings() : "";
  pg.classList.add("on"); $("#tabs").hidden = true; paintMini();
  if (keepScroll) pg.scrollTop = y;
  const on = $("#strip .st.on"); if (on) { const st = $("#strip"); st.scrollLeft = Math.max(0, on.offsetLeft - st.clientWidth / 2 + on.clientWidth / 2); }
  if (K === "log" && setOn("keepAlive")) wakeOn();
}
function openPage(p) { if (PAGE) STACK.push(PAGE); else SCROLL[TAB] = $("#main").scrollTop; PAGE = p; closeSheet(); $("#page").scrollTop = 0; renderPage(); }
ACT.pageBack = () => { PAGE = STACK.pop() || null; $("#page").scrollTop = 0; renderPage(); if (!PAGE) { const y = $("#main").scrollTop; render(); $("#main").scrollTop = y; } };
const nav = (title, right) => '<div class="nav"><button class="back" data-a="pageBack">' + I.back + "</button><h3>" + esc(title) + "</h3>" + (right || '<span style="width:44px"></span>') + "</div>";
function vInstall() {
  return '<div class="head"><div class="title">NitFit</div></div><div class="body-pad"><div class="card" style="padding:18px;margin-top:16px"><b>Open NitFit from its own icon.</b>'
    + '<ol class="ol" style="margin-top:10px"><li>Tap <b>Share</b> at the bottom of Safari.</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li><li>Open <b>NitFit</b> from the new icon.</li></ol></div></div>';
}
function head(title, eyebrow, icons) {
  return '<div class="head">' + (eyebrow ? '<div class="eyebrow">' + esc(eyebrow) + "</div>" : "") + '<div class="trow"><div class="title">' + esc(title) + '</div><div class="icons">' + (icons || "") + "</div></div>";
}

// ===== Dashboard =====
function weekStats(mode) {
  const d0 = weekSun(today()), plan = { sets: 0, ex: new Set(), mus: new Set() }, done = { sets: 0, ex: new Set(), mus: new Set() }, last = { sets: 0, ex: new Set(), mus: new Set() };
  for (let i = 0; i < 7; i++) { const d = addDays(d0, i), dk = dayKeyFor(d); if (!dk) continue; itemsForDay(dk, d).forEach(it => { plan.sets += it.n; plan.ex.add(it.ex); plan.mus.add(tagsOf(it.ex)[0]); }); }
  const add = (o, s) => sessionSets(s.id).forEach(x => { o.sets++; o.ex.add(x.exId); o.mus.add(tagsOf(x.exId)[0]); });
  sessionsSorted().forEach(s => {
    if (mode !== "all" && !s.dayKey) return;
    if (s.d >= d0 && s.d <= addDays(d0, 6)) add(done, s); else if (s.d >= addDays(d0, -7) && s.d < d0) add(last, s);
  });
  return { plan, done, last };
}
function ringSvg(size, stroke, frac, color) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--chip)" stroke-width="' + stroke + '"/>'
    + '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + (c * f).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/></svg>';
}
function ring(label, val, tgt, size, color, big) {
  return '<div class="ring' + (big ? " bigr" : "") + '"><div class="rv">' + ringSvg(size, big ? 4 : 3.5, tgt ? val / tgt : 0, color) + "<div><b>" + val + "</b><small>" + Math.max(0, tgt - val) + " left</small></div></div>"
    + '<div class="rl">' + label + '</div><div class="rt">' + tgt + " target</div></div>";
}
const DPOOL = {
  insights: { n: "Insights & Analytics", short: "Insights", tiles: ["workouts", "wtrend"] },
  habits: { n: "Habits", short: "Habits", tiles: ["weighin", "wohabit"] },
  body: { n: "Body Metrics", short: "Body Metrics", tiles: ["scale", "waist", "bf"] },
  muscles: { n: "Muscle Groups", short: "Muscle Groups", tiles: () => ALL_MUSCLES.map(m => "m:" + m) },
  exercises: { n: "Exercises", short: "Exercises", tiles: () => EXERCISES.map(e => "e:" + e.id) } };
const poolOf = k => typeof DPOOL[k].tiles === "function" ? DPOOL[k].tiles() : DPOOL[k].tiles;
function dashLayout() {
  const L = S.settings.dash;
  if (L && L.secs) return clone(L);
  const hide = S.settings.dashHide || [];
  return { pages: ["rings", "records"], secs: [["insights", ["workouts", "wtrend"]], ["habits", ["weighin", "wohabit"]], ["body", ["scale", "waist"]], ["muscles", ["m:Side Delts", "m:Lats"]], ["exercises", topExercises().map(x => "e:" + x)]]
    .map(([k, t]) => ({ k, tiles: hide.includes(k) ? [] : t })) };
}
const TILE_NAME = id => ({ workouts: "Workouts", wtrend: "Weight Trend", weighin: "Weigh-In", wohabit: "Workouts", scale: "Scale Weight", waist: "Waist", bf: "Body Fat" })[id] || (id.startsWith("m:") ? id.slice(2) : (getEx(id.slice(2)) || {}).n || id);
function tileIcon(id) {
  const sv = b => '<svg viewBox="0 0 32 24">' + b + "</svg>";
  if (id === "workouts") return sv('<rect x="4" y="9" width="6" height="11" rx="1" fill="var(--orange)"/><rect x="13" y="4" width="6" height="16" rx="1" fill="var(--orange)"/><rect x="22" y="15" width="6" height="5" rx="1" fill="var(--orange)"/>');
  if (id === "wtrend") return sv('<path d="M3 13l7 6L29 4" fill="none" stroke="var(--purple)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>');
  if (id === "weighin" || id === "wohabit") { const c = id === "weighin" ? "var(--green)" : "var(--orange)"; return sv('<rect x="3" y="9" width="7" height="7" rx="1.5" fill="' + c + '"/><rect x="12.5" y="9" width="7" height="7" rx="1.5" fill="' + c + '"/><rect x="22" y="9" width="7" height="7" rx="1.5" fill="' + c + '"/>'); }
  if (id === "scale" || id === "waist" || id === "bf") return sv('<path d="M3 16l7-5 6 3 13-9" fill="none" stroke="var(--green)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>');
  if (id.startsWith("m:")) return muscleThumb(id.slice(2));
  return thumbFor(id.slice(2));
}
function tileHtml(id) {
  const d = today();
  if (id === "workouts") { const sv = sessionsSorted().filter(s2 => s2.endTs).slice(-7).map(s2 => sessionSets(s2.id).length); return card2("openPage", ' data-k="workouts"', "Workouts", "Last 7 Workouts", barsSvg(sv, "var(--orange)"), sv.length ? sv[sv.length - 1] : "--", "sets"); }
  if (id === "wtrend") { const tr = trendSeries(weightList()), l7 = tr.filter(x => x.d >= addDays(d, -6)); return card2("openPage", ' data-k="wtrend"', "Weight Trend", "Last 7 Days", dotLine(l7.map(x => x.trend), "var(--purple)"), tr.length ? tr[tr.length - 1].trend.toFixed(1) : "--", "kg"); }
  if (id === "weighin" || id === "wohabit") {
    const w = id === "weighin", days30 = Array.from({ length: 30 }, (_, i) => addDays(d, i - 29)), wk0 = weekSun(d);
    const n = w ? Object.keys(S.weights).filter(x => x >= wk0).length : sessionsSorted().filter(s2 => s2.d >= wk0 && s2.endTs && sessionSets(s2.id).length).length;
    return card2("openPage", ' data-k="' + id + '"', w ? "Weigh-In" : "Workouts", "Last 30 Days", '<div class="dots">' + days30.map(x => "<i" + ((w ? S.weights[x] : doneOn(x)) ? (w ? ' class="g"' : ' class="o"') : "") + "></i>").join("") + "</div>", w ? n + "/7" : n, "this week");
  }
  if (id === "scale" || id === "bf") { const wl = weightList().filter(x => id === "scale" || x.bf != null).slice(-7), v = x => id === "scale" ? x.kg : x.bf; return card2("openPage", ' data-k="scale"', TILE_NAME(id), "Last 7 Entries", dotLine(wl.map(v), "var(--green)"), wl.length ? v(wl[wl.length - 1]).toFixed(1) : "--", id === "scale" ? "kg" : "%"); }
  if (id === "waist") { const ws = Object.values(S.waists).sort((a, b) => a.d < b.d ? -1 : 1).slice(-7); return card2("openPage", ' data-k="waist"', "Waist", "Last 7 Entries", dotLine(ws.map(x => x.inch), "var(--green)"), ws.length ? ws[ws.length - 1].inch : "--", "in"); }
  if (id.startsWith("m:")) { const m = id.slice(2), v = muscleSets(7, d)[m]; return card2("muscle", ' data-m="' + esc(m) + '"', m, "Last 7 Days", '<div class="thumb mthumb">' + muscleThumb(m) + "</div>", v ? fmtKg(v) : "--", v === 1 ? "set" : "sets"); }
  const ex = id.slice(2), hs = histFor(ex).slice(-7), v = hs.map(x => Math.max(...x.sets.map(s2 => e1rm(s2.kg || 0, s2.reps))));
  return card2("openEx", ' data-ex="' + ex + '"', TILE_NAME(id), "Last 7 Workouts", barsSvg(v.map(Math.round), "var(--blue)"), v.length ? fmtKg(Math.round(v[v.length - 1] * 2) / 2) : "--", "kg 1-RM");
}
const DASH_SECS = [["insights", "Insights & Analytics"], ["habits", "Habits"], ["body", "Body Metrics"], ["muscles", "Muscle Groups"], ["exercises", "Exercises"]];
const dashOn = k => !(S.settings.dashHide || []).includes(k);
const card2 = (act, extra, title, sub, viz, val, unit) => '<button class="ic press" data-a="' + act + '"' + (extra || "") + "><b>" + esc(title) + '</b><span class="p">' + sub + '</span><div class="viz">' + viz + '</div><div class="v">' + val + "<small>" + unit + "</small></div>" + I.chev + "</button>";
// ===== Dashboard (Apple style) =====
const D2N = { insights: "Insights & analytics", habits: "Habits", body: "Body metrics", muscles: "Muscle groups", exercises: "Exercises" };
const D2T = id => ({ workouts: "Workouts", wtrend: "Weight trend", weighin: "Weigh-in", wohabit: "Workouts", scale: "Scale weight", waist: "Waist", bf: "Body fat" })[id] || TILE_NAME(id);
const D2A = "#0A84FF", D2OFF = "currentColor";
const d2num = (v, unit) => '<div class="d2n">' + v + (unit ? "<small>" + unit + "</small>" : "") + "</div>";
const d2sign = v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
// a ring of separate little dashes, one per target item, lit when done
function tickRing(size, n, lit, big) {
  const N = n > 0 ? n : 60, c = size / 2, ro = c - 2, len = big ? 11 : 8, w = N > 80 ? 2.2 : N > 40 ? 2.6 : 3;
  let s = '<svg class="tr" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '">';
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 2 * Math.PI - Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
    s += '<line x1="' + (c + ca * (ro - len)).toFixed(2) + '" y1="' + (c + sa * (ro - len)).toFixed(2) + '" x2="' + (c + ca * ro).toFixed(2) + '" y2="' + (c + sa * ro).toFixed(2) + '" stroke="' + (n > 0 && i < lit ? D2A : D2OFF) + '" stroke-width="' + w + '" stroke-linecap="round"/>';
  }
  return s + "</svg>";
}
// weekly score out of 100: sets count for half, exercises and muscles a quarter each
function weekScore(done, plan) {
  const f = (a, b) => b ? Math.min(1, a / b) : 0;
  return Math.round(100 * (0.5 * f(done.sets, plan.sets) + 0.25 * f(done.ex.size, plan.ex.size) + 0.25 * f(done.mus.size, plan.mus.size)));
}
function solidRing(v, frac, sub, color, track) {
  const S = 104, w = 10, r = (S - w) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
  return '<div class="rv"><svg width="' + S + '" height="' + S + '" viewBox="0 0 ' + S + " " + S + '"><circle cx="52" cy="52" r="' + r + '" fill="none" style="stroke:' + track + '" stroke-width="' + w + '"/>'
    + (f > 0 ? '<circle class="arc" cx="52" cy="52" r="' + r + '" fill="none" style="stroke:' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-dasharray="' + (c * f).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 52 52)"/>' : "") + "</svg>"
    + '<div class="rc"><b>' + v + "</b><small>" + sub + "</small></div></div>";
}
function ringsHtml() {
  const st = weekStats(RINGMODE), all = RINGMODE === "all", p = st.plan, dn = st.done, ls = st.last;
  const sc = weekScore(dn, p), scL = weekScore(ls, p), diff = sc - scL;
  const one = (label, ring, foot) => '<div class="d3r">' + ring + '<div class="rl">' + label + '</div><div class="rt">' + foot + "</div></div>";
  const setsFrac = all ? dn.sets / Math.max(1, ls.sets, dn.sets) : dn.sets / Math.max(1, p.sets), exFrac = all ? dn.ex.size / Math.max(1, ls.ex.size, dn.ex.size) : dn.ex.size / Math.max(1, p.ex.size);
  let h = '<div class="d3rings">'
    + one("Sets", solidRing(dn.sets, setsFrac, "done", "#FF6B6B", "rgba(255,107,107,.2)"), all ? ls.sets + " last week" : "of " + p.sets)
    + one("Training score", solidRing(sc, sc / 100, "of 100", "var(--dt)", "var(--dtrk)"), (diff > 0 ? "+" : diff < 0 ? "−" : "") + Math.abs(diff) + " vs last week")
    + one("Exercises", solidRing(dn.ex.size, exFrac, "done", "#7AB8F5", "rgba(122,184,245,.2)"), all ? ls.ex.size + " last week" : "of " + p.ex.size) + "</div>";
  // pace: how many planned sets should be done by the end of today
  const d = today(), w0 = weekSun(d); let due = 0;
  for (let i = 0; i < 7; i++) { const x = addDays(w0, i); if (x >= d) break; const dk = dayKeyFor(x); if (dk) itemsForDay(dk, x).forEach(it => due += it.n); }
  const left = Math.max(0, p.sets - dn.sets);
  const msg = !p.sets ? "No program sets planned this week."
    : left === 0 ? "Week done. <b>" + dn.sets + " sets</b> logged."
    : (dn.sets >= due ? "You're on pace. " : "A bit behind. ") + "<b>" + left + " sets</b> left this week.";
  return h + '<div class="d3pace"><svg viewBox="0 0 20 20" width="18" height="18"><path d="M3 14l5-5 3 3 6-6M13 6h4v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + msg + "</span></div>";
}
// smooth line through points (Catmull-Rom turned into curves)
function d2path(P) {
  if (P.length < 2) return "";
  let d = "M" + P[0][0].toFixed(1) + " " + P[0][1].toFixed(1);
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2, k = 1 / 6;
    d += " C" + (p1[0] + (p2[0] - p0[0]) * k).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) * k).toFixed(1) + " " + (p2[0] - (p3[0] - p1[0]) * k).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) * k).toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
  }
  return d;
}
let D2G = 0;
function d2chart(vals, W, H, o) {
  o = o || {}; const pts = vals.map((v, i) => [i, v]).filter(p => p[1] != null);
  if (!pts.length) return '<svg class="d2v" width="' + W + '" height="' + H + '"><line x1="2" y1="' + (H - 2) + '" x2="' + (W - 2) + '" y2="' + (H - 2) + '" stroke="currentColor" stroke-opacity=".25" stroke-width="1.5" stroke-dasharray="2 4" stroke-linecap="round"/></svg>';
  const lo = Math.min(...pts.map(p => p[1])), hi = Math.max(...pts.map(p => p[1])), sp = hi - lo || 1, n = Math.max(vals.length - 1, 1), pad = o.dots ? 4 : 2;
  const P = pts.map(p => [pad + p[0] / n * (W - pad * 2), hi === lo ? H / 2 : pad + (1 - (p[1] - lo) / sp) * (H - pad * 2 - (o.fill ? 6 : 0))]);
  const line = d2path(P), id = "d2g" + (++D2G), col = o.color || "currentColor";
  let s = '<svg class="d2v" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '">';
  if (o.fill && P.length > 1) s += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".28"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs><path d="' + line + " L" + P[P.length - 1][0].toFixed(1) + " " + H + " L" + P[0][0].toFixed(1) + " " + H + ' Z" fill="url(#' + id + ')"/>';
  if (P.length > 1) s += '<path d="' + line + '" fill="none" stroke="' + col + '" stroke-width="' + (o.w || 2) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  if (o.dots) s += P.map((p, i) => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i === P.length - 1 ? 3.6 : 2.2) + '" fill="' + col + '"' + (i === P.length - 1 ? "" : ' fill-opacity=".55"') + "/>").join("");
  else { const L = P[P.length - 1]; s += '<circle cx="' + L[0].toFixed(1) + '" cy="' + L[1].toFixed(1) + '" r="3" fill="' + col + '"/>'; }
  return s + "</svg>";
}
function d2bars(vals, W, H) {
  const n = Math.max(vals.length, 1), mx = Math.max(1, ...vals), bw = 7, gap = (W - n * bw) / Math.max(n - 1, 1);
  return '<svg class="d2v" width="' + W + '" height="' + H + '">' + (vals.length ? vals.map((v, i) => { const h = Math.max(6, v / mx * H); return '<rect x="' + (i * (bw + Math.min(gap, 9))).toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + bw + '" height="' + h.toFixed(1) + '" rx="3.5" fill="currentColor"' + (i === vals.length - 1 ? "" : ' fill-opacity=".3"') + "/>"; }).join("")
    : Array.from({ length: 7 }, (_, i) => '<rect x="' + i * 14 + '" y="' + (H - 6) + '" width="7" height="6" rx="3" fill="currentColor" fill-opacity=".2"/>').join("")) + "</svg>";
}
// change over the last 7 days: newest entry minus the newest entry on or before 7 days ago
function d2delta(list, key, d) {
  if (!list.length) return null; const last = list[list.length - 1], cut = addDays(d, -7), old = list.filter(x => x.d <= cut).pop();
  return old ? last[key] - old[key] : null;
}
const d2card = (act, extra, title, sub, body, foot) => '<button class="d2c press" data-a="' + act + '"' + (extra || "") + '><div class="d2h"><b>' + esc(title) + "</b>" + I.chev + '</div><span class="d2s">' + sub + '</span><div class="d2b">' + body + '</div><div class="d2f">' + foot + "</div></button>";
function d2tile(id) {
  const d = today(), wk0 = weekSun(d);
  if (id === "workouts") {
    const fin = sessionsSorted().filter(s2 => s2.endTs && sessionSets(s2.id).length), sv = fin.slice(-7).map(s2 => sessionSets(s2.id).length);
    const done = fin.filter(s2 => s2.d >= wk0).length; let plan = 0; for (let i = 0; i < 7; i++) { const x = addDays(wk0, i), dk = dayKeyFor(x); if (dk && planFor(dk).length) plan++; }
    return d2card("openPage", ' data-k="workouts"', "Workouts", "This week", '<div class="d2row">' + d2num(done) + d2bars(sv, 70, 44) + "</div>", "of " + plan + " this week");
  }
  if (id === "wtrend") {
    const tr = trendSeries(weightList()), l = tr.slice(-14), last = tr[tr.length - 1], ch = d2delta(tr.map(x => ({ d: x.d, v: x.trend })), "v", d);
    return d2card("openPage", ' data-k="wtrend"', "Weight trend", "Last 14 days", (last ? d2num(last.trend.toFixed(1), "kg") : d2num("--")) + d2chart(l.map(x => x.trend), 140, 46, { fill: 1, w: 2.2 }), ch == null ? (last ? "No change yet" : "No entries yet") : d2sign(ch) + " kg this week");
  }
  if (id === "weighin") {
    const days = Array.from({ length: 30 }, (_, i) => addDays(d, i - 29)), ws = days.map(x => S.weights[x] ? S.weights[x].kg : null), have = ws.filter(v => v != null);
    const lo = Math.min(...have), hi = Math.max(...have), sp = hi - lo || 1, W = 142, H = 46, dx = (W - 6) / 29;
    let svg = '<svg class="d2v" width="' + W + '" height="' + H + '">';
    ws.forEach((v, i) => { const x = 3 + i * dx; svg += v == null ? '<circle cx="' + x.toFixed(1) + '" cy="' + (H - 3) + '" r="1.9" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="1.1"/>' : '<circle cx="' + x.toFixed(1) + '" cy="' + (3 + (hi === lo ? 0.5 : 1 - (v - lo) / sp) * (H - 14)).toFixed(1) + '" r="2.4" fill="currentColor"/>'; });
    const n = Object.keys(S.weights).filter(x => x >= wk0 && x <= d).length;
    return d2card("openPage", ' data-k="weighin"', "Weigh-in", "Last 30 days", svg + "</svg>", "<em>" + n + "</em> of 7 this week");
  }
  if (id === "wohabit") {
    const mon = x => addDays(x, -((dow(x) + 6) % 7)), start = addDays(mon(d), -21);
    let g = '<div class="d2cal">' + ["M", "T", "W", "T", "F", "S", "S"].map(x => "<span>" + x + "</span>").join("");
    for (let i = 0; i < 28; i++) { const x = addDays(start, i); g += '<i class="' + (x > d ? "fut" : doneOn(x) ? "on" : "") + (x === d ? " today" : "") + '"></i>'; }
    const n = sessionsSorted().filter(s2 => s2.d >= mon(d) && s2.d <= d && s2.endTs && sessionSets(s2.id).length).length;
    return d2card("openPage", ' data-k="wohabit"', "Workouts", "Last 4 weeks", g + "</div>", "<em>" + n + "</em> this week");
  }
  if (id === "scale" || id === "bf" || id === "waist") {
    const isW = id === "waist", list = isW ? Object.values(S.waists).sort((a, b) => a.d < b.d ? -1 : 1).map(x => ({ d: x.d, v: +x.inch })) : weightList().filter(x => id === "scale" || x.bf != null).map(x => ({ d: x.d, v: id === "scale" ? x.kg : x.bf }));
    const unit = isW ? "in" : id === "bf" ? "%" : "kg", last = list[list.length - 1], ch = d2delta(list, "v", d);
    return d2card("openPage", ' data-k="' + (isW ? "waist" : "scale") + '"', D2T(id), "Last 7 entries", '<div class="d2row">' + d2num(last ? (+last.v).toFixed(1) : "--", last ? unit : "") + d2chart(list.slice(-7).map(x => x.v), 56, 30, { w: 1.8 }) + "</div>", ch == null ? (last ? "No change yet" : "No entries yet") : d2sign(ch) + " this week");
  }
  if (id.startsWith("m:")) { const m = id.slice(2), v = muscleSets(7, d)[m]; return d2card("muscle", ' data-m="' + esc(m) + '"', m, "Last 7 days", '<div class="d2pic">' + muscleThumb(m) + "</div>", "<em>" + (v ? fmtKg(v) : 0) + "</em> " + (v === 1 ? "set" : "sets")); }
  const ex = id.slice(2), hs = histFor(ex).slice(-7), v = hs.map(x => Math.max(...x.sets.map(s2 => e1rm(s2.kg || 0, s2.reps)))), last = v[v.length - 1];
  return d2card("openEx", ' data-ex="' + ex + '"', D2T(id), "Last 7 workouts", '<div class="d2row">' + d2num(last ? fmtKg(Math.round(last * 2) / 2) : "--", last ? "kg" : "") + d2chart(v, 56, 30, { w: 1.8 }) + "</div>", last ? "Estimated 1-RM" : "No sets yet");
}
function vDash() {
  const d = today(), L = dashLayout();
  let h = '<div class="d2">' + head("Dashboard", "", '<button class="ib" data-a="plusMenu" aria-label="Quick add">' + I.plus + '</button><button class="ib" data-a="dashCustom" aria-label="Customize">' + I.sliders + "</button>");
  const pg = { rings: '<div class="pg"><div class="d3hd"><h2 class="d2h2">Weekly workouts</h2><span>This week</span></div><div class="d3card" id="rings">' + ringsHtml() + "</div>"
      + '<div class="seg slide d2seg' + (RINGMODE === "all" ? " right" : "") + '"><i class="thumbx"></i><button class="' + (RINGMODE === "program" ? "on" : "") + '" data-a="ringMode" data-v="program">Active program</button><button class="' + (RINGMODE === "all" ? "on" : "") + '" data-a="ringMode" data-v="all">All workouts</button></div></div>',
    records: '<div class="pg"><h2 class="d2h2">Recent records</h2>' + recordsHtml() + "</div>" };
  h += '<div class="pager" id="pager">' + L.pages.map(p => pg[p]).join("") + '</div><div class="pdots"><i class="on"></i><i></i></div></div><div class="body-pad">';
  if (storageBroken) h += '<div class="d2bk"><i></i>' + esc(storageBroken) + "</div>";
  else if (!KV.token) h += '<button class="d2bk press" data-a="backup"><i></i>Not backed up yet<span>Set up</span></button>';
  if (activeSession()) h += '<button class="d2p press" data-a="resume"><div class="m"><b>' + esc(activeSession().name) + "</b><span>Workout in progress</span></div><em>Resume</em></button>";
  if (!S.weights[d]) h += '<button class="d2p press" data-a="weightSheet"><div class="m"><b>Morning weigh-in</b><span>After you pee, before food</span></div><span class="wbox">kg</span></button>';
  const see = { body: '<button class="d2see" data-a="openPage" data-k="scale">See all</button>', muscles: '<button class="d2see" data-a="tabTo" data-tab="levels">See all</button>', exercises: '<button class="d2see" data-a="openPage" data-k="exlist">See all</button>' };
  L.secs.forEach(sec => { if (!sec.tiles.length) return; h += '<div class="d2sec"><h2>' + esc(D2N[sec.k] || DPOOL[sec.k].n) + "</h2>" + (see[sec.k] || "") + '</div><div class="d2grid">' + sec.tiles.map(d2tile).join("") + "</div>"; });
  return h + "</div></div>";
}
function topExercises() { const c = {}; Object.values(S.sets).forEach(x => { if (!x.w) c[x.exId] = (c[x.exId] || 0) + 1; }); const l = Object.keys(c).sort((a, b) => c[b] - c[a]); ["pullup", "inc_smith_press"].forEach(x => { if (!l.includes(x)) l.push(x); }); return l.slice(0, 2); }
function recordsHtml() {
  const best = {}; Object.values(S.sets).forEach(x => { if (x.w || !x.kg) return; const v = e1rm(x.kg, x.reps); if (!best[x.exId] || v > best[x.exId].v) best[x.exId] = { v, x }; });
  const l = Object.values(best).sort((a, b) => a.x.d < b.x.d ? 1 : -1).slice(0, 5);
  if (!l.length) return '<div class="recs empty"><p class="small">Your best lifts show up here once you log workouts.</p></div>';
  return '<div class="recs">' + l.map(b => '<button class="rec" data-a="openEx" data-ex="' + b.x.exId + '"><b>' + esc((getEx(b.x.exId) || {}).n) + "</b><span>" + fmtKg(b.x.kg) + " kg × " + b.x.reps + " · " + dShort(b.x.d) + "</span></button>").join("") + "</div>";
}
let DC = null;
ACT.dashCustom = () => { DC = dashLayout(); openPage({ kind: "dashcust" }); };
function vDashCust() {
  const prev = { rings: '<svg viewBox="0 0 160 90"><circle cx="40" cy="38" r="17" fill="none" stroke="var(--blue)" stroke-width="3"/><circle cx="80" cy="38" r="22" fill="none" stroke="var(--orange)" stroke-width="3"/><circle cx="120" cy="38" r="17" fill="none" stroke="var(--teal)" stroke-width="3"/><rect x="26" y="70" width="28" height="6" rx="3" fill="var(--chip)"/><rect x="66" y="70" width="28" height="6" rx="3" fill="var(--chip)"/><rect x="106" y="70" width="28" height="6" rx="3" fill="var(--chip)"/></svg>',
    records: '<svg viewBox="0 0 160 90">' + [0, 1, 2, 3, 4, 5].map(i => '<rect x="18" y="' + (10 + i * 12) + '" width="14" height="6" rx="3" fill="var(--chip)"/><rect x="40" y="' + (10 + i * 12) + '" width="' + (84 - i * 7) + '" height="6" rx="2" fill="var(--gold)"/><rect x="' + (130 - i * 7) + '" y="' + (10 + i * 12) + '" width="14" height="6" rx="3" fill="var(--chip)"/>').join("") + "</svg>" };
  let h = nav("Customize Dashboard", '<button class="navtxt" data-a="dcSave">Save</button>') + '<div class="dctop">' + DC.pages.map((p, i) => '<div class="dcp"><div class="dbox">' + prev[p] + '</div><button class="ib plain" data-a="dcPage" aria-label="Move">' + (i ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>') + "</button></div>").join("") + '</div><div class="body-pad">';
  DC.secs.forEach((sec, si) => {
    const up = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
    h += '<div class="dch"><h2>' + esc(DPOOL[sec.k].n) + '</h2><button class="ib plain"' + (si ? "" : " disabled") + ' data-a="dcMove" data-i="' + si + '" data-v="-1" aria-label="Move up">' + up + '</button><button class="ib plain"' + (si < DC.secs.length - 1 ? "" : " disabled") + ' data-a="dcMove" data-i="' + si + '" data-v="1" aria-label="Move down" style="transform:scaleY(-1)">' + up + "</button></div>";
    h += '<div class="card dcl" data-sec="' + si + '">' + sec.tiles.map((t, ti) => '<div class="dcr" data-t="' + ti + '"><span class="dci">' + tileIcon(t) + "</span><b>" + esc(TILE_NAME(t)) + '</b><span class="hdl" aria-label="Drag to reorder"><i></i><i></i></span></div>').join("")
      + '<button class="addrm" data-a="dcAdd" data-i="' + si + '">Add or Remove ' + esc(DPOOL[sec.k].short) + "</button></div>";
  });
  return h + "</div>";
}
ACT.dcPage = () => { DC.pages.reverse(); haptic(); renderPage(true); };
ACT.dcMove = el => { const i = +el.dataset.i, j = i + +el.dataset.v; if (j < 0 || j >= DC.secs.length) return; const t = DC.secs[i]; DC.secs[i] = DC.secs[j]; DC.secs[j] = t; haptic(); renderPage(true); };
ACT.dcAdd = el => { DCSEC = +el.dataset.i; paintDcAdd(); };
let DCSEC = 0;
function paintDcAdd() {
  const sec = DC.secs[DCSEC], pool = poolOf(sec.k);
  openSheet(DPOOL[sec.k].n, "Add or remove tiles", pool.map(t => '<button class="opt dct" data-a="dcTog" data-t="' + esc(t) + '"><span class="dci">' + tileIcon(t) + '</span><div class="m"><b>' + esc(TILE_NAME(t)) + '</b></div><span class="sw' + (sec.tiles.includes(t) ? " on" : "") + '"><i></i></span></button>').join("") + '<button class="big" style="margin-top:16px" data-a="dcDone">Done</button>', { name: "dcadd", keep: true, tall: pool.length > 6 });
}
ACT.dcTog = el => { const sec = DC.secs[DCSEC], t = el.dataset.t, i = sec.tiles.indexOf(t); if (i >= 0) sec.tiles.splice(i, 1); else sec.tiles.push(t); haptic(); $(".sw", el).classList.toggle("on", i < 0); };
ACT.dcDone = () => { closeSheet(); renderPage(true); };
ACT.dcSave = () => { addEvent("settings.upserted", { dash: DC }); haptic(); toast("Dashboard saved"); DC = null; ACT.pageBack(); };
// drag the two-line handle to reorder tiles inside a section
document.addEventListener("pointerdown", e => {
  const hd = e.target.closest(".dcr .hdl"); if (!hd || !DC) return; e.preventDefault();
  const row = hd.closest(".dcr"), list = row.parentElement, si = +list.dataset.sec, y0 = e.clientY; let from = +row.dataset.t, cur = from;
  row.classList.add("drag"); hd.setPointerCapture(e.pointerId);
  const rows = () => $$(".dcr", list), H = row.offsetHeight;
  const mv = ev => {
    const dy = ev.clientY - y0, to = Math.max(0, Math.min(rows().length - 1, from + Math.round(dy / H)));
    row.style.transform = "translateY(" + dy + "px)";
    rows().forEach((r, k) => { if (r === row) return; const shift = (k > from && k <= to) ? -H : (k < from && k >= to) ? H : 0; r.style.transform = shift ? "translateY(" + shift + "px)" : ""; });
    if (to !== cur) { cur = to; haptic(); }
  };
  const up = () => { hd.removeEventListener("pointermove", mv); hd.removeEventListener("pointerup", up); hd.removeEventListener("pointercancel", up);
    const t = DC.secs[si].tiles; const [x] = t.splice(from, 1); t.splice(cur, 0, x); renderPage(true); };
  hd.addEventListener("pointermove", mv); hd.addEventListener("pointerup", up); hd.addEventListener("pointercancel", up);
});
ACT.dashTog = () => {};
ACT.metricsAll = () => openSheet("Body Metrics", "", optRow(I.scale, "Scale Weight", "", "openPage", ' data-k="scale"', "chev") + optRow(I.tape, "Waist", "", "openPage", ' data-k="waist"', "chev") + optRow(I.ruler, "Measurements", "Arms, calf, neck, thigh, chest", "measureSheet", "", "chev") + optRow(I.fire, "Weight Trend", "", "openPage", ' data-k="wtrend"', "chev"));
ACT.openPage = el => openPage({ kind: el.dataset.k });
ACT.openEx = el => openPage({ kind: "exercise", ex: el.dataset.ex });
ACT.muscle = el => openPage({ kind: "muscle", m: el.dataset.m });
const dShort = d => +d.slice(8) + " " + MONTHS_LONG[+d.slice(5, 7) - 1].slice(0, 3);
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
ACT.ringMode = el => {
  if (RINGMODE === el.dataset.v) return; RINGMODE = el.dataset.v; haptic();
  const seg = el.closest(".seg"); seg.classList.toggle("right", RINGMODE === "all"); $$("button", seg).forEach(b => b.classList.toggle("on", b === el));
  const r = $("#rings"); r.classList.add("swap"); setTimeout(() => { r.innerHTML = ringsHtml(); r.classList.remove("swap"); }, 160);
};
ACT.tabTo = el => { SCROLL[TAB] = $("#main").scrollTop; TAB = el.dataset.tab; render(); if (el.dataset.sub === "history") ACT.history(); };

// ===== Workout tab =====
function dayBtn(x, d, extra) { const dk = dayKeyFor(x); return '<button class="day press' + (doneOn(x) ? " done" : "") + (x === d ? " today" : "") + (x < d && !doneOn(x) ? " past" : "") + '" data-a="' + (dk ? "preview" : "noop") + '" data-day="' + (dk || "") + '">' + +x.slice(8) + "<span>" + DAY2[dow(x)] + "</span>" + (extra || "") + "</button>"; }
function vWorkoutTab() {
  const d = today(), d0 = weekSun(d), wk = programWeek(d);
  let h = head("Workout", "", '<button class="ib' + (CALOPEN ? " inv" : "") + '" data-a="calToggle" aria-label="Calendar">' + I.cal + '</button><button class="ib" data-a="createMenu" aria-label="Create">' + I.plus + '</button><button class="ib" data-a="woMore" aria-label="More">' + I.kebab + "</button>");
  if (!CALOPEN) h += '<div class="week">' + Array.from({ length: 7 }, (_, i) => dayBtn(addDays(d0, i), d)).join("") + "</div>";
  else {
    const start = addDays(d0, -21); h += '<div class="calx">';
    for (let w = 0; w < 9; w++) {
      const row = Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i));
      h += '<div class="cxr">' + row.map((x, i) => (w === 0 && i === 0) ? '<button class="ib inv cxup" data-a="calToggle" aria-label="Close calendar">' + I.up + "</button>" : dayBtn(x, d)).join("") + "</div>";
      const first = row.findIndex(x => x.slice(8) === "01");
      if (first >= 0) h += '<div class="cxm"><span style="grid-column:' + (first + 1) + '">' + MONTHS_LONG[+row[first].slice(5, 7) - 1].slice(0, 3) + " '" + row[first].slice(2, 4) + "</span></div>";
    }
    h += "</div>";
  }
  h += "</div><div class='body-pad'>";
  const act = activeSession();
  if (act) h += '<button class="prompt press" data-a="resume" style="width:100%;text-align:left"><div class="m"><b>' + esc(act.name) + '</b><span class="small">In progress · ' + sessionSets(act.id).length + (sessionSets(act.id).length === 1 ? " set" : " sets") + ' logged</span></div><span class="ul">Resume</span></button>';
  h += '<div class="sec"><h2>Active Program</h2><button class="ul" data-a="weeksInfo">Week ' + wk + "</button></div>";
  h += '<div class="card"><button class="prog-h" data-a="progToggle"><div class="picon">' + I.rocket + '</div><div class="m"><b>' + esc(PROGRAM_NAME) + '</b><span class="sub">6 workouts</span></div><span class="cv' + (PROGOPEN ? "" : " closed") + '">' + I.up + "</span></button>";
  if (PROGOPEN) for (let i = 0; i < 7; i++) {
    const x = addDays(d0, i), dk = dayKeyFor(x), isToday = x === d;
    if (!dk) { h += '<div class="wrow' + (isToday ? " today" : "") + '"><div class="m"><div class="dlbl">' + WEEKDAYS[i] + '</div><b>Rest Day</b></div><span class="cb' + (x < d ? " on" : "") + '">' + I.tick + "</span></div>"; continue; }
    h += wRow(dk, x, isToday);
  }
  h += "</div>";
  h += '<div class="sec"><h2>Workout Library</h2><button class="ul" data-a="libToggle">' + (LIBOPEN ? "Collapse" : "Expand") + "</button></div>";
  if (LIBOPEN) h += '<div class="card">' + DAY_KEYS.map(k => wRow(k, null, false)).join("") + "</div>";
  return h + "</div>";
}
function wRow(dk, x, isToday) {
  const items = itemsForDay(dk, x || today()), names = items.map(it => (getEx(it.ex) || {}).n).join(", "), mus = [];
  items.forEach(it => tagsOf(it.ex).forEach(m => { if (!mus.includes(m)) mus.push(m); }));
  return '<button class="wrow press' + (isToday ? " today" : "") + '" data-a="preview" data-day="' + dk + '"><div class="m">' + (x ? '<div class="dlbl">' + WEEKDAYS[dow(x)] + (isToday ? " · Today" : "") + "</div>" : "") + "<b>" + esc(DAYS[dk].name) + '</b><div class="ex">' + esc(names) + '</div><div class="tags">' + mus.slice(0, 6).map(m => '<span class="tag">' + esc(m) + "</span>").join("") + "</div></div>" + (x ? '<span class="cb' + (doneOn(x) ? " on" : "") + '">' + I.tick + "</span>" : I.chev) + "</button>";
}
ACT.calToggle = () => { CALOPEN = !CALOPEN; haptic(); SCROLL.workout = 0; render(); };
ACT.libToggle = () => { LIBOPEN = !LIBOPEN; SCROLL.workout = $("#main").scrollTop; render(); };
ACT.woMore = () => openSheet("More", "", optRow(I.empty, "Start Empty Workout", "", "emptyWorkout", "", "chev") + optRow(I.hist, "Workout History", "", "history", "", "chev") + optRow(I.cal, "Month Calendar", "", "calendar", "", "chev") + optRow(I.book, "Program Weeks", "Week " + programWeek(today()), "weeksInfo", "", "chev"));
ACT.createMenu = () => openSheet("Create", "", optRow(I.empty, "New Workout", "Start an empty workout and add exercises", "emptyWorkout", "", "chev") + optRow(I.cal, "Train a different day", "Pick any workout from your plan", "pickDay", "", "chev"));
ACT.noop = () => toast("Saturday is your rest day");
ACT.progToggle = () => { PROGOPEN = !PROGOPEN; SCROLL.workout = $("#main").scrollTop; render(); };
ACT.weeksInfo = () => openSheet("Week " + programWeek(today()), "How your sets build up", '<div class="kv"><span>Weeks 1 and 2</span><b>2 sets, 3 RIR</b></div><div class="kv"><span>Weeks 3 and 4</span><b>Planned sets</b></div><div class="kv"><span>Week 5 on</span><b>Extra sets on priorities</b></div><p class="hint" style="margin-top:14px">RIR means reps left in the tank. 3 RIR means you stop when you could still do 3 more good reps.</p>');
ACT.resume = () => { closeSheet(); closeDialog(); STACK = []; PAGE = { kind: "log" }; LOGI = null; renderPage(); };

// ===== Workout preview =====
function vPreview(dk) {
  const d = today(), items = itemsForDay(dk, d), lab = ssLabels(items), wk = programWeek(d);
  const mus = {};
  items.forEach(it => { const m = tagsOf(it.ex)[0]; mus[m] = mus[m] || { ex: 0, sets: 0 }; mus[m].ex++; mus[m].sets += it.n; });
  const mins = 10 + Math.round(items.reduce((a, it) => a + it.n * (((getEx(it.ex) || {}).rest || 90) + 45), 0) / 60) + 5;
  let h = nav(DAYS[dk].name, '<span class="navr"><button class="ib plain" data-a="prevMenu" data-day="' + dk + '" aria-label="Options">' + I.kebab + "</button></span>") + '<div class="body-pad" style="padding-top:0">';
  h += '<h2 style="margin-top:8px">Target Muscles</h2><div class="tm">' + Object.keys(mus).map(m => '<button class="tmc press" data-a="muscle" data-m="' + esc(m) + '"><div class="thumb">' + muscleThumb(m) + "</div><div><b>" + esc(m) + "</b><span>" + mus[m].ex + " exercise" + (mus[m].ex > 1 ? "s" : "") + "</span><span>" + mus[m].sets + " sets</span></div></button>").join("") + "</div>";
  h += '<div class="exhead"><div><h2>' + (items.length + 1) + ' Exercises</h2><div class="sub">Estimated workout time is ' + mins + ' min</div></div><button class="ib" data-a="addExDay" data-day="' + dk + '" aria-label="Add exercise">' + I.plus + "</button></div>";
  h += '<div class="exlist"><div class="exr"><div class="thumb word" style="margin-top:0">Back<br>fix</div><div class="m"><b>Back fix</b><div class="srow">5 moves · about 10 min</div><div class="tags">' + ["Abs", "Lower Back", "Glutes", "Neck"].map(m => '<span class="tag">' + m + "</span>").join("") + "</div></div></div>";
  items.forEach((it, i) => {
    const ex = exFor(it); if (!ex) return;
    const rt = rirFor(ex, it, wk, it.n);
    h += '<div class="exr"><div class="thumb">' + thumbFor(it.ex) + '</div><div class="m">' + (lab[i] ? '<div class="ssl">Superset ' + lab[i] + "</div>" : "") + "<b>" + esc(ex.n) + "</b>"
      + rt.map((r, k) => { const rr = it.rr && it.rr[k] ? it.rr[k] : ex.r; return '<div class="srow"><span class="sn">' + (k + 1) + "</span>" + (rr[0] === rr[1] ? rr[0] : rr[0] + "-" + rr[1]) + (ex.t ? " sec" : " reps") + (ex.each ? " each" : "") + '<span class="rir r' + r + '">' + r + "</span></div>"; }).join("")
      + '<div class="tags">' + tagsOf(it.ex).map(m => '<span class="tag">' + esc(m) + "</span>").join("") + '</div></div><button class="kebab" data-a="exOpts" data-i="' + i + '" data-day="' + dk + '">' + I.kebab + "</button></div>";
  });
  h += "</div></div>";
  const act = activeSession();
  h += '<div class="bottom">' + (act ? (act.dayKey === dk ? '<button class="big press" data-a="resume">Resume Workout</button>' : '<button class="big soft press" data-a="resume">Resume ' + esc(act.name) + "</button>") : '<button class="big press" data-a="start" data-day="' + dk + '">Start Workout</button>') + "</div>";
  return h;
}
ACT.addExDay = el => { PENDING = { kind: "add", i: null, day: el.dataset.day }; openSheet("Add Exercise", "Adds it to " + DAYS[el.dataset.day].name + " from now on", pickerHtml("picked"), { tall: true }); };
ACT.prevMenu = el => { const dk = el.dataset.day; openSheet(DAYS[dk].name, DAYS[dk].sub || "", (activeSession() ? "" : optRow(I.dumb, "Start workout", "", "start", ' data-day="' + dk + '"')) + optRow(I.plus, "Add exercise", "Adds it to this workout from now on", "addExDay", ' data-day="' + dk + '"') + (S.program[dk] ? optRow(I.rotate, "Reset to original plan", "Undo your swaps and changes", "resetDay", ' data-day="' + dk + '"', "red") : "")); };
ACT.resetDay = el => { if (el.dataset.sure !== "1") { el.dataset.sure = "1"; $("b", el).textContent = "Tap again to reset"; return; } addEvent("program.upserted", { dayKey: el.dataset.day, reset: true }); closeSheet(); toast("Back to the original plan"); renderPage(); };
ACT.preview = el => { if (!el.dataset.day) return; openPage({ kind: "preview", dayKey: el.dataset.day }); };
ACT.closePage = () => ACT.pageBack();
ACT.start = el => {
  if (activeSession()) return ACT.resume();
  const dk = el.dataset.day, d = today();
  addEvent("session.started", { v2: 1, dayKey: dk, name: DAYS[dk].name, items: itemsForDay(dk, d) });
  haptic(); closeSheet(); STACK = []; PAGE = { kind: "log" }; LOGI = -1; $("#page").scrollTop = 0; renderPage();
};
ACT.emptyWorkout = () => {
  if (activeSession()) return ACT.resume();
  addEvent("session.started", { v2: 1, dayKey: null, name: "Empty Workout", items: [] });
  closeSheet(); STACK = []; PAGE = { kind: "log" }; LOGI = 0; renderPage(); ACT.addEx();
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
  const P = pauseOf(s);
  let h = '<div class="lg-top"><div class="lg-bar"><button class="back" data-a="logMenu" aria-label="Workout options">' + I.menu + "</button>"
    + '<span class="clock' + (P.at ? " paused" : "") + '" id="clock"' + (setOn("showClock") ? "" : " hidden") + ">" + (P.at ? "Paused" : fmtClock(elapsed(s))) + "</span><span style=\"flex:1\"></span>"
    + '<button class="restw" id="restpill" data-a="restSheet">' + I.watch + '<span id="restt">0:00</span><i class="rbar"><b id="restbar"></b></i></button></div>';
  const lab = ssLabels(s.items), fixAll = fixDone(s, "f", BACK_FIX.length).every(Boolean);
  h += '<div class="strip" id="strip"><button class="st' + (LOGI === -1 ? " on" : "") + (fixAll ? " done" : "") + '" data-a="goEx" data-i="-1"><div class="thumb word">Back fix</div>' + (fixAll ? '<span class="ck">' + I.tick + "</span>" : "") + "</button>"
    + s.items.map((it, i) => '<button class="st' + (LOGI === i ? " on" : "") + (exDone(s, i) ? " done" : "") + '" data-a="goEx" data-i="' + i + '"><div class="thumb">' + tallThumb(it.ex) + '</div><div class="nm">' + esc(shortName(it.ex)) + "</div>" + (lab[i] ? '<span class="ssd">' + lab[i] + "</span>" : "") + (exDone(s, i) ? '<span class="ck">' + I.tick + "</span>" : "") + "</button>").join("")
    + '<button class="st' + (LOGI === s.items.length ? " on" : "") + '" data-a="goEx" data-i="' + s.items.length + '"><div class="thumb word">Cool down</div></button>'
    + '<button class="st add" data-a="addEx"><div class="thumb">' + I.plus + "</div></button></div></div>";
  h += '<div class="lg-body">';
  if (LOGI === -1) h += vFix(s, "f", "Back fix", "10 min, before anything else", BACK_FIX);
  else if (LOGI === s.items.length) h += vFix(s, "c", "Cool down", "5 min", COOLDOWN[(DAYS[s.dayKey] || {}).cool || "legs"]) + '<div class="lg-next"><button class="big press" data-a="finish">Finish Workout</button></div>';
  else h += vExPage(s, LOGI);
  setTimeout(paintRest, 0);
  return h + "</div>";
}
const tallThumb = id => thumbFor(id);
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
  const ex = R.ex, bw = ex.eq === "bw", nLogged = Object.keys(R.logged).length, lab = ssLabels(s.items)[i], rirOn = setOn("rirTrack");
  const wk = s.id + ":" + i, warm = WARM[wk] != null ? WARM[wk] : setOn("warmAuto", false), wsets = (!bw && R.rows[0] && R.rows[0].kg) ? warmupSets(ex, R.rows[0].kg) : [], wl = warmLogged(s, it.ex);
  const lo = R.rows.length ? Math.min(...R.rows.map(r => r.lo)) : ex.r[0], hi = R.rows.length ? Math.max(...R.rows.map(r => r.hi)) : ex.r[1];
  let h = (lab ? '<div class="ssl">Superset ' + lab + "</div>" : "") + '<div class="lg-head"><div><div class="lg-name">' + esc(ex.n) + '</div><div class="lg-sub">Set ' + Math.min(nLogged + 1, it.n) + " of " + it.n + "</div></div>"
    + '<div class="lg-rng"><b>' + (lo === hi ? lo : lo + "-" + hi) + "</b><span>" + (ex.t ? "sec" : "reps") + "</span></div></div>";
  h += '<div class="pills"><button class="pl wand' + (R.events.length ? " lit" : "") + '" data-a="smartSheet" data-i="' + i + '" aria-label="Smart Progression">' + I.wand + "</button>"
    + '<button class="pl" data-a="infoSheet" data-ex="' + it.ex + '">' + I.bars + "Info</button>"
    + (wsets.length ? '<button class="pl' + (warm ? " on" : "") + '" data-a="warm" data-i="' + i + '">' + I.fire + "Warm Up</button>" : "")
    + '<button class="pl" data-a="targetsSheet" data-i="' + i + '">' + I.target + "Targets</button>"
    + '<button class="pl" data-a="swapEx" data-i="' + i + '">' + I.swap + "Swap</button>"
    + '<button class="pl" data-a="exOpts" data-i="' + i + '">' + I.kebab + "</button></div>";
  const allDone = nLogged >= it.n;
  h += '<div class="tbl"><div class="th"><span>Set</span><span>Auto ' + I.swap + "</span><span>" + (bw ? "" : "kg") + "</span><span>" + (ex.t ? "Sec" : "Reps") + '</span><button class="cb hcb' + (allDone ? " on" : "") + '" data-a="logAll" data-i="' + i + '" aria-label="Log all sets">' + I.tick + "</button></div>";
  if (warm) wsets.forEach((w, k) => {
    const st = wl[k];
    h += '<div class="tr warm' + (st ? " done" : "") + '"><span class="sb">W</span><span class="auto">' + fmtKg(w[0]) + " kg × " + w[1] + '</span><span class="cell"><span class="cellb ph">' + fmtKg(w[0]) + '</span></span><span class="cell"><span class="cellb ph">' + w[1] + '</span></span>'
      + '<button class="cb' + (st ? " on" : "") + '" data-a="warmTick" data-i="' + i + '" data-k="' + k + '" data-kg="' + w[0] + '" data-r="' + w[1] + '">' + I.tick + "</button></div>";
  });
  R.rows.forEach((r, k) => {
    const st = R.logged[k], dk = s.id + ":" + i + ":" + k, dr = DRAFT[dk] || {}, pr = PENDRIR[dk], rirShow = st ? (st.rir != null ? st.rir : r.rir) : (pr != null ? pr : r.rir);
    h += '<div class="tr' + (st ? " done" : "") + '" data-i="' + i + '" data-k="' + k + '"><span class="sb">' + (k + 1) + '</span><span class="auto' + (r.adjusted ? " adj" : "") + '">' + autoTxt(r, ex) + (rirOn ? "<br>" + r.rir + " RIR" : "") + "</span>"
      + '<span class="cell">' + (bw ? '<div class="bw">BW</div>' : cellBtn(i, k, "kg", st ? fmtKg(st.kg) : dr.kg, r.kg != null ? fmtKg(r.kg) : "")) + "</span>"
      + '<span class="cell">' + cellBtn(i, k, "reps", st ? st.reps + (st.p ? "+" + st.p : "") : (dr.reps != null && dr.reps !== "" ? dr.reps + (dr.p ? "+" + dr.p : "") : null), String(r.reps != null ? r.reps : r.lo)) + (rirOn && rirShow != null ? '<button class="rir r' + Math.min(6, rirShow) + '" data-a="kpOpen" data-i="' + i + '" data-k="' + k + '" data-f="reps">' + (rirShow >= 6 ? "6+" : rirShow) + "</button>" : "") + "</span>"
      + '<button class="cb' + (st ? " on" : "") + '" data-a="tick" data-i="' + i + '" data-k="' + k + '">' + I.tick + "</button></div>";
    { const nt = st ? st.note : dr.note; if (nt) h += '<div class="setnote" data-a="kpOpen" data-i="' + i + '" data-k="' + k + '" data-f="reps">' + esc(nt) + "</div>"; }
    if (st && bw) h += '<div class="qrow"><button class="clean' + (st.q !== "cheated" ? " on" : "") + '" data-a="q" data-id="' + st.id + '" data-v="clean">Clean</button><button class="cheated' + (st.q === "cheated" ? " on" : "") + '" data-a="q" data-id="' + st.id + '" data-v="cheated">Cheated</button></div>';
  });
  h += '<button class="addset press" data-a="addSet" data-i="' + i + '">' + I.plus + "</button></div>";
  h += '<div class="cue"><b>How to:</b> ' + esc(ex.cue) + "</div>";
  const p = partnerIndex(s.items, i), next = i + 1 < s.items.length ? i + 1 : s.items.length;
  h += '<div class="lg-next">' + (p >= 0 && lab.endsWith("1") ? '<button class="big soft press" data-a="goEx" data-i="' + p + '">Go to ' + esc((getEx(s.items[p].ex) || {}).n) + "</button>" : '<button class="big' + (exDone(s, i) ? "" : " soft") + ' press" data-a="goEx" data-i="' + next + '">' + (next >= s.items.length ? "Cool down and finish" : "Next exercise") + "</button>") + "</div>";
  return h;
}
ACT.goEx = el => { kpClose(true); LOGI = +el.dataset.i; haptic(); $("#page").scrollTop = 0; renderPage(); const on = $("#strip .st.on"); if (on) on.scrollIntoView({ inline: "center", block: "nearest" }); };
ACT.warm = el => { const s = activeSession(), k = s.id + ":" + el.dataset.i; WARM[k] = !WARM[k]; renderPage(true); };
ACT.warmTick = el => {
  const s = activeSession(), i = +el.dataset.i, k = +el.dataset.k, it = s.items[i], st = warmLogged(s, it.ex)[k];
  if (st) addEvent("entity.deleted", { ref: st.id }); else addEvent("set.logged", { sessionId: s.id, exId: it.ex, idx: k, kg: +el.dataset.kg, reps: +el.dataset.r, w: true });
  rebuild(); haptic(); renderPage(true);
};
ACT.tick = el => {
  const s = activeSession(); if (!s) return; if (KP) kpCommit();
  const i = +el.dataset.i, k = +el.dataset.k, it = s.items[i], R = rowsFor(s, i), ex = R.ex;
  if (R.logged[k]) { addEvent("entity.deleted", { ref: R.logged[k].id }); rebuild(); haptic(); renderPage(true); return; }
  const r = R.rows[k], D = DRAFT[s.id + ":" + i + ":" + k] || {};
  let kg = ex.eq === "bw" ? 0 : numIn(D.kg); if (kg == null) kg = r.kg;
  let reps = numIn(D.reps); if (reps == null) reps = r.reps != null ? r.reps : r.lo;
  const part = Math.max(0, Math.round(numIn(D.p) || 0));
  if (ex.eq !== "bw" && kg == null) { kpOpen(i, k, "kg"); return toast("Type the weight first"); }
  if (reps == null || reps <= 0) { kpOpen(i, k, "reps"); return toast("Type your reps"); }
  const pk = s.id + ":" + i + ":" + k, rir = !setOn("rirTrack") ? null : PENDRIR[pk] !== undefined ? PENDRIR[pk] : r.rir; delete PENDRIR[pk]; delete DRAFT[pk];
  addEvent("set.logged", { sessionId: s.id, exId: it.ex, item: i, idx: k, kg, reps: Math.round(reps), p: part, note: D.note || "", rir, tKg: r.kg, tReps: r.reps, tRir: r.rir, q: "clean" });
  kpClose(true); haptic();
  // copied weights below this set give way to whatever Smart Progression picks next
  for (let k2 = k + 1; k2 < it.n; k2++) { const D2 = DRAFT[s.id + ":" + i + ":" + k2]; if (D2 && D2.prop) { delete D2.kg; D2.prop = false; } }
  const lab = ssLabels(s.items)[i], p = partnerIndex(s.items, i), rest = it.light ? 60 : (it.rest || ex.rest);
  if (setOn("ssScroll") && p >= 0 && lab.endsWith("1") && !exDone(s, p)) { LOGI = p; toast("Superset: now " + (getEx(s.items[p].ex) || {}).n); renderPage(); return; }
  if (setOn("ssScroll") && p >= 0 && lab.endsWith("2") && !exDone(s, p)) { if (setOn("restOn")) startRest(rest); LOGI = p; renderPage(); return; }
  if (setOn("restOn")) startRest(rest);
  if (setOn("autoNext") && exDone(s, i) && (p < 0 || exDone(s, p))) {
    let n = -1; for (let j = 0; j < s.items.length; j++) if (!exDone(s, j)) { n = j; break; }
    LOGI = n < 0 ? s.items.length : n; toast(n < 0 ? "All exercises done. Cool down next." : "Next: " + (getEx(s.items[n].ex) || {}).n);
    $("#page").scrollTop = 0; renderPage(); return;
  }
  renderPage(true); nextToast(s, i, k);
};
function fillSets(s, i) {
  const R = rowsFor(s, i); if (!R) return 0; const it = s.items[i], ex = R.ex; let n = 0;
  R.rows.forEach((r, k) => {
    if (R.logged[k]) return; const pk = s.id + ":" + i + ":" + k, dr = DRAFT[pk] || {};
    let kg = ex.eq === "bw" ? 0 : numIn(dr.kg); if (kg == null) kg = r.kg;
    let reps = numIn(dr.reps); if (reps == null) reps = r.reps != null ? r.reps : r.lo;
    if (ex.eq !== "bw" && kg == null) return;
    const rir = !setOn("rirTrack") ? null : PENDRIR[pk] !== undefined ? PENDRIR[pk] : r.rir; delete PENDRIR[pk]; delete DRAFT[pk];
    addEvent("set.logged", { sessionId: s.id, exId: it.ex, item: i, idx: k, kg, reps: Math.round(reps), p: Math.max(0, Math.round(numIn(dr.p) || 0)), note: nt, rir, tKg: r.kg, tReps: r.reps, tRir: r.rir, q: "clean" }); n++;
  });
  return n;
}
function nextToast(s, i, k) {
  const R2 = rowsFor(s, i), nx = R2.rows.find(r => !r.done), ev = R2.events[R2.events.length - 1]; if (!nx) return;
  const what = (nx.kg ? fmtKg(nx.kg) + " kg × " : "") + nx.reps + (nx.kg ? "" : " reps") + ", " + nx.rir + " left in the tank";
  toast(ev && ev.k === k ? (ev.to > ev.from ? "Too easy. Next set: " : "Too hard. Next set: ") + what : "Next set: " + what);
}
ACT.logAll = el => { if (KP) kpCommit(); const s = activeSession(), i = +el.dataset.i, n = fillSets(s, i); haptic(); if (!n) toast(exDone(s, i) ? "All sets are logged" : "Type the weight first"); else if (setOn("restOn")) startRest(s.items[i].rest || (getEx(s.items[i].ex) || {}).rest || 90); renderPage(true); };
document.addEventListener("change", e => {
  const inp = e.target;
  if (inp.id === "wIn") return saveWeight(inp.value);
  if (inp.id === "entryDate") { if (inp.value) entrySheet(inp.value, ENTRY_K); return; }
  if (inp.dataset && inp.dataset.hsel) { const k = inp.dataset.hsel, cur = (CALM2[k] || today().slice(0, 7)).split("-"); if (inp.dataset.part === "m") cur[1] = pad2(+inp.value); else cur[0] = inp.value; CALM2[k] = cur.join("-"); renderPage(true); return; }
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT") e.target.blur(); });
ACT.rirPick = el => kpOpen(+el.dataset.i, +el.dataset.k, "reps");
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
  const c = ctxOf(el), items = c.day ? planFor(c.day) : activeSession().items, it = items[c.i], ex = exFor(it);
  const n = c.day ? setsFor(it, today()) : it.n, rt = rirFor(ex, it, programWeek(today()), n);
  TED = { c, ex, rows: Array.from({ length: n }, (_, k) => ({ lo: it.rr && it.rr[k] ? it.rr[k][0] : ex.r[0], hi: it.rr && it.rr[k] ? it.rr[k][1] : ex.r[1], rir: rt[k] })), rest: it.rest || ex.rest, restOn: !!it.rest, def: rt };
  paintTargets();
};
function paintTargets(err) {
  const T = TED;
  let h = '<div class="tgh"><span>Set</span><span>Rep Range</span><span>RIR</span></div>' + T.rows.map((r, k) => '<div class="tgr"><button class="sb" data-a="tDel" data-k="' + k + '" aria-label="Remove set">' + (k + 1) + '</button><button class="tin gfield' + (r.hi < r.lo ? " bad" : "") + '" data-a="gpOpen" data-k="t:' + k + ':lo" data-int="1" data-label="Set ' + (k + 1) + ' reps min">' + r.lo + '</button><button class="tin gfield' + (r.hi < r.lo ? " bad" : "") + '" data-a="gpOpen" data-k="t:' + k + ':hi" data-int="1" data-label="Set ' + (k + 1) + ' reps max">' + r.hi + '</button><button class="rir r' + Math.min(6, r.rir) + '" data-a="tRir" data-k="' + k + '">' + r.rir + "</button></div>").join("");
  if (err) h += '<p class="err">' + err + "</p>";
  h += '<button class="addset" data-a="tAdd">' + I.plus + "</button><p class=\"hint\">Tap a set number to remove that set. Tap a RIR badge to change it.</p>";
  h += '<div class="trest"><div class="m"><b>Set Rest Timers</b><span>Use your own rest for this exercise</span></div><button class="sw' + (T.restOn ? " on" : "") + '" data-a="tRestOn"><i></i></button></div>';
  if (T.restOn) h += '<div class="tg"><button data-a="tRest" data-v="-15">− 15 s</button><button class="on" style="pointer-events:none">' + Math.floor(T.rest / 60) + ":" + pad2(T.rest % 60) + '</button><button data-a="tRest" data-v="15">+ 15 s</button></div>';
  h += '<button class="big" style="margin-top:18px" data-a="tSave">Save</button>';
  openSheet("Targets", T.ex.n, h, { name: "targets", keep: true });
}
ACT.tRir = el => { const r = TED.rows[+el.dataset.k]; r.rir = (r.rir + 1) % 5; haptic(); paintTargets(); };
ACT.tAdd = () => { const l = TED.rows[TED.rows.length - 1] || { lo: TED.ex.r[0], hi: TED.ex.r[1], rir: 2 }; TED.rows.push(Object.assign({}, l)); paintTargets(); };
ACT.tDel = el => { if (TED.rows.length < 2) return toast("Keep at least one set"); TED.rows.splice(+el.dataset.k, 1); paintTargets(); };
ACT.tRestOn = () => { TED.restOn = !TED.restOn; paintTargets(); };
ACT.tRest = el => { TED.rest = Math.max(15, TED.rest + +el.dataset.v); paintTargets(); };
ACT.tSave = () => {
  gpClose(); const T = TED, c = T.c; if (T.rows.some(r => r.hi < r.lo || r.lo < 1)) return paintTargets("Reps max must be the same as or higher than reps min.");
  const n = T.rows.length, same = T.rows.every(r => r.lo === T.rows[0].lo && r.hi === T.rows[0].hi);
  const upd = { r: [T.rows[0].lo, T.rows[0].hi], rr: same ? null : T.rows.map(r => [r.lo, r.hi]), rirs: T.rows.map((r, k) => r.rir === T.def[k] ? null : r.rir), rest: T.restOn ? T.rest : null };
  if (!upd.rirs.some(x => x != null)) upd.rirs = null;
  if (c.day) { const items = clone(planFor(c.day)); Object.assign(items[c.i], upd, { sets: n, fixed: true }); addEvent("program.upserted", { dayKey: c.day, items }); toast("Plan updated"); }
  else { editItems(items => { Object.assign(items[c.i], upd, { n }); }); toast("Targets saved"); }
  closeSheet(); haptic(); renderPage(true);
};
ACT.setsN = el => { const i = +el.dataset.i; editItems(items => { items[i].n = Math.max(1, items[i].n + +el.dataset.v); }); ACT.targetsSheet(el); renderPage(true); };
ACT.repR = el => { const i = +el.dataset.i, d = +el.dataset.v; editItems(items => { const ex = getEx(items[i].ex), r = (items[i].r || ex.r).slice(); items[i].r = [Math.max(1, r[0] + d * 2), Math.max(2, r[1] + d * 2)]; }); ACT.targetsSheet(el); renderPage(true); };

// exercise options (preview: changes the plan, in a workout: asks)
ACT.exOpts = el => {
  const i = +el.dataset.i, inLog = !el.dataset.day, dk = el.dataset.day || (activeSession() || {}).dayKey;
  const items = inLog ? activeSession().items : planFor(dk), it = items[i], ex = getEx(it.ex), p = partnerIndex(items, i);
  const ctx = ' data-i="' + i + '"' + (inLog ? "" : ' data-day="' + dk + '"'), n = inLog ? it.n : setsFor(it, today());
  openSheet("Exercise Options", ex.n, '<button class="opt" data-a="infoSheet" data-ex="' + it.ex + '"><span class="oi">' + I.bars + '</span><div class="m"><b>Info</b><span>Learn about the exercise</span></div>' + I.chev + "</button>"
    + '<div class="opt"><span class="oi">' + I.target + '</span><div class="m"><b>Targets</b><span>' + n + " set" + (n === 1 ? "" : "s") + '</span></div><button class="pill-btn" data-a="targetsSheet"' + ctx + ">Edit</button></div>"
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
  if (tr && e.target.dataset.f && activeSession()) {
    const sid = activeSession().id, f = e.target.dataset.f, k = sid + ":" + tr.dataset.i + ":" + tr.dataset.k, D = (DRAFT[k] = DRAFT[k] || {}); D[f] = e.target.value; if (f === "kg") D.prop = false;
    if (f === "kg" && setOn("propagate")) { let nx = tr.nextElementSibling; while (nx) { if (nx.classList.contains("tr") && !nx.classList.contains("done") && !nx.classList.contains("warm")) { const inp = $('input[data-f="kg"]', nx), k2 = sid + ":" + nx.dataset.i + ":" + nx.dataset.k; if (inp) { inp.value = e.target.value; const D2 = (DRAFT[k2] = DRAFT[k2] || {}); D2.kg = e.target.value; D2.prop = true; }  } nx = nx.nextElementSibling; } }
    return;
  }
  if (e.target.dataset.tk != null && TED) { const r = TED.rows[+e.target.dataset.tk]; if (r) r[e.target.dataset.tf] = Math.max(0, Math.round(numIn(e.target.value) || 0)); return; }
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
const optRow = (icon, title, sub, act, extra, cls) => '<button class="opt' + (cls ? " o-" + cls : "") + '" data-a="' + act + '"' + (extra || "") + '><span class="oi">' + icon + '</span><div class="m"><b>' + title + "</b>" + (sub ? "<span>" + sub + "</span>" : "") + "</div>" + (cls === "chev" ? I.chev : "") + "</button>";
ACT.logMenu = () => { const s = activeSession(), P = pauseOf(s); openSheet("Workout Options", "", optRow(P.at ? I.play : I.pause, P.at ? "Resume workout" : "Pause workout", "", "pauseToggle") + optRow(I.mini, "Minimize workout", "", "minimize") + optRow(I.flag, "Finish workout", "", "finish") + optRow(I.gear, "Workout settings", "", "wsettings", "", "chev") + optRow(I.plus, "Add exercise", "", "addEx") + optRow(I.trash, "Discard workout", "", "discard", "", "red")); };
ACT.minimize = () => { closeSheet(); PAGE = null; STACK = []; renderPage(); render(); };
ACT.finish = () => {
  const s = activeSession(); if (!s) return; if (KP) kpClose(); closeSheet();
  const tot = s.items.length, touched = s.items.filter((it, i) => Object.keys(loggedByIdx(s, it.ex)).length).length;
  if (tot && s.items.every((it, i) => exDone(s, i))) return finishNow();
  openDialog("Finish this workout?", "<p>You've logged " + touched + " of " + tot + " exercises. Log All Sets saves every set using the numbers on screen. Log Only Completed Sets keeps just the ones you ticked.</p>"
    + '<button class="big soft" data-a="finishAll">Log All Sets</button><button class="big" data-a="finishDone">Log Only Completed Sets</button>');
};
ACT.finishAll = () => { const s = activeSession(); s.items.forEach((_, i) => fillSets(s, i)); closeDialog(); finishNow(); };
ACT.finishDone = () => { closeDialog(); const s = activeSession(); if (!sessionSets(s.id).length) { addEvent("entity.deleted", { ref: s.id }); rebuild(); stopRest(); PAGE = null; STACK = []; render(); toast("Nothing was logged, so the workout was removed"); return; } finishNow(); };
function finishNow() {
  const s = activeSession(); if (!s) return;
  addEvent("session.finished", { sessionId: s.id }); stopRest(); wakeOff(); haptic(); syncNow();
  try { localStorage.removeItem(pauseKey(s)); } catch (_) {}
  PAGE = null; STACK = []; LOGI = null; TAB = "dashboard"; render();
  ACT.viewSession({ dataset: { id: s.id } }, true);
}
ACT.discard = el => {
  if (el && el.dataset && el.dataset.sure !== "1" && el.classList) { el.dataset.sure = "1"; $("b", el).textContent = "Tap again to delete"; return; }
  const s = activeSession(); if (s) { addEvent("entity.deleted", { ref: s.id }); try { localStorage.removeItem(pauseKey(s)); } catch (_) {} } rebuild(); closeSheet(); closeDialog(); stopRest(); wakeOff(); PAGE = null; STACK = []; render();
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
const setChip = x => "<span>" + (x.kg ? fmtKg(x.kg) + " × " : "") + x.reps + (x.p ? '<em class="pp">+' + x.p + "</em>" : "") + (x.rir != null ? ' <i class="rir r' + Math.min(6, x.rir) + '" style="font-style:normal">' + x.rir + "</i>" : "") + (x.q === "cheated" ? ' <b style="color:var(--red);font-size:11px">cheat</b>' : "") + "</span>";
ACT.delSession = el => { if (el.dataset.sure !== "1") { el.dataset.sure = "1"; el.textContent = "Tap again to delete"; return; } addEvent("entity.deleted", { ref: el.dataset.id }); rebuild(); closeSheet(); render(); toast("Workout deleted"); };

// info sheet
const EQ_NAME = { bb: "Barbell", bw: "Body weight", cable: "Cable", db: "Dumbbells", machine: "Machine", plate: "Plate-loaded machine", smith: "Smith machine" };
ACT.infoSheet = el => {
  if (el.dataset.ex) INFO_ID = el.dataset.ex; INFOTAB = el.dataset.tab || "Instructions";
  const id = INFO_ID, e = getEx(id), hist = histFor(id), tags = tagsOf(id);
  let h = '<div class="ptabs sheet-tabs">' + ["Instructions", "Details", "History"].map(t => '<button class="' + (t === INFOTAB ? "on" : "") + '" data-a="infoSheet" data-tab="' + t + '">' + t + "</button>").join("") + "</div>";
  if (INFOTAB === "Instructions") {
    const v = MUSCLE_VIEW[tags[0]] || ["front"], lv = {}; tags.forEach((m, k) => lv[m] = k ? 0.4 : 1);
    h += '<div class="infobody"><img class="ti" alt="" src="thumbs-v3/e-' + id + '.webp"></div>';
    h += '<div class="cue" style="margin-top:14px"><b>How to:</b> ' + esc(e.cue) + "</div>";
    h += '<div class="kv"><span>Rep range</span><b>' + e.r[0] + "-" + e.r[1] + (e.t ? " sec" : " reps") + (e.each ? " each side" : "") + '</b></div><div class="kv"><span>Rest</span><b>' + fmtRest(e.rest) + "</b></div>";
  } else if (INFOTAB === "Details") {
    h += '<div class="tm" style="margin-top:12px">' + tags.map((m, k) => '<button class="tmc press" data-a="muscle" data-m="' + esc(m) + '"><div class="thumb">' + muscleThumb(m) + "</div><div><b>" + esc(m) + "</b><span>" + (k ? "Secondary" : "Primary") + "</span></div></button>").join("") + "</div>";
    h += '<div class="sl">Details</div><div class="kv"><span>Type</span><b>' + (e.kind === "c" ? "Compound" : e.kind === "core" ? "Core" : "Isolation") + '</b></div><div class="kv"><span>Equipment</span><b>' + (EQ_NAME[e.eq] || e.eq) + '</b></div><div class="kv"><span>Laterality</span><b>' + (e.each ? "One side at a time" : "Both sides together") + '</b></div><div class="kv"><span>Metrics</span><b>' + (e.t ? "Time" : e.eq === "bw" ? "Reps" : "Weight × Reps") + '</b></div><div class="kv"><span>Weight step</span><b>' + (e.eq === "bw" ? "Body weight" : "2.5 kg") + "</b></div>";
  } else {
    const best = hist.length ? hist.flatMap(x => x.sets).reduce((a, s2) => e1rm(s2.kg || 0, s2.reps) > e1rm(a.kg || 0, a.reps) ? s2 : a) : null;
    if (best) h += '<div class="kv"><span>Best set</span><b>' + (best.kg ? fmtKg(best.kg) + " kg × " : "") + best.reps + '</b></div><div class="kv"><span>Estimated max</span><b>' + (best.kg ? fmtKg(Math.round(e1rm(best.kg, best.reps) * 2) / 2) + " kg" : best.reps + " reps") + '</b></div><div class="kv"><span>Workouts</span><b>' + hist.length + "</b></div>";
    if (hist.length > 1) h += '<div class="sl">Estimated max over time</div><div class="chart">' + lineChart(hist.map(x => ({ d: x.d, v: Math.max(...x.sets.map(s2 => e1rm(s2.kg || 0, s2.reps))) }))) + "</div>";
    if (hist.length) h += '<div class="sl">History</div>' + hist.slice().reverse().slice(0, 20).map(x => '<div class="hist-d">' + niceDate(x.d) + '</div><div class="hist-s">' + x.sets.map(setChip).join("") + "</div>").join("");
    else h += '<p class="hint" style="margin-top:18px">No history yet. Your sets show up here after you log them, and they stay forever.</p>';
  }
  openSheet(e.n, "", h, { tall: true, name: "info" });
};
const fmtRest = sec => sec >= 60 ? Math.floor(sec / 60) + " min" + (sec % 60 ? " " + sec % 60 + " s" : "") : sec + " s";

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
function stopRest() { REST = null; clearInterval(restIv); try { localStorage.removeItem("nitfit:rest"); } catch (_) {} paintRest(); if (!(activeSession() && setOn("keepAlive"))) wakeOff(); }
function paintRest() {
  const pill = $("#restpill"), t = $("#restt"), bar = $("#restbar");
  if (!REST) { if (pill) { pill.className = "restw"; t.textContent = "0:00"; bar.style.width = "0"; } return; }
  const left = REST.end - Date.now();
  if (left <= 0 && !REST.rang) { REST.rang = true; beep(); haptic(); setTimeout(() => { if (REST && REST.rang) stopRest(); }, 5000); }
  if (pill) { pill.className = "restw " + (REST.rang ? "done" : "on"); t.textContent = REST.rang ? "Go" : restLeft(); bar.style.width = REST.rang ? "100%" : Math.max(0, Math.min(100, left / REST.total * 100)) + "%"; }
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
ACT.history = () => openPage({ kind: "history" });
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
  let h = '<div class="sc4">' + [[I.scale, "Weight", "weightSheet"], [I.tape, "Waist", "waistSheet"], [I.ruler, "Metrics", "measureSheet"], [I.hist, "History", "history"]].map(x => '<button data-a="' + x[2] + '"><span>' + x[0] + "</span>" + x[1] + "</button>").join("") + "</div>";
  const card = (lbl, k, a) => { const items = itemsForDay(k, today()), mus = []; items.forEach(it => tagsOf(it.ex).forEach(m => { if (!mus.includes(m)) mus.push(m); })); return '<button class="upnext press" data-a="' + a + '" data-day="' + k + '"><div class="m"><b>' + lbl + " · " + esc(DAYS[k].name) + '</b><div class="ex">' + esc(items.map(it => (getEx(it.ex) || {}).n).join(", ")) + '</div><div class="tags">' + mus.slice(0, 5).map(m => '<span class="tag">' + esc(m) + "</span>").join("") + "</div></div>" + I.chev + "</button>"; };
  if (act && act.dayKey) h += card("In Progress", act.dayKey, "resume");
  else if (act) h += optRow(I.dumb, "Resume " + esc(act.name), "", "resume");
  else if (dk) h += card(doneOn(today()) ? "Done today" : "Up Next", dk, "preview");
  else h += '<div class="upnext"><div class="m"><b>Rest day</b><div class="ex">Saturday is for recovery. Walk, stretch, sleep.</div></div></div>';
  if (!act) h += optRow(I.empty, "Empty Workout", "", "emptyWorkout", "", "chev") + optRow(I.cal, "Train a different day", "", "pickDay", "", "chev");
  openSheet("Shortcuts", "", h);
};
ACT.pickDay = () => openSheet("Which workout?", "", DAY_KEYS.map(k => '<button class="opt" data-a="preview" data-day="' + k + '"><div class="m"><b>' + esc(DAYS[k].name) + "</b><span>" + esc(DAYS[k].sub) + "</span></div>" + I.chev + "</button>").join(""));

// ===== body: weight, waist, measurements =====
function saveWeight(v) { const kg = numIn(v); if (kg == null) return; if (kg < 35 || kg > 150) return toast("Type it in kg"); addEvent("weight.logged", { kg: Math.round(kg * 10) / 10 }); haptic(); toast("Weight saved"); closeSheet(); render(); }
function saveWaist(v) { const inch = numIn(v); if (inch == null) return; if (inch < 20 || inch > 50) return toast("Type it in inches"); addEvent("waist.logged", { inch: Math.round(inch * 4) / 4 }); haptic(); toast("Waist saved"); closeSheet(); render(); }
const ddmmyyyy = d => d.slice(8) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4);
function entrySheet(d, kind) {
  kind = kind || "scale"; ENTRY_D = d; ENTRY_K = kind; const w = S.weights[d], wa = S.waists[d], fut = d > today();
  GV.eW = w ? String(w.kg) : ""; GV.eBf = w && w.bf != null ? String(w.bf) : ""; GV.eWa = wa ? String(wa.inch) : "";
  const title = '<label class="dpick">' + ddmmyyyy(d) + " " + I.down + '<input type="date" id="entryDate" value="' + d + '"></label>';
  const has = kind === "waist" ? wa : w;
  const right = has ? '<button class="ib plain" data-a="entryDel" aria-label="Delete">' + I.trash + "</button>" : "";
  const body = fut ? '<p class="hint" style="margin-top:6px">This day has not happened yet. Pick today or an earlier day.</p>'
    : kind === "waist" ? '<div class="ef one"><div><label>Waist</label>' + gField("eWa", GV.eWa, "in", "Waist", "0.25") + '</div></div><button class="big" style="margin-top:14px" data-a="entrySave">Save</button>'
    : '<div class="ef wbf"><div><label>Weight</label>' + gField("eW", GV.eW, "kg", "Weight", "0.1") + '</div><div><label>Body Fat</label>' + gField("eBf", GV.eBf, "%", "Body fat", "0.5") + '</div></div><button class="big" style="margin-top:14px" data-a="entrySave">Save</button>';
  openSheet("", kind === "waist" ? "Waist" : "Scale Weight", body, { titleHtml: title, right, name: "entry" });
  if (!fut && !has) setTimeout(() => { const f = $('[data-k="' + (kind === "waist" ? "eWa" : "eW") + '"]'); if (f) ACT.gpOpen(f); }, 380);
}
let ENTRY_K = "scale";
ACT.weightSheet = el => entrySheet((el && el.dataset && el.dataset.d) || today(), "scale");
ACT.entrySave = () => {
  gpClose(); const d = ENTRY_D, kg = numIn(GV.eW), bf = numIn(GV.eBf), inch = numIn(GV.eWa);
  if (ENTRY_K === "waist") {
    if (inch == null) return toast("Type your waist");
    if (inch < 20 || inch > 50) return toast("Waist should be in inches");
    addEvent("waist.logged", { inch: Math.round(inch * 4) / 4 }, d);
  } else {
    if (kg == null) return toast("Type your weight");
    if (kg < 35 || kg > 150) return toast("Weight should be in kg");
    if (bf != null && (bf < 3 || bf > 40)) return toast("Body fat should be a %");
    addEvent("weight.logged", bf == null ? { kg: Math.round(kg * 10) / 10 } : { kg: Math.round(kg * 10) / 10, bf: Math.round(bf * 10) / 10 }, d);
  }
  haptic(); closeSheet(); toast("Saved"); render(); if (PAGE) renderPage(true);
};
ACT.entryDel = el => { if (el.dataset.sure !== "1") { el.dataset.sure = "1"; el.classList.add("warn"); toast("Tap the bin again to delete"); return; } const d = ENTRY_D, x = ENTRY_K === "waist" ? S.waists[d] : S.weights[d]; if (x) addEvent("entity.deleted", { ref: x.id }); rebuild(); closeSheet(); toast("Deleted"); render(); if (PAGE) renderPage(true); };
ACT.saveW = () => saveWeight($("#wEdit").value);
ACT.waistSheet = el => entrySheet((el && el.dataset && el.dataset.d) || today(), "waist");
ACT.saveWa = () => saveWaist($("#waEdit").value);
const MEAS = [["armR", "Arm, relaxed"], ["armF", "Arm, flexed"], ["calf", "Calf"], ["neck", "Neck"], ["thigh", "Thigh"], ["chest", "Chest"]];
ACT.measureSheet = () => {
  const last = Object.values(S.measures).sort((a, b) => a.d < b.d ? 1 : -1)[0] || {};
  MEAS.forEach(([k]) => { GV["m:" + k] = ""; });
  openSheet("Measurements", "Inches, once a month", MEAS.map(([k, n]) => '<div class="kv" style="align-items:center"><span>' + n + "</span>" + gField("m:" + k, "", "in", n, "0.25", last[k] ? String(last[k]) : "in") + "</div>").join("") + '<button class="big" style="margin-top:14px" data-a="saveMeas">Save</button>', { name: "meas" });
};
ACT.saveMeas = () => { gpClose(); const p = {}; MEAS.forEach(([k]) => { const v = numIn(GV["m:" + k]); if (v != null) p[k] = v; }); if (!Object.keys(p).length) return toast("Type at least one"); addEvent("measure.logged", p); closeSheet(); toast("Saved"); render(); };

// ===== Levels =====
function levelMap() { const mv = muscleSets(7 * LVRANGE, today()), lv = {}; ALL_MUSCLES.forEach(m => { const v = (mv[m] || 0) / LVRANGE; lv[m] = v > 0 ? Math.min(1, 0.15 + v / 18) : 0; }); return { mv, lv }; }
function vLevels() {
  const { mv } = levelMap();
  let h = "<div class='body-pad'>";
  h += '<div class="b3w"><div id="b3slot" class="b3slot"></div><button class="b2name" id="b3name" data-a="b2Open" hidden></button><button class="ib b3home" data-a="b3Home" aria-label="Reset view">' + I.rotate + '</button><div class="mcard" id="b3card"></div></div>';
  h += '<div class="legend"><i></i>Average weekly sets over <button data-a="lvRange">' + LVRANGE + "-week " + I.down + "</button></div>";
  ["Upper", "Lower"].forEach(g => {
    h += "<h2>" + g + ' Body Levels</h2><div class="card">' + MUSCLE_GROUPS[g].map(m => { const v = (mv[m] || 0) / LVRANGE; return '<button class="lvrow press" data-a="muscle" data-m="' + esc(m) + '"><div class="thumb">' + muscleThumb(m) + '</div><div class="m"><b>' + esc(m) + "</b><span>" + fmtKg(Math.round(v * 10) / 10) + " sets</span></div></button>"; }).join("") + "</div>";
  });
  return h + "</div>";
}
// ---- the body: 4 painted views (front, side, back, side). Red by default; the tapped muscle turns blue.
// No canvas pixel reads anywhere (iPhone adds noise to those): tap maps come as small run-length files, masks as PNGs.
const BV = ["front", "faceleft", "back", "faceright"], BMW = 750, BMH = 1536, BDIR = "body-v4/";
// body centre and half-width of the waist in each painting (picture pixels), used to make one picture turn into the next
const BCX = [372, 379, 376, 358], BHW = [115, 77, 115, 82];
const BOPEN = { "Upper Chest": "Chest", "Mid Chest": "Chest", "Lower Chest": "Chest", "Outer Calf": "Calves", "Inner Calf": "Calves", Abductors: "Glutes" };
const B2 = { el: null, maps: {}, G: null, pos: 0, z: 1, px: 0, py: 0, sel: null, anim: 0, live: false };
function attachBody2d() {
  const slot = $("#b3slot"); if (!slot) return;
  if (!B2.el) b2Build();
  slot.appendChild(B2.el); b2Layout(); b2Name();
}
function b2Build() {
  const el = B2.el = document.createElement("div"); el.className = "b2";
  el.innerHTML = '<div class="b3load"><i></i>Loading body...</div><div class="b2stage">' + BV.map(v => '<div class="b2v" data-v="' + v + '"><img class="b2base" alt="" draggable="false" src="' + BDIR + v + '.webp"><img class="b2pick" alt="" draggable="false" src="' + BDIR + v + '-blue.webp"></div>').join("") + '</div>';
  const first = $(".b2v[data-v=front] .b2base", el), done = () => { const l = $(".b3load", el); if (l) l.remove(); };
  if (first.complete) done(); else first.addEventListener("load", done);
  fetch(BDIR + "info.json").then(r => r.json()).then(info => {
    B2.G = info.G;
    return Promise.all(BV.map(v => fetch(BDIR + v + ".bin").then(r => r.arrayBuffer()).then(buf => {
      const b = new Uint8Array(buf), L = new Uint8Array(BMW * BMH); let p = 0;
      for (let i = 0; i + 2 < b.length; i += 3) { const lab = b[i], n = b[i + 1] | (b[i + 2] << 8); if (lab) L.fill(lab, p, p + n); p += n; }
      B2.maps[v] = L;
    })));
  }).catch(e => console.error(e));
  b2Gestures(el);
  new ResizeObserver(() => b2Layout()).observe(el);
}
function b2Layout() {
  const el = B2.el; if (!el || !el.isConnected) return; const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
  const T = 14, Bt = 22; B2.W = W; B2.H = H; B2.bh = H - T - Bt; B2.bw = B2.bh * 1500 / 3072; B2.T = T; b2Paint();
}
// while a finger is on the screen the stage is scaled with a transform (fast); when it lifts, the real size is set so the picture redraws sharp
function b2Paint() {
  const el = B2.el; if (!el || !B2.W) return; const n = BV.length, p = ((B2.pos % n) + n) % n, i0 = Math.floor(p), f = p - i0, i1 = (i0 + 1) % n;
  const sm = t => t * t * (3 - 2 * t), bw = (B2.bw || 1) * (B2.live ? 1 : B2.z), px = d => d / BMW * bw;
  // during a turn: the leaving body narrows toward the next body's width, the arriving one widens from the leaving body's width
  const kA = BHW[i1] / BHW[i0], kB = BHW[i0] / BHW[i1], e = sm(f);
  $$(".b2v", el).forEach((v, i) => {
    let o = 0, sx = 1, dx = 0, z = 0, br = 1;
    const centre = px(BMW / 2 - BCX[i]);
    if (i === i0) { sx = 1 + (kA - 1) * e; o = 1 - sm(Math.max(0, Math.min(1, (f - 0.5) / 0.3))); dx = centre; z = 1; }
    else if (i === i1 && f > 0) { sx = kB + (1 - kB) * e; o = sm(Math.max(0, Math.min(1, (f - 0.28) / 0.34))); dx = centre; z = 2; }
    v.style.opacity = o; v.style.visibility = o > 0.002 ? "visible" : "hidden"; v.style.zIndex = z;
    v.style.transform = "translateX(" + dx + "px) scaleX(" + sx + ")";
  });
  const st = $(".b2stage", el), cx = B2.W / 2 + B2.px, cy = B2.T + B2.bh / 2 + B2.py;
  if (B2.live) { st.style.width = B2.bw + "px"; st.style.height = B2.bh + "px"; st.style.left = (B2.W - B2.bw) / 2 + "px"; st.style.top = B2.T + "px"; st.style.transform = "translate(" + B2.px + "px," + B2.py + "px) scale(" + B2.z + ")"; }
  else { const w = B2.bw * B2.z, h = B2.bh * B2.z; st.style.transform = ""; st.style.width = w + "px"; st.style.height = h + "px"; st.style.left = cx - w / 2 + "px"; st.style.top = cy - h / 2 + "px"; }
  el.classList.toggle("zoomed", B2.z > 1.01);
}
function b2Select(g) {
  B2.sel = g; const G = B2.G || [], gi = g ? G.indexOf(g) + 1 : 0;
  BV.forEach(v => {
    const pk = $('.b2v[data-v="' + v + '"] .b2pick', B2.el), has = gi && B2.maps[v] && B2.maps[v].indexOf(gi) >= 0;
    if (!has) { pk.classList.remove("on"); return; }
    const u = "url(" + BDIR + "m/" + v + "-" + gi + ".png)"; pk.style.webkitMaskImage = pk.style.maskImage = u; pk.classList.add("on");
  });
  b2Name();
}
function b2Name() {
  const b = $("#b3name"), c = $("#b3card"); if (b) b.hidden = true; if (!c) return;
  if (!B2.sel) { c.classList.remove("on"); return; }
  // the tapped muscle's numbers, right under the body: no scrolling needed
  const m = BOPEN[B2.sel] || B2.sel, d = today(), w1 = muscleSets(7, d)[m] || 0, w4 = (muscleSets(28, d)[m] || 0) / 4, from = addDays(d, -27), cnt = {};
  Object.values(S.sets).forEach(x => { if (x.w || x.d < from || x.d > d || !tagsOf(x.exId).includes(m)) return; cnt[x.exId] = (cnt[x.exId] || 0) + 1; });
  const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 3);
  const sub = B2.sel !== m ? '<span class="mcs">' + esc(B2.sel) + "</span>" : "";
  c.innerHTML = '<button class="mch press" data-a="b2Open"><div><b>' + esc(m) + "</b>" + sub + "</div>" + I.chev + "</button>"
    + '<div class="mcn"><div><b>' + fmtKg(Math.round(w1 * 10) / 10) + '</b><span>Sets this week</span></div><div><b>' + fmtKg(Math.round(w4 * 10) / 10) + "</b><span>4-week average</span></div></div>"
    + (top.length ? '<div class="mce">' + top.map(x => '<button class="press" data-a="openEx" data-ex="' + x + '"><span>' + esc((getEx(x) || {}).n || x) + "</span><em>" + cnt[x] + " sets</em></button>").join("") + "</div>"
      : '<p class="mc0">No sets for this muscle in the last 4 weeks.</p>');
  c.classList.add("on");
}
function b2Hit(cx, cy) {
  const n = BV.length, v = BV[Math.round(((B2.pos % n) + n) % n) % n], L = B2.maps[v]; if (!L || !B2.G) return null;
  const r = $('.b2v[data-v="' + v + '"]', B2.el).getBoundingClientRect(), X = Math.floor((cx - r.left) / r.width * BMW), Y = Math.floor((cy - r.top) / r.height * BMH);
  for (let rad = 0; rad <= 10; rad += 2) for (let dy = -rad; dy <= rad; dy += 2) for (let dx = -rad; dx <= rad; dx += 2) {
    const x = X + dx, y = Y + dy; if (x < 0 || y < 0 || x >= BMW || y >= BMH) continue; const g = L[y * BMW + x]; if (g) return B2.G[g - 1];
  }
  return null;
}
function b2Clamp() {
  B2.z = Math.max(1, Math.min(4, B2.z));
  const mx = Math.max(0, (B2.bw * B2.z - B2.W) / 2 + 40), my = Math.max(0, (B2.bh * B2.z - B2.H) / 2 + 40);
  if (B2.z <= 1.001) { B2.px = 0; B2.py = 0; } else { B2.px = Math.max(-mx, Math.min(mx, B2.px)); B2.py = Math.max(-my, Math.min(my, B2.py)); }
}
function b2Animate(to, ms) {
  cancelAnimationFrame(B2.anim); B2.live = true; const from = { pos: B2.pos, z: B2.z, px: B2.px, py: B2.py }, t0 = performance.now(), e = t => 1 - Math.pow(1 - t, 3.2);
  const step = now => { const t = Math.min(1, (now - t0) / ms), k = e(t); for (const key in to) B2[key] = from[key] + (to[key] - from[key]) * k; b2Paint(); if (t < 1) B2.anim = requestAnimationFrame(step); else { B2.pos = ((Math.round(B2.pos) % 4) + 4) % 4; B2.live = false; b2Paint(); } };
  B2.anim = requestAnimationFrame(step);
}
function b2ZoomAt(cx, cy, z) {
  const r = B2.el.getBoundingClientRect(), ox = cx - r.left - B2.W / 2, oy = cy - r.top - (B2.T + B2.bh / 2), k = z / B2.z;
  B2.px = ox - (ox - B2.px) * k; B2.py = oy - (oy - B2.py) * k; B2.z = z;
}
function b2Gestures(el) {
  const P = new Map(); let mode = null, sx = 0, sy = 0, st = 0, spos = 0, lastX = 0, lastY = 0, lastT = 0, vel = 0, pinch = null, lastTap = 0, tapX = 0, tapY = 0;
  const settle = () => { B2.live = false; b2Paint(); };
  el.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return; cancelAnimationFrame(B2.anim);
    P.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { el.setPointerCapture(e.pointerId); } catch (_) {}
    if (P.size === 1) { mode = "maybe"; sx = lastX = e.clientX; sy = lastY = e.clientY; st = lastT = performance.now(); spos = B2.pos; vel = 0; }
    else if (P.size === 2) { const [a, b] = [...P.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: B2.z, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; mode = "pinch"; B2.live = true; if (Math.abs(B2.pos - Math.round(B2.pos)) > 0.001) B2.pos = Math.round(B2.pos) % 4; b2Paint(); }
  });
  el.addEventListener("pointermove", e => {
    if (!P.has(e.pointerId)) return; P.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (mode === "pinch" && P.size >= 2) {
      const [a, b] = [...P.values()], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, d = Math.hypot(a.x - b.x, a.y - b.y);
      B2.px += mx - pinch.mx; B2.py += my - pinch.my; pinch.mx = mx; pinch.my = my;
      b2ZoomAt(mx, my, Math.max(0.85, Math.min(4.5, pinch.z * d / pinch.d))); b2Paint(); e.preventDefault(); return;
    }
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (mode === "maybe" && Math.hypot(dx, dy) > 8) { mode = B2.z > 1.01 ? "pan" : Math.abs(dx) > Math.abs(dy) ? "turn" : "scroll"; if (mode !== "scroll") B2.live = true; }
    const now = performance.now();
    if (mode === "turn") { B2.pos = spos - dx / (B2.W * 0.7); if (now > lastT) vel = vel * 0.4 + 0.6 * (e.clientX - lastX) / (now - lastT); lastX = e.clientX; lastT = now; b2Paint(); e.preventDefault(); }
    else if (mode === "pan") { B2.px += e.clientX - lastX; B2.py += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; b2Clamp(); b2Paint(); e.preventDefault(); }
  });
  const end = e => {
    if (!P.has(e.pointerId)) return; P.delete(e.pointerId); const was = mode;
    if (was === "pinch") { if (P.size === 1) { const [a] = [...P.values()]; mode = "pan"; lastX = a.x; lastY = a.y; return; } if (B2.z < 1.05) b2Animate({ z: 1, px: 0, py: 0 }, 220); else { b2Clamp(); settle(); } mode = null; return; }
    if (P.size) return; mode = null;
    if (was === "turn") { const v = performance.now() - lastT > 90 ? 0 : -vel / (B2.W * 0.55) * 1000; let tgt = Math.round(B2.pos + v * 0.28); if (Math.abs(v) > 0.6 && tgt === Math.round(B2.pos)) tgt += Math.sign(v); const dist = Math.abs(tgt - B2.pos); b2Animate({ pos: tgt }, Math.min(900, 280 + dist * 260)); return; }
    if (was === "pan") { settle(); return; }
    if (was === "maybe" && e.type === "pointerup" && performance.now() - st < 400) {
      const now = performance.now();
      if (now - lastTap < 300 && Math.hypot(e.clientX - tapX, e.clientY - tapY) < 30) { lastTap = 0; if (B2.z > 1.01) b2Animate({ z: 1, px: 0, py: 0 }, 260); else { const z0 = B2.z, px0 = B2.px, py0 = B2.py; b2ZoomAt(e.clientX, e.clientY, 2.4); b2Clamp(); const to = { z: B2.z, px: B2.px, py: B2.py }; B2.z = z0; B2.px = px0; B2.py = py0; b2Animate(to, 260); } return; }
      lastTap = now; tapX = e.clientX; tapY = e.clientY;
      if (Math.abs(B2.pos - Math.round(B2.pos)) > 0.01) return;
      const g = b2Hit(e.clientX, e.clientY);
      if (g && g === B2.sel) { ACT.b2Open(); return; }  // second tap on the blue muscle opens it
      if (g) haptic(); b2Select(g);
    }
  };
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  ["gesturestart", "gesturechange"].forEach(t => el.addEventListener(t, e => e.preventDefault()));
  el.addEventListener("touchmove", e => { if (e.touches.length > 1 || B2.z > 1.01) e.preventDefault(); }, { passive: false });
}
ACT.b2Open = () => { if (!B2.sel) return; const m = BOPEN[B2.sel] || B2.sel; ACT.muscle({ dataset: { m } }); };
ACT.b3Home = () => { b2Select(null); b2Animate({ pos: Math.round(B2.pos / 4) * 4, z: 1, px: 0, py: 0 }, 300); };
ACT.flip = () => { FLIP = FLIP === "front" ? "back" : "front"; SCROLL.levels = $("#main").scrollTop; render(); };
ACT.lvRange = () => { LVRANGE = LVRANGE === 1 ? 4 : 1; SCROLL.levels = $("#main").scrollTop; render(); };
// ===== Profile and Settings =====
function weekStreak() {
  const fin = sessionsSorted().filter(x => x.endTs && sessionSets(x.id).length).map(x => x.d); if (!fin.length) return 0;
  let w = weekSun(today()), n = 0; if (!fin.some(d => d >= w)) w = addDays(w, -7);
  while (fin.some(d => d >= w && d <= addDays(w, 6))) { n++; w = addDays(w, -7); }
  return n;
}
function vProfile() {
  const first = EV.length ? EV.reduce((a, e) => e.d < a ? e.d : a, EV[0].d) : today(), fin = sessionsSorted().filter(x => x.endTs && sessionSets(x.id).length);
  const sets = Object.values(S.sets).filter(x => !x.w).length, wl = weightList(), ws = Object.values(S.waists).sort((a, b) => a.d < b.d ? -1 : 1);
  let h = '<div class="d2 pf">' + head("Profile", "", '<button class="ib" data-a="settings" aria-label="Settings">' + '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="5.5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18.5" cy="12" r="1.9"/></svg>' + "</button>") + '</div><div class="body-pad">';
  h += '<div class="pfh"><button class="pfa" data-a="pickAvatar" aria-label="Change photo">' + (S.settings.avatar ? '<img src="' + S.settings.avatar + '" alt="">' : "N") + "<i>" + I.pencil + '</i></button><div class="pfn"><b>Nit</b><span>Training since ' + MONTHS_LONG[+first.slice(5, 7) - 1] + " " + first.slice(0, 4) + "</span></div></div>";
  h += '<div class="pfs"><div><b>' + fin.length + "</b><span>Workouts</span></div><div><b>" + sets + "</b><span>Sets</span></div><div><b>" + weekStreak() + "</b><span>Week streak</span></div></div>";
  const kg = wl.length ? wl[wl.length - 1].kg : null, kg0 = wl.length ? wl[0].kg : null, wa = ws.length ? +ws[ws.length - 1].inch : null;
  h += '<div class="d2sec"><h2>Body</h2></div><div class="d2grid">'
    + d2card("openPage", ' data-k="scale"', "Weight", wl.length ? "Since " + dShort(wl[0].d) : "No entries yet", d2num(kg == null ? "--" : kg.toFixed(1), kg == null ? "" : "kg"), kg == null ? "Log your morning weight" : (kg - kg0 === 0 ? "No change yet" : d2sign(kg - kg0) + " kg in total"))
    + d2card("openPage", ' data-k="waist"', "Waist", ws.length ? "Latest entry" : "No entries yet", d2num(wa == null ? "--" : wa.toFixed(1), wa == null ? "" : "in"), ws.length ? dShort(ws[ws.length - 1].d) : "Measure each week") + "</div>";
  h += '<div class="d2sec"><h2>Personal records</h2></div>' + recordsHtml();
  h += '<div class="d2sec"><h2>Recent workouts</h2>' + (fin.length ? '<button class="d2see" data-a="history">See all</button>' : "") + "</div>";
  h += fin.length ? '<div class="pfl">' + fin.slice(-5).reverse().map(x => '<div class="pfr"><div class="m"><b>' + esc(x.name || "Workout") + "</b><span>" + dShort(x.d) + "</span></div><em>" + sessionSets(x.id).length + " sets</em></div>").join("") + "</div>"
    : '<div class="pfl"><div class="pfr"><div class="m"><span>Your finished workouts show up here.</span></div></div></div>';
  return h + "</div></div>";
}
ACT.settings = () => openPage({ kind: "settings" });
// profile photo: picked from the phone, cut to a square, made small, saved with the rest of your data
ACT.pickAvatar = () => { let f = $("#avIn"); if (!f) { f = document.createElement("input"); f.type = "file"; f.accept = "image/*"; f.id = "avIn"; f.hidden = true; document.body.appendChild(f); f.addEventListener("change", () => { const file = f.files[0]; f.value = ""; if (!file) return; const im = new Image(), u = URL.createObjectURL(file); im.onload = () => { const c = document.createElement("canvas"), N = 240, k = Math.min(im.width, im.height); c.width = c.height = N; c.getContext("2d").drawImage(im, (im.width - k) / 2, (im.height - k) / 2, k, k, 0, 0, N, N); URL.revokeObjectURL(u); addEvent("settings.upserted", { avatar: c.toDataURL("image/jpeg", 0.82) }); paintAvatar(); render(); haptic(); }; im.src = u; }); } f.click(); };
function paintAvatar() {
  const b = $("#tabs .tyou"); if (!b) return;
  b.innerHTML = '<span class="tbg"></span><span class="tic"><svg viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="tuc"><circle cx="12" cy="12" r="8.4"/></clipPath></defs><circle cx="12" cy="12" r="9.3" fill="none" stroke="currentColor" stroke-width="1.8"/><g clip-path="url(#tuc)" fill="currentColor"><circle cx="12" cy="9.6" r="3.3"/><ellipse cx="12" cy="19.6" rx="6.4" ry="4.6"/></g></svg></span>';
  b.setAttribute("aria-label", "Profile");
}
function vSettings() {
  const st = syncStatus(), t = S.settings.theme || "dark";
  let h = nav("Settings") + "<div class='body-pad'>";
  h += "<h2>General</h2><div class='card'>" + optRow(I.scale, "Weight", weightList().length ? weightList().slice(-1)[0].kg.toFixed(1) + " kg" : "", "openPage", ' data-k="scale"', "chev")
    + optRow(I.tape, "Waist", "", "openPage", ' data-k="waist"', "chev") + optRow(I.ruler, "Measurements", "", "measureSheet", "", "chev")
    + optRow(I.clock, "Daily Routine", "", "routine", "", "chev") + optRow(I.book, "Units", "Kilograms and inches", "units", "", "chev") + "</div>";
  h += "<h2>Feature Settings</h2><div class='card'>" + optRow(I.dash, "Dashboard", "", "dashCustom", "", "chev") + optRow(I.dumb, "Workout", "", "wsettings", "", "chev")
    + optRow(I.rocket, "Program Weeks", "Week " + programWeek(today()), "weeksInfo", "", "chev") + optRow(I.hist, "Exercises", "", "openPage", ' data-k="exlist"', "chev") + "</div>";
  h += '<h2>Theme</h2><div class="themes">' + [["system", "System"], ["light", "Light"], ["dark", "Dark"]].map(([k, n]) => '<button class="th-c' + (t === k ? " on" : "") + '" data-a="theme" data-v="' + k + '"><div class="th-p ' + k + '"><b>Aa</b><span><i></i><i></i><i></i><i></i></span></div>' + n + "</button>").join("") + "</div>";
  h += "<h2>Data Management</h2><div class='card'>"
    + '<button class="opt" data-a="backup"><span class="oi">' + I.cloud + '</span><div class="m"><b>Backup</b><span>' + esc(st.t) + '</span></div><span class="dotc" style="background:var(--' + (st.c === "green" ? "green" : st.c === "amber" ? "gold" : "red") + ')"></span></button>'
    + optRow(I.file, "Save a backup file", "", "exportFile") + optRow(I.file, "Load a backup file", "", "importFile") + "</div>";
  h += '<p class="hint" style="text-align:center;margin-top:24px">Version ' + APP_VERSION + " · " + EV.length + " entries saved</p>";
  return h + "</div>";
}
ACT.units = () => openSheet("Units", "", '<div class="kv"><span>Weight</span><b>Kilograms</b></div><div class="kv"><span>Waist and measurements</span><b>Inches</b></div><div class="kv"><span>Height</span><b>Centimetres</b></div><p class="hint" style="margin-top:12px">Weights move in 2.5 kg steps.</p>');
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
ACT.tab = el => { const t = el.dataset.tab; SCROLL[TAB] = $("#main").scrollTop; if (t === TAB) { $("#main").scrollTo({ top: 0, behavior: "smooth" }); return; } TAB = t; haptic(); $$("#tabs [data-tab]").forEach(b => b.classList.toggle("on", b.dataset.tab === TAB)); tabsPill(); requestAnimationFrame(() => setTimeout(render, 0)); };
document.addEventListener("click", e => { const el = e.target.closest("[data-a]"); if (!el) return; const f = ACT[el.dataset.a]; if (f) { e.preventDefault(); f(el, e); } });
document.addEventListener("DOMContentLoaded", () => {
  $("#importIn").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { const n = await importExport(JSON.parse(await f.text())); toast(n + " entries loaded"); render(); } catch (er) { toast(er.message || "Could not read that file"); } e.target.value = ""; });
});


// ===== app keypad (no iPhone keyboard while logging) =====
// one layout for every keypad:  1 2 3 [hide] / 4 5 6 [delete] / 7 8 9 [extra] / [corner] 0 0 [go]
function padGrid(act, hideAct, extra, corner, go, note) {
  const k = v => '<button class="kk" data-a="' + act + '" data-v="' + v + '">' + v + "</button>";
  const hide = '<button class="ks" data-a="' + hideAct + '" aria-label="Hide keypad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="11" rx="2"/><path d="M7 8h.01M11 8h.01M15 8h.01M7 11h10M9 19l3 2 3-2"/></svg></button>';
  const del = '<button class="kk del" data-a="' + act + '" data-v="del" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg></button>';
  return '<div class="kp-grid">' + k(1) + k(2) + k(3) + hide + k(4) + k(5) + k(6) + (note || '<span class="ks dim"></span>') + k(7) + k(8) + k(9) + extra + corner + k(0) + del + go + "</div>";
}

let KP = null;
function cellBtn(i, k, f, val, ph) {
  const has = val != null && val !== "", on = KP && KP.i === i && KP.k === k && (KP.f === f || (f === "reps" && (KP.f === "p" || KP.f === "rir")));
  return '<button class="cellb' + (has ? "" : " ph") + (on ? " act" : "") + '" data-a="kpOpen" data-i="' + i + '" data-k="' + k + '" data-f="' + f + '">' + (has ? esc(String(val)) : esc(ph || "")) + "</button>";
}
const kpKey = () => activeSession().id + ":" + KP.i + ":" + KP.k;
function kpCtx() { const s = activeSession(), R = rowsFor(s, KP.i); return { s, R, ex: R.ex, it: s.items[KP.i], st: R.logged[KP.k], r: R.rows[KP.k] }; }
function kpOpen(i, k, f) {
  if (KP) kpCommit();
  const s = activeSession(); if (!s) return;
  KP = { i, k, f: f === "kg" && (getEx(s.items[i].ex) || {}).eq === "bw" ? "reps" : f, buf: "", typed: false };
  document.body.classList.add("kpon"); renderPage(true); paintKp(); kpReveal();
}
ACT.kpOpen = el => { haptic(); kpOpen(+el.dataset.i, +el.dataset.k, el.dataset.f); };
function kpReveal() {
  requestAnimationFrame(() => setTimeout(() => {
    if (!KP) return; const row = $('.tr[data-i="' + KP.i + '"][data-k="' + KP.k + '"]'), pg = $("#page"), kp = $("#kp"), top = $(".lg-top"); if (!row) return;
    const rb = row.getBoundingClientRect(), limit = window.innerHeight - kp.offsetHeight - 12, head = top ? top.getBoundingClientRect().bottom + 8 : 0;
    if (rb.bottom > limit) pg.scrollTo({ top: pg.scrollTop + rb.bottom - limit, behavior: "smooth" }); else if (rb.top < head) pg.scrollTo({ top: pg.scrollTop - (head - rb.top), behavior: "smooth" });
  }, 60));
}
function kpCommit() {
  if (!KP || !KP.typed || KP.f === "rir") return;
  const c = kpCtx(), v = KP.buf;
  if (c.st) { const n = numIn(v); if (n == null) return; addEvent("set.edited", KP.f === "kg" ? { ref: c.st.id, kg: n } : KP.f === "reps" ? { ref: c.st.id, reps: Math.round(n) } : { ref: c.st.id, p: Math.round(n) }); return; }
  const D = (DRAFT[kpKey()] = DRAFT[kpKey()] || {}); D[KP.f] = v; if (KP.f === "kg") D.prop = false;
  if (KP.f === "kg" && setOn("propagate") && v !== "") for (let k2 = KP.k + 1; k2 < c.it.n; k2++) { if (c.R.logged[k2]) continue; const D2 = (DRAFT[activeSession().id + ":" + KP.i + ":" + k2] = DRAFT[activeSession().id + ":" + KP.i + ":" + k2] || {}); if (!D2.kg || D2.prop) { D2.kg = v; D2.prop = true; } }
}
function kpClose(silent) { if (!KP) return; if (!silent) kpCommit(); KP = null; document.body.classList.remove("kpon"); $("#kp").classList.remove("on"); if (!silent) renderPage(true); }
ACT.kpHide = () => { haptic(); kpClose(); };
function kpCur() {
  const c = kpCtx(), D = DRAFT[kpKey()] || {};
  if (KP.typed) return KP.buf;
  if (KP.f === "kg") return c.st ? fmtKg(c.st.kg) : (D.kg != null && D.kg !== "" ? D.kg : (c.r.kg != null ? fmtKg(c.r.kg) : ""));
  if (KP.f === "p") return c.st ? String(c.st.p || 0) : String(D.p || 0);
  return c.st ? String(c.st.reps) : (D.reps != null && D.reps !== "" ? D.reps : String(c.r.reps != null ? c.r.reps : c.r.lo));
}
function kpShow() {
  const cell = $('.tr[data-i="' + KP.i + '"][data-k="' + KP.k + '"] .cellb[data-f="' + (KP.f === "kg" ? "kg" : "reps") + '"]'); if (!cell) return;
  const c = kpCtx(), D = DRAFT[kpKey()] || {};
  if (!KP.typed && KP.f !== "p") { cell.textContent = kpCur(); cell.classList.add("ph", "act"); return; }
  if (KP.f === "kg") { cell.textContent = KP.buf; cell.classList.toggle("ph", false); }
  else { const full = KP.f === "reps" ? (KP.typed ? KP.buf : "") : (c.st ? c.st.reps : (D.reps || (c.r.reps != null ? c.r.reps : c.r.lo))), pp = KP.f === "p" ? (KP.typed ? KP.buf : "") : (c.st ? c.st.p : D.p); cell.innerHTML = esc(String(full)) + (KP.f === "p" || +pp ? '<em class="pp">+' + esc(String(pp || "")) + "</em>" : ""); cell.classList.remove("ph"); }
  cell.classList.add("act");
}
function paintKp() {
  const el = $("#kp"); if (!KP) { el.classList.remove("on"); return; }
  const c = kpCtx(), rirOn = setOn("rirTrack"), pk = kpKey(), rirCur = c.st ? c.st.rir : (PENDRIR[pk] !== undefined ? PENDRIR[pk] : c.r.rir), isKg = KP.f === "kg";
  let top = "";
  if (isKg) {
    const v = numIn(kpCur());
    top = '<div class="kp-info">' + (c.ex.eq === "bb" && v ? (v >= 20 ? fmtKg((v - 20) / 2) + " kg each side + 20 kg bar" : "Lighter than the 20 kg bar") : c.ex.eq === "db" && v ? fmtKg(v) + " kg in each hand" : "Weights move in 2.5 kg steps") + "</div>";
  } else if (rirOn) top = '<div class="kp-rir">' + [0, 1, 2, 3, 4, 5, 6, 7].map(v => '<button class="rir r' + Math.min(6, v) + (v === 7 ? " rplus" : "") + (rirCur === v ? " sel" : "") + '" data-a="kpRir" data-v="' + v + '">' + (v === 7 ? "+" : v) + "</button>").join("") + "</div>";
  const extra = isKg ? '<div class="ks pm"><button data-a="kpStep" data-v="-1">−</button><button data-a="kpStep" data-v="1">+</button></div>' : '<div class="ks pm fp"><button class="' + (KP.f !== "p" ? "on" : "") + '" data-a="kpMode" data-v="reps">F</button><button class="' + (KP.f === "p" ? "on" : "") + '" data-a="kpMode" data-v="p">P</button></div>';
  const corner = isKg ? '<button class="kk" data-a="kpKey" data-v=".">.</button>' : '<span class="kk"></span>';
  const note = '<button class="ks" data-a="kpNote" aria-label="Add a note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M8 15.5l1-3 6-6 2 2-6 6z"/></svg></button>';
  const go = '<button class="ks go" data-a="kpGo" aria-label="' + (isKg ? "Next" : "Log set") + '">' + (isKg ? I.next : I.tick) + "</button>";
  el.innerHTML = '<div class="kp-top">' + top + "</div>" + padGrid("kpKey", "kpHide", extra, corner, go, note);
  el.classList.add("on"); kpShow();
}
ACT.kpNote = () => {
  if (!KP) return; kpCommit(); const c = kpCtx(), key = kpKey(), cur = c.st ? (c.st.note || "") : ((DRAFT[key] || {}).note || "");
  NOTEK = { key, ref: c.st ? c.st.id : null, i: KP.i, k: KP.k };
  openSheet("Note", c.ex.n + " · Set " + (KP.k + 1), '<textarea class="field note" id="noteIn" rows="4" placeholder="How did it feel? Grip, pain, machine number...">' + esc(cur) + '</textarea><button class="big" style="margin-top:12px" data-a="noteSave">Save note</button>', { name: "note" });
};
let NOTEK = null;
ACT.noteSave = () => {
  const v = ($("#noteIn").value || "").trim(); if (!NOTEK) return;
  if (NOTEK.ref) addEvent("set.note", { ref: NOTEK.ref, note: v }); else (DRAFT[NOTEK.key] = DRAFT[NOTEK.key] || {}).note = v;
  NOTEK = null; $("#noteIn").blur(); closeSheet(); toast(v ? "Note saved" : "Note removed"); renderPage(true); if (KP) paintKp();
};
ACT.kpKey = el => {
  if (!KP) return; const v = el.dataset.v; haptic();
  if (KP.f === "rir") { if (v === "del" || v === ".") return; return ACT.kpRir({ dataset: { v: String(Math.min(6, +v)) } }); }
  // a digit replaces the planned number; delete takes off only the last digit of what is shown
  if (!KP.typed) { KP.buf = v === "del" ? String(kpCur() || "") : ""; KP.typed = true; }
  if (v === "del") KP.buf = KP.buf.slice(0, -1);
  else if (v === ".") { if (KP.f === "kg" && !KP.buf.includes(".")) KP.buf = (KP.buf || "0") + "."; }
  else if (KP.buf.replace(".", "").length < 5) KP.buf = KP.buf === "0" ? v : KP.buf + v;
  kpShow(); if (KP.f === "kg") paintKp();
};
ACT.kpStep = el => {
  const c = kpCtx(), cur = numIn(kpCur()) || 0, step = KP.f === "kg" ? (c.ex.step || 2.5) : 1;
  KP.buf = String(Math.max(0, Math.round((cur + step * +el.dataset.v) * 100) / 100)); KP.typed = true; haptic(); kpShow(); paintKp();
};
ACT.kpMode = el => {
  kpCommit(); const v = el.dataset.v;
  KP = { i: KP.i, k: KP.k, f: KP.f === v && v === "rir" ? "reps" : v, buf: "", typed: false };
  if (KP.f === "p") toast("Now typing partial reps"); else if (KP.f === "rir") toast("Type reps in reserve, 0 to 6"); haptic(); paintKp();
};
ACT.kpRir = el => {
  const c = kpCtx(), cur = c.st ? c.st.rir : (PENDRIR[kpKey()] !== undefined ? PENDRIR[kpKey()] : c.r.rir); let v = +el.dataset.v; if (v === cur) v = null;
  if (c.st) addEvent("set.rir", { ref: c.st.id, rir: v }); else PENDRIR[kpKey()] = v;
  haptic(); const keep = { i: KP.i, k: KP.k, f: KP.f === "rir" ? "reps" : KP.f }; kpCommit(); KP = Object.assign(keep, { typed: false, buf: "" }); renderPage(true); paintKp();
};
ACT.kpGo = () => {
  if (!KP) return; const c = kpCtx();
  if (KP.f === "kg") { kpCommit(); KP = { i: KP.i, k: KP.k, f: "reps", buf: "", typed: false }; renderPage(true); paintKp(); kpReveal(); return; }
  kpCommit();
  if (c.st) { kpClose(true); renderPage(true); return; }
  const btn = $('.tr[data-i="' + KP.i + '"][data-k="' + KP.k + '"] [data-a="tick"]'); const i = KP.i, k = KP.k;
  kpClose(true); ACT.tick(btn || { dataset: { i: String(i), k: String(k) }, closest: () => null });
};

// ===== the same keypad for any other number box =====
const GV = {}; let GP = null;
function gField(k, val, unit, label, step, ph) { return '<button class="gfield fin" data-a="gpOpen" data-k="' + k + '" data-unit="' + (unit || "") + '" data-label="' + esc(label || "") + '" data-step="' + (step || "1") + '"' + (ph ? ' data-ph="' + esc(ph) + '"' : "") + '><span class="gv' + (val ? "" : " ph") + '">' + esc(val || ph || "") + '</span><span class="gu">' + (unit || "") + "</span></button>"; }
function gpEl() { return $('[data-a="gpOpen"][data-k="' + GP.k + '"]'); }
function gpShow() {
  const el = gpEl(); if (!el) return; const v = GP.typed ? GP.buf : (GV[GP.k] != null ? GV[GP.k] : "");
  const t = $(".gv", el) || el; t.textContent = v || (GP.typed ? "" : (el.dataset.ph || (el.classList.contains("wbox") ? "kg" : ""))); t.classList.toggle("ph", !v);
  $$(".gfield.act").forEach(x => x.classList.remove("act")); el.classList.add("act");
}
ACT.gpOpen = el => {
  if (KP) kpClose(); if (GP) gpCommit();
  const k = el.dataset.k; if (k.startsWith("t:")) { const [, rk, f] = k.split(":"); GV[k] = String(TED.rows[+rk][f]); }
  GP = { k, int: el.dataset.int === "1", step: +(el.dataset.step || 1), label: el.dataset.label || "", unit: el.dataset.unit || "", buf: "", typed: false };
  document.body.classList.add("gpon"); haptic(); paintGp(); el.scrollIntoView({ block: "center", behavior: "smooth" });
};
function gpCommit() {
  if (!GP || !GP.typed) return; GV[GP.k] = GP.buf;
  if (GP.k.startsWith("t:") && TED) { const [, rk, f] = GP.k.split(":"); TED.rows[+rk][f] = Math.max(0, Math.round(numIn(GP.buf) || 0)); }
}
function gpClose() { if (!GP) return; gpCommit(); const k = GP.k; GP = null; document.body.classList.remove("gpon"); const kp = $("#kp"); kp.classList.remove("on", "gp"); $$(".gfield.act").forEach(x => x.classList.remove("act")); if (k.startsWith("t:") && TED && SHEET === "targets") paintTargets(); }
function paintGp() {
  const el = $("#kp"), L = { 2: "ABC", 3: "DEF", 4: "GHI", 5: "JKL", 6: "MNO", 7: "PQRS", 8: "TUV", 9: "WXYZ" };
  const k = v => '<button class="ik" data-a="gpKey" data-v="' + v + '"><b>' + v + "</b>" + (L[v] ? "<i>" + L[v] + "</i>" : "") + "</button>";
  el.innerHTML = '<div class="ipad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(k).join("") + (GP.int ? '<span class="ik blank"></span>' : '<button class="ik blank" data-a="gpKey" data-v=".">.</button>') + k(0)
    + '<button class="ik blank" data-a="gpKey" data-v="del" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg></button></div>';
  el.classList.add("on", "gp"); gpShow();
  requestAnimationFrame(() => document.body.style.setProperty("--kph", el.offsetHeight + "px"));
}
ACT.gpKey = el => {
  if (!GP) return; const v = el.dataset.v; haptic();
  if (!GP.typed) { GP.buf = v === "del" ? String(GV[GP.k] || "") : ""; GP.typed = true; }
  if (v === "del") GP.buf = GP.buf.slice(0, -1);
  else if (v === ".") { if (!GP.int && !GP.buf.includes(".")) GP.buf = (GP.buf || "0") + "."; }
  else if (GP.buf.replace(".", "").length < 5) GP.buf = GP.buf === "0" ? v : GP.buf + v;
  gpShow();
};
ACT.gpStep = el => { const cur = numIn(GP.typed ? GP.buf : GV[GP.k]) || (GP.k === "wIn" ? (weightList().slice(-1)[0] || { kg: 60 }).kg : 0); GP.buf = String(Math.max(0, Math.round((cur + GP.step * +el.dataset.v) * 100) / 100)); GP.typed = true; haptic(); gpShow(); };
ACT.gpDone = () => { const k = GP && GP.k; gpCommit(); const v = GV[k]; gpClose(); if (k === "wIn" && v) saveWeight(v); };

document.addEventListener("pointerdown", e => { if (GP && !e.target.closest("#kp") && !e.target.closest(".gfield") && !e.target.closest("[data-a=\"entrySave\"],[data-a=\"tSave\"],[data-a=\"saveMeas\"]")) gpClose(); }, true);
// ===== pause, mini player, dialog =====
const pauseKey = s => "nitfit:pause:" + s.id;
function pauseOf(s) { try { return JSON.parse(localStorage.getItem(pauseKey(s)) || "null") || { at: null, total: 0 }; } catch (_) { return { at: null, total: 0 }; } }
function elapsed(s) { const P = pauseOf(s); return (P.at || Date.now()) - Date.parse(s.startTs) - (P.total || 0); }
ACT.pauseToggle = () => {
  const s = activeSession(); if (!s) return; const P = pauseOf(s);
  if (P.at) { P.total = (P.total || 0) + Date.now() - P.at; P.at = null; toast("Workout resumed"); } else { P.at = Date.now(); toast("Workout paused"); }
  try { localStorage.setItem(pauseKey(s), JSON.stringify(P)); } catch (_) {}
  closeSheet(); haptic(); if (PAGE) renderPage(true); else paintMini();
};
function paintMini() {
  const m = $("#mini"), s = activeSession(), show = !!(s && !PAGE && (isStandalone() || /dev/.test(location.search)));
  m.hidden = !show; document.body.classList.toggle("hasmini", show);
  if (!show) return;
  const ci = pickLogi(s), P = pauseOf(s), th = [];
  [ci, ci + 1].forEach(i => { if (i >= 0 && i < s.items.length) th.push('<span class="thumb">' + tallThumb(s.items[i].ex) + "</span>"); });
  m.innerHTML = '<button class="mm" data-a="resume"><span class="clock" id="mclock">' + (P.at ? "Paused" : fmtClock(elapsed(s))) + '</span><span class="mth">' + th.join("") + "</span></button>"
    + '<button class="mb" data-a="pauseToggle" aria-label="' + (P.at ? "Resume" : "Pause") + '">' + (P.at ? I.play : I.pause) + '</button><button class="mb" data-a="finish" aria-label="Finish">' + I.stop + "</button>";
}
function openDialog(title, html) { $("#dlg h3").textContent = title; $("#dlg .db").innerHTML = html; $("#dlg").classList.add("on"); }
function closeDialog() { $("#dlg").classList.remove("on"); }
ACT.closeDialog = closeDialog;

// ===== workout settings =====
const WSET = [["General"],
  ["restOn", "Rest Timer", "Counts down after every set", "watch", true],
  ["smart", "Smart Progression", "Changes the next sets when one was too easy or too hard", "wand", true],
  ["warmAuto", "Warm-Up", "Show warm-up sets on every exercise", "fire", false],
  ["propagate", "Propagate Changes", "A weight you type fills the sets below it", "ss", true],
  ["rirTrack", "RIR Tracking", "Fill reps in reserve from your plan", "target", true],
  ["ssScroll", "Superset Auto-Scroll", "Jump between superset exercises after each set", "swap", true],
  ["autoNext", "Exercise Auto-Next", "Move on when every set of an exercise is done", "next", true],
  ["Display"],
  ["keepAlive", "Keep Alive", "Keep the screen on during a workout", "sun", true],
  ["showClock", "Workout Timer", "Show the time since you started", "clock", true]];
function vWset() {
  let h = nav("Workout") + '<div class="body-pad">', open = false;
  WSET.forEach(r => {
    if (r.length === 1) { if (open) h += "</div>"; h += "<h2>" + r[0] + '</h2><div class="card">'; open = true; return; }
    const on = setOn(r[0], r[4]);
    h += '<button class="opt" data-a="setTog" data-k="' + r[0] + '" data-def="' + (r[4] ? 1 : 0) + '"><span class="oi">' + I[r[3]] + '</span><div class="m"><b>' + r[1] + "</b><span>" + r[2] + '</span></div><span class="sw' + (on ? " on" : "") + '"><i></i></span></button>';
  });
  if (open) h += "</div>";
  h += '<h2>Rest chime</h2><div class="card" style="padding:14px 16px"><div class="tg" style="margin:0">' + [["0", "Off"], ["0.35", "Soft"], ["0.6", "Normal"], ["1", "Loud"]].map(([v, n]) => '<button class="' + (Math.abs((S.settings.vol == null ? 0.6 : S.settings.vol) - +v) < 0.01 ? "on" : "") + '" data-a="setVol" data-v="' + v + '">' + n + "</button>").join("") + "</div></div>";
  return h + "</div>";
}
ACT.wsettings = () => openPage({ kind: "wset" });
ACT.setTog = el => { const k = el.dataset.k, cur = setOn(k, el.dataset.def === "1"); addEvent("settings.upserted", { [k]: !cur }); haptic(); if (k === "keepAlive" && cur) wakeOff(); renderPage(true); };
ACT.setVol = el => { addEvent("settings.upserted", { vol: +el.dataset.v }); if (+el.dataset.v) beep(); renderPage(true); };

// ===== charts and metric pages =====
const RANGES = [["1W", 7], ["1M", 30], ["3M", 91], ["6M", 182], ["1Y", 365], ["All", 0]];
function rangeOf(key, firstD, def) {
  const r = RNG[key] || def || "1M", days = (RANGES.find(x => x[0] === r) || [0, 30])[1], to = today();
  let from = days ? addDays(to, -(days - 1)) : (firstD && firstD < to ? firstD : addDays(to, -29));
  return { from, to, r };
}
function rangeRow(key, def, avg) {
  const cur = RNG[key] || def || "1M";
  return '<div class="rngw"><div class="rng">' + RANGES.map(([n]) => '<button class="' + (n === cur ? "on" : "") + '" data-a="rng" data-k="' + key + '" data-v="' + n + '">' + n + "</button>").join("") + "</div>"
    + (avg ? '<button class="avg" data-a="avg" data-k="' + key + '">' + (AVG[key] || "D") + " " + I.down + "</button>" : "") + "</div>";
}
ACT.rng = el => { RNG[el.dataset.k] = el.dataset.v; haptic(); renderPage(true); };
ACT.avg = el => { const k = el.dataset.k; openSheet("Chart Averaging", "", [["D", "Daily"], ["W", "Weekly"], ["M", "Monthly"]].map(([v, n]) => '<button class="opt" data-a="avgSet" data-k="' + k + '" data-v="' + v + '"><div class="m"><b>' + v + " - " + n + '</b></div><span class="radio' + ((AVG[k] || "D") === v ? " on" : "") + '"></span></button>').join("")); };
ACT.avgSet = el => { AVG[el.dataset.k] = el.dataset.v; closeSheet(); renderPage(true); };
ACT.ptab = el => { PTAB[el.dataset.k] = el.dataset.v; haptic(); renderPage(true); };
const ptabs = (key, list) => '<div class="ptabs">' + list.map(t => '<button class="' + ((PTAB[key] || list[0]) === t ? "on" : "") + '" data-a="ptab" data-k="' + key + '" data-v="' + t + '">' + t + "</button>").join("") + "</div>";
function fmtRange(a, b) {
  const da = +a.slice(8), db = +b.slice(8), ma = MONTHS_LONG[+a.slice(5, 7) - 1].slice(0, 3), mb = MONTHS_LONG[+b.slice(5, 7) - 1].slice(0, 3);
  if (a.slice(0, 4) !== b.slice(0, 4)) return da + " " + ma + " " + a.slice(0, 4) + " - " + db + " " + mb + " " + b.slice(0, 4);
  if (ma !== mb) return da + " " + ma + " - " + db + " " + mb + " " + b.slice(0, 4);
  return (da === db ? "" : da + " - ") + db + " " + mb + " " + b.slice(0, 4);
}
const statHead = (a, b, sub) => '<div class="stath"><div><span>' + a[0] + "</span><b>" + a[1] + "<small>" + a[2] + "</small></b></div><div><span>" + b[0] + "</span><b>" + b[1] + "<small>" + b[2] + "</small></b></div></div>" + (sub ? '<div class="sub stdate">' + sub + "</div>" : "");
function buckets(from, to, mode) {
  const out = [];
  if (mode === "M") { let y = +from.slice(0, 4), m = +from.slice(5, 7); while (true) { const s0 = y + "-" + pad2(m) + "-01"; if (s0 > to) break; const nx = m === 12 ? (y + 1) + "-01-01" : y + "-" + pad2(m + 1) + "-01"; out.push({ s: s0 < from ? from : s0, e: addDays(nx, -1), l: MONTHS_LONG[m - 1].slice(0, 3) }); m++; if (m > 12) { m = 1; y++; } } return out; }
  if (mode === "W") { let x = weekSun(from); while (x <= to) { out.push({ s: x, e: addDays(x, 6), l: dShort(x) }); x = addDays(x, 7); } return out; }
  const n = daysBetween(from, to) + 1; for (let i = 0; i < n; i++) { const x = addDays(from, i); out.push({ s: x, e: x, l: n <= 7 ? DAY2[dow(x)] : dShort(x) }); } return out;
}
function niceMax(v) { if (v <= 0) return 10; const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
function barChart(vals, labels, color, opt) {
  opt = opt || {}; const series = Array.isArray(vals[0]) ? vals : [vals], colors = Array.isArray(color) ? color : [color];
  const tot = series[0].map((_, i) => series.reduce((a, sv) => a + (sv[i] || 0), 0));
  const W = 340, H = 200, pr = 30, pb = 24, n = Math.max(1, tot.length), mx = niceMax(Math.max(0, ...tot)), cw = (W - pr) / n, bw = Math.max(2, Math.min(18, cw * 0.62));
  let s = '<svg viewBox="0 0 ' + W + " " + H + '">';
  [0, 0.5, 1].forEach(f => { const y = (H - pb) - f * (H - pb - 8); s += '<line x1="0" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)" stroke-dasharray="' + (f ? "3 4" : "0") + '"/><text x="' + (W - 4) + '" y="' + (y + 4) + '" text-anchor="end">' + Math.round(mx * f * 10) / 10 + "</text>"; });
  for (let i = 0; i < n; i++) { let base = H - pb; series.forEach((sv, j) => { const v = sv[i] || 0; if (!v) return; const h = v / mx * (H - pb - 8); base -= h; s += '<rect x="' + (i * cw + (cw - bw) / 2).toFixed(1) + '" y="' + base.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" fill="' + colors[j % colors.length] + '"/>'; }); }
  const every = Math.ceil(n / 6); labels.forEach((l, i) => { if (i % every) return; s += '<text x="' + (i * cw + cw / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(l) + "</text>"; });
  return s + "</svg>";
}
function emptyLine(from, to) { const b = buckets(from, to, daysBetween(from, to) > 60 ? "M" : "D"); return barChart(b.map(() => 0), b.map(x => x.l), "var(--blue)"); }
const legend = items => '<div class="lgd">' + items.map(([n, c, k]) => '<span><i class="' + (k || "bar") + '" style="--c:' + c + '"></i>' + n + "</span>").join("") + "</div>";
const TUT = {}, TUTS = {
  wtrend: [["What is Weight Trend?", "Your scale number jumps around every day. The trend is the real direction hiding under all that noise."],
    ["How does it work?", "Each weigh-in is blended with your recent ones, so one salty dinner or a glass of water can't fool you."],
    ["How to use it", "Weigh in every morning, the same way. Judge your progress by the trend line and the weekly change, not by today's number."]],
  workouts: [["Sets and volume", "Sets counts every hard set you finish. Volume is weight times reps, added up."],
    ["What to look for", "A slow rise over the weeks means you are doing more work. A sudden drop usually means missed sessions or poor sleep."]] };
function tutorial(id) {
  try { if (localStorage.getItem("nitfit:tut:" + id)) return ""; } catch (_) {}
  const st = TUTS[id], i = TUT[id] || 0, [t, p] = st[i];
  return '<div class="tutc"><b>' + (i ? I.wand : I.info) + esc(t) + "</b><p>" + esc(p) + '</p><div class="tb"><button class="dis" data-a="tutDis" data-id="' + id + '">Dismiss Tutorial</button><span></span>'
    + (i ? '<button class="pv" data-a="tutGo" data-id="' + id + '" data-v="-1">Previous</button>' : "") + (i < st.length - 1 ? '<button class="pv" data-a="tutGo" data-id="' + id + '" data-v="1">Next</button>' : '<button class="pv" data-a="tutDis" data-id="' + id + '">Done</button>') + "</div></div>";
}
ACT.tutGo = el => { TUT[el.dataset.id] = (TUT[el.dataset.id] || 0) + +el.dataset.v; haptic(); renderPage(true); };
ACT.tutDis = el => { try { localStorage.setItem("nitfit:tut:" + el.dataset.id, "1"); } catch (_) {} renderPage(true); };
ACT.tutShow = el => { try { localStorage.removeItem("nitfit:tut:" + el.dataset.id); } catch (_) {} TUT[el.dataset.id] = 0; renderPage(true); };
const CAP = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L1.5 9 12 14l8-3.8V16h1.8V9z"/><path d="M6 12.6V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-3.4L12 15.5z"/></svg>';
function tip(id, title, text) {
  try { if (localStorage.getItem("nitfit:tip:" + id)) return ""; } catch (_) {}
  return '<div class="tipc"><b>' + I.info + title + "</b><p>" + text + '</p><button data-a="tipOff" data-id="' + id + '">Got it</button></div>';
}
ACT.tipOff = el => { try { localStorage.setItem("nitfit:tip:" + el.dataset.id, "1"); } catch (_) {} renderPage(true); };

function setsIn(from, to, filter) { return Object.values(S.sets).filter(x => !x.w && x.d >= from && x.d <= to && (!filter || filter(x))); }
function vWorkouts() {
  const key = "workouts", tab = PTAB[key] || "Sets", first = (sessionsSorted()[0] || {}).d, R = rangeOf(key, first, "1W"), mode = AVG[key] || "D";
  const bk = buckets(R.from, R.to, mode), sets = setsIn(R.from, R.to), bwKg = (weightList().slice(-1)[0] || { kg: 60 }).kg;
  const isBw = x => (getEx(x.exId) || {}).eq === "bw", val = x => tab === "Sets" ? 1 : (isBw(x) ? bwKg : (x.kg || 0)) * x.reps;
  const res = bk.map(b => sets.filter(x => x.d >= b.s && x.d <= b.e && !isBw(x)).reduce((a, x) => a + val(x), 0));
  const bwv = bk.map(b => sets.filter(x => x.d >= b.s && x.d <= b.e && isBw(x)).reduce((a, x) => a + val(x), 0));
  const vals = res.map((v, i) => v + bwv[i]), tot = vals.reduce((a, b) => a + b, 0), used = vals.filter(Boolean).length, u = tab === "Sets" ? "sets" : "kg";
  let h = nav("Workouts") + '<div class="ptabs ic2">' + [["Sets", I.next], ["Volume", I.dumb]].map(([t, ic]) => '<button class="' + (tab === t ? "on" : "") + '" data-a="ptab" data-k="' + key + '" data-v="' + t + '">' + ic + t + "</button>").join("") + "</div>" + '<div class="body-pad">';
  h += '<div class="stathw">' + statHead(["Average " + tab, used ? fmtNum(tot / used) : "0", u], ["Total " + tab, fmtNum(tot), u], fmtRange(R.from, R.to)) + "</div>";
  h += '<div class="chart lg">' + barChart([res, bwv], bk.map(b => b.l), ["var(--orange)", "#8a3b2a"]) + "</div>" + rangeRow(key, "1W", true) + legend([["Resistance", "var(--orange)"], ["Bodyweight", "#8a3b2a"]]);
  h += "<h2>Recent Workouts</h2>" + (sessionsSorted().filter(x => x.endTs).length ? '<div class="card">' + sessionsSorted().filter(x => x.endTs).reverse().slice(0, 10).map(x => '<button class="opt" data-a="viewSession" data-id="' + x.id + '"><div class="m"><b>' + esc(x.name) + "</b><span>" + niceDate(x.d) + " · " + sessionSets(x.id).length + " sets</span></div>" + I.chev + "</button>").join("") + "</div>" : '<p class="hint">No workouts yet.</p>');
  return h + "</div>";
}
const fmtNum = v => v >= 1000 ? Math.round(v).toLocaleString() : (Math.round(v * 10) / 10).toString();
function vMuscle(m) {
  const key = "m:" + m, tab = PTAB[key] || "Sets", R = rangeOf(key, null, "3M"), mode = AVG[key] || "W", bk = buckets(R.from, R.to, mode);
  const sets = setsIn(R.from, R.to, x => tagsOf(x.exId).includes(m)), wgt = x => tagsOf(x.exId)[0] === m ? 1 : 0.5;
  const vals = bk.map(b => sets.filter(x => x.d >= b.s && x.d <= b.e).reduce((a, x) => a + (tab === "Sets" ? wgt(x) : wgt(x) * (x.kg || 0) * x.reps), 0));
  const tot = vals.reduce((a, b) => a + b, 0), used = vals.length;
  let h = nav(m) + ptabs(key, ["Sets", "Volume"]) + '<div class="body-pad">';
  h += statHead(["Average " + (tab === "Sets" ? "Sets" : "Volume"), used && tot ? fmtNum(tot / used) : "--", tab === "Sets" ? "sets" : "kg"], ["Total " + (tab === "Sets" ? "Sets" : "Volume"), fmtNum(tot), tab === "Sets" ? "sets" : "kg"], fmtRange(R.from, R.to));
  h += '<div class="chart lg">' + barChart(vals, bk.map(b => b.l), "var(--blue)") + "</div>" + rangeRow(key, "3M", true) + legend([["Main muscle 1 set, helper 0.5", "var(--blue)"]]);
  h += tip("levels", "How many sets?", "Most muscles grow well on about 10 to 20 hard sets a week. Your weak spots get more.");
  h += "<h2>Exercises</h2><div class='card'>" + EXERCISES.filter(e => tagsOf(e.id).includes(m)).map(e => '<button class="opt" data-a="openEx" data-ex="' + e.id + '"><div class="thumb" style="width:44px;height:44px">' + thumbFor(e.id) + '</div><div class="m"><b>' + esc(e.n) + "</b><span>" + (tagsOf(e.id)[0] === m ? "Main muscle" : "Helps") + "</span></div>" + I.chev + "</button>").join("") + "</div>";
  return h + "</div>";
}
function vExercise(id) {
  const e = getEx(id), key = "e:" + id, tab = PTAB[key] || "1-RM", hist = histFor(id), R = rangeOf(key, (hist[0] || {}).d, "3M");
  const inR = hist.filter(x => x.d >= R.from && x.d <= R.to);
  const fn = { "1-RM": ss => Math.max(...ss.map(x => e1rm(x.kg || 0, x.reps))), "3-RM": ss => Math.max(...ss.map(x => e1rm(x.kg || 0, x.reps))) / (1 + 3 / 30), "10-RM": ss => Math.max(...ss.map(x => e1rm(x.kg || 0, x.reps))) / (1 + 10 / 30), "Heaviest": ss => Math.max(...ss.map(x => x.kg || 0)), "Volume": ss => ss.reduce((a, x) => a + (x.kg || 0) * x.reps, 0) }[tab];
  const pts = inR.map(x => ({ d: x.d, v: Math.round(fn(x.sets) * 10) / 10 }));
  let h = nav(e.n, '<span class="navr"><button class="ib plain" data-a="infoSheet" data-ex="' + id + '" aria-label="Info">' + I.info + "</button></span>") + ptabs(key, ["1-RM", "3-RM", "10-RM", "Heaviest", "Volume"]) + '<div class="body-pad">';
  h += statHead(["Average", pts.length ? fmtNum(pts.reduce((a, p) => a + p.v, 0) / pts.length) : "--", "kg"], ["Best", pts.length ? fmtNum(Math.max(...pts.map(p => p.v))) : "--", "kg"], fmtRange(R.from, R.to));
  h += '<div class="chart lg">' + (pts.length > 1 ? lineChart(pts) : pts.length ? barChart([pts[0].v], [dShort(pts[0].d)], "var(--blue)") : emptyLine(R.from, R.to)) + "</div>" + rangeRow(key, "3M");
  if (tab.endsWith("RM")) h += '<p class="hint">Estimated from your best set each workout. You never have to test a real max.</p>';
  h += "<h2>History</h2>" + (hist.length ? hist.slice().reverse().slice(0, 30).map(x => '<div class="hist-d">' + niceDate(x.d) + '</div><div class="hist-s">' + x.sets.map(setChip).join("") + "</div>").join("") : '<p class="hint">No sets yet. Everything you log here stays forever.</p>');
  return h + "</div>";
}
function vExList() {
  return nav("Exercises") + '<div class="body-pad">' + pickerHtml("openEx").replace('top:-6px;background:var(--top)', 'top:0;background:var(--bg)') + "</div>";
}

// weight
function slopePerWeek(tr) { const l = tr.slice(-21); if (l.length < 2) return null; const span = daysBetween(l[0].d, l[l.length - 1].d) || 1; return (l[l.length - 1].trend - l[0].trend) / span * 7; }
function vWTrend() {
  const key = "wtrend", wl = weightList(), tr = trendSeries(wl), R = rangeOf(key, (wl[0] || {}).d, "1M"), inR = tr.filter(x => x.d >= R.from && x.d <= R.to);
  let h = nav("Weight Trend", '<span class="navr"><button class="ib plain" data-a="tutShow" data-id="wtrend" aria-label="Show tutorial">' + CAP + "</button></span>") + '<div class="body-pad">';
  h += statHead(["Average", inR.length ? (inR.reduce((a, x) => a + x.trend, 0) / inR.length).toFixed(1) : "--", "kg"], ["Difference", inR.length > 1 ? sgn(inR[inR.length - 1].trend - inR[0].trend) : "0.0", "kg"], fmtRange(R.from, R.to));
  h += '<div class="chart lg">' + (inR.length > 1 ? lineChart(inR.map(x => ({ d: x.d, v: x.trend, raw: x.kg }))) : emptyLine(R.from, R.to)) + "</div>" + rangeRow(key, "1M");
  h += legend([["Scale Weight", "var(--text3)", "dot"], ["Trend Weight", "var(--purple)", "line"]]);
  h += tutorial("wtrend");
  const cur = tr.length ? tr[tr.length - 1] : null, wk = slopePerWeek(tr);
  h += '<h2>Insights &amp; Data</h2><div class="card"><div class="wch"><b>Weight Changes</b>' + [3, 7, 14, 30, 90].map(n => { const old = tr.find(x => x.d >= addDays(today(), -n)); const ok = cur && tr.length && tr[0].d <= addDays(today(), -n) && old; const dv = ok ? cur.trend - old.trend : null; return '<div class="wcr"><span>' + n + '-day</span><b>' + (ok ? sgn(dv) + " kg" : "-- kg") + '</b><em class="' + (ok ? (Math.abs(dv) < 0.15 ? "st" : dv > 0 ? "up" : "dn") : "wt") + '">' + (ok ? (Math.abs(dv) < 0.15 ? "Steady" : dv > 0 ? "Gaining" : "Losing") : "Waiting") + "</em></div>"; }).join("") + "</div></div>";
  const box = (v, u, t, p) => '<div class="ibox"><div class="bx"><b>' + v + "</b><span>" + u + "</span></div><div><b>" + t + "</b><p>" + p + "</p></div></div>";
  h += '<div class="card" style="margin-top:12px">' + box(cur ? cur.trend.toFixed(1) : "--", "kg", "Current Weight", "Your true weight right now, with the daily ups and downs taken out.")
    + box(wk == null ? "--" : sgn(wk), "kg per week", "Weekly Weight Change", "How fast your trend moved over the last three weeks.")
    + box(wk == null ? "--" : Math.round(wk * 7700 / 7), "kcal per day", "Energy Balance", "Roughly how many calories above (plus) or below (minus) what you burn, worked out from your weight.")
    + box(cur && wk != null ? (cur.trend + wk * 30 / 7).toFixed(1) : "--", "kg", "30-Day Projection", "Where your weight lands in 30 days if this pace holds. Goal: 68 kg.") + "</div>";
  h += '<h2>Data Sources</h2><div class="card">' + optRow(I.scale, "Scale Weight", "Manage data", "openPage", ' data-k="scale"', "chev") + "</div>";
  return h + "</div>";
}
const sgn = v => (v > 0 ? "+" : "") + v.toFixed(2).replace(/0$/, "");
function vScale(store) {
  const w = store === "weights", key = store, list = Object.values(S[store]).sort((a, b) => a.d < b.d ? -1 : 1), val = x => w ? x.kg : x.inch, unit = w ? "kg" : "in";
  const R = rangeOf(key, (list[0] || {}).d, "1M"), inR = list.filter(x => x.d >= R.from && x.d <= R.to);
  let h = nav(w ? "Scale Weight" : "Waist", '<span class="navr"><button class="ib plain" data-a="' + (w ? "weightSheet" : "waistSheet") + '" aria-label="Add">' + I.plus + "</button></span>") + '<div class="body-pad">';
  h += statHead(["Average", inR.length ? (inR.reduce((a, x) => a + val(x), 0) / inR.length).toFixed(1) : "--", unit], ["Difference", inR.length > 1 ? sgn(val(inR[inR.length - 1]) - val(inR[0])) : "0.0", unit], fmtRange(R.from, R.to));
  h += '<div class="chart lg">' + (inR.length > 1 ? lineChart(inR.map(x => ({ d: x.d, v: val(x) }))) : emptyLine(R.from, R.to)) + "</div>" + rangeRow(key, "1M") + legend([[w ? "Scale Weight" : "Waist", "var(--green)", "line"]]);
  h += w ? tip("scale", "Same time, same way", "Weigh yourself right after waking and peeing, before food and water. Same scale, same spot on the floor.") : tip("waist", "Measuring your waist", "Saturday mornings, tape level at the belly button, breathe out normally and don't suck in.");
  const by = {}; list.slice().reverse().forEach(x => (by[x.d.slice(0, 7)] = by[x.d.slice(0, 7)] || []).push(x));
  Object.keys(by).forEach(mk => { h += "<h2>" + MONTHS_LONG[+mk.slice(5) - 1] + " " + mk.slice(0, 4) + '</h2><div class="card">' + by[mk].map(x => '<button class="opt" data-a="' + (w ? "weightSheet" : "waistSheet") + '" data-d="' + x.d + '"><span class="oi">' + (w ? I.scale : I.tape) + '</span><div class="m"><b>' + val(x) + " " + unit + "</b><span>" + WEEKDAYS[dow(x.d)].slice(0, 3) + ", " + dShort(x.d) + '</span></div><span class="edit">' + I.pencil + "</span></button>").join("") + "</div>"; });
  if (!list.length) h += '<p class="hint" style="margin-top:18px">No entries yet. Tap + to add one.</p>';
  return h + "</div>";
}
function vHabit(kind) {
  const w = kind === "weights", key = "h:" + kind, d = today(), tracked = x => w ? !!S.weights[x] : doneOn(x);
  const ym = CALM2[key] || d.slice(0, 7), [y, m] = ym.split("-").map(Number), first = ym + "-01", start = addDays(first, -dow(first));
  let streak = 0;
  if (w) { let x = S.weights[d] ? d : addDays(d, -1); while (S.weights[x]) { streak++; x = addDays(x, -1); } }
  else { let x = weekSun(d); if (![0, 1, 2, 3, 4, 5, 6].some(i => doneOn(addDays(x, i)))) x = addDays(x, -7); while ([0, 1, 2, 3, 4, 5, 6].some(i => doneOn(addDays(x, i)))) { streak++; x = addDays(x, -7); } }
  let h = nav(w ? "Weigh-In" : "Workouts") + '<div class="body-pad">';
  h += w ? statHead(["Today", S.weights[d] ? S.weights[d].kg.toFixed(1) : "--", "kg"], ["Streak", streak, streak === 1 ? "day" : "days"]) : statHead(["This week", sessionsSorted().filter(x => x.d >= weekSun(d) && x.endTs).length, "workouts"], ["Streak", streak, streak === 1 ? "week" : "weeks"]);
  const mstart = addDays(first, -((dow(first) + 6) % 7)), yrs = []; for (let k = +d.slice(0, 4) - 3; k <= +d.slice(0, 4) + 1; k++) yrs.push(k);
  h += '<div class="hcal">';
  for (let i = 0; i < 42; i++) { const x = addDays(mstart, i), out = x.slice(0, 7) !== ym; if (i === 35 && out) break; h += '<button class="' + (out ? "out" : "") + (tracked(x) ? (w ? " tg" : " to") : "") + (x === d ? " today" : "") + '" data-a="habitDay" data-k="' + kind + '" data-d="' + x + '">' + +x.slice(8) + "</button>"; }
  h += '</div><div class="hcalh">' + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(x => "<span>" + x + "</span>").join("") + "</div>";
  const prev = dstr(new Date(y, m - 2, 1)).slice(0, 7), next = dstr(new Date(y, m, 1)).slice(0, 7);
  h += '<div class="hnav2"><div class="pair"><button data-a="hMonth" data-k="' + key + '" data-v="' + prev + '" aria-label="Previous month">' + I.back + '</button><button data-a="hMonth" data-k="' + key + '" data-v="' + next + '" aria-label="Next month" style="transform:scaleX(-1)">' + I.back + "</button></div>"
    + '<label class="selp wide">' + MONTHS_LONG[m - 1] + " " + I.down + '<select data-hsel="' + key + '" data-part="m">' + MONTHS_LONG.map((n, k) => '<option value="' + (k + 1) + '"' + (k + 1 === m ? " selected" : "") + ">" + n + "</option>").join("") + "</select></label>"
    + '<label class="selp">' + y + " " + I.down + '<select data-hsel="' + key + '" data-part="y">' + yrs.map(k => '<option' + (k === y ? " selected" : "") + ">" + k + "</option>").join("") + "</select></label></div>";
  h += legend([["Tracked", w ? "var(--green)" : "var(--orange)", "ring"], ["Untracked", "var(--line)", "ring"]]);
  const yr = d.slice(0, 4), jan = yr + "-01-01", g0 = addDays(jan, -dow(jan));
  h += "<h2>" + yr + '</h2><div class="card yr"><div class="yg">';
  for (let c = 0; c < 53; c++) for (let r = 0; r < 7; r++) { const x = addDays(g0, c * 7 + r); h += '<i class="' + (x.slice(0, 4) !== yr ? "n" : tracked(x) ? (w ? "g" : "o") : "") + '"></i>'; }
  h += '</div><div class="ym">' + MONTHS_LONG.map(x => "<span>" + x.slice(0, 1) + "</span>").join("") + "</div></div>";
  return h + "</div>";
}
ACT.hMonth = el => { CALM2[el.dataset.k] = el.dataset.v; renderPage(true); };
ACT.habitDay = el => {
  const x = el.dataset.d;
  if (el.dataset.k === "weights") return entrySheet(x, "scale");
  const s2 = sessionsSorted().filter(q => q.d === x && q.endTs); if (s2.length) return ACT.viewSession({ dataset: { id: s2[s2.length - 1].id } });
  const dk = dayKeyFor(x); toast(dk ? DAYS[dk].name + (x > today() ? " is planned" : " was not logged") : "Rest day");
};

// iOS 26 bug: after the iPhone keyboard closes, a home-screen app can stay shrunk with a dead band at the bottom.
// Hiding and showing the full-height screens for one frame makes iOS measure the screen again.
let MAXH = window.innerHeight;
window.addEventListener("resize", () => { MAXH = Math.max(MAXH, window.innerHeight); });
// iPhone bug: with the see-through status bar, a home-screen app's page can stop short of the bottom of the screen
// by the height of the status bar. Measure the missing strip and stretch the page over it.
function fixGap() {
  if (!isStandalone() || innerHeight > innerWidth * 3 || innerWidth > innerHeight) { document.documentElement.style.setProperty("--vgap", "0px"); document.documentElement.classList.remove("gapfix"); return; }
  let pr = document.getElementById("vprobe");
  if (!pr) { pr = document.createElement("div"); pr.id = "vprobe"; pr.style.cssText = "position:absolute;left:-9px;top:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none"; document.documentElement.appendChild(pr); }
  const vis = Math.min(innerHeight, document.documentElement.clientHeight || innerHeight);
  const full = Math.max(screen.height, pr.getBoundingClientRect().height);
  const g = Math.round(full - vis), gap = g > 10 && g < 80 ? g : 0;
  document.documentElement.style.setProperty("--vgap", gap + "px"); document.documentElement.classList.toggle("gapfix", gap > 0);
}
fixGap(); addEventListener("resize", () => setTimeout(fixGap, 60)); addEventListener("orientationchange", () => setTimeout(fixGap, 300));
function healViewport(force) {
  const a = document.activeElement; if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA")) return;
  window.scrollTo(0, 0);
  if (!force && window.innerHeight >= MAXH - 4) return;
  const els = [$("#main"), $("#page")], ys = els.map(e => e.scrollTop);
  els.forEach(e => { e.style.display = "none"; }); void document.body.offsetHeight;
  els.forEach((e, i) => { e.style.display = ""; e.scrollTop = ys[i]; });
}
document.addEventListener("focusout", e => { if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) { setTimeout(healViewport, 150); setTimeout(healViewport, 600); } });
if (window.visualViewport) visualViewport.addEventListener("resize", () => setTimeout(healViewport, 120));
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") setTimeout(() => healViewport(true), 200); });
// Instagram style: scroll down and the tab bar gets a little smaller, scroll back up and it comes back.
// Only a real swipe counts: the bounce at the top or bottom of a page and tiny finger jitter are ignored.
let LASTY = 0, ACC = 0, FOLDLOCK = 0;
function setFold(on) {
  if (document.body.classList.contains("tsmall") === on) return;
  document.body.classList.toggle("tsmall", on); FOLDLOCK = Date.now() + 280; ACC = 0;
}
function bindCompact() {
  const m = $("#main");
  m.addEventListener("scroll", () => {
    const y = m.scrollTop, max = m.scrollHeight - m.clientHeight, dy = y - LASTY; LASTY = y;
    if (y <= 0 || y >= max - 1) { ACC = 0; if (y <= 0) setFold(false); return; }
    if (y < 40) { ACC = 0; return setFold(false); }
    if (Math.abs(dy) > 160) { ACC = 0; return; }
    if ((ACC > 0) !== (dy > 0) && Math.abs(dy) < 4) return;
    ACC = (ACC > 0) === (dy > 0) ? ACC + dy : dy;
    if (Date.now() < FOLDLOCK) return;
    if (ACC > 36 && y > 100) setFold(true); else if (ACC < -28) setFold(false);
  }, { passive: true });
}
// ----- liquid glass tab bar (like WhatsApp) -----
// Tap: the glass pill slides to the tab. Press and hold: the pill swells into a lens you can drag along the bar,
// the icon under it grows a little. Let go: it shrinks back into the pill on the nearest tab and opens it.
// ----- Liquid Glass tab bar (copied from Apple Fitness and Health on iOS 26) -----
// Rest: a see-through glass bar, the open tab sits in a dark pill and is tinted blue.
// Touch: the bar swells and turns lighter, the pill becomes a clear lens that magnifies and bends
// the icons under it (and tints them). Let go: the lens settles into the dark pill on the nearest tab.
let TABDRAG = null, TABEATCLICK = false, TABX = null, LENST = 0;
const tabBtns = () => $$("#tabs .tcap > button[data-tab]");
function pillTo(b, jump) {
  const pill = $("#tabs .pill"); if (!pill || !b) return;
  if (jump) pill.style.transition = "none";
  pill.style.setProperty("--x", b.offsetLeft + "px"); pill.style.width = b.offsetWidth + "px";
  if (jump) { pill.offsetWidth; pill.style.transition = ""; }
}
function lensBuild() {
  const row = $("#tabs .lrow"); if (!row) return;
  row.innerHTML = tabBtns().map(b => '<span style="left:' + b.offsetLeft + "px;width:" + b.offsetWidth + "px;top:" + b.offsetTop + "px;height:" + b.offsetHeight + 'px">' + b.innerHTML + "</span>").join("");
}
function lensAt(cx) {
  const cap = $("#tabs .tcap"), L = $("#tabs .lens"), row = $("#tabs .lrow"), b0 = tabBtns()[0]; if (!L || !b0) return;
  const W = cap.offsetWidth, H = cap.offsetHeight, LW = Math.round(b0.offsetWidth * 1.16), LH = Math.round(H * 1.22);
  cx = Math.max(LW / 2 - 6, Math.min(W - LW / 2 + 6, cx));
  const left = cx - LW / 2, top = (H - LH) / 2;
  L.style.width = LW + "px"; L.style.height = LH + "px"; L.style.top = top + "px"; L.style.transform = "translateX(" + left.toFixed(1) + "px)";
  const T = $("#tabs"); T.style.setProperty("--lx", left.toFixed(1) + "px"); T.style.setProperty("--ly", top.toFixed(1) + "px");
  if (T._lw !== LW || T._lh !== LH) { T._lw = LW; T._lh = LH; T.style.setProperty("--lw", LW + "px"); T.style.setProperty("--lh", LH + "px");
    T.style.setProperty("--lm", 'url("data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='" + LW + "' height='" + LH + "'><rect width='" + LW + "' height='" + LH + "' rx='" + LH / 2 + "' fill='black'/></svg>") + '")');
    tabBtns().forEach(b => { b.style.setProperty("--ox", b.offsetLeft + "px"); b.style.setProperty("--oy", b.offsetTop + "px"); }); }
  row.style.width = W + "px"; row.style.height = H + "px";
  row.style.transformOrigin = cx.toFixed(1) + "px " + (H / 2) + "px";
  row.style.transform = "translate(" + (-left).toFixed(1) + "px," + (-top).toFixed(1) + "px) scale(1.12)";
}
function glassOn(on) { $("#tabs").classList.toggle("held", on); }
// open tab changed by a tap: the dark pill slides over (runs on the graphics chip, so it stays smooth)
function tabsPill(noAnim) {
  const on = $("#tabs .tcap > button.on"), pill = $("#tabs .pill"); if (!pill) return;
  pill.style.opacity = on ? "" : 0; if (!on) { TABX = null; return; }
  const c = on.offsetLeft + on.offsetWidth / 2, moved = TABX != null && Math.abs(TABX - c) > 2; TABX = c;
  if (noAnim || !moved) return pillTo(on, true);
  pill.classList.remove("move"); void pill.offsetWidth; pill.classList.add("move"); pillTo(on);
}
function glassReset() { clearTimeout(LENST); const t = $("#tabs"), L = $("#tabs .lens"); if (t) t.classList.remove("held"); if (L) L.classList.remove("on", "glide"); }
function tabsGlass() {
  const cap = $("#tabs .tcap"); if (!cap || cap._glass) return; cap._glass = 1;
  lensWarp(); tabsPill(true);
  const scale = () => cap.getBoundingClientRect().width / cap.offsetWidth;
  const local = e => (e.clientX - cap.getBoundingClientRect().left) / scale();
  const nearest = x => { let best = null, d = 1e9; tabBtns().forEach(b => { const k = Math.abs(b.offsetLeft + b.offsetWidth / 2 - x); if (k < d) { d = k; best = b; } }); return best; };
  const hold = () => {
    const D = TABDRAG; if (!D || D.held) return; D.held = true; clearTimeout(LENST);
    try { cap.setPointerCapture(D.id); } catch (_) {}
    lensBuild(); const L = $("#tabs .lens"); L.classList.remove("glide"); lensAt(D.x); glassOn(true); L.classList.add("on");
    D.hover = nearest(D.x); haptic();
  };
  cap.addEventListener("pointerdown", e => { TABDRAG = { id: e.pointerId, x0: e.clientX, x: local(e), held: false, hover: null }; TABDRAG.t = setTimeout(hold, 170); });
  cap.addEventListener("pointermove", e => {
    const D = TABDRAG; if (!D || D.id !== e.pointerId) return; D.x = local(e);
    if (!D.held && Math.abs(e.clientX - D.x0) > 6) { clearTimeout(D.t); hold(); }
    if (!D.held) return;
    lensAt(D.x); const h = nearest(D.x); if (h !== D.hover) { haptic(); D.hover = h; }
    e.preventDefault();
  });
  const end = () => {
    const D = TABDRAG; TABDRAG = null; if (!D) return; clearTimeout(D.t); if (!D.held) return;
    TABEATCLICK = true; setTimeout(() => TABEATCLICK = false, 350);
    const b = nearest(D.x), L = $("#tabs .lens"), c = b.offsetLeft + b.offsetWidth / 2;
    const x0 = D.x, t0 = performance.now(), dur = 230;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); lensAt(x0 + (c - x0) * e); if (k < 1 && $("#tabs").classList.contains("held")) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    LENST = setTimeout(() => {
      pillTo(b, true); glassReset();
      if (b.dataset.tab !== TAB) { TABX = c; try { ACT.tab(b); } catch (err) { console.error(err); } }
    }, 240);
  };
  cap.addEventListener("pointerup", end); cap.addEventListener("pointercancel", end);
  // never leave the glass stuck: a finger lifted anywhere, or the app coming back, clears it
  addEventListener("pointerup", () => setTimeout(() => { if (!TABDRAG) glassReset(); }, 400), true);
  document.addEventListener("visibilitychange", () => { TABDRAG = null; glassReset(); });
  cap.addEventListener("click", e => { if (TABEATCLICK) { e.stopPropagation(); e.preventDefault(); TABEATCLICK = false; } }, true);
  window.addEventListener("resize", () => { lensBuild(); tabsPill(true); });
}
// the bend at the lens edge: a small map that pushes what's near the rim toward the middle,
// so icons and words curve and stretch as the lens slides over them
function lensWarp() {
  const W = 160, H = 100, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"), img = x.createImageData(W, H), d = img.data, r = H / 2;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const px = i + .5, py = j + .5, cx = Math.max(r, Math.min(W - r, px)), dx = px - cx, dy = py - r, dist = Math.hypot(dx, dy) || 1;
    const edge = Math.min(1, Math.max(0, 1 - (r - dist) / (r * 0.34))), k = edge * edge * (3 - 2 * edge), o = (j * W + i) * 4;
    d[o] = 128 - (dx / dist) * k * 127; d[o + 1] = 128 - (dy / dist) * k * 127; d[o + 2] = 128; d[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const fe = document.getElementById("lgwImg"); if (fe) { fe.setAttribute("href", c.toDataURL()); fe.setAttributeNS("http://www.w3.org/1999/xlink", "href", c.toDataURL()); }
}
ACT.expandTabs = () => setFold(false);
// ----- boot -----
async function boot() {
  try { await coreBoot(); } catch (e) { $("#main").innerHTML = '<div class="head"><div class="title">NitFit</div></div><p class="hint" style="padding:20px">NitFit could not open its storage. Close it and open it again.</p>'; return; }
  applyTheme(); paintAvatar(); render(); bindCompact(); tabsGlass();
  try { const r = JSON.parse(localStorage.getItem("nitfit:rest") || "null"); if (r && r.end > Date.now()) { REST = r; restIv = setInterval(paintRest, 250); } } catch (_) {}
  if (activeSession()) { PAGE = { kind: "log" }; renderPage(); }
  try { matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { if (S.settings.theme === "system") { applyTheme(); render(); } }); } catch (_) {}
  if (KV.token) syncNow(true);
  if ("serviceWorker" in navigator && isStandalone()) navigator.serviceWorker.register("sw.js").catch(() => {});
  setInterval(() => { const s = activeSession(); if (!s) return; const P = pauseOf(s), t = P.at ? "Paused" : fmtClock(elapsed(s)); ["#clock", "#mclock"].forEach(q => { const el = $(q); if (el) el.textContent = t; }); }, 1000);
  let lastDay = today();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "visible") return; if (today() !== lastDay) { lastDay = today(); render(); } if (KV.token) syncNow(); if (REST) paintRest(); });
}
boot();
