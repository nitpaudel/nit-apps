// ---------- NitFit screens, part 2: Progress and Food ----------
function scoreOf(h, ex) { return Math.max(...h.sets.map(s => e1rm(s.kg, s.reps))); }
function bestSet(h) { return h.sets.reduce((a, s) => e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a, h.sets[0]); }
function vProgress() {
  let h = '<div class="top"><div><h1>Progress</h1></div>' + syncChip() + '</div><div class="seg">' + [["lifts", "Lifts"], ["weight", "Weight"], ["muscles", "Muscles"]].map(x => '<button class="' + (UI.prog === x[0] ? "on" : "") + '" data-a="prog" data-v="' + x[0] + '">' + x[1] + "</button>").join("") + "</div>";
  if (UI.prog === "lifts") {
    const list = Object.keys(S.byEx).map(id => ({ ex: getEx(id), hist: histFor(id) })).filter(x => x.ex && x.hist.length).sort((a, b) => a.hist[a.hist.length - 1].d < b.hist[b.hist.length - 1].d ? 1 : -1);
    if (!list.length) return h + '<div class="card"><div style="font-weight:800;font-size:18px">No lifts yet</div><p class="sub" style="margin:6px 0 0">Every exercise you log gets its own graph here. Go train.</p></div>';
    h += '<div class="card tight">' + list.map(x => { const last = x.hist[x.hist.length - 1], b = bestSet(last), st = stalled(x.hist);
      return '<button class="row" style="width:100%" data-a="exGraph" data-ex="' + x.ex.id + '"><div class="grow"><div class="t">' + esc(x.ex.n) + '</div><div class="s num">' + (b.kg ? kgTxt(b.kg) + " kg x " : "") + b.reps + unit(x.ex) + ", " + niceDate(last.d) + (st ? ' <span class="tag amber">Stuck</span>' : "") + "</div></div>" + spark(x.hist.slice(-12).map(hh => scoreOf(hh, x.ex))) + "</button>"; }).join("") + "</div>";
  } else if (UI.prog === "weight") {
    const tr = trendSeries(weightList());
    if (!tr.length) return h + '<div class="card"><div style="font-weight:800;font-size:18px">No weigh-ins yet</div><p class="sub" style="margin:6px 0 0">Weigh in every morning on the Today screen. The line here shows your real direction, not daily noise.</p></div>';
    const now = tr[tr.length - 1], t7 = tr.filter(x => dayNum(x.d) <= dayNum(now.d) - 7).pop(), wk = t7 ? (now.trend - t7.trend) / ((dayNum(now.d) - dayNum(t7.d)) / 7) : null;
    h += '<div class="card"><div class="kv"><div><div class="mut" style="font-size:13px;font-weight:700">TREND</div><div class="big num">' + now.trend.toFixed(1) + '<span style="font-size:18px"> kg</span></div></div><div style="text-align:right"><div class="mut" style="font-size:13px;font-weight:700">PER WEEK</div><div class="num" style="font-size:24px;font-weight:800">' + (wk == null ? "..." : (wk >= 0 ? "+" : "") + wk.toFixed(2)) + "</div></div></div>" +
      '<p class="sub" style="margin:8px 0 10px">' + esc(wk == null ? "A week of weigh-ins and this shows your pace." : paceLine(wk, now.trend)) + "</p>" +
      lineChart([{ pts: tr.map(x => [dayNum(x.d), x.kg]), color: "#5b5b63", dotsOnly: true, r: 2.2 }, { pts: tr.map(x => [dayNum(x.d), x.trend]), color: "#d6ff3f", w: 2.8 }], { xf: dayLabel, h: 190 }) + "</div>" +
      '<button class="btn ghost" data-a="addPastWeight">Add or fix a weigh-in</button>';
  } else {
    const d = today(), ws = addDays(d, -dow(d)), cnt = {};
    Object.values(S.sets).forEach(st => { if (st.d < ws || st.d > addDays(ws, 6) || !S.sessions[st.sessionId]) return; const ex = getEx(st.exId); if (!ex) return; cnt[ex.m] = (cnt[ex.m] || 0) + 1; ex.s.forEach(m => cnt[m] = (cnt[m] || 0) + 0.5); });
    h += '<div class="card"><div style="font-weight:800;font-size:18px;margin-bottom:2px">Sets this week</div><p class="sub" style="margin:0 0 10px">The box on each bar is your target zone. Helper work counts as half a set.</p>' +
      MUSCLES.map(m => { const band = setBand(m), v = cnt[m] || 0, sc = 20; return '<div class="mrow"><div>' + m + '</div><div class="mbar"><b style="left:' + band[0] / sc * 100 + "%;width:" + (band[1] - band[0]) / sc * 100 + '%"></b><i style="width:' + Math.min(100, v / sc * 100) + "%;" + (v > band[1] + 4 ? "background:var(--amber)" : "") + '"></i></div><div class="num" style="text-align:right;font-weight:700">' + (Math.round(v * 2) / 2) + "</div></div>"; }).join("") + "</div>";
  }
  return h;
}
function paceLine(wk, kg) {
  const pm = wk * 4.345 / kg * 100;
  if (wk < 0.05) return wk < -0.05 ? "You are losing weight. You cannot build muscle like this. Eat more." : "Weight is flat. Eat more to grow.";
  if (wk > 0.3) return "Too fast. Past 0.3 kg a week it is mostly fat. Watch your waist.";
  return "Good pace. Slow gain means mostly muscle.";
}
ACT.prog = el => { UI.prog = el.dataset.v; render(); };
ACT.exGraph = el => {
  const ex = getEx(el.dataset.ex), hist = histFor(ex.id);
  if (!hist.length) return openSheet("<h3>" + esc(ex.n) + "</h3><p>No history yet. Log it once and the graph starts.</p>");
  const bw = hist.every(h => h.sets.every(s => !s.kg)), pts = hist.map(h => [dayNum(h.d), scoreOf(h, ex)]);
  const best = hist.reduce((a, h) => scoreOf(h, ex) > scoreOf(a, ex) ? h : a, hist[0]), b = bestSet(best), st = stalled(hist);
  openSheet("<h3>" + esc(ex.n) + "</h3><p>" + (bw ? "Best set each workout." : "Strength score: a fair guess of the most you could lift once. Up means stronger.") + (st ? ' <span class="tag amber">Stuck 3 sessions</span>' : "") + "</p>" +
    '<div class="card">' + lineChart([{ pts, color: "#d6ff3f", dots: true, w: 2.6 }], { xf: dayLabel, h: 180, yf: v => Math.round(v) }) + '<div class="kv" style="margin-top:8px"><span class="mut">Best ever</span><b class="num">' + (b.kg ? kgTxt(b.kg) + " kg x " : "") + b.reps + unit(ex) + ", " + niceDate(best.d) + "</b></div></div>" +
    '<h2>History</h2><div class="card tight">' + hist.slice(-30).reverse().map(h => '<div class="row"><div class="grow"><div class="t num">' + esc(setsTxt(h.sets, ex)) + '</div></div><div class="r">' + niceDate(h.d) + "</div></div>").join("") + "</div>");
};
ACT.addPastWeight = () => openSheet('<h3>Add or fix a weigh-in</h3><div class="field" style="margin-bottom:10px"><input class="inp" type="date" id="pwD" value="' + today() + '" max="' + today() + '"></div><div class="field"><input class="inp num" id="pwK" inputmode="decimal" placeholder="kg"><button class="btn small" data-a="savePastWeight">Save</button></div>');
ACT.savePastWeight = () => { const d = $("#pwD").value, v = numIn($("#pwK").value); if (!d || !(v > 25 && v < 250)) return toast("Pick a day and type the weight."); addEvent("weight.logged", { kg: v }, d); closeSheet(); render(); };

// ----- Food -----
function maybeCheckin() {
  const t = today(), ws = addDays(t, -((dow(t) + 1) % 7));      // the most recent Saturday
  if (S.checkins.some(c => c.ws === ws) || !S.food.length) return;
  const first = S.food.reduce((a, f) => f.d < a ? f.d : a, S.food[0].d); if (daysBetween(first, ws) < 6) return;
  const tr = trendSeries(weightList()), days = []; let lastT = null;
  for (let i = 14; i >= 1; i--) { const d = addDays(ws, -i), fd = foodDay(d), row = tr.filter(x => x.d <= d).pop(); days.push({ d, kcal: fd.kcal, meals: fd.meals, weighed: !!S.weights[d], trend: row ? row.trend : null }); }
  const st = S.settings, res = foodCheckin(days, { tdee: st.tdee, kcalTarget: st.kcal, goalRate: st.goalRate, exclude: st.exclude && st.exclude.ws === ws ? st.exclude.why : null });
  addEvent("checkin.done", Object.assign({ ws }, res));
  if (res.status === "updated") addEvent("settings.upserted", { kcal: res.kcalTarget, tdee: res.tdee });
}
function vFood() {
  maybeCheckin();
  const d = UI.foodD || today(), fd = foodDay(d), st = S.settings, isT = d === today();
  let h = '<div class="top"><div><div class="sub">' + (isT ? "Today" : niceDate(d)) + "</div><h1>Food</h1></div>" + syncChip() + "</div>";
  h += '<div class="btns" style="margin-bottom:12px"><button class="btn small ghost" data-a="foodDay" data-v="-1">‹ Day before</button>' + (isT ? "" : '<button class="btn small ghost" data-a="foodDay" data-v="1">Next day ›</button>') + "</div>";
  const kp = Math.min(100, fd.kcal / st.kcal * 100), pp = Math.min(100, fd.p / st.protein * 100);
  h += '<div class="card"><div class="kv"><div style="font-weight:800">Calories</div><div class="num"><b style="font-size:22px">' + fd.kcal + '</b> <span class="mut">of ' + st.kcal + '</span></div></div><div class="meter' + (fd.kcal > st.kcal * 1.1 ? " over" : "") + '"><i style="width:' + kp + '%"></i></div>' +
    '<div class="kv" style="margin-top:14px"><div style="font-weight:800">Protein</div><div class="num"><b style="font-size:22px">' + fd.p + '</b> <span class="mut">of ' + st.protein + ' g</span></div></div><div class="meter"><i style="width:' + pp + '%"></i></div></div>';
  h += '<div class="coach"><p>' + esc(foodLine(fd, st, isT)) + "</p></div>";
  h += '<button class="btn" data-a="usual">Add my usual day</button>';
  h += "<h2>Tap to add</h2><div class=\"fgrid\">" + allFoods().map(f => '<button class="fb" data-a="addFood" data-id="' + f.id + '"><div class="n">' + esc(f.n) + '</div><div class="v num">' + esc(f.unit) + " · " + Math.round(f.kcal) + " kcal · " + (Math.round(f.p * 10) / 10) + " g</div></button>").join("") + "</div>";
  h += '<div class="btns" style="margin-top:10px"><button class="btn small ghost" data-a="quickFood">Something else</button><button class="btn small ghost" data-a="newFood">Save a new food</button></div>';
  h += "<h2>Eaten " + (isT ? "today" : "that day") + '</h2><div class="card tight">' + (fd.items.length ? fd.items.map(f => '<button class="row" style="width:100%" data-a="foodItem" data-id="' + f.id + '"><div class="grow"><div class="t">' + esc(f.n) + (f.qty !== 1 ? " x " + (Math.round(f.qty * 10) / 10) : "") + '</div></div><div class="r num">' + Math.round(f.kcal) + " kcal · " + Math.round(f.p) + " g</div></button>").join("") : '<div class="row"><div class="grow mut">Nothing logged.</div></div>') + "</div>";
  const cr = S.creatine[d];
  h += '<div class="card tight"><div class="row"><div class="grow"><div class="t">Creatine</div><div class="s">3 to 5 g, every day</div></div><button class="chip' + (cr ? " on" : "") + '" data-a="creatine">' + (cr ? "Taken" : "Not yet") + "</button></div></div>";
  const ck = S.checkins[S.checkins.length - 1];
  h += '<h2>Weekly check</h2><div class="card"><div style="font-weight:700">' + esc(ck ? ck.reason : "Every Saturday NitFit looks at your weight trend and your food, then sets your calories for the week. It needs 1 week of logging first.") + "</div></div>";
  return h;
}
function foodLine(fd, st, isT) {
  const left = st.protein - fd.p;
  if (!fd.items.length) return isT ? "Nothing logged today. Log your 2 main meals. That is the minimum." : "Nothing was logged this day.";
  if (left <= 0 && fd.kcal >= st.kcal * 0.9) return "Protein and calories hit. That is how you grow.";
  if (left <= 0) return "Protein hit. Calories are " + (st.kcal - fd.kcal) + " short. Drink the shake.";
  const eggs = fd.items.filter(f => f.foodId === "egg").reduce((a, f) => a + f.qty, 0), opts = [];
  if (eggs < 4) opts.push((4 - eggs) + " eggs (" + Math.round((4 - eggs) * 6.3) + " g)"); opts.push("soya chunks 30 g (16 g)"); opts.push("a glass of milk (8 g)");
  return "Protein: " + left + " g to go. Eat " + opts.slice(0, 2).join(" or ") + ".";
}
ACT.foodDay = el => { const d = addDays(UI.foodD || today(), +el.dataset.v); UI.foodD = d >= today() ? null : d; render(); };
function logFood(f, qty, d, batch) { return addEvent("food.logged", { foodId: f.id, n: f.n, qty, kcal: Math.round(f.kcal * qty), p: Math.round(f.p * qty * 10) / 10, c: Math.round(f.c * qty * 10) / 10, f: Math.round(f.f * qty * 10) / 10, batch: batch || null }, d); }
ACT.addFood = el => {
  const f = getFood(el.dataset.id), d = UI.foodD || today();
  const prev = S.food.filter(x => x.d === d && x.foodId === f.id && !x.batch && Date.now() - Date.parse(x.ts) < 600e3).pop();
  if (prev) { addEvent("entity.deleted", { ref: prev.id }, d); logFood(f, prev.qty + 1, d); } else logFood(f, 1, d);
  toast(f.n + " added"); render();
};
ACT.foodItem = el => {
  const it = S.food.find(x => x.id === el.dataset.id); if (!it) return;
  openSheet("<h3>" + esc(it.n) + '</h3><p class="num">' + Math.round(it.kcal) + " kcal · " + Math.round(it.p) + ' g protein</p><h2>How much</h2><div class="chips" style="margin-bottom:14px">' + [[0.7, "Small"], [1, "Usual"], [1.4, "Big"], [2, "2"], [3, "3"], [4, "4"]].map(x => '<button class="chip' + (Math.abs(it.qty - x[0]) < 0.01 ? " on" : "") + '" data-a="foodQty" data-id="' + it.id + '" data-v="' + x[0] + '">' + x[1] + "</button>").join("") + '</div><button class="btn red" data-a="foodDel" data-id="' + it.id + '">Remove</button>');
};
ACT.foodQty = el => { const it = S.food.find(x => x.id === el.dataset.id); if (!it) return; const q = +el.dataset.v, base = it.qty || 1; addEvent("entity.deleted", { ref: it.id }, it.d); addEvent("food.logged", { foodId: it.foodId, n: it.n, qty: q, kcal: Math.round(it.kcal / base * q), p: Math.round(it.p / base * q * 10) / 10, c: Math.round(it.c / base * q * 10) / 10, f: Math.round(it.f / base * q * 10) / 10, batch: it.batch }, it.d); closeSheet(); render(); };
ACT.foodDel = el => { const it = S.food.find(x => x.id === el.dataset.id); if (it) addEvent("entity.deleted", { ref: it.id }, it.d); closeSheet(); render(); };
ACT.creatine = () => { const d = UI.foodD || today(); addEvent("creatine.logged", { on: !S.creatine[d] }, d); render(); };
ACT.usual = () => {
  UI.usual = {}; (S.settings.usual || []).forEach(u => UI.usual[u[0]] = u[1]); usualSheet();
};
function usualSheet() {
  let k = 0, p = 0; const rows = allFoods().map(f => { const q = UI.usual[f.id] || 0; k += f.kcal * q; p += f.p * q; return '<div class="row"><div class="grow"><div class="t">' + esc(f.n) + '</div><div class="s">' + esc(f.unit) + '</div></div><div class="stepper"><button data-a="usualQ" data-id="' + f.id + '" data-v="-1">-</button><span class="num">' + q + '</span><button data-a="usualQ" data-id="' + f.id + '" data-v="1">+</button></div></div>'; }).join("");
  const sc = $("#sheet .pn").scrollTop;
  openSheet('<h3>My usual day</h3><p>Set this once. After that it is one tap. <b class="num" style="color:var(--txt)">' + Math.round(k) + " kcal · " + Math.round(p) + ' g protein</b></p><button class="btn" data-a="usualAdd">Add all of this</button><div class="card tight" style="margin-top:12px">' + rows + "</div>");
  $("#sheet .pn").scrollTop = sc;
}
ACT.usualQ = el => { UI.usual[el.dataset.id] = Math.max(0, (UI.usual[el.dataset.id] || 0) + +el.dataset.v); usualSheet(); };
ACT.usualAdd = () => {
  const d = UI.foodD || today(), list = Object.keys(UI.usual).filter(id => UI.usual[id] > 0).map(id => [id, UI.usual[id]]); if (!list.length) return toast("Pick at least one food.");
  if (JSON.stringify(list) !== JSON.stringify(S.settings.usual)) addEvent("settings.upserted", { usual: list });
  const batch = uid(); list.forEach(u => { const f = getFood(u[0]); if (f) logFood(f, u[1], d, batch); });
  closeSheet(); toast("Usual day added"); render();
};
ACT.quickFood = () => openSheet('<h3>Something else</h3><p>Ate something that is not on the list? Type your best guess. A guess beats nothing.</p><input class="inp" id="qfN" placeholder="What was it" style="margin-bottom:10px;font-size:16px;font-weight:600"><div class="field" style="margin-bottom:12px"><input class="inp num" id="qfK" inputmode="numeric" placeholder="kcal"><input class="inp num" id="qfP" inputmode="decimal" placeholder="protein g"></div><button class="btn" data-a="quickFoodSave" data-keep="0">Add</button>');
ACT.newFood = () => openSheet('<h3>Save a new food</h3><p>It will show in your tap list from now on.</p><input class="inp" id="qfN" placeholder="Name" style="margin-bottom:10px;font-size:16px;font-weight:600"><input class="inp" id="qfU" placeholder="Portion, like 1 bowl" style="margin-bottom:10px;font-size:16px;font-weight:600"><div class="field" style="margin-bottom:12px"><input class="inp num" id="qfK" inputmode="numeric" placeholder="kcal"><input class="inp num" id="qfP" inputmode="decimal" placeholder="protein g"></div><button class="btn" data-a="quickFoodSave" data-keep="1">Save and add</button>');
ACT.quickFoodSave = el => {
  const n = $("#qfN").value.trim() || "Other food", k = numIn($("#qfK").value), p = numIn($("#qfP").value) || 0; if (!(k > 0)) return toast("Type the calories.");
  const f = { id: "c_" + uid(), n, unit: ($("#qfU") ? $("#qfU").value.trim() : "") || "1 portion", kcal: k, p, c: 0, f: 0 };
  if (el.dataset.keep === "1") addEvent("food.custom", f);
  logFood(f, 1, UI.foodD || today()); closeSheet(); render();
};
