// ---------------------------------------------------------------------------
// Screens, part 2: Progress. Lifts, weight, and where the week's work went.
// ---------------------------------------------------------------------------

const scoreOf = h => Math.max(...h.sets.map(s => e1rm(s.kg, s.reps)));
const bestSet = h => h.sets.reduce((a, s) => e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a, h.sets[0]);

// Hard sets done per muscle this week. A helper muscle counts as half a set.
function weekVolume(d) {
  const ws = addDays(d, -dow(d)), we = addDays(ws, 6), cnt = {};
  Object.values(S.sets).forEach(st => {
    if (st.d < ws || st.d > we || !S.sessions[st.sessionId]) return;
    const ex = getEx(st.exId); if (!ex) return;
    cnt[ex.m] = (cnt[ex.m] || 0) + 1;
    (ex.s || []).forEach(m => (cnt[m] = (cnt[m] || 0) + 0.5));
  });
  return cnt;
}

function vProgress() {
  let h = '<div class="top"><div><div class="eyebrow">Everything you have logged</div><h1>Progress</h1></div>' + syncChip() + "</div>";
  h += '<div class="seg">' + [["lifts", "Lifts"], ["weight", "Weight"], ["muscles", "Muscles"]]
    .map(x => '<button class="' + (UI.prog === x[0] ? "on" : "") + '" data-a="prog" data-v="' + x[0] + '">' + x[1] + "</button>").join("") + "</div>";

  if (UI.prog === "lifts") h += progLifts();
  else if (UI.prog === "weight") h += progWeight();
  else h += progMuscles();
  return h;
}
ACT.prog = el => { UI.prog = el.dataset.v; render(); };

function progLifts() {
  const list = Object.keys(S.byEx).map(id => ({ ex: getEx(id), hist: histFor(id) }))
    .filter(x => x.ex && x.hist.length)
    .sort((a, b) => a.hist[a.hist.length - 1].d < b.hist[b.hist.length - 1].d ? 1 : -1);
  if (!list.length) return '<div class="card empty"><h3>No lifts yet</h3><p>Every exercise you log gets its own graph here. Go and train.</p></div>';
  return '<div class="card flush">' + list.map(x => {
    const last = x.hist[x.hist.length - 1], b = bestSet(last), st = stalled(x.hist);
    return '<button class="row" data-a="exGraph" data-ex="' + x.ex.id + '"><div class="grow"><div class="t">' + esc(x.ex.n) + '</div>'
      + '<div class="s num">' + (b.kg ? kgTxt(b.kg) + " kg x " : "") + b.reps + unit(x.ex) + ", " + niceDate(last.d)
      + (st ? ' <span class="tag hot">Stuck</span>' : "") + "</div></div>"
      + spark(x.hist.slice(-12).map(hh => scoreOf(hh))) + "</button>";
  }).join("") + "</div>";
}

ACT.exGraph = el => {
  const ex = getEx(el.dataset.ex), hist = histFor(ex.id);
  if (!hist.length) return openSheet("<h3>" + esc(ex.n) + "</h3><p>No history yet. Log it once and the graph starts.</p>");
  const bw = hist.every(h => h.sets.every(s => !s.kg));
  const pts = hist.map(h => [dayNum(h.d), scoreOf(h)]);
  const best = hist.reduce((a, h) => scoreOf(h) > scoreOf(a) ? h : a, hist[0]);
  const b = bestSet(best), st = stalled(hist);
  openSheet("<h3>" + esc(ex.n) + "</h3><p>"
    + (bw ? "Your best set each workout." : "Strength score. A fair estimate of the most you could lift once. Up means stronger, nothing else matters.")
    + (st ? ' <span class="tag hot">Stuck</span>' : "") + "</p>"
    + '<div class="card">' + lineChart([{ pts, color: "var(--t0)", dots: true, w: 2.4 }], { xf: dayLabel, h: 180, yf: v => Math.round(v) })
    + '<div class="row" style="padding:14px 0 0;border-top:.5px solid var(--line);margin-top:10px"><div class="grow"><div class="s">Best ever</div></div>'
    + '<div class="r num" style="color:var(--t0);font-weight:800">' + (b.kg ? kgTxt(b.kg) + " kg x " : "") + b.reps + unit(ex) + "</div></div></div>"
    + '<h2>Every session</h2><div class="card flush">' + hist.slice(-30).reverse().map(h =>
        '<div class="row"><div class="grow"><div class="t num" style="font-size:15px">' + esc(setsTxt(h.sets, ex)) + '</div></div>'
        + '<div class="r" style="font-size:14px">' + niceDate(h.d) + "</div></div>").join("") + "</div>");
};

function progWeight() {
  const tr = trendSeries(weightList());
  if (!tr.length) return '<div class="card empty"><h3>No weigh-ins yet</h3><p>Weigh in every morning on the Today screen. The line here shows your real direction, not the daily noise.</p></div>';
  const now = tr[tr.length - 1];
  const t7 = tr.filter(x => dayNum(x.d) <= dayNum(now.d) - 7).pop();
  const wk = t7 ? (now.trend - t7.trend) / ((dayNum(now.d) - dayNum(t7.d)) / 7) : null;
  let h = '<div class="card"><div class="top" style="margin-bottom:6px">'
    + '<div><div class="eyebrow">Trend</div><div class="display num">' + now.trend.toFixed(1) + '<span class="u"> kg</span></div></div>'
    + '<div style="text-align:right"><div class="eyebrow">Per week</div><div class="num" style="font-size:26px;font-weight:800;letter-spacing:-.03em">'
    + (wk == null ? "..." : (wk >= 0 ? "+" : "") + wk.toFixed(2)) + "</div></div></div>"
    + '<p class="tiny" style="margin:8px 0 14px">' + esc(wk == null ? "One more week of weigh-ins and this shows your real pace." : paceLine(wk)) + "</p>"
    + lineChart([
        { pts: tr.map(x => [dayNum(x.d), x.kg]), color: "var(--t3)", dotsOnly: true, r: 2 },
        { pts: tr.map(x => [dayNum(x.d), x.trend]), color: "var(--t0)", w: 2.6 },
      ], { xf: dayLabel, h: 190 }) + "</div>";
  h += '<button class="btn ghost" data-a="addPastWeight" style="margin-top:12px">Add or fix a weigh-in</button>';
  return h;
}

function paceLine(wk) {
  if (wk < -0.05) return "You are losing weight. You cannot build muscle like this. Eat more, starting today.";
  if (wk < 0.05) return "Flat. Nothing is being built at this rate. Eat more.";
  if (wk > 0.35) return "Too fast. Past 0.35 kg a week most of it is fat. Pull the food back a little.";
  return "Good pace. Slow gain is mostly muscle. Hold it here.";
}

ACT.addPastWeight = () => openSheet('<h3>Add or fix a weigh-in</h3><div class="field" style="margin-bottom:12px">'
  + '<input class="inp" type="date" id="pwD" value="' + today() + '" max="' + today() + '"></div>'
  + '<div class="field"><input class="inp num" id="pwK" inputmode="decimal" placeholder="kg">'
  + '<button class="btn" style="width:auto;padding:0 20px" data-a="savePastWeight">Save</button></div>');
ACT.savePastWeight = () => {
  const d = $("#pwD").value, v = numIn($("#pwK").value);
  if (!d || !(v > 25 && v < 250)) return toast("Pick a day and type the weight.");
  addEvent("weight.logged", { kg: v }, d); closeSheet(); render();
};

// Where the week's work actually went, shown on the body and in numbers.
function progMuscles() {
  const d = today(), cnt = weekVolume(d);
  const heat = {};
  MUSCLES.forEach(m => {
    const band = SET_BAND[m] || [8, 16], v = cnt[m] || 0;
    const lvl = v >= band[0] ? 2 : v > 0 ? 1 : 0;
    if (lvl) (MUSCLE_TO_FIG[m] || []).forEach(k => { if ((heat[k] || 0) < lvl) heat[k] = lvl; });
  });
  const side = UI.side || "front";
  let h = '<div class="card" style="padding:10px 16px 20px"><div class="figwrap" id="figwrap">'
    + '<button class="figside l" data-a="figFlip">' + ICON.left + "</button>"
    + '<div class="flipper">' + figSvg(side, heat, { flat: true }) + "</div>"
    + '<button class="figside r" data-a="figFlip">' + ICON.right + "</button>"
    + '<div class="figlabel">' + (side === "front" ? "Front" : "Back") + "</div></div>"
    + '<p class="tiny" style="text-align:center;margin-top:16px">Red means that muscle got enough work this week. Dark red means some, but not enough. Grey means you ignored it.</p></div>';

  const under = MUSCLES.filter(m => (cnt[m] || 0) < (SET_BAND[m] || [8])[0]);
  if (Object.keys(cnt).length && under.length) {
    h += '<div class="coach"><p>Short this week on ' + esc(under.slice(0, 3).join(", ")) + ".</p>"
      + "<p>Weeks like this are why people train for years and look the same.</p></div>";
  }

  h += '<h2>Hard sets this week</h2><div class="card">'
    + MUSCLES.map(m => {
      const band = SET_BAND[m], v = cnt[m] || 0, sc = 24;
      return '<div class="mrow"><div class="nm">' + m + '</div><div class="mbar">'
        + '<b style="left:' + (band[0] / sc * 100) + "%;width:" + ((band[1] - band[0]) / sc * 100) + '%"></b>'
        + '<i style="width:' + Math.min(100, v / sc * 100) + '%"></i></div>'
        + '<div class="v num">' + (Math.round(v * 2) / 2) + "</div></div>";
    }).join("")
    + '<p class="tiny" style="margin-top:14px">The lighter block on each bar is the zone that actually grows the muscle. Helping out counts as half a set.</p></div>';
  return h;
}
