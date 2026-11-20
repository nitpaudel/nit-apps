// ---------------------------------------------------------------------------
// NitFit screens. Today, Workout, Progress, plus floating sheets.
// Logging a set never redraws the whole page, only that exercise's card.
// ---------------------------------------------------------------------------
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const ACT = {};
let TAB = "today";
const SCROLL = {};
const numIn = v => { if (v == null) return null; const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
const fmtKg = k => (Math.round(k * 100) / 100).toString();
const fmtDur = ms => { const m = Math.floor(ms / 60000); return m >= 60 ? Math.floor(m / 60) + " h " + (m % 60) + " min" : m + " min"; };
const isStandalone = () => navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;

const I = {
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 8 13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5L6.5 6.5L1.5 11.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h9M17.5 7H20M4 12h3M11.5 12H20M4 17h11M19.5 17h.5"/><circle cx="15.3" cy="7" r="2.2"/><circle cx="9.3" cy="12" r="2.2"/><circle cx="17.3" cy="17" r="2.2"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/></svg>',
};

// ----- small things -----
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2200);
}
let hapticEl = null;
function haptic() {
  try {
    if (navigator.vibrate) return navigator.vibrate(8);
    if (!hapticEl) { hapticEl = document.createElement("input"); hapticEl.type = "checkbox"; hapticEl.setAttribute("switch", ""); hapticEl.style.cssText = "position:absolute;opacity:0;pointer-events:none"; document.body.appendChild(hapticEl); }
    hapticEl.checked = !hapticEl.checked;
  } catch (_) {}
}
function applyCard() {
  const c = (S && S.settings.card) || "glass";
  document.documentElement.dataset.card = c;
  try { localStorage.setItem("nitfit:card", c); } catch (_) {}
}

// ----- sheet -----
let SHEET = null;
function openSheet(title, html, opts) {
  opts = opts || {};
  SHEET = opts.name || title;
  const sh = $("#sheet");
  sh.classList.toggle("short", !!opts.short);
  $("h3", sh).textContent = title;
  $(".sbody", sh).innerHTML = html;
  $(".sbody", sh).scrollTop = 0;
  $("#scrim").classList.add("on"); sh.style.transform = ""; sh.classList.add("on");
}
function closeSheet() { SHEET = null; $("#sheet").classList.remove("on"); $("#scrim").classList.remove("on"); $("#sheet").style.transform = ""; if (document.activeElement) document.activeElement.blur(); }
ACT.closeSheet = closeSheet;
(function sheetDrag() {
  let y0 = null, dy = 0;
  document.addEventListener("touchstart", e => { const h = e.target.closest(".grab,.shead"); if (!h || !$("#sheet").classList.contains("on")) return; y0 = e.touches[0].clientY; dy = 0; $("#sheet").style.transition = "none"; }, { passive: true });
  document.addEventListener("touchmove", e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); $("#sheet").style.transform = "translateY(" + dy + "px)"; }, { passive: true });
  document.addEventListener("touchend", () => { if (y0 == null) return; y0 = null; const sh = $("#sheet"); sh.style.transition = ""; if (dy > 110) closeSheet(); else sh.style.transform = ""; });
})();

// ----- reading the day -----
const dayKeyFor = d => DAYMAP[dow(d)];
function lastFinishedBefore(d) { const l = sessionsSorted().filter(s => s.endTs && s.d < d); return l.length ? l[l.length - 1] : null; }
function itemsForDay(dayKey, d) {
  return planFor(dayKey).map(it => Object.assign({}, it, { n: setsFor(it, d) }));
}
// superset labels: A1, A2, B1...
function ssLabels(items) {
  const out = [], seen = {};
  items.forEach((it, i) => { if (!it.ss) { out.push(""); return; } seen[it.ss] = (seen[it.ss] || 0) + 1; out.push(it.ss + seen[it.ss]); });
  return out;
}
function partnerIndex(items, i) {
  const it = items[i]; if (!it || !it.ss) return -1;
  for (let j = 0; j < items.length; j++) if (j !== i && items[j].ss === it.ss) return j;
  return -1;
}
const exFor = it => { const e = getEx(it.ex); return e ? Object.assign({}, e, it.r ? { r: it.r } : {}) : null; };
const TGT = {};
function targetFor(sess, i) {
  const key = sess.id + ":" + i + ":" + sess.items[i].ex + ":" + sess.items[i].n;
  if (!TGT[key]) {
    const it = sess.items[i], ex = exFor(it), prev = lastFinishedBefore(sess.d);
    const gap = prev ? daysBetween(prev.d, sess.d) : 0;
    TGT[key] = coachTarget(ex, histFor(it.ex, sess.id), { sets: it.n, gap, easy: programWeek(sess.d) <= 2, light: !!it.light });
  }
  return TGT[key];
}
function tgtTxt(t, ex) {
  const each = ex.each ? " each" : "", u = ex.t ? " sec" : "";
  if (t.kg == null && t.tag === "new") return t.sets + " sets · find your " + (ex.eq === "bw" ? "level" : "weight");
  const r = t.reps, same = r.every(x => x === r[0]);
  return t.sets + " × " + (t.kg ? fmtKg(t.kg) + " kg × " : "") + (same ? r[0] : r.join(", ")) + u + each;
}
function loggedByIdx(sess, exId) {
  const out = {};
  sessionSets(sess.id).filter(x => x.exId === exId).forEach(x => { out[x.idx] = x; });
  return out;
}

// ----- render -----
function render() {
  const main = $("#main");
  if (!isStandalone() && !/dev/.test(location.search)) { main.innerHTML = vInstall(); $("#tabs").hidden = true; return; }
  $("#tabs").hidden = false;
  const v = TAB === "today" ? vToday() : TAB === "workout" ? vWorkout() : vProgress();
  main.innerHTML = v;
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === TAB));
  main.scrollTop = SCROLL[TAB] || 0;
}
function vInstall() {
  return '<div class="top"><div><h1>NitFit</h1></div></div><div class="card pad"><b>Open NitFit from its own icon.</b>'
    + '<ol class="ol" style="margin-top:10px"><li>Tap <b>Share</b> at the bottom of Safari.</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li><li>Open <b>NitFit</b> from the new icon.</li></ol>'
    + '<p class="small" style="margin-top:8px">Your workouts are saved inside the icon version, so always open it from there.</p></div>';
}

// ===== Today =====
function vToday() {
  const d = today(), dt = new Date(), dk = dayKeyFor(d), wk = programWeek(d);
  let h = '<div class="top"><div><div class="eyebrow">' + WEEKDAYS[dt.getDay()] + ", " + dt.getDate() + " " + MONTHS[dt.getMonth()] + " · Week " + wk + '</div><h1>Today</h1></div>'
    + '<button class="round" data-a="settings" aria-label="Settings">' + I.gear + "</button></div>";
  if (storageBroken) h += '<div class="banner">' + esc(storageBroken) + "</div>";
  else if (!KV.token) h += '<div class="banner">Not backed up yet.<button data-a="settings">Set up</button></div>';
  else if (KV.syncErr && !/Offline/.test(KV.syncErr)) h += '<div class="banner">' + esc(KV.syncErr) + "</div>";

  // morning check-in
  const w = S.weights[d], tr = trendSeries(weightList()), trend = tr.length ? tr[tr.length - 1].trend : null;
  const waistDue = dow(d) === 6 || !Object.keys(S.waists).length, ws = S.waists[d];
  h += '<div class="card"><div class="ck"><div class="m"><b>Weight</b><span>' + (trend != null && w ? "Trend " + trend.toFixed(1) + " kg" : "Morning, after you pee, before food") + "</span></div>"
    + (w ? '<button class="bigval" data-a="editWeight">' + w.kg.toFixed(1) + "<small>kg</small></button>"
      : '<input class="inp" id="wIn" inputmode="decimal" placeholder="kg" enterkeyhint="done">') + "</div>";
  if (waistDue) h += '<div class="ck"><div class="m"><b>Waist</b><span>' + (dow(d) === 6 ? "Saturday check" : "Your starting point") + ", at the belly button</span></div>"
    + (ws ? '<button class="bigval" data-a="editWaist">' + ws.inch + "<small>in</small></button>"
      : '<input class="inp" id="waistIn" inputmode="decimal" placeholder="in" enterkeyhint="done">') + "</div>";
  h += '<div class="ck" style="padding-top:6px;padding-bottom:12px"><button class="link" data-a="howMeasure">How to weigh and measure</button></div></div>';

  // workout
  h += vWorkoutCard(d, dk);

  // the day
  const nowM = dt.getHours() * 60 + dt.getMinutes(), mins = t => +t.slice(0, 2) * 60 + +t.slice(3);
  let cur = -1; ROUTINE.forEach((r, i) => { if (mins(r.t) <= nowM) cur = i; });
  h += "<h2>Your day</h2><div class=\"card\">" + ROUTINE.map((r, i) => '<div class="row' + (i === cur ? " now" : i < cur ? " past" : "") + '"><span class="time">' + r.t + '</span><div class="m"><b style="white-space:normal">' + esc(r.n) + "</b></div></div>").join("") + "</div>";
  return h;
}
function vWorkoutCard(d, dk) {
  const act = activeSession(), doneToday = sessionsSorted().filter(s => s.d === d && s.endTs);
  if (act) {
    const n = sessionSets(act.id).length, tot = act.items.reduce((a, it) => a + it.n, 0);
    return '<div class="card pad"><div class="lbl">In progress</div><div class="wk-name" style="margin-top:2px">' + esc(act.name) + '</div><p class="sub" style="margin:6px 0 14px">' + n + " of " + tot + " sets · started " + fmtDur(Date.now() - Date.parse(act.startTs)) + ' ago</p><button class="pill white wide" data-a="tab" data-tab="workout">Continue workout</button></div>';
  }
  if (doneToday.length) {
    const s = doneToday[doneToday.length - 1], n = sessionSets(s.id).length;
    return '<div class="card pad"><div class="lbl">Done today</div><div class="wk-name" style="margin-top:2px">' + esc(s.name) + '</div><p class="sub" style="margin:6px 0 14px">' + n + " sets logged. Go and eat.</p>"
      + '<button class="pill soft wide" data-a="viewSession" data-id="' + s.id + '">See the workout</button></div>';
  }
  if (!dk) return '<div class="card pad"><div class="lbl">Saturday</div><div class="wk-name" style="margin-top:2px">Rest day</div><p class="sub" style="margin-top:6px">Recovery is when the muscle grows. An easy walk is fine.</p>'
    + '<button class="link" style="margin-top:8px" data-a="pickDay">Train anyway</button></div>';
  const day = DAYS[dk], items = itemsForDay(dk, d), lab = ssLabels(items), wk = programWeek(d);
  const total = items.reduce((a, it) => a + it.n, 0);
  return '<div class="card pad"><div class="wk-head"><div><div class="lbl">' + esc(day.sub) + '</div><div class="wk-name" style="margin-top:2px">' + esc(day.name) + "</div></div>"
    + (wk <= 2 ? '<span class="badge easy">Easy week</span>' : "") + "</div>"
    + '<div class="wk-list">' + items.map((it, i) => { const e = getEx(it.ex); return "<div><b style=\"font-weight:500\">" + (lab[i] ? '<span style="color:var(--text2);font-weight:600">' + lab[i] + " </span>" : "") + esc(e ? e.n : it.ex) + "</b><span>" + it.n + " sets</span></div>"; }).join("") + "</div>"
    + '<button class="pill white wide" data-a="start" data-day="' + dk + '">Start workout</button>'
    + '<p class="small" style="text-align:center;margin-top:10px">' + total + " sets · back fix first · about " + (wk <= 2 ? 50 : 75) + " min</p></div>";
}
ACT.howMeasure = () => openSheet("How to measure", '<div class="card pad" style="margin-top:6px"><b>Weight, every morning</b><ol class="ol"><li>Right after you wake up and pee.</li><li>Before eating or drinking anything.</li><li>Same clothes (or none), same scale, same spot on the floor.</li></ol>'
  + '<p class="small">Your weight jumps up to 1 kg a day from water and food. That is normal. NitFit uses the trend, not one day.</p></div>'
  + '<div class="card pad"><b>Waist, every Saturday</b><ol class="ol"><li>Morning, after you pee, before food or water.</li><li>Stand relaxed and breathe out normally. Do not suck in.</li><li>Tape at your belly button, level all the way around, snug but not squeezing.</li><li>Same spot every time.</li></ol></div>', { short: true });

function saveWeight(v) {
  const kg = numIn(v); if (kg == null) return;
  if (kg < 35 || kg > 150) return toast("That doesn't look right. Type it in kg.");
  addEvent("weight.logged", { kg: Math.round(kg * 10) / 10 }); haptic(); toast("Weight saved"); render();
}
function saveWaist(v) {
  const inch = numIn(v); if (inch == null) return;
  if (inch < 20 || inch > 50) return toast("Type your waist in inches.");
  addEvent("waist.logged", { inch: Math.round(inch * 4) / 4 }); haptic(); toast("Waist saved"); render();
}
ACT.editWeight = () => { const w = S.weights[today()]; openSheet("Weight today", '<input class="field" id="wEdit" inputmode="decimal" value="' + w.kg + '"><button class="pill white wide" style="margin-top:12px" data-a="saveWEdit">Save</button>', { short: true }); setTimeout(() => $("#wEdit").focus(), 350); };
ACT.saveWEdit = () => { const v = $("#wEdit").value; closeSheet(); saveWeight(v); };
ACT.editWaist = () => { const w = S.waists[today()]; openSheet("Waist today", '<input class="field" id="waEdit" inputmode="decimal" value="' + w.inch + '"><button class="pill white wide" style="margin-top:12px" data-a="saveWaEdit">Save</button>', { short: true }); setTimeout(() => $("#waEdit").focus(), 350); };
ACT.saveWaEdit = () => { const v = $("#waEdit").value; closeSheet(); saveWaist(v); };

// ===== Workout =====
function vWorkout() {
  const act = activeSession();
  if (act) return vSession(act);
  const d = today(), dk = dayKeyFor(d);
  let h = '<div class="top"><div><div class="eyebrow">Week ' + programWeek(d) + '</div><h1>Workout</h1></div></div>';
  h += vWorkoutCard(d, dk);
  h += '<button class="pill soft wide" data-a="pickDay" style="margin-bottom:4px">Train a different day</button>';
  const past = sessionsSorted().filter(s => s.endTs).reverse().slice(0, 30);
  h += "<h2>History</h2>";
  if (!past.length) h += '<div class="card empty"><b>No workouts yet</b>Your first one shows up here.</div>';
  else h += '<div class="card">' + past.map(s => { const n = sessionSets(s.id).length; return '<button class="row" data-a="viewSession" data-id="' + s.id + '"><div class="m"><b>' + esc(s.name) + "</b><span>" + niceDate(s.d) + " · " + n + " sets" + (s.endTs ? " · " + fmtDur(Date.parse(s.endTs) - Date.parse(s.startTs)) : "") + "</span></div>" + I.chev + "</button>"; }).join("") + "</div>";
  return h;
}
ACT.pickDay = () => openSheet("Which workout?", '<div class="group">' + DAY_KEYS.map(k => '<button class="row" data-a="start" data-day="' + k + '"><div class="m"><b>' + esc(DAYS[k].name) + "</b><span>" + esc(DAYS[k].sub) + "</span></div>" + I.chev + "</button>").join("") + "</div>", { short: true });
ACT.start = el => {
  const dk = el.dataset.day, d = today();
  if (activeSession()) { closeSheet(); TAB = "workout"; render(); return; }
  addEvent("session.started", { v2: 1, dayKey: dk, name: DAYS[dk].name, items: itemsForDay(dk, d) });
  closeSheet(); haptic(); TAB = "workout"; SCROLL.workout = 0; render();
};

function vSession(s) {
  const sets = sessionSets(s.id), tot = s.items.reduce((a, it) => a + it.n, 0), wk = programWeek(s.d);
  let h = '<div class="sbar"><div class="m"><b>' + esc(s.name) + '</b><span id="sTime">' + fmtClock(Date.now() - Date.parse(s.startTs)) + " · " + '<span id="sCount">' + sets.length + " of " + tot + "</span> sets</span></div>"
    + '<button class="pill white" data-a="finish">Finish</button></div>';
  if (wk <= 2) h += '<div class="note">Easy week ' + wk + ". 2 sets each, and stop every set with 3 to 4 reps still in the tank.</div>";
  h += vFix(s, "f", "Back fix", BACK_FIX, "10 min, before anything else");
  const lab = ssLabels(s.items);
  s.items.forEach((it, i) => { h += '<div class="card ex" id="ex' + i + '">' + vEx(s, i, lab[i]) + "</div>"; });
  h += '<button class="pill soft wide" data-a="addEx" style="margin-bottom:12px">Add exercise</button>';
  const cool = COOLDOWN[(DAYS[s.dayKey] || {}).cool || "legs"];
  h += vFix(s, "c", "Cool down", cool, "5 min");
  h += '<button class="pill white wide" data-a="finish" style="margin-top:6px">Finish workout</button>';
  return h;
}
const fmtClock = ms => { const t = Math.floor(ms / 1000), m = Math.floor(t / 60); return m >= 60 ? Math.floor(m / 60) + ":" + pad2(m % 60) + ":" + pad2(t % 60) : m + ":" + pad2(t % 60); };
function vFix(s, pre, title, list, sub) {
  const done = S.fixDone[s.id] || [];
  const n = list.filter((_, i) => done.includes(pre + i)).length;
  return '<div class="card fix"><div class="fix-h"><div><b>' + title + '</b><div class="small">' + sub + '</div></div><span class="small">' + n + " of " + list.length + "</span></div>"
    + list.map((x, i) => { const k = pre + i, on = done.includes(k); return '<button class="fi' + (on ? " done" : "") + '" data-a="fix" data-k="' + k + '"><span class="circ">' + I.tick + '</span><div class="m"><b>' + esc(x.n) + "</b><span>" + esc(x.dose) + "</span></div></button>"; }).join("") + "</div>";
}
ACT.fix = el => {
  const s = activeSession(); if (!s) return;
  const done = (S.fixDone[s.id] || []).slice(), k = el.dataset.k, i = done.indexOf(k);
  if (i >= 0) done.splice(i, 1); else done.push(k);
  addEvent("fix.done", { sessionId: s.id, done }); haptic();
  const y = $("#main").scrollTop; SCROLL.workout = y; render();
};

function vEx(s, i, label) {
  const it = s.items[i], ex = exFor(it);
  if (!ex) return '<div class="ex-h"><div class="m"><b>' + esc(it.ex) + "</b></div></div>";
  const t = targetFor(s, i), logged = loggedByIdx(s, it.ex);
  const hist = histFor(it.ex, s.id), last = hist.length ? hist[hist.length - 1].sets : [];
  const bw = ex.eq === "bw", rows = Math.max(it.n, Object.keys(logged).length ? Math.max(...Object.keys(logged).map(Number)) + 1 : 0);
  const partner = partnerIndex(s.items, i);
  let h = '<div class="ex-h"><div class="m">' + (label ? '<span class="ss">SUPERSET ' + label + "</span>" : "") + "<b>" + esc(ex.n) + "</b></div>"
    + '<button class="more" data-a="exMenu" data-i="' + i + '" aria-label="More">' + I.more + "</button></div>";
  h += '<div class="tgt">' + esc(tgtTxt(t, ex)) + "</div>";
  h += '<div class="why">' + esc(t.reason) + (partner >= 0 && label.endsWith("1") ? " Then go straight to " + esc((getEx(s.items[partner].ex) || {}).n || "the next one") + "." : "") + "</div>";
  h += '<div class="sets"><div class="sh"><span>Set</span><span>Last</span><span>' + (bw ? "" : "kg") + "</span><span>" + (ex.t ? "sec" : "reps") + "</span><span></span></div>";
  for (let k = 0; k < rows; k++) {
    const st = logged[k], lp = last[k] || last[last.length - 1];
    const pkg = t.kg != null ? fmtKg(t.kg) : "", prep = t.reps[k] != null ? t.reps[k] : (t.reps[t.reps.length - 1] != null ? t.reps[t.reps.length - 1] : "");
    h += '<div class="st' + (st ? " done" : "") + '" data-i="' + i + '" data-k="' + k + '"><span class="n">' + (k + 1) + '</span><span class="pv">' + (lp ? (lp.kg ? fmtKg(lp.kg) + " × " : "") + lp.reps : "") + "</span>"
      + (bw ? '<span class="small" style="text-align:center">body</span>' : '<input inputmode="decimal" data-f="kg" placeholder="' + pkg + '" value="' + (st ? fmtKg(st.kg) : "") + '">')
      + '<input inputmode="numeric" data-f="reps" placeholder="' + prep + '" value="' + (st ? st.reps : "") + '">'
      + '<button class="tick" data-a="tick" aria-label="Done">' + I.tick + "</button></div>";
    if (st) h += '<div class="qrow"><button class="qchip ' + st.q + '" data-a="q" data-id="' + st.id + '">' + (st.q === "clean" ? "Clean" : st.q === "struggled" ? "Struggled" : "Cheated") + "</button></div>";
  }
  h += '</div><div class="ex-f"><button data-a="addSet" data-i="' + i + '">+ Set</button>' + (rows > Object.keys(logged).length && it.n > 1 ? '<button data-a="dropSet" data-i="' + i + '">− Set</button>' : "") + "</div>";
  return h;
}
function repaintEx(i) {
  const s = activeSession(); if (!s) return;
  const card = $("#ex" + i); if (card) card.innerHTML = vEx(s, i, ssLabels(s.items)[i]);
  const tot = s.items.reduce((a, it) => a + it.n, 0), c = $("#sCount"); if (c) c.textContent = sessionSets(s.id).length + " of " + tot;
}
ACT.tick = el => {
  const s = activeSession(); if (!s) return;
  const row = el.closest(".st"), i = +row.dataset.i, k = +row.dataset.k, it = s.items[i], ex = exFor(it);
  const logged = loggedByIdx(s, it.ex);
  if (logged[k]) { addEvent("entity.deleted", { ref: logged[k].id }); rebuild(); haptic(); repaintEx(i); toast("Set removed"); return; }
  const t = targetFor(s, i), kIn = $('input[data-f="kg"]', row), rIn = $('input[data-f="reps"]', row);
  let kg = ex.eq === "bw" ? 0 : numIn(kIn.value); if (kg == null) kg = numIn(kIn.placeholder);
  let reps = numIn(rIn.value); if (reps == null) reps = numIn(rIn.placeholder);
  if (ex.eq !== "bw" && kg == null) { kIn.focus(); return toast("Type the weight first"); }
  if (reps == null || reps <= 0) { rIn.focus(); return toast("Type your reps"); }
  addEvent("set.logged", { sessionId: s.id, exId: it.ex, item: i, idx: k, kg, reps: Math.round(reps), q: "clean", tKg: t.kg, tReps: t.reps[k] });
  haptic(); repaintEx(i);
  // rest: in a superset, the first one goes straight to its partner
  const lab = ssLabels(s.items)[i], p = partnerIndex(s.items, i);
  if (p >= 0 && lab.endsWith("1")) { toast("Now " + ((getEx(s.items[p].ex) || {}).n || "the next one")); const c = $("#ex" + p); if (c) c.scrollIntoView({ behavior: "smooth", block: "center" }); }
  else if (S.settings.restOn) startRest(it.light ? 60 : ex.rest);
};
// typing into a set that is already done fixes it
document.addEventListener("change", e => {
  const inp = e.target;
  if (inp.id === "wIn") return saveWeight(inp.value);
  if (inp.id === "waistIn") return saveWaist(inp.value);
  const row = inp.closest && inp.closest(".st.done"); if (!row) return;
  const s = activeSession(); if (!s) return;
  const i = +row.dataset.i, k = +row.dataset.k, st = loggedByIdx(s, s.items[i].ex)[k]; if (!st) return;
  const v = numIn(inp.value); if (v == null) return;
  addEvent("set.edited", inp.dataset.f === "kg" ? { ref: st.id, kg: v } : { ref: st.id, reps: Math.round(v) }); toast("Set updated");
});
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const inp = e.target; if (inp.id === "wIn" || inp.id === "waistIn") { inp.blur(); return; }
  const row = inp.closest && inp.closest(".st"); if (!row) return;
  e.preventDefault(); if (inp.dataset.f === "kg") { const r = $('input[data-f="reps"]', row); if (r) r.focus(); } else { inp.blur(); }
});
ACT.q = el => {
  const st = S.sets[el.dataset.id]; if (!st) return;
  const nq = st.q === "clean" ? "struggled" : st.q === "struggled" ? "cheated" : "clean";
  addEvent("set.q", { ref: st.id, q: nq }); haptic();
  el.className = "qchip " + nq; el.textContent = nq === "clean" ? "Clean" : nq === "struggled" ? "Struggled" : "Cheated";
};
function editItems(fn) { const s = activeSession(); const items = clone(s.items); fn(items); addEvent("session.edited", { sessionId: s.id, items }); }
ACT.addSet = el => { const i = +el.dataset.i; editItems(items => { items[i].n += 1; }); repaintEx(i); };
ACT.dropSet = el => { const i = +el.dataset.i; editItems(items => { items[i].n = Math.max(1, items[i].n - 1); }); repaintEx(i); };

// exercise menu
ACT.exMenu = el => {
  const s = activeSession(), i = +el.dataset.i, it = s.items[i], ex = exFor(it);
  openSheet(ex.n, '<div class="card pad" style="margin-top:4px"><div class="lbl">How to do it</div><p style="margin-top:4px;font-size:15px;line-height:1.45">' + esc(ex.cue) + "</p>"
    + '<p class="small" style="margin-top:8px">' + esc(ex.m) + " · " + ex.r[0] + (ex.r[1] !== ex.r[0] ? " to " + ex.r[1] : "") + (ex.t ? " sec" : " reps") + (ex.each ? " each side" : "") + " · rest " + Math.round(ex.rest / 60 * 10) / 10 + " min</p></div>"
    + '<div class="group"><button class="row" data-a="exHist" data-ex="' + ex.id + '"><div class="m"><b>History</b></div>' + I.chev + "</button>"
    + '<button class="row" data-a="swapEx" data-i="' + i + '"><div class="m"><b>Swap exercise</b></div>' + I.chev + "</button>"
    + '<button class="row" data-a="removeEx" data-i="' + i + '"><div class="m"><b style="color:var(--red)">Remove from this workout</b></div></button></div>', { short: true });
};
function pickerHtml(act, extra) {
  const by = {};
  EXERCISES.forEach(e => (by[e.m] = by[e.m] || []).push(e));
  return '<div class="search"><input class="field" id="exSearch" placeholder="Search" autocomplete="off"></div>'
    + MUSCLE_ORDER.filter(m => by[m]).map(m => '<div class="slbl" data-m>' + esc(m) + '</div><div class="group">' + by[m].map(e => '<button class="row" data-a="' + act + '" data-ex="' + e.id + '"' + (extra || "") + ' data-name="' + esc(e.n.toLowerCase()) + '"><div class="m"><b>' + esc(e.n) + "</b></div></button>").join("") + "</div>").join("");
}
document.addEventListener("input", e => {
  if (e.target.id !== "exSearch") return;
  const q = e.target.value.trim().toLowerCase();
  $$("#sheet .group").forEach(g => { let any = false; $$(".row", g).forEach(r => { const on = !q || r.dataset.name.includes(q); r.hidden = !on; any = any || on; }); g.hidden = !any; const l = g.previousElementSibling; if (l && l.hasAttribute("data-m")) l.hidden = !any; });
});
let PENDING = null;
ACT.swapEx = el => { PENDING = { kind: "swap", i: +el.dataset.i }; openSheet("Swap for", pickerHtml("picked")); };
ACT.addEx = () => { PENDING = { kind: "add" }; openSheet("Add exercise", pickerHtml("picked")); };
ACT.removeEx = el => { PENDING = { kind: "remove", i: +el.dataset.i }; askScope(); };
ACT.picked = el => { PENDING.ex = el.dataset.ex; askScope(); };
function askScope() {
  const s = activeSession(), name = esc(s.name);
  const what = PENDING.kind === "swap" ? "Swap it" : PENDING.kind === "add" ? "Add it" : "Remove it";
  openSheet(what, '<div class="group"><button class="row" data-a="applyEdit" data-scope="today"><div class="m"><b>Just today</b><span>Next ' + name + " goes back to the plan</span></div></button>"
    + '<button class="row" data-a="applyEdit" data-scope="always"><div class="m"><b>Every ' + name + ' from now</b><span>Changes your plan</span></div></button></div>', { short: true });
}
ACT.applyEdit = el => {
  const s = activeSession(), P = PENDING; if (!s || !P) return;
  const always = el.dataset.scope === "always";
  editItems(items => {
    if (P.kind === "swap") items[P.i] = Object.assign({}, items[P.i], { ex: P.ex, r: null, light: items[P.i].light });
    if (P.kind === "add") items.push({ ex: P.ex, sets: 3, n: programWeek(s.d) <= 2 ? 2 : 3 });
    if (P.kind === "remove") items.splice(P.i, 1);
  });
  if (always && s.dayKey) {
    const src = activeSession().items.map(x => { const o = { ex: x.ex, sets: x.sets || x.n }; if (x.p5) o.p5 = x.p5; if (x.r) o.r = x.r; if (x.ss) o.ss = x.ss; if (x.light) o.light = x.light; return o; });
    addEvent("program.upserted", { dayKey: s.dayKey, items: src });
  }
  PENDING = null; closeSheet(); haptic(); SCROLL.workout = $("#main").scrollTop; render();
  toast(always ? "Plan updated" : "Changed for today");
};

ACT.finish = () => {
  const s = activeSession(); if (!s) return;
  const n = sessionSets(s.id).length;
  if (!n) {
    openSheet("Finish workout?", '<p class="sub" style="text-align:center;margin:6px 0 14px">No sets logged yet.</p><div class="group"><button class="row" data-a="discard"><div class="m"><b style="color:var(--red)">Delete this workout</b></div></button><button class="row" data-a="closeSheet"><div class="m"><b>Keep going</b></div></button></div>', { short: true });
    return;
  }
  addEvent("session.finished", { sessionId: s.id }); stopRest(); haptic();
  TAB = "today"; SCROLL.today = 0; render(); syncNow();
  toast(n + " sets logged. Go and eat.");
};
ACT.discard = () => { const s = activeSession(); if (s) addEvent("entity.deleted", { ref: s.id }); rebuild(); closeSheet(); stopRest(); TAB = "today"; render(); };

ACT.viewSession = el => {
  const s = S.sessions[el.dataset.id]; if (!s) return;
  const sets = sessionSets(s.id), by = {};
  sets.forEach(x => (by[x.exId] = by[x.exId] || []).push(x));
  let h = '<p class="sub" style="text-align:center;margin-bottom:6px">' + niceDate(s.d) + " · " + sets.length + " sets" + (s.endTs ? " · " + fmtDur(Date.parse(s.endTs) - Date.parse(s.startTs)) : "") + "</p>";
  Object.keys(by).forEach(id => { const e = getEx(id); h += '<div class="hist-d">' + esc(e ? e.n : id) + '</div><div class="hist-s">' + by[id].sort((a, b) => a.idx - b.idx).map(x => '<span class="' + x.q + '">' + (x.kg ? fmtKg(x.kg) + " × " : "") + x.reps + "</span>").join("") + "</div>"; });
  if (!sets.length) h += '<div class="empty">No sets in this workout.</div>';
  h += '<button class="pill red wide" style="margin-top:22px" data-a="delSession" data-id="' + s.id + '">Delete workout</button>';
  openSheet(s.name, h);
};
ACT.delSession = el => {
  if (el.dataset.sure !== "1") { el.dataset.sure = "1"; el.textContent = "Tap again to delete"; return; }
  addEvent("entity.deleted", { ref: el.dataset.id }); rebuild(); closeSheet(); render(); toast("Workout deleted");
};
ACT.exHist = el => {
  const id = el.dataset.ex, e = getEx(id), hist = histFor(id).reverse();
  let h = hist.length ? "" : '<div class="empty"><b>No history yet</b>Your sets show up here after you log them.</div>';
  if (hist.length > 1) h += '<div class="card pad"><div class="lbl">Best set per workout (estimated max)</div><div class="chart">' + lineChart(hist.slice().reverse().map(x => ({ d: x.d, v: Math.max(...x.sets.map(s => e1rm(s.kg || 0, s.reps))) })), {}) + "</div></div>";
  hist.forEach(x => { h += '<div class="hist-d">' + niceDate(x.d) + '</div><div class="hist-s">' + x.sets.map(s => '<span class="' + s.q + '">' + (s.kg ? fmtKg(s.kg) + " × " : "") + s.reps + "</span>").join("") + "</div>"; });
  openSheet(e ? e.n : id, h);
};

// ----- rest timer -----
let REST = null, restIv = null, AC = null, wake = null;
function ensureAudio() { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (_) {} }
function beep() {
  try { ensureAudio(); if (!AC) return; const now = AC.currentTime, vol = S.settings.vol == null ? 0.6 : S.settings.vol;
    [0, 0.22].forEach((dt, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.value = i ? 880 : 660;
      g.gain.setValueAtTime(0.0001, now + dt); g.gain.exponentialRampToValueAtTime(0.25 * vol + 0.001, now + dt + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, now + dt + 0.5);
      o.connect(g).connect(AC.destination); o.start(now + dt); o.stop(now + dt + 0.55); }); } catch (_) {}
}
function startRest(sec) {
  ensureAudio(); REST = { end: Date.now() + sec * 1000, total: sec * 1000, rang: false };
  try { localStorage.setItem("nitfit:rest", JSON.stringify(REST)); } catch (_) {}
  clearInterval(restIv); restIv = setInterval(paintRest, 250); paintRest(); wakeOn();
}
function stopRest() { REST = null; clearInterval(restIv); try { localStorage.removeItem("nitfit:rest"); } catch (_) {} paintRest(); wakeOff(); }
function paintRest() {
  const el = $("#rest"); if (!REST) { el.classList.remove("on", "done"); return; }
  const left = REST.end - Date.now();
  if (left <= 0 && !REST.rang) { REST.rang = true; beep(); haptic(); el.classList.add("done"); setTimeout(() => { if (REST && REST.rang) stopRest(); }, 4000); }
  const t = Math.max(0, Math.ceil(left / 1000));
  $(".time", el).textContent = Math.floor(t / 60) + ":" + pad2(t % 60);
  $(".bar i", el).style.width = Math.min(100, 100 * (1 - Math.max(0, left) / REST.total)) + "%";
  el.classList.add("on");
}
ACT.restAdd = el => { if (!REST) return; REST.end += +el.dataset.v * 1000; REST.total = Math.max(REST.total, REST.end - Date.now()); REST.rang = false; $("#rest").classList.remove("done"); paintRest(); };
ACT.restSkip = () => stopRest();
async function wakeOn() { try { if ("wakeLock" in navigator && !wake) wake = await navigator.wakeLock.request("screen"); } catch (_) {} }
function wakeOff() { try { if (wake) wake.release(); } catch (_) {} wake = null; }

// ===== Progress =====
function vProgress() {
  let h = '<div class="top"><div><div class="eyebrow">Goal: 68 kg, 14% or leaner</div><h1>Progress</h1></div></div>';
  // weight
  const tr = trendSeries(weightList());
  const range = S.ui_range || "3M", days = { "1M": 31, "3M": 92, "6M": 183, All: 99999 }[range];
  const cut = addDays(today(), -days), pts = tr.filter(x => x.d >= cut);
  const last = tr.length ? tr[tr.length - 1] : null;
  let rate = "";
  if (tr.length >= 2) { const a = tr.find(x => x.d >= addDays(last.d, -14)) || tr[0], span = Math.max(1, daysBetween(a.d, last.d)); const wk = (last.trend - a.trend) / span * 7; rate = (wk >= 0 ? "+" : "") + wk.toFixed(2) + " kg a week"; }
  h += '<div class="card pad"><div class="lbl">Weight trend</div><div class="bigval" style="margin-top:2px">' + (last ? last.trend.toFixed(1) + "<small>kg</small>" : "&nbsp;") + '</div><div class="small">' + (last ? (rate || "Keep weighing in") + " · aim for about +0.25 kg a week" : "Weigh in every morning on the Today tab") + "</div>"
    + (pts.length >= 2 ? '<div class="chart">' + lineChart(pts.map(x => ({ d: x.d, v: x.trend, raw: x.kg })), { goal: 68 }) + "</div>" : "")
    + '<div class="seg">' + ["1M", "3M", "6M", "All"].map(r => '<button class="' + (r === range ? "on" : "") + '" data-a="range" data-v="' + r + '">' + r + "</button>").join("") + "</div></div>";
  // waist
  const wl = Object.values(S.waists).sort((a, b) => a.d < b.d ? -1 : 1);
  if (wl.length) { const lw = wl[wl.length - 1]; h += '<div class="card"><div class="ck"><div class="m"><b>Waist</b><span>' + niceDate(lw.d) + (wl.length > 1 ? " · started at " + wl[0].inch + " in" : "") + '</span></div><div class="bigval">' + lw.inch + "<small>in</small></div></div></div>"; }
  // pull-ups toward 30
  const pu = (S.byEx.pullup || []).map(id => S.sets[id]).filter(x => x && x.q !== "cheated");
  const best = pu.length ? Math.max(...pu.map(x => x.reps)) : 0;
  h += '<div class="card pad"><div class="lbl">Pull-ups, best clean set</div><div class="bigval" style="margin-top:2px">' + best + "<small>of 30</small></div>"
    + '<div class="goal"><i style="width:' + Math.min(100, best / 30 * 100) + '%"></i></div></div>';
  // exercises
  const done = Object.keys(S.byEx).filter(id => (S.byEx[id] || []).length && getEx(id));
  h += "<h2>Lifts</h2>";
  if (!done.length) h += '<div class="card empty"><b>Nothing yet</b>Every lift you log shows up here with its own graph.</div>';
  else {
    const rows = done.map(id => { const hs = histFor(id); const l = hs[hs.length - 1]; return { id, hs, l }; }).sort((a, b) => a.l.d < b.l.d ? 1 : -1);
    h += '<div class="card">' + rows.map(r => {
      const e = getEx(r.id), bs = r.l.sets.reduce((a, s) => e1rm(s.kg || 0, s.reps) > e1rm(a.kg || 0, a.reps) ? s : a, r.l.sets[0]);
      return '<button class="row" data-a="exHist" data-ex="' + r.id + '"><div class="m"><b>' + esc(e.n) + "</b><span>" + niceDate(r.l.d) + " · best " + (bs.kg ? fmtKg(bs.kg) + " kg × " : "") + bs.reps + "</span></div>" + spark(r.hs.map(x => Math.max(...x.sets.map(s => e1rm(s.kg || 0, s.reps))))) + I.chev + "</button>";
    }).join("") + "</div>";
  }
  return h;
}
ACT.range = el => { S.ui_range = el.dataset.v; SCROLL.progress = $("#main").scrollTop; render(); };
function lineChart(pts, o) {
  const W = 340, H = 150, pl = 4, pr = 34, pt = 10, pb = 22;
  let vs = pts.map(p => p.v).concat(pts.filter(p => p.raw != null).map(p => p.raw));
  let lo = Math.min(...vs), hi = Math.max(...vs); if (hi - lo < 1) { lo -= 0.5; hi += 0.5; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const t0 = dayNum(pts[0].d), t1 = Math.max(t0 + 1, dayNum(pts[pts.length - 1].d));
  const X = d => pl + (dayNum(d) - t0) / (t1 - t0) * (W - pl - pr), Y = v => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const P = pts.map(p => [X(p.d), Y(p.v)]);
  let d = "M" + P[0][0].toFixed(1) + " " + P[0][1].toFixed(1);
  for (let i = 1; i < P.length; i++) { const a = P[i - 2] || P[i - 1], b = P[i - 1], c = P[i], e = P[i + 1] || c;
    d += " C" + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + " " + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + " " + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + " " + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + " " + c[0].toFixed(1) + " " + c[1].toFixed(1); }
  let s = '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none">';
  [hi - pad, lo + pad].forEach(v => { s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="rgba(255,255,255,.08)" stroke-dasharray="2 4"/><text x="' + (W - pr + 6) + '" y="' + (Y(v) + 4).toFixed(1) + '">' + (Math.round(v * 10) / 10) + "</text>"; });
  pts.forEach(p => { if (p.raw != null) s += '<circle cx="' + X(p.d).toFixed(1) + '" cy="' + Y(p.raw).toFixed(1) + '" r="2" fill="rgba(255,255,255,.28)"/>'; });
  s += '<path d="' + d + '" fill="none" stroke="#f5f5f7" stroke-width="2.4" stroke-linecap="round" vector-effect="non-scaling-stroke"/>';
  s += '<text x="' + pl + '" y="' + (H - 4) + '">' + niceDate(pts[0].d) + '</text><text x="' + (W - pr) + '" y="' + (H - 4) + '" text-anchor="end">' + niceDate(pts[pts.length - 1].d) + "</text>";
  return s + "</svg>";
}
function spark(vals) {
  if (vals.length < 2) return '<span class="spark"></span>';
  const lo = Math.min(...vals), hi = Math.max(...vals) || 1, W = 64, H = 26;
  const pts = vals.map((v, i) => (i / (vals.length - 1) * (W - 4) + 2).toFixed(1) + "," + (H - 3 - (hi === lo ? 0.5 : (v - lo) / (hi - lo)) * (H - 6)).toFixed(1)).join(" ");
  return '<svg class="spark" viewBox="0 0 64 26"><polyline points="' + pts + '" fill="none" stroke="#f5f5f7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

// ===== Settings =====
ACT.settings = () => {
  const st = syncStatus(), card = S.settings.card || "glass";
  let h = '<div class="slbl" style="margin-top:6px">Card style</div><div class="tg"><button class="' + (card === "glass" ? "on" : "") + '" data-a="card" data-v="glass">Glass</button><button class="' + (card === "default" ? "on" : "") + '" data-a="card" data-v="default">Default</button></div>';
  h += '<div class="slbl">Backup</div><div class="group"><div class="row"><span class="dot ' + st.c + '"></span><div class="m"><b style="white-space:normal">' + esc(st.t) + "</b><span>Private repo: " + esc(repoName()) + "</span></div></div>";
  if (KV.token) h += '<button class="row" data-a="syncNow"><div class="m"><b>Back up now</b></div></button><button class="row" data-a="newKey"><div class="m"><b>Change key</b></div></button></div>';
  else h += "</div>" + keyStepsHtml();
  h += '<div class="slbl">Your plan</div><div class="group"><div class="row"><div class="m"><b>Week ' + programWeek(today()) + '</b><span>Weeks 1 and 2 easy, 3 and 4 normal, full sets from week 5</span></div></div>'
    + '<div class="row"><div class="m"><b>Rest timer</b><span>Starts after each set, soft chime at the end</span></div><div class="tg" style="margin:0;width:120px"><button class="' + (S.settings.restOn ? "on" : "") + '" data-a="restOn" data-v="1">On</button><button class="' + (!S.settings.restOn ? "on" : "") + '" data-a="restOn" data-v="0">Off</button></div></div></div>';
  h += '<div class="slbl">Data</div><div class="group"><button class="row" data-a="exportFile"><div class="m"><b>Save a backup file</b></div></button><button class="row" data-a="importFile"><div class="m"><b>Load a backup file</b></div></button></div>';
  h += '<p class="hint" style="text-align:center;margin-top:18px">NitFit ' + APP_VERSION + " · " + EV.length + " entries saved</p>";
  openSheet("Settings", h, { name: "settings" });
};
function keyStepsHtml() {
  return '<ol class="ol"><li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank">github.com/settings/personal-access-tokens/new</a></li>'
    + "<li>Name: <b>NitFit backup</b>. Expiration: <b>No expiration</b>.</li><li>Repository access: <b>Only select repositories</b>, then <b>nitfit-data</b>.</li>"
    + "<li>Permissions: <b>Contents</b>, set to <b>Read and write</b>. Tap <b>Generate token</b> and copy it.</li></ol>"
    + '<input class="field" id="keyIn" placeholder="Paste the key here" autocomplete="off" autocapitalize="off" spellcheck="false">'
    + '<button class="pill white wide" style="margin-top:10px" data-a="connect">Connect</button><p class="hint" id="keyErr"></p>';
}
ACT.card = el => { addEvent("settings.upserted", { card: el.dataset.v }); applyCard(); haptic(); ACT.settings(); };
ACT.restOn = el => { addEvent("settings.upserted", { restOn: el.dataset.v === "1" }); haptic(); ACT.settings(); };
ACT.newKey = () => openSheet("Change key", keyStepsHtml());
ACT.connect = async el => {
  const err = $("#keyErr"); el.textContent = "Connecting..."; err.textContent = "";
  try { await connectKey($("#keyIn").value); toast("Backed up"); closeSheet(); render(); }
  catch (e) { err.textContent = e.message; err.classList.add("err"); el.textContent = "Connect"; }
};
ACT.syncNow = async () => { toast("Backing up..."); const ok = await syncNow(true); toast(ok ? "Backed up" : (KV.syncErr || "Could not back up")); if (SHEET === "settings") ACT.settings(); };
function syncPaint() { if (SHEET === "settings" && !syncing) { /* refreshed on next open */ } }
ACT.exportFile = () => {
  const blob = new Blob([JSON.stringify(buildExport())], { type: "application/json" }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "nitfit-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove();
};
ACT.importFile = () => $("#importIn").click();
document.addEventListener("DOMContentLoaded", () => {
  $("#importIn").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { const n = await importExport(JSON.parse(await f.text())); toast(n + " entries loaded"); closeSheet(); render(); } catch (er) { toast(er.message || "Could not read that file"); } e.target.value = ""; });
});

// ----- tabs and taps -----
ACT.tab = el => {
  const t = el.dataset.tab; SCROLL[TAB] = $("#main").scrollTop;
  if (t === TAB) { $("#main").scrollTo({ top: 0, behavior: "smooth" }); return; }
  TAB = t; haptic(); closeSheet(); render();
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]"); if (!el) return;
  const f = ACT[el.dataset.a]; if (f) { e.preventDefault(); f(el, e); }
});

// ----- boot -----
async function boot() {
  try { await coreBoot(); } catch (e) { $("#main").innerHTML = '<div class="empty"><b>NitFit could not open its storage</b>Close it and open it again.</div>'; return; }
  applyCard(); render();
  try { const r = JSON.parse(localStorage.getItem("nitfit:rest") || "null"); if (r && r.end > Date.now()) { REST = r; restIv = setInterval(paintRest, 250); paintRest(); } } catch (_) {}
  if (KV.token) syncNow(true);
  if ("serviceWorker" in navigator && isStandalone()) navigator.serviceWorker.register("sw.js").catch(() => {});
  setInterval(() => { const s = activeSession(), el = $("#sTime"); if (s && el && el.firstChild) el.firstChild.textContent = fmtClock(Date.now() - Date.parse(s.startTs)) + " · "; }, 1000);
  let lastDay = today();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "visible") return; if (today() !== lastDay) { lastDay = today(); render(); } if (KV.token) syncNow(); if (REST) paintRest(); });
}
boot();
