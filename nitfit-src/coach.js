// ---------- NitFit coach: pure rules, no screen code ----------
const kgTxt = k => (Math.round(k * 100) / 100).toString();
function snap(kg, step, dir) {
  if (!step) return Math.max(0, Math.round(kg * 2) / 2);
  const f = dir < 0 ? Math.floor : dir > 0 ? Math.ceil : Math.round;
  return Math.max(step, f(kg / step + (dir ? 0 : 1e-9)) * step);
}
const e1rm = (kg, reps) => kg > 0 ? kg * (1 + Math.min(reps, 30) / 30) : reps;
const fill = (n, v) => Array.from({ length: n }, () => v);
const unit = ex => ex.t ? " s" : "";

// hist: past sessions for this exercise, oldest first: [{d, sets:[{kg,reps,rir}]}], working sets only
// ctx: {sets, flags (0,1,2), deload (bool), gap (days since any last workout)}
function coachTarget(ex, hist, ctx) {
  const lo = ex.r[0], hi = ex.r[1], step = ex.step || 0, n = ctx.sets || 3, u = unit(ex);
  if (!hist.length) {
    return { kg: null, reps: fill(n, null), sets: n, tag: "new", reason: ex.eq === "bw"
      ? "First time. Do as many clean ones as you can, and stop 1 or 2 before failure."
      : "First time. Pick a weight you can lift about " + Math.round((lo + hi) / 2) + " times with 2 left in the tank. Log what you really did." };
  }
  const last = hist[hist.length - 1];
  const kg = last.sets[0].kg || 0;
  let r = last.sets.map(s => s.reps);
  while (r.length < n) r.push(r[r.length - 1]);
  r = r.slice(0, n);
  const lastTxt = "Last time " + (kg ? kgTxt(kg) + " kg x " : "") + last.sets.map(s => s.reps).join(", ") + u + ".";
  const bw = !kg;
  const down = pct => { if (bw) return kg; let nk = snap(kg * (1 - pct), step, 0); if (nk >= kg) nk = kg - step; return Math.max(step || 0, nk); };

  if (ctx.deload) {
    return { kg, reps: fill(Math.ceil(n / 2), lo), sets: Math.ceil(n / 2), tag: "easy", reason: "Easy week. Half the sets, same weight. Stop 3 reps before failure. This is how you come back stronger." };
  }
  if (ctx.gap >= 14) {
    const s = Math.max(1, Math.ceil(n * 2 / 3));
    return { kg: down(0.2), reps: fill(s, bw ? Math.max(1, Math.round(r[0] * 0.8)) : lo), sets: s, tag: "back", reason: "You were away " + ctx.gap + " days. 20% lighter and fewer sets this week. Build back." };
  }
  if (ctx.gap >= 7) {
    return { kg: down(0.1), reps: fill(n, bw ? Math.max(1, r[0] - 1) : lo), sets: n, tag: "back", reason: "You were away " + ctx.gap + " days. 10% lighter today. Back to normal next time." };
  }
  if (ctx.flags >= 2) {
    const s = Math.max(1, n - 1);
    return { kg, reps: r.slice(0, s), sets: s, tag: "hold", reason: "Bad sleep and low energy. One set less, same weight, no records today. " + lastTxt };
  }
  if (ctx.flags === 1) {
    return { kg, reps: r, sets: n, tag: "hold", reason: "Rough night or low energy. Hold the weight and match last time. " + lastTxt };
  }
  // stuck 3 sessions in a row at the same weight
  if (hist.length >= 3 && !bw) {
    const h3 = hist.slice(-3), tot = h => h.sets.reduce((a, s) => a + s.reps, 0);
    if (h3.every(h => (h.sets[0].kg || 0) === kg) && tot(h3[2]) <= tot(h3[1]) && tot(h3[1]) <= tot(h3[0]) && !r.every(x => x >= hi)) {
      return { kg: down(0.1), reps: fill(n, Math.min(hi, lo + 2)), sets: n, tag: "reset", reason: "Stuck for 3 sessions at " + kgTxt(kg) + " kg. Drop 10% and build back up. Check your sleep and food." };
    }
  }
  if (!bw && r[0] <= lo - 3) {
    const nk = down(0.04 * (lo - r[0]));
    return { kg: nk, reps: fill(n, lo), sets: n, tag: "down", reason: "Too heavy. " + lastTxt + " That is " + (lo - r[0]) + " under the range. Go to " + kgTxt(nk) + " kg." };
  }
  if (!bw && last.sets[0].rir === 0 && r[0] < lo) {
    const nk = down(0);
    return { kg: nk, reps: fill(n, lo), sets: n, tag: "down", reason: "You hit failure early. " + lastTxt + " One step lighter." };
  }
  if (!bw && r[0] >= hi + 3 && !ex.t) {
    const nk = snap(Math.max(kg * (1 + 0.04 * (r[0] - hi)), kg + step), step, 0);
    return { kg: nk, reps: fill(n, lo), sets: n, tag: "up", reason: "Too light. " + lastTxt + " Go up to " + kgTxt(nk) + " kg." };
  }
  if (r.every(x => x >= hi)) {
    if (bw) {
      const add = ex.t ? 5 : 1;
      return { kg, reps: r.map(x => x + add), sets: n, tag: "up", reason: lastTxt + " Top of the range. Add " + add + (ex.t ? " seconds" : " rep") + " to every set." };
    }
    const jump = step / kg;
    const cap = ex.kind === "c" ? hi + 3 : Math.min(25, Math.max(hi + 5, 20));
    if (jump > 0.10 && !r.every(x => x >= cap)) {
      return { kg, reps: r.map(x => Math.min(cap, x + 1)), sets: n, tag: "reps", reason: lastTxt + " The next weight is a " + Math.round(jump * 100) + "% jump, too big. Add reps first, up to " + cap + ", then go up." };
    }
    return { kg: kg + step, reps: fill(n, lo), sets: n, tag: "up", reason: lastTxt + " Every set hit the top. Add " + kgTxt(step) + " kg." };
  }
  if (r[0] >= hi) {
    return { kg, reps: r.map(x => x >= hi ? hi : x + 1), sets: n, tag: "reps", reason: lastTxt + " First set hit the top. Same weight. Bring the other sets up." };
  }
  return { kg, reps: r.map(x => Math.min(hi, Math.max(lo, x + 1))), sets: n, tag: "reps", reason: lastTxt + " Same weight. Beat it by 1 rep per set." };
}

function warmupSets(ex, kg) {
  if (!kg || ex.kind !== "c" || ex.eq === "bw") return [];
  const s = ex.step || 2.5;
  const out = [[0.5, 8], [0.7, 4], [0.85, 2]].map(([p, reps]) => [snap(kg * p, s, 0), reps]).filter(w => w[0] < kg);
  return out.filter((w, i) => i === 0 || w[0] !== out[i - 1][0]);
}

// best strength score per session for an exercise, and whether it has stalled
function stalled(hist) {
  // Small lifts sit still for a session or two between weight jumps. That is
  // normal. Stuck means four sessions with nothing better than before them.
  if (hist.length < 6) return false;
  const best = h => Math.max(...h.sets.map(s => e1rm(s.kg || 0, s.reps)));
  const b = hist.map(best), before = Math.max(...b.slice(0, -4)), recent = Math.max(...b.slice(-4));
  return recent <= before * 1.002;
}

// smooth weight trend: each day moves 10% toward the new weight. Missing days are filled in a straight line.
function trendSeries(weights) {            // weights: [{d, kg}] sorted by day
  const out = []; let t = null, prev = null;
  const dayNum = d => Math.round(Date.parse(d + "T00:00:00Z") / 864e5);
  for (const w of weights) {
    if (t === null) { t = w.kg; }
    else {
      const gap = dayNum(w.d) - dayNum(prev.d);
      for (let i = 1; i <= gap; i++) { const v = prev.kg + (w.kg - prev.kg) * i / gap; t = t + 0.1 * (v - t); }
    }
    out.push({ d: w.d, kg: w.kg, trend: t }); prev = w;
  }
  return out;
}

// weekly food check-in. days: last 14 days oldest first [{d, kcal, meals, weighed, trend}]
function foodCheckin(days, s) {              // s: {tdee, kcalTarget, goalRate, exclude}
  const last7 = days.slice(-7);
  const isLogged = x => x.meals >= 2 && x.kcal >= 0.6 * s.kcalTarget;
  const logged7 = last7.filter(isLogged).length, weigh7 = last7.filter(x => x.weighed).length;
  const hold = why => ({ status: "hold", tdee: s.tdee, kcalTarget: s.kcalTarget, reason: why });
  if (s.exclude) return hold("This week is not counted (" + s.exclude + "). Target stays at " + s.kcalTarget + ".");
  if (logged7 < 4) return hold("Only " + logged7 + " of 7 days logged. Target stays at " + s.kcalTarget + ". Log at least 4 days.");
  if (weigh7 < 3) return hold("Only " + weigh7 + " weigh-ins this week. Target stays at " + s.kcalTarget + ". Weigh in every morning.");
  const lg = days.filter(isLogged), tr = days.filter(x => x.trend != null);
  if (tr.length < 2) return hold("Not enough weight data yet. Target stays at " + s.kcalTarget + ".");
  const meanKcal = lg.reduce((a, x) => a + x.kcal, 0) / lg.length;
  const span = Math.max(1, (Date.parse(tr[tr.length - 1].d) - Date.parse(tr[0].d)) / 864e5);
  const perDay = (tr[tr.length - 1].trend - tr[0].trend) / span;
  const raw = meanKcal - perDay * 5800;
  const tdee = Math.round(s.tdee + 0.5 * (raw - s.tdee));
  const surplus = Math.min(400, Math.max(150, s.goalRate * 5800 / 7));
  let target = tdee + surplus;
  target = Math.max(s.kcalTarget - 150, Math.min(s.kcalTarget + 150, target));
  target = Math.round(target / 25) * 25;
  const wk = perDay * 7, dir = target > s.kcalTarget ? "up" : target < s.kcalTarget ? "down" : "same";
  const reason = "Weight trend " + (wk >= 0 ? "+" : "") + wk.toFixed(2) + " kg a week, eating about " + Math.round(meanKcal / 10) * 10 + ". " +
    (dir === "same" ? "Target stays at " + target + "." : "Target goes " + dir + " to " + target + ".");
  return { status: "updated", tdee, raw: Math.round(raw), kcalTarget: target, weekly: wk, reason };
}

// future you
const FUTURE_KNOTS = [[0, 0, 0, 0], [3, 1, 1.6, 2.3], [6, 2, 3.3, 4.5], [9, 3, 4.9, 6.8], [12, 4, 6.5, 9], [18, 5, 8.3, 11.5], [24, 6, 10, 14], [60, 8, 14, 20]];
function leanGain(months, which) {           // which: 1 low, 2 mid, 3 high
  const k = FUTURE_KNOTS; if (months >= 60) return k[k.length - 1][which];
  for (let i = 1; i < k.length; i++) if (months <= k[i][0]) { const a = k[i - 1], b = k[i]; return a[which] + (b[which] - a[which]) * (months - a[0]) / (b[0] - a[0]); }
  return 0;
}
const ffmi = (leanKg, hM) => leanKg / (hM * hM) + 6.1 * (1.8 - hM);
const leanCap = hM => (25 - 6.1 * (1.8 - hM)) * hM * hM;
function navyBf(waistCm, neckCm, heightCm) { // men, returns %
  const inch = c => c / 2.54; if (!(waistCm > neckCm)) return null;
  return 86.010 * Math.log10(inch(waistCm) - inch(neckCm)) - 70.041 * Math.log10(inch(heightCm)) + 36.76;
}
if (typeof module !== "undefined") module.exports = { coachTarget, warmupSets, stalled, trendSeries, foodCheckin, leanGain, ffmi, leanCap, navyBf, e1rm, snap };
