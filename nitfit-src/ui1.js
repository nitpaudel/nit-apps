// ---------- NitFit screens, part 1: helpers, Today, Workout, rest timer ----------
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
let TAB = "today";
const UI = { prog: "lifts", foodD: null, swapPlan: false, cmpPose: "front" };
const ACT = {};
const numIn = v => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2200); }
function openSheet(html) { $("#sheet .in").innerHTML = html; $("#sheet").classList.add("on"); $("#sheet .pn").scrollTop = 0; }
function closeSheet() { $("#sheet").classList.remove("on"); $("#sheet .in").innerHTML = ""; }
ACT.closeSheet = closeSheet;
const ICON_TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// simple line chart. series: [{pts:[[x,y]], color, w, dots, dash}]
function lineChart(series, o) {
  o = o || {}; const W = 340, H = o.h || 170, L = 38, R = 8, T = 10, B = 22;
  const all = series.flatMap(s => s.pts); if (!all.length) return '<div class="mut" style="padding:24px 0;text-align:center">No data yet.</div>';
  let x0 = Math.min(...all.map(p => p[0])), x1 = Math.max(...all.map(p => p[0])), y0 = Math.min(...all.map(p => p[1])), y1 = Math.max(...all.map(p => p[1]));
  if (x1 === x0) { x0 -= 1; x1 += 1; } const padY = (y1 - y0) * 0.12 || Math.max(1, y1 * 0.05); y0 -= padY; y1 += padY;
  const X = x => L + (x - x0) / (x1 - x0) * (W - L - R), Y = y => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  const yf = o.yf || (v => Math.round(v * 10) / 10), xf = o.xf || (v => v);
  let g = "";
  for (let i = 0; i < 3; i++) { const v = y0 + (y1 - y0) * (0.1 + 0.4 * i), y = Y(v).toFixed(1); g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="#27272c" stroke-width="1"/><text x="' + (L - 6) + '" y="' + (+y + 4) + '" text-anchor="end" font-size="10.5" fill="#8e8e96">' + yf(v) + "</text>"; }
  g += '<text x="' + L + '" y="' + (H - 5) + '" font-size="10.5" fill="#8e8e96">' + esc(xf(x0)) + '</text><text x="' + (W - R) + '" y="' + (H - 5) + '" text-anchor="end" font-size="10.5" fill="#8e8e96">' + esc(xf(x1)) + "</text>";
  for (const s of series) {
    if (!s.pts.length) continue;
    if (!s.dotsOnly) g += '<polyline fill="none" stroke="' + s.color + '" stroke-width="' + (s.w || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : "") + ' points="' + s.pts.map(p => X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join(" ") + '"/>';
    if (s.dots || s.dotsOnly) g += s.pts.map(p => '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="' + (s.r || 2.6) + '" fill="' + s.color + '"/>').join("");
  }
  return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '">' + g + "</svg>";
}
function spark(vals, color) {
  if (vals.length < 2) return '<svg class="spark"></svg>';
  const a = Math.min(...vals), b = Math.max(...vals), sp = (b - a) || 1;
  return '<svg class="spark" viewBox="0 0 84 30"><polyline fill="none" stroke="' + (color || "#d6ff3f") + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="' + vals.map((v, i) => (3 + i * 78 / (vals.length - 1)).toFixed(1) + "," + (26 - (v - a) / sp * 22).toFixed(1)).join(" ") + '"/></svg>';
}
const dayLabel = n => { const t = new Date(n * 864e5); return t.getUTCDate() + " " + MONTHS[t.getUTCMonth()]; };

// ----- coach helpers -----
function readinessFlags(d) { let f = 0; const sl = sleepFor(d); if (sl && sl.flag === "bad") f++; if (S.energy[d] === "low") f++; return f; }
function gapDays(d) { const ss = sessionsSorted().filter(s => s.d < d); return ss.length ? daysBetween(ss[ss.length - 1].d, d) : 0; }
function setsTxt(sets, ex) { const kg = sets[0].kg; return (kg ? kgTxt(kg) + " kg x " : "") + sets.map(s => s.reps).join(", ") + unit(ex); }
function tgtTxt(t, ex) {
  if (t.kg == null) return t.sets + " sets, find your " + (ex.eq === "bw" ? "level" : "weight");
  const r = t.reps, same = r.every(x => x === r[0]);
  return t.sets + " x " + (t.kg ? kgTxt(t.kg) + " kg x " : "") + (same ? r[0] : r.join(", ")) + unit(ex);
}
function coachLines() {
  const d = today(), y = addDays(d, -1), out = [], st = S.settings;
  if (!S.weights[d]) out.push("Weigh in. Every morning, before food.");
  const yKey = S.dayMap[dow(y)], trainedY = sessionsSorted().some(s => s.d === y), trainedT = sessionsSorted().some(s => s.d === d && s.endTs);
  if (yKey !== "core" && !trainedY && Object.keys(S.sessions).length) out.push("You missed yesterday. It is gone. Hit today.");
  const fy = foodDay(y); if (fy.items.length && fy.p < st.proteinFloor) out.push("Protein was " + fy.p + " of " + st.protein + " g yesterday. Fix it today.");
  if (trainedT) out.push("Workout done. Now eat and sleep.");
  else if (S.dayMap[dow(d)] !== "core" && new Date().getHours() >= 9) out.push("The gym is open till 8 PM. Late beats missed.");
  if (weekInfo(d).easy) out.push("Easy week. Half the sets. Do not skip it.");
  return out.slice(0, 3);
}

// ----- Today -----
function vToday() {
  const d = today(), dt = new Date(), dayKey = S.dayMap[dow(d)], act = activeSession(), wi = weekInfo(d);
  const doneT = sessionsSorted().filter(s => s.d === d && s.endTs);
  const w = S.weights[d], wl = weightList(), tr = trendSeries(wl), trend = tr.length ? tr[tr.length - 1].trend : null;
  const sl = sleepFor(d), en = S.energy[d];
  const ctx = { flags: readinessFlags(d), deload: wi.easy, gap: gapDays(d) };
  let h = '<div class="top"><div><div class="sub">' + WEEKDAYS[dt.getDay()] + ", " + dt.getDate() + " " + MONTHS[dt.getMonth()] + "</div><h1>Today</h1></div>" + syncChip() + "</div>";
  h += bannerHtml();
  const cl = coachLines(); if (cl.length) h += '<div class="coach">' + cl.map(x => "<p>" + esc(x) + "</p>").join("") + "</div>";
  // weight, sleep, energy
  h += '<div class="card tight">';
  h += '<div class="row"><div class="grow"><div class="t">Weight</div><div class="s">' + (trend ? "Trend " + trend.toFixed(1) + " kg" : "Log it every morning") + "</div></div>" +
    (w ? '<button class="r num" data-a="editWeight" style="color:var(--txt);font-weight:800;font-size:19px">' + w.kg.toFixed(1) + " kg</button>"
       : '<div class="field" style="width:150px"><input class="inp num" id="wIn" inputmode="decimal" placeholder="kg"><button class="btn small" data-a="saveWeight">Save</button></div>') + "</div>";
  h += '<div class="row"><div class="grow"><div class="t">Sleep</div><div class="s">' + (sl && sl.min ? Math.floor(sl.min / 60) + " h " + (sl.min % 60) + " min, from your sleep widget" : "How did you sleep?") + '</div></div><div class="chips">' +
    ["bad", "ok", "good"].map(f => '<button class="chip' + (sl && sl.flag === f ? " on" : "") + '" data-a="sleep" data-v="' + f + '">' + f[0].toUpperCase() + f.slice(1) + "</button>").join("") + "</div></div>";
  h += '<div class="row"><div class="grow"><div class="t">Energy</div></div><div class="chips">' +
    ["low", "ok", "high"].map(f => '<button class="chip' + (en === f ? " on" : "") + '" data-a="energy" data-v="' + f + '">' + f[0].toUpperCase() + f.slice(1) + "</button>").join("") + "</div></div>";
  h += "</div>";
  // workout
  if (act) {
    const n = sessionSets(act.id).length;
    h += '<h2>Workout running</h2><div class="card"><div class="kv"><div style="font-size:22px;font-weight:800">' + esc(DAY_NAMES[act.dayKey] || "Workout") + '</div><div class="mut">' + n + ' sets done</div></div><div style="height:12px"></div><button class="btn" data-a="openWk">Continue workout</button></div>';
  } else {
    h += "<h2>" + (dayKey === "core" ? "Rest day" : "Today's workout") + "</h2>";
    doneT.forEach(s => { const n = sessionSets(s.id).length, min = Math.round((Date.parse(s.endTs) - Date.parse(s.startTs)) / 60000); h += '<div class="card"><div class="kv"><div style="font-size:19px;font-weight:800">' + esc(DAY_NAMES[s.dayKey] || "Workout") + ' <span class="tag acc">Done</span></div><button class="mut" data-a="summary" data-id="' + s.id + '">' + n + " sets, " + min + " min ›</button></div></div>"; });
    if (!doneT.some(s => s.dayKey === dayKey)) h += planCard(dayKey, ctx, wi);
    h += '<button class="btn ghost" data-a="pickDay" style="margin-top:2px">Do a different day</button>';
  }
  return h;
}
function planCard(dayKey, ctx, wi) {
  const items = S.plan[dayKey] || [];
  let h = '<div class="card"><div class="kv" style="margin-bottom:8px"><div style="font-size:24px;font-weight:800;letter-spacing:-.02em">' + esc(DAY_NAMES[dayKey]) + "</div><div>" + (wi.easy ? '<button class="tag amber" data-a="easyToggle">Easy week</button>' : '<span class="tag">Week ' + wi.week + " of 6</span>") + "</div></div>";
  if (dayKey === "core") h += '<p class="sub" style="margin:0 0 8px">No lifting today. This short routine fixes your core and posture. 10 minutes.</p>';
  h += items.map(it => { const ex = getEx(it.ex); if (!ex) return ""; const t = coachTarget(ex, histFor(it.ex), Object.assign({ sets: it.sets }, ctx)); return '<div class="plan-li"><div class="n">' + esc(ex.n) + '</div><div class="v num">' + esc(tgtTxt(t, ex).replace(/, find your.*/, "")) + "</div></div>"; }).join("");
  h += '<div style="height:14px"></div><button class="btn" data-a="start" data-day="' + dayKey + '">Start ' + esc(DAY_NAMES[dayKey]) + "</button></div>";
  return h;
}
function syncChip() { const s = syncStatus(); return '<button class="sync" data-a="tab" data-tab="more"><span data-synctxt>' + esc(s.t) + '</span><span class="dot ' + s.c + '" data-syncdot></span></button>'; }
function syncPaint() { const s = syncStatus(); $$("[data-synctxt]").forEach(e => e.textContent = s.t); $$("[data-syncdot]").forEach(e => e.className = "dot " + s.c); }
function bannerHtml() {
  if (storageBroken) return '<div class="banner"><span>' + esc(storageBroken) + "</span></div>";
  if (!KV.token) return '<div class="banner"><span>Not backed up yet. If this phone loses the data, it is gone.</span><button data-a="keySetup">Set up</button></div>';
  if (KV.syncErr && !/Offline/.test(KV.syncErr)) return '<div class="banner"><span>' + esc(KV.syncErr) + '</span><button data-a="syncNow">Retry</button></div>';
  return "";
}
ACT.saveWeight = () => { const v = numIn($("#wIn").value); if (!(v > 25 && v < 250)) return toast("Type your weight in kg."); addEvent("weight.logged", { kg: v }); render(); };
ACT.editWeight = () => openSheet('<h3>Today\'s weight</h3><div class="field"><input class="inp num" id="wIn" inputmode="decimal" value="' + S.weights[today()].kg + '"><button class="btn small" data-a="saveWeight2">Save</button></div>');
ACT.saveWeight2 = () => { const v = numIn($("#wIn").value); if (!(v > 25 && v < 250)) return toast("Type your weight in kg."); addEvent("weight.logged", { kg: v }); closeSheet(); render(); };
ACT.sleep = el => { addEvent("sleep.manual", { flag: el.dataset.v }); render(); };
ACT.energy = el => { addEvent("energy.logged", { level: el.dataset.v }); render(); };
ACT.easyToggle = () => { const wi = weekInfo(today()); openSheet('<h3>Easy week</h3><p>Every 6th week you do half the sets with the same weights. Your body catches up and you come back stronger. Skipping it is how people get stuck.</p><button class="btn ghost" data-a="easyOff" data-ws="' + wi.ws + '">Skip the easy week anyway</button>'); };
ACT.easyOff = el => { addEvent("settings.upserted", { easyOff: el.dataset.ws, easyOn: null }); closeSheet(); render(); };
ACT.pickDay = () => openSheet("<h3>Pick a day</h3><p>A missed day is skipped, not moved. Use this only when you need to.</p>" + DAY_ORDER.map(k => '<button class="row" style="width:100%" data-a="start" data-day="' + k + '"><div class="grow"><div class="t">' + DAY_NAMES[k] + '</div><div class="s">' + (S.plan[k] || []).length + ' exercises</div></div><span class="chev">›</span></button>').join(""));

// ----- Workout -----
const WK = { drafts: {}, extra: {}, tg: {} };
ACT.start = el => {
  const d = today(), dayKey = el.dataset.day; closeSheet(); ensureAudio();
  if (activeSession()) return openWk();
  if (!S.settings.blockStart) addEvent("settings.upserted", { blockStart: d });
  addEvent("session.started", { dayKey, items: clone(S.plan[dayKey] || []), flags: readinessFlags(d), deload: weekInfo(d).easy, gap: gapDays(d) });
  WK.drafts = {}; WK.extra = {}; openWk();
};
ACT.openWk = () => { ensureAudio(); openWk(); };
function openWk() { $("#wk").classList.add("on"); renderWk(); wakeOn(); clearInterval(openWk.iv); openWk.iv = setInterval(paintClock, 20000); }
function closeWk() { $("#wk").classList.remove("on"); clearInterval(openWk.iv); wakeOff(); render(); }
ACT.minWk = closeWk;
function paintClock() { const s = activeSession(), el = $("#wkClock"); if (s && el) el.textContent = Math.max(0, Math.round((Date.now() - Date.parse(s.startTs)) / 60000)) + " min"; }
function exBlock(sess, it, first) {
  const ex = getEx(it.ex); if (!ex) return "";
  const hist = histFor(it.ex, sess.id), t = coachTarget(ex, hist, { sets: it.sets, flags: sess.flags, deload: sess.deload, gap: sess.gap }); WK.tg[it.ex] = t;
  const logged = sessionSets(sess.id).filter(s => s.exId === it.ex), maxIdx = logged.length ? Math.max(...logged.map(s => s.idx)) + 1 : 0;
  const n = Math.max(maxIdx, 1, t.sets + (WK.extra[it.ex] || 0)), last = hist.length ? hist[hist.length - 1] : null;
  const best = hist.length ? Math.max(...hist.flatMap(hh => hh.sets.map(s => e1rm(s.kg, s.reps)))) : null;
  const lastLogged = logged.slice().sort((a, b) => b.idx - a.idx)[0], done = logged.length >= t.sets;
  let rows = '<div class="sr h"><div>Set</div><div>Last time</div><div>' + (ex.eq === "bw" ? "+ kg" : "kg") + "</div><div>" + (ex.t ? "Sec" : "Reps") + "</div><div></div></div>";
  for (let i = 0; i < n; i++) {
    const lg = logged.find(s => s.idx === i), k = it.ex + "|" + i, dr = WK.drafts[k] || {}, pv = last && last.sets[Math.min(i, last.sets.length - 1)];
    const kgV = lg ? lg.kg : dr.kg != null ? dr.kg : lastLogged ? lastLogged.kg : t.kg != null ? t.kg : "";
    const tr = t.reps[Math.min(i, t.reps.length - 1)], rV = lg ? lg.reps : dr.reps != null ? dr.reps : tr != null ? tr : "";
    const pr = lg && best != null && e1rm(lg.kg, lg.reps) > best * 1.0001;
    rows += '<div class="sr' + (lg ? " ok" : "") + '"><div class="i">' + (i + 1) + '</div><div class="prev num">' + (pv ? (pv.kg ? kgTxt(pv.kg) + " x " : "") + pv.reps + unit(ex) : "") + "</div>" +
      '<input class="num" inputmode="decimal" data-i="kg" data-k="' + k + '" value="' + (kgV === 0 && ex.eq === "bw" ? "" : kgV === "" ? "" : kgTxt(kgV)) + '" placeholder="' + (ex.eq === "bw" ? "0" : "kg") + '"' + (lg ? " readonly" : "") + ">" +
      '<input class="num" inputmode="numeric" data-i="reps" data-k="' + k + '" value="' + rV + '" placeholder="' + (t.kg == null && !ex.t ? ex.r[0] + "-" + ex.r[1] : "") + '"' + (lg ? " readonly" : "") + ">" +
      '<button class="tick" data-a="tick" data-ex="' + it.ex + '" data-idx="' + i + '">' + ICON_TICK + "</button>" + (pr ? '<div class="pr">New record</div>' : "") + "</div>";
  }
  let h = '<div class="ex' + (done ? " done" : "") + '" id="ex-' + it.ex + '"><div class="hd"><button data-a="why" data-ex="' + it.ex + '" style="flex:1;min-width:0"><div class="nm">' + esc(ex.n) + '</div><div class="tg num">' + esc(tgtTxt(t, ex)) + '</div></button><button class="more" data-a="exMenu" data-ex="' + it.ex + '">···</button></div>';
  if (WK.why === it.ex) h += '<div class="why">' + esc(t.reason) + (ex.cue ? "<br><br>" + esc(ex.cue) : "") + "</div>";
  if (ex.note) h += '<div class="note">' + esc(ex.note) + "</div>";
  if (first && !logged.length) { const wu = warmupSets(ex, t.kg); if (wu.length) h += '<div class="wu">Warm-up sets first: ' + wu.map(w => "<b>" + kgTxt(w[0]) + " x " + w[1] + "</b>").join(", ") + "</div>"; }
  h += '<div class="sets">' + rows + "</div>";
  if (done && lastLogged && lastLogged.rir == null && ex.kind !== "core") h += '<div class="rir"><div class="q">Last set: how many more could you have done?</div><div class="chips">' + [0, 1, 2, 3].map(v => '<button class="chip" data-a="rir" data-id="' + lastLogged.id + '" data-v="' + v + '">' + (v === 3 ? "3+" : v) + "</button>").join("") + "</div></div>";
  else h += '<div class="exf"><button data-a="addSet" data-ex="' + it.ex + '">+ Set</button>' + (n > Math.max(1, maxIdx) ? '<button data-a="delSet" data-ex="' + it.ex + '">- Set</button>' : "") + "</div>";
  return h + "</div>";
}
function renderWk() {
  const sess = activeSession(); if (!sess) return closeWk();
  const body = $("#wk .body"), sc = body.scrollTop;
  const head = '<button class="btn small ghost" data-a="minWk">‹ Back</button><div style="text-align:center"><div class="ttl">' + esc(DAY_NAMES[sess.dayKey] || "Workout") + '</div><div class="clock num" id="wkClock"></div></div><button class="btn small" data-a="finish">Finish</button>';
  $("#wk .head").innerHTML = head;
  let h = "";
  if (sess.deload) h += '<div class="coach"><p>Easy week. Half the sets, same weights, stop 3 reps early.</p></div>';
  else if (sess.flags >= 2) h += '<div class="coach"><p>Bad sleep and low energy. One set less today. No records.</p></div>';
  else if (sess.flags === 1) h += '<div class="coach"><p>Not your best day. Hold your weights. Match last time.</p></div>';
  if (!sessionSets(sess.id).length && sess.dayKey !== "core") h += '<div class="card"><div style="font-weight:800;margin-bottom:6px">Warm up first, 5 minutes</div><div class="sub">' + WARMUP.map(esc).join("<br>") + "</div></div>";
  let first = true;
  sess.items.forEach(it => { h += exBlock(sess, it, first); first = false; });
  h += '<button class="btn ghost" data-a="addEx">Add an exercise</button>';
  body.innerHTML = h; body.scrollTop = sc; paintClock();
}
document.addEventListener("input", e => { const el = e.target; if (el.dataset && el.dataset.i && el.dataset.k) { const dr = WK.drafts[el.dataset.k] = WK.drafts[el.dataset.k] || {}; dr[el.dataset.i] = el.value === "" ? null : numIn(el.value); } });
document.addEventListener("focusin", e => { if (e.target.matches && e.target.matches(".sr input:not([readonly])")) setTimeout(() => { try { e.target.select(); } catch (_) {} }, 0); });
ACT.why = el => { WK.why = WK.why === el.dataset.ex ? null : el.dataset.ex; renderWk(); };
ACT.addSet = el => { WK.extra[el.dataset.ex] = (WK.extra[el.dataset.ex] || 0) + 1; renderWk(); };
ACT.delSet = el => { WK.extra[el.dataset.ex] = (WK.extra[el.dataset.ex] || 0) - 1; renderWk(); };
ACT.tick = el => {
  ensureAudio();
  const sess = activeSession(); if (!sess) return; const exId = el.dataset.ex, i = +el.dataset.idx, ex = getEx(exId), k = exId + "|" + i;
  const lg = sessionSets(sess.id).find(s => s.exId === exId && s.idx === i);
  if (lg) { addEvent("entity.deleted", { ref: lg.id }); WK.drafts[k] = { kg: lg.kg, reps: lg.reps }; return renderWk(); }
  const row = el.closest(".sr"), kg = numIn($('[data-i="kg"]', row).value) || 0, reps = Math.round(numIn($('[data-i="reps"]', row).value) || 0);
  if (!(reps > 0)) return toast(ex.t ? "Type the seconds first." : "Type your reps first.");
  if (ex.eq !== "bw" && !(kg > 0)) return toast("Type the weight first.");
  const t = WK.tg[exId] || { reps: [] };
  addEvent("set.logged", { sessionId: sess.id, exId, idx: i, kg, reps, tKg: t.kg, tReps: t.reps[Math.min(i, t.reps.length - 1)] });
  delete WK.drafts[k];
  const items = sess.items, lastEx = items[items.length - 1].ex === exId, cnt = sessionSets(sess.id).filter(s => s.exId === exId).length;
  if (!(lastEx && cnt >= (t.sets || 1))) startRest(ex.rest, ex.n);
  renderWk();
};
ACT.rir = el => { addEvent("set.rir", { ref: el.dataset.id, rir: +el.dataset.v }); renderWk(); };
ACT.exMenu = el => {
  const ex = getEx(el.dataset.ex);
  openSheet("<h3>" + esc(ex.n) + "</h3><p>" + esc(ex.cue) + '</p><div class="btns" style="margin-bottom:10px"><button class="btn ghost" data-a="swap" data-ex="' + ex.id + '">Swap</button><button class="btn ghost" data-a="exGraph" data-ex="' + ex.id + '">Graph</button></div>' +
    '<h2>Your note (seat height, grip)</h2><textarea class="inp" id="exNote" placeholder="Shows every time">' + esc(ex.note || "") + "</textarea>" +
    '<h2>Weight step and rest</h2><div class="field"><input class="inp num" id="exStep" inputmode="decimal" value="' + (ex.step || 0) + '"><span class="mut" style="flex:none">kg step</span><input class="inp num" id="exRest" inputmode="numeric" value="' + ex.rest + '"><span class="mut" style="flex:none">s rest</span></div>' +
    '<p style="margin-top:8px">The step is the smallest jump this machine or weight allows. Check the stack and fix it once.</p>' +
    '<button class="btn" data-a="exSave" data-ex="' + ex.id + '">Save</button><div style="height:10px"></div><button class="btn red" data-a="exDrop" data-ex="' + ex.id + '">Skip this one today</button>');
};
ACT.exSave = el => { const step = numIn($("#exStep").value), rest = numIn($("#exRest").value); addEvent("exercise.upserted", { exId: el.dataset.ex, note: $("#exNote").value.trim(), step: step >= 0 ? step : 0, rest: rest > 0 ? Math.round(rest) : 90 }); closeSheet(); if (activeSession() && $("#wk").classList.contains("on")) renderWk(); else render(); };
function editSession(fn) { const s = activeSession(); if (!s) return; const items = clone(s.items); fn(items); addEvent("session.edited", { sessionId: s.id, items }); }
ACT.exDrop = el => { editSession(items => { const i = items.findIndex(x => x.ex === el.dataset.ex); if (i >= 0 && items.length > 1) items.splice(i, 1); }); closeSheet(); renderWk(); };
ACT.swap = el => {
  const ex = getEx(el.dataset.ex), s = activeSession(), inS = new Set((s ? s.items : []).map(x => x.ex));
  const alts = allExercises().filter(a => a.m === ex.m && a.id !== ex.id && !inS.has(a.id) && a.kind === ex.kind).concat(allExercises().filter(a => a.m === ex.m && a.id !== ex.id && !inS.has(a.id) && a.kind !== ex.kind));
  openSheet("<h3>Swap " + esc(ex.n) + "</h3><p>Machine busy or it hurts? Pick another one for the same muscle. Each exercise keeps its own history.</p>" +
    '<button class="chip' + (UI.swapPlan ? " on" : "") + '" data-a="swapPlan" data-ex="' + ex.id + '" style="margin-bottom:10px">' + (UI.swapPlan ? "Also changing my plan" : "Just today (tap to also change my plan)") + "</button>" +
    (alts.length ? alts.map(a => '<button class="row" style="width:100%" data-a="swapTo" data-from="' + ex.id + '" data-to="' + a.id + '"><div class="grow"><div class="t">' + esc(a.n) + '</div><div class="s">' + (histFor(a.id).length ? "Last: " + esc(setsTxt(histFor(a.id).slice(-1)[0].sets, a)) : "New for you") + '</div></div><span class="chev">›</span></button>').join("") : '<p>No other exercise for this muscle. Add your own in Settings.</p>'));
};
ACT.swapPlan = el => { UI.swapPlan = !UI.swapPlan; ACT.swap(el); };
ACT.swapTo = el => {
  const from = el.dataset.from, to = el.dataset.to, s = activeSession();
  editSession(items => { const it = items.find(x => x.ex === from); if (it) it.ex = to; });
  if (UI.swapPlan && s && S.plan[s.dayKey]) { const plan = clone(S.plan), it = plan[s.dayKey].find(x => x.ex === from); if (it) { it.ex = to; addEvent("plan.upserted", { plan }); } }
  UI.swapPlan = false; closeSheet(); renderWk();
};
ACT.addEx = () => exPicker("addExTo", "Add an exercise");
function exPicker(action, title, extra) {
  const by = {}; allExercises().forEach(e => (by[e.m] = by[e.m] || []).push(e));
  openSheet("<h3>" + esc(title) + "</h3>" + Object.keys(by).map(m => "<h2>" + esc(m) + "</h2>" + by[m].map(e => '<button class="row" style="width:100%" data-a="' + action + '" data-ex="' + e.id + '"' + (extra || "") + '><div class="grow"><div class="t">' + esc(e.n) + "</div></div></button>").join("")).join(""));
}
ACT.addExTo = el => { editSession(items => { if (!items.some(x => x.ex === el.dataset.ex)) items.push({ ex: el.dataset.ex, sets: 3 }); }); closeSheet(); renderWk(); };
ACT.finish = () => {
  const s = activeSession(); if (!s) return closeWk();
  const n = sessionSets(s.id).length;
  if (!n) return openSheet('<h3>Nothing logged</h3><p>You have not ticked any set.</p><button class="btn red" data-a="discardWk">Cancel this workout</button><div style="height:10px"></div><button class="btn ghost" data-a="closeSheet">Keep going</button>');
  const planned = s.items.reduce((a, it) => a + ((WK.tg[it.ex] || {}).sets || it.sets), 0);
  if (n < planned) return openSheet("<h3>Finish early?</h3><p>" + n + " of " + planned + ' sets done. Unfinished sets do not count.</p><button class="btn" data-a="finish2">Finish now</button><div style="height:10px"></div><button class="btn ghost" data-a="closeSheet">Keep going</button>');
  ACT.finish2();
};
ACT.discardWk = () => { const s = activeSession(); if (s) addEvent("entity.deleted", { ref: s.id }); closeSheet(); stopRest(); closeWk(); };
ACT.finish2 = () => { const s = activeSession(); if (!s) return; addEvent("session.finished", { sessionId: s.id }); stopRest(); closeWk(); showSummary(s.id); syncNow(); };
const volOf = sets => sets.reduce((a, s) => a + (s.kg ? s.kg * s.reps : s.reps), 0);
function showSummary(sid) {
  const s = S.sessions[sid]; if (!s) return; const sets = sessionSets(sid), min = Math.round((Date.parse(s.endTs || new Date().toISOString()) - Date.parse(s.startTs)) / 60000);
  const prs = []; new Set(sets.map(x => x.exId)).forEach(exId => { const hist = histFor(exId).filter(h => h.d < s.d || (h.d === s.d && h.sid < sid)); if (!hist.length) return; const best = Math.max(...hist.flatMap(h => h.sets.map(x => e1rm(x.kg, x.reps)))), mine = sets.filter(x => x.exId === exId), top = mine.reduce((a, x) => e1rm(x.kg, x.reps) > e1rm(a.kg, a.reps) ? x : a, mine[0]); if (e1rm(top.kg, top.reps) > best * 1.0001) prs.push(getEx(exId).n + ": " + (top.kg ? kgTxt(top.kg) + " kg x " : "") + top.reps); });
  const prev = sessionsSorted().filter(x => x.dayKey === s.dayKey && x.endTs && x.id !== s.id && (x.d < s.d || (x.d === s.d && x.startTs < s.startTs))).pop();
  let cmp = ""; if (prev) { const a = volOf(sessionSets(prev.id)), b = volOf(sets), pc = a ? Math.round((b - a) / a * 100) : 0; cmp = '<div class="row"><div class="grow"><div class="t">Against last ' + esc(DAY_NAMES[s.dayKey]) + '</div><div class="s">Total work lifted</div></div><div class="r ' + (pc >= 0 ? "acc" : "red") + '" style="font-weight:800">' + (pc >= 0 ? "+" : "") + pc + "%</div></div>"; }
  const byM = {}; sets.forEach(x => { const ex = getEx(x.exId); if (ex) byM[ex.m] = (byM[ex.m] || 0) + 1; });
  const line = prs.length ? prs.length + (prs.length === 1 ? " record." : " records.") + " Now eat your protein and sleep." : prev ? "No records today. Same day next week: beat these numbers." : "First one logged. Next week you beat it.";
  openSheet("<h3>" + esc(DAY_NAMES[s.dayKey] || "Workout") + ' done</h3><div class="coach"><p>' + esc(line) + '</p></div><div class="card tight"><div class="row"><div class="grow"><div class="t">Time</div></div><div class="r num">' + min + ' min</div></div><div class="row"><div class="grow"><div class="t">Sets</div><div class="s">' + esc(Object.keys(byM).map(m => m + " " + byM[m]).join(", ")) + '</div></div><div class="r num">' + sets.length + "</div></div>" + cmp + "</div>" +
    (prs.length ? "<h2>New records</h2><div class=\"card tight\">" + prs.map(p => '<div class="row"><div class="grow"><div class="t">' + esc(p) + "</div></div></div>").join("") + "</div>" : "") + '<button class="btn" data-a="closeSheet">Done</button>');
}
ACT.summary = el => showSummary(el.dataset.id);

// ----- rest timer -----
let REST = null, restIv = null, AC = null, wake = null;
function ensureAudio() {
  try {
    if ("audioSession" in navigator) navigator.audioSession.type = S.settings.mix ? "ambient" : "playback";
    AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state !== "running") AC.resume();
  } catch (_) {}
}
function beep() {
  if (!AC) return;
  try {
    const t = AC.currentTime + 0.02, v = Math.max(0.02, S.settings.vol);
    [[659.25, 0], [880, 0.2], [1318.5, 0.4]].forEach(([f, o]) => { const osc = AC.createOscillator(), g = AC.createGain(); osc.type = "sine"; osc.frequency.value = f; g.gain.setValueAtTime(0.0001, t + o); g.gain.linearRampToValueAtTime(v * 0.6, t + o + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + o + 0.5); osc.connect(g); g.connect(AC.destination); osc.start(t + o); osc.stop(t + o + 0.55); });
  } catch (_) {}
}
function startRest(sec, label) {
  if (!S.settings.restOn || !(sec > 0)) return;
  REST = { end: Date.now() + sec * 1000, total: sec, label: label || "", fired: false };
  try { localStorage.setItem("nitfit:rest", JSON.stringify(REST)); } catch (_) {}
  if (!restIv) restIv = setInterval(paintRest, 250); paintRest();
}
function stopRest() { REST = null; try { localStorage.removeItem("nitfit:rest"); } catch (_) {} paintRest(); }
function paintRest() {
  const el = $("#rest");
  if (!REST) { el.classList.remove("on", "go"); clearInterval(restIv); restIv = null; return; }
  const left = (REST.end - Date.now()) / 1000; el.classList.add("on");
  if (left <= 0) {
    if (!REST.fired) { REST.fired = true; if (left > -3) beep(); }
    el.classList.add("go"); $("#rest .time").textContent = "GO"; $("#rest .lbl").textContent = "Rest is over";
    if (left < -15) stopRest(); return;
  }
  el.classList.remove("go"); const s = Math.ceil(left);
  $("#rest .time").textContent = Math.floor(s / 60) + ":" + pad2(s % 60); $("#rest .lbl").textContent = "Rest";
  $("#rest .bar i").style.width = Math.max(0, Math.min(100, (1 - left / REST.total) * 100)) + "%";
}
ACT.restAdd = el => { if (!REST) return; const dlt = +el.dataset.v * 1000; REST.end = Math.max(Date.now() + 1000, REST.end + dlt); REST.total = Math.max(5, REST.total + dlt / 1000); REST.fired = false; try { localStorage.setItem("nitfit:rest", JSON.stringify(REST)); } catch (_) {} paintRest(); };
ACT.restSkip = stopRest;
async function wakeOn() { try { if ("wakeLock" in navigator) wake = await navigator.wakeLock.request("screen"); } catch (_) {} }
function wakeOff() { try { if (wake) wake.release(); } catch (_) {} wake = null; }
document.addEventListener("visibilitychange", () => { if (!document.hidden) { if ($("#wk").classList.contains("on")) wakeOn(); paintRest(); if (KV.token) syncNow(); } });
