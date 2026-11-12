const path = process.argv[2];
const D = require(path + "/data.js"), C = require(path + "/coach.js");
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } };
const H = (kg, reps, rir) => ({ d: "x", sets: reps.map(r => ({ kg, reps: r, rir })) });
const ctx = { sets: 3, flags: 0, deload: false, gap: 1 };
let ex = D.EXMAP.incline_db_press;   // 8-12, step 2.5
let t = C.coachTarget(ex, [], ctx); ok(t.kg === null && t.tag === "new", "new");
t = C.coachTarget(ex, [H(20, [12, 12, 12])], ctx); ok(t.kg === 20 && t.reps[0] === 13 && t.tag === "reps", "20kg jump 12.5% -> reps first " + JSON.stringify(t));
t = C.coachTarget(ex, [H(20, [15, 15, 15])], ctx); ok(t.kg === 22.5 && t.reps[0] === 8, "cap reached -> jump " + JSON.stringify(t));
t = C.coachTarget(ex, [H(30, [12, 12, 12])], ctx); ok(t.kg === 32.5 && t.reps[0] === 8, "30kg jump 8% -> add weight");
t = C.coachTarget(ex, [H(30, [12, 10, 9])], ctx); ok(t.kg === 30 && t.reps.join() === "12,11,10", "rule 3 " + t.reps);
t = C.coachTarget(ex, [H(30, [10, 9, 8])], ctx); ok(t.kg === 30 && t.reps.join() === "11,10,9", "beat by 1");
t = C.coachTarget(ex, [H(30, [5, 4, 4])], ctx); ok(t.kg === 27.5 && t.tag === "down", "too heavy " + t.kg);
t = C.coachTarget(ex, [H(30, [16, 15, 14])], ctx); ok(t.kg > 30 && t.tag === "up", "too light " + t.kg);
t = C.coachTarget(ex, [H(30, [9, 8, 8]), H(30, [9, 8, 7]), H(30, [9, 8, 7])], ctx); ok(t.kg === 27.5 && t.tag === "reset", "3 stuck -10% " + t.kg);
t = C.coachTarget(ex, [H(30, [10, 9, 8])], { ...ctx, flags: 1 }); ok(t.kg === 30 && t.reps.join() === "10,9,8", "one flag hold");
t = C.coachTarget(ex, [H(30, [10, 9, 8])], { ...ctx, flags: 2 }); ok(t.sets === 2, "two flags one less set");
t = C.coachTarget(ex, [H(30, [10, 9, 8])], { ...ctx, deload: true }); ok(t.sets === 2 && t.kg === 30 && t.reps[0] === 8, "deload");
t = C.coachTarget(ex, [H(30, [10, 9, 8])], { ...ctx, gap: 9 }); ok(t.kg === 27.5, "gap 9 -> -10% " + t.kg);
t = C.coachTarget(ex, [H(30, [10, 9, 8])], { ...ctx, gap: 20 }); ok(t.kg === 25 && t.sets === 2, "gap 20 -> -20% " + t.kg);
ex = D.EXMAP.smith_squat;            // step 5
t = C.coachTarget(ex, [H(60, [10, 10, 10])], ctx); ok(t.kg === 65, "smith 60 -> 65 (8%)");
t = C.coachTarget(ex, [H(40, [10, 10, 10])], ctx); ok(t.kg === 40 && t.reps[0] === 11, "smith 40 jump 12.5% reps first");
ex = D.EXMAP.pull_up;
t = C.coachTarget(ex, [H(0, [12, 12, 12])], ctx); ok(t.kg === 0 && t.reps[0] === 13, "pull up add rep");
t = C.coachTarget(ex, [H(0, [12, 9, 7])], ctx); ok(t.reps.join() === "12,10,8", "pull up bring others up " + t.reps);
ex = D.EXMAP.plank;
t = C.coachTarget(ex, [H(0, [60, 60])], { ...ctx, sets: 2 }); ok(t.reps[0] === 65, "plank +5s");
ex = D.EXMAP.db_lateral_raise;       // 12-20
t = C.coachTarget(ex, [H(7.5, [20, 20, 20, 20])], { ...ctx, sets: 4 }); ok(t.kg === 7.5 && t.reps[0] === 21, "lateral reps first to 25 " + JSON.stringify(t.reps));
t = C.coachTarget(ex, [H(7.5, [25, 25, 25, 25])], { ...ctx, sets: 4 }); ok(t.kg === 10 && t.reps[0] === 12, "lateral jump at cap");
ok(C.warmupSets(D.EXMAP.smith_squat, 60).join("|") === "30,8|40,4|50,2", "warmup " + C.warmupSets(D.EXMAP.smith_squat, 60).join("|"));
// trend
const tr = C.trendSeries([{ d: "2026-11-01", kg: 60 }, { d: "2026-11-02", kg: 61 }, { d: "2026-11-04", kg: 61 }]);
ok(Math.abs(tr[1].trend - 60.1) < 1e-9 && tr[2].trend > 60.1, "trend");
// food check-in
const mk = (n, kcal, meals, w, t0, slope) => Array.from({ length: n }, (_, i) => ({ d: "2026-11-" + String(i + 1).padStart(2, "0"), kcal, meals, weighed: w, trend: t0 + slope * i }));
let c = C.foodCheckin(mk(14, 2650, 3, true, 60, 0), { tdee: 2400, kcalTarget: 2650, goalRate: 0.22 });
ok(c.status === "updated" && c.tdee === 2525 && c.kcalTarget === 2700, "flat weight -> tdee up halfway, +cap " + JSON.stringify(c));
c = C.foodCheckin(mk(14, 2650, 1, true, 60, 0), { tdee: 2400, kcalTarget: 2650, goalRate: 0.22 }); ok(c.status === "hold", "hold on low logging");
c = C.foodCheckin(mk(14, 2650, 3, false, 60, 0), { tdee: 2400, kcalTarget: 2650, goalRate: 0.22 }); ok(c.status === "hold", "hold on no weigh-ins");
c = C.foodCheckin(mk(14, 2650, 3, true, 60, 0.1), { tdee: 2400, kcalTarget: 2650, goalRate: 0.22 }); ok(c.kcalTarget === 2500, "fast gain -> down capped 150 " + c.kcalTarget);
// future
ok(Math.abs(C.leanGain(12, 2) - 6.5) < 1e-9 && Math.abs(C.leanGain(7.5, 2) - 4.1) < 0.01, "lean gain");
ok(Math.abs(C.ffmi(51.6, 1.77) - 16.65) < 0.05, "ffmi " + C.ffmi(51.6, 1.77)); ok(Math.abs(C.leanCap(1.77) - 77.7) < 0.3, "cap " + C.leanCap(1.77));
const bf = C.navyBf(72.4, 34.3, 177); ok(bf > 7 && bf < 10, "navy " + bf);
console.log(fails ? fails + " FAILED" : "all coach tests passed");
