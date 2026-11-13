// ---------------------------------------------------------------------------
// The demo. Only ever loaded into the demo build.
//
// Fills the app with about two months of invented training so every screen,
// graph and number has something real-looking in it. It writes to its own
// storage box and can never reach the real NitFit data or GitHub.
// ---------------------------------------------------------------------------

// Where each lift starts and roughly how fast it climbs, per week.
const DEMO_LIFTS = {
  inc_db_press: [10, 0.75], inc_smith_press: [20, 1.25], flat_db_press: [10, 0.6],
  smith_ohp: [20, 1.1], db_ohp: [8, 0.5], cable_fly_low: [5, 0.5], cable_fly_high: [5, 0.45],
  cable_lat_raise: [4, 0.35], lean_lat_raise: [4, 0.3], lat_raise: [5, 0.35],
  rear_delt_fly: [15, 1.2], face_pull: [10, 0.9],
  tri_pushdown: [12.5, 0.9], tri_overhead: [10, 0.9], close_smith: [20, 1.1],
  pulldown_wide: [30, 1.8], pulldown_close: [30, 1.4], cable_row: [30, 1.6],
  chest_sup_row: [10, 0.7], db_row: [12, 0.7], straight_arm: [15, 1.2],
  shrug: [16, 1], incline_curl: [6, 0.4], hammer_curl: [8, 0.4],
  preacher_curl: [7.5, 0.35], db_curl: [7.5, 0.4], cable_curl: [10, 0.8],
  smith_squat: [30, 2.4], leg_press: [50, 5], leg_ext: [25, 1.8], leg_curl: [20, 1.5],
  rdl: [12, 1], hip_thrust: [30, 3], calf_standing: [35, 2.4], calf_seated: [20, 1.8],
  pallof: [10, 0.6], cable_crunch: [15, 1.2],
};

// Bodyweight moves climb in reps, not kilos.
const DEMO_BW = { pullup: [5, 0.5], dip: [5, 0.6], pushup: [18, 1.6], chinup: [6, 0.5],
  hang_leg_raise: [7, 0.5], back_ext: [12, 0.8], plank: [30, 3], side_plank: [20, 2],
  dead_bug: [8, 0.6], bird_dog: [8, 0.5], neck_ext: [12, 0.8], neck_flex: [12, 0.8] };

// A repeatable wobble, so the demo looks the same every time it is rebuilt.
function demoRand(seed) {
  let x = seed * 9301 + 49297;
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
}

const DEMO_WEEKS = 9;

async function seedDemo() {
  const rnd = demoRand(7);
  const batch = [];                       // every event, written to storage in one go at the end
  const put = e => { EV.push(e); EVIDS.add(e.id); applyEvent(e); batch.push(e); };
  const mkEvent = (type, p, d, ts) => ({ id: uid(), ts: ts || new Date(d + "T08:00:00").toISOString(),
    tz: tzOff(), d, type, v: 1, dev: KV.dev, p });
  const t = today();
  const start = addDays(t, -(DEMO_WEEKS * 7 - 1));

  // settings first
  put(mkEvent("settings.upserted", { blockStart: start, heightCm: 177, bfGuess: 15, theme: "light" }, start));

  let weight = 58.1;

  for (let i = 0; i < DEMO_WEEKS * 7; i++) {
    const d = addDays(start, i);
    const week = Math.floor(i / 7);
    const dayKey = DEFAULT_DAYMAP[dow(d)];
    const easy = week % 6 === 5;

    // ---- morning weigh-in, with real daily noise on top of a slow climb ----
    weight += 0.031 + (rnd() - 0.5) * 0.44;
    if (i % 11 !== 7) put(mkEvent("weight.logged", { kg: Math.round(weight * 10) / 10 }, d));

    // ---- sleep and energy ----
    const sr = rnd();
    put(mkEvent("sleep.manual", { flag: sr < 0.17 ? "bad" : sr < 0.5 ? "ok" : "good" }, d));
    const er = rnd();
    put(mkEvent("energy.logged", { level: er < 0.18 ? "low" : er < 0.62 ? "ok" : "high" }, d));

    // ---- did he train ----
    const skipped = rnd() < 0.09;                       // a few missed days, like real life
    if (skipped || d > t) continue;
    const items = DEFAULT_PLAN[dayKey] || [];
    if (!items.length) continue;

    const startTs = new Date(d + "T07:" + pad2(Math.floor(rnd() * 40)) + ":00").toISOString();
    const sess = mkEvent("session.started", { dayKey, items: clone(items), flags: 0, deload: easy, gap: 1 }, d, startTs);
    put(sess);

    let mins = 4;
    for (const it of items) {
      const ex = getEx(it.ex); if (!ex) continue;
      const nSets = easy ? Math.ceil(it.sets / 2) : it.sets;
      const lift = DEMO_LIFTS[it.ex], bw = DEMO_BW[it.ex];
      const step = ex.step || STEP_BY_EQ[ex.eq] || 2.5;

      let kg = 0, baseReps = ex.r[0] + 1;
      if (lift) {
        const raw = lift[0] + lift[1] * week * (easy ? 0.9 : 1);
        kg = Math.max(step, Math.round(raw / step) * step);
      } else if (bw) {
        baseReps = Math.round(bw[0] + bw[1] * week);
      }

      for (let sIdx = 0; sIdx < nSets; sIdx++) {
        mins += Math.round(1.4 + (ex.rest || 90) / 60);
        const fade = sIdx * (ex.kind === "c" ? 0.9 : 0.6);
        let reps = Math.round(baseReps - fade + (rnd() - 0.5) * 1.6);
        reps = Math.max(ex.t ? 15 : 3, reps);
        if (easy) reps = Math.max(3, reps - 2);
        const ts = new Date(Date.parse(startTs) + mins * 60000).toISOString();
        put(mkEvent("set.logged", { sessionId: sess.id, exId: it.ex, idx: sIdx, kg, reps }, d, ts));
      }
    }

    put(mkEvent("session.finished", { sessionId: sess.id }, d, new Date(Date.parse(startTs) + mins * 60000).toISOString()));
  }

  // ---- tape, three times across the block so the change readout works ----
  const tape = [
    ["shoulders", 117.5, 1.6], ["chest", 88, 1.4], ["waist", 72.5, 0.5],
    ["arm", 31, 0.8], ["forearm", 27.5, 0.4], ["thigh", 48, 0.9],
    ["calf", 32, 0.4], ["neck", 35, 0.4],
  ];
  [0, 1, 2].forEach(k => {
    const d = addDays(start, k * 28);
    if (d > t) return;
    tape.forEach(([site, base, grow]) => put(mkEvent("measure.logged", { site, cm: Math.round((base + grow * k) * 10) / 10 }, d)));
  });

  // ---- progress photos, so the before and after slider has something to slide ----
  for (const pose of ["front", "back", "side"]) {
    for (let k = 0; k < 3; k++) {
      const d = addDays(start, k * 28);
      if (d > t) break;
      const buf = demoPhoto(pose, k);
      const photoId = "p" + uid();
      await mediaPut(photoId, buf, "image/jpeg");
      put(mkEvent("photo.added", { pose, photoId }, d));
    }
  }

  await idbDo("events", "readwrite", st => { batch.forEach(e => st.put(e)); });
  await kvSet("skipSetup", true);
  await kvSet("demoSeeded", 2);
  rebuild();
}

// A stand-in photo. Not a real body, just something that visibly changes
// month to month so the slider proves it works.
function demoPhoto(pose, k) {
  const W = 480, H = 640, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, H);
  const tone = [["#2b2b31", "#17171b"], ["#2f2f36", "#19191e"], ["#343440", "#1b1b22"]][k];
  g.addColorStop(0, tone[0]); g.addColorStop(1, tone[1]);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // a rough torso that gets a touch wider each month
  const w = 94 + k * 13, cx = W / 2;
  x.fillStyle = "rgba(255,255,255,.10)";
  x.beginPath();
  x.moveTo(cx - w, 210); x.quadraticCurveTo(cx - w * 0.55, 330, cx - 52, 430);
  x.lineTo(cx + 52, 430); x.quadraticCurveTo(cx + w * 0.55, 330, cx + w, 210);
  x.quadraticCurveTo(cx, 168, cx - w, 210); x.fill();
  x.beginPath(); x.arc(cx, 150, 44, 0, Math.PI * 2); x.fill();
  x.fillStyle = "rgba(255,255,255,.34)";
  x.font = "600 22px -apple-system, system-ui, sans-serif";
  x.textAlign = "center";
  x.fillText("Example photo", cx, 560);
  x.font = "500 16px -apple-system, system-ui, sans-serif";
  x.fillStyle = "rgba(255,255,255,.22)";
  x.fillText(pose + " · month " + (k + 1), cx, 590);
  const data = c.toDataURL("image/jpeg", 0.8).split(",")[1];
  const bin = atob(data), arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

// Wipe it and build it again.
ACT.demoReset = async () => {
  closeSheet(); toast("Rebuilding the example data...");
  await idbDo("events", "readwrite", s => { s.clear(); });
  await idbDo("media", "readwrite", s => { s.clear(); });
  EV = []; EVIDS.clear(); rebuild();
  await seedDemo();
  applyTheme(); render();
  toast("Fresh example data");
};
