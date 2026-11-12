const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = process.argv[2], SHOTS = process.argv[3];
const types = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const server = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p.endsWith("/")) p += "index.html"; const f = path.join(ROOT, p); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" }); r.end(b); } }); });
// fake GitHub
const GHFILES = {}; let shaN = 1, puts = 0, forceConflict = 0, netDown = false;
async function gh(route) {
  if (netDown) return route.abort("internetdisconnected");
  const req = route.request(), u = new URL(req.url()), m = /\/repos\/nitpaudel\/nitfit-data(?:\/contents\/(.*))?$/.exec(u.pathname);
  const json = (code, o) => route.fulfill({ status: code, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
  if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
  if ((req.headers()["authorization"] || "") !== "Bearer good_key") return json(401, {});
  if (!m) return json(404, {});
  if (m[1] === undefined) return json(200, { private: true });
  const p = m[1];
  if (req.method() === "GET") {
    if (GHFILES[p]) return json(200, { content: Buffer.from(GHFILES[p].text).toString("base64"), sha: GHFILES[p].sha, size: GHFILES[p].text.length });
    const kids = Object.keys(GHFILES).filter(k => k.startsWith(p + "/")); if (!kids.length) return json(404, {});
    const names = [...new Set(kids.map(k => k.slice(p.length + 1).split("/")[0]))];
    return json(200, names.map(n => ({ name: n, type: kids.some(k => k === p + "/" + n) ? "file" : "dir" })));
  }
  if (req.method() === "PUT") {
    const b = JSON.parse(req.postData());
    if (forceConflict > 0) { forceConflict--; return json(409, {}); }
    if (GHFILES[p] && GHFILES[p].sha !== b.sha) return json(409, {});
    if (!GHFILES[p] && b.sha) return json(422, {});
    GHFILES[p] = { text: Buffer.from(b.content, "base64").toString("utf8"), sha: "sha" + (shaN++) }; puts++;
    return json(200, { content: { sha: GHFILES[p].sha } });
  }
  json(405, {});
}
let fails = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  await new Promise(r => server.listen(8123, r));
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const mk = async () => { const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: "block" }); await ctx.route("https://api.github.com/**", gh); const page = await ctx.newPage(); page.on("pageerror", e => { console.log("PAGE ERROR", e.message); fails++; }); page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) console.log("console:", m.text()); }); return { ctx, page }; };
  const shot = (page, n) => page.screenshot({ path: path.join(SHOTS, n + ".png") });
  const tap = (page, sel) => page.locator(sel).first().click();
  let { ctx, page } = await mk();
  await page.goto("http://localhost:8123/nitfit/"); await page.waitForSelector("#sheet.on");
  await shot(page, "01-setup"); await tap(page, '[data-a="keyLater"]');
  await shot(page, "02-today-empty");
  // seed 6 weeks of history through the real event path
  await page.evaluate(() => {
    const t = today(); let kg = 59.6;
    for (let w = 6; w >= 1; w--) for (let k = 0; k < 6; k++) {
      const d = addDays(addDays(t, -dow(t)), -7 * w + k), dayKey = S.dayMap[dow(d)];
      const s = addEvent("session.started", { dayKey, items: clone(S.plan[dayKey]), flags: 0, deload: false, gap: 1 }, d);
      S.plan[dayKey].forEach(it => { const ex = getEx(it.ex), base = ex.eq === "bw" ? 0 : ex.kind === "c" ? 30 : 15; for (let i = 0; i < it.sets; i++) addEvent("set.logged", { sessionId: s.id, exId: it.ex, idx: i, kg: base ? base + (w < 4 ? ex.step : 0) : 0, reps: Math.min(ex.r[1], ex.r[0] + (6 - w) % 4 + (i === 0 ? 1 : 0)) }, d); });
      addEvent("session.finished", { sessionId: s.id }, d);
    }
    for (let i = 42; i >= 1; i--) { kg += 0.035 + (Math.sin(i) * 0.25) / 6; addEvent("weight.logged", { kg: Math.round((kg + Math.sin(i * 1.7) * 0.4) * 10) / 10 }, addDays(t, -i)); }
    for (let i = 16; i >= 1; i--) { const d = addDays(t, -i); [["dalbhat", 2], ["shake", 1], ["egg", 4], ["coffee", 1], ["soya", 1]].forEach(u => logFood(getFood(u[0]), u[1], d, "b" + i)); }
    addEvent("settings.upserted", { blockStart: addDays(t, -42) });
    rebuild(); render();
  });
  await page.fill("#wIn", "60.4"); await tap(page, '[data-a="saveWeight"]');
  await tap(page, '[data-a="sleep"][data-v="ok"]'); await tap(page, '[data-a="energy"][data-v="high"]');
  await shot(page, "03-today");
  ok(await page.locator('[data-a="start"]').count() > 0, "start button shown");
  const dayKey = await page.evaluate(() => S.dayMap[dow(today())]);
  await tap(page, '[data-a="start"]'); await page.waitForSelector("#wk.on");
  await shot(page, "04-workout");
  // one tap logging on the first exercise
  const firstEx = await page.evaluate(() => activeSession().items[0].ex);
  await tap(page, `.tick[data-ex="${firstEx}"][data-idx="0"]`);
  ok(await page.locator("#rest.on").count() === 1, "rest timer starts after a tick");
  ok(await page.evaluate(() => sessionSets(activeSession().id).length) === 1, "one set logged with one tap");
  await shot(page, "05-workout-rest");
  await tap(page, '[data-a="restAdd"][data-v="15"]'); await tap(page, '[data-a="restSkip"]');
  ok(await page.locator("#rest.on").count() === 0, "rest skip hides the bar");
  // edit reps on set 2 then tick, untick, tick
  await page.fill(`#ex-${firstEx} .sr:nth-child(3) [data-i="reps"]`, "12"); await tap(page, `.tick[data-ex="${firstEx}"][data-idx="1"]`);
  ok(await page.evaluate(ex => sessionSets(activeSession().id).find(s => s.exId === ex && s.idx === 1).reps, firstEx) === 12, "typed reps are saved");
  await tap(page, `.tick[data-ex="${firstEx}"][data-idx="1"]`);
  ok(await page.evaluate(() => sessionSets(activeSession().id).length) === 1, "untick removes the set");
  await tap(page, `.tick[data-ex="${firstEx}"][data-idx="1"]`);
  // why + menu + swap
  await tap(page, `[data-a="why"][data-ex="${firstEx}"]`); await shot(page, "06-why");
  await tap(page, `[data-a="exMenu"][data-ex="${firstEx}"]`); await page.waitForSelector("#sheet.on"); await shot(page, "07-exmenu");
  await tap(page, '[data-a="swap"]'); await shot(page, "08-swap"); await page.locator("#sheet .bg").click({ position: { x: 20, y: 20 } });
  // reload mid workout: must resume
  await page.reload(); await page.waitForSelector('[data-a="openWk"]');
  ok(await page.evaluate(() => sessionSets(activeSession().id).length) === 2, "workout survives a reload");
  await tap(page, '[data-a="openWk"]');
  // finish every set of everything quickly
  for (let guard = 0; guard < 80; guard++) { const t = page.locator(".sr:not(.ok) .tick").first(); if (!(await t.count())) break; await t.click(); if (await page.locator('.rir [data-a="rir"]').count()) await tap(page, '.rir [data-a="rir"][data-v="2"]'); }
  await tap(page, '[data-a="restSkip"]').catch(() => {});
  await tap(page, '[data-a="finish"]'); await page.waitForSelector("#sheet.on"); await shot(page, "09-summary"); await tap(page, '#sheet .btn[data-a="closeSheet"]');
  ok(await page.evaluate(() => !activeSession()), "workout finished");
  await shot(page, "10-today-done");
  // progress
  await tap(page, '#tabs [data-tab="progress"]'); await shot(page, "11-progress-lifts");
  await tap(page, '.row[data-a="exGraph"]'); await page.waitForSelector("#sheet.on"); await shot(page, "12-lift-graph"); await page.locator("#sheet .bg").click({ position: { x: 20, y: 20 } });
  await tap(page, '[data-a="prog"][data-v="weight"]'); await shot(page, "13-weight");
  await tap(page, '[data-a="prog"][data-v="muscles"]'); await shot(page, "14-muscles");
  // food
  await tap(page, '#tabs [data-tab="food"]'); await shot(page, "15-food-empty");
  await tap(page, '[data-a="usual"]'); await page.waitForSelector("#sheet.on"); await shot(page, "16-usual"); await tap(page, '[data-a="usualAdd"]');
  await tap(page, '.fb[data-id="soya"]'); await tap(page, '.fb[data-id="soya"]');
  ok(await page.evaluate(() => foodDay(today()).kcal) === 2240 + 208, "usual day plus 2 soya adds up: " + await page.evaluate(() => foodDay(today()).kcal));
  await tap(page, '[data-a="creatine"]'); await page.evaluate(() => window.scrollTo(0, 0)); await shot(page, "17-food");
  ok(await page.evaluate(() => S.checkins.length) >= 1, "weekly food check ran: " + await page.evaluate(() => (S.checkins[0] || {}).reason));
  // body
  await tap(page, '#tabs [data-tab="body"]');
  for (const [site, v] of [["shoulders", "112"], ["waist", "72.4"], ["neck", "35"]]) { await tap(page, `[data-a="measure"][data-site="${site}"]`); await page.fill("#mIn", v); await tap(page, '[data-a="measureSave"]'); }
  // two photos
  const mkImg = async (color) => page.evaluate(async c => { const cv = document.createElement("canvas"); cv.width = 600; cv.height = 800; const g = cv.getContext("2d"); g.fillStyle = c; g.fillRect(0, 0, 600, 800); g.fillStyle = "#fff"; g.fillRect(200, 150, 200, 500); const b = await new Promise(r => cv.toBlob(r, "image/jpeg")); await onPhoto(new File([b], "a.jpg", { type: "image/jpeg" }), "front", c === "#334" ? addDays(today(), -30) : today()); }, color);
  await mkImg("#334"); await mkImg("#543");
  await page.waitForTimeout(300); await shot(page, "18-body");
  await page.evaluate(() => window.scrollTo(0, 99999)); await page.waitForTimeout(100); await shot(page, "19-body-future");
  await tap(page, '.ph[data-pose="front"]'); await page.waitForSelector("#cmp"); await page.waitForTimeout(300);
  const box = await page.locator("#cmp").boundingBox(); await page.mouse.move(box.x + 100, box.y + 200); await page.mouse.down(); await page.mouse.move(box.x + box.width * 0.3, box.y + 220); await page.mouse.up();
  const wPc = await page.evaluate(() => parseFloat(document.querySelector("#cmp .topw").style.width)); ok(Math.abs(wPc - 30) < 3, "photo slider follows the finger: " + wPc);
  await shot(page, "20-compare"); await page.locator("#sheet .bg").click({ position: { x: 20, y: 20 } });
  // settings + plan editor
  await tap(page, '#tabs [data-tab="more"]'); await shot(page, "21-settings");
  await tap(page, '[data-a="planDay"][data-day="pushA"]'); await page.waitForSelector("#sheet.on"); await shot(page, "22-plan"); await page.locator("#sheet .bg").click({ position: { x: 20, y: 20 } });
  // ----- sync -----
  const n1 = await page.evaluate(() => EV.length);
  await tap(page, '[data-a="keySetup"]'); await page.fill("#keyIn", "bad_key"); await tap(page, '[data-a="keyConnect"]'); await page.waitForFunction(() => document.querySelector("#keyErr").textContent.length > 0);
  ok(/did not work/.test(await page.textContent("#keyErr")), "bad key is refused"); ok(await page.evaluate(() => !KV.token), "bad key is not kept");
  forceConflict = 2;
  await page.fill("#keyIn", "good_key"); await tap(page, '[data-a="keyConnect"]'); await page.waitForFunction(() => !document.querySelector("#sheet").classList.contains("on"), null, { timeout: 30000 });
  const remoteCount = () => Object.keys(GHFILES).filter(k => k.startsWith("log/")).reduce((a, k) => a + GHFILES[k].text.trim().split("\n").length, 0);
  ok(remoteCount() === n1, "every entry reached GitHub, even after 2 clashes: " + remoteCount() + " of " + n1);
  ok(Object.keys(GHFILES).some(k => k.startsWith("backup/")), "monthly backup file written");
  ok(await page.evaluate(() => (KV.dirty || []).length) === 0 && await page.evaluate(() => syncStatus().c) === "green", "status is green after saving");
  ok(!JSON.stringify(GHFILES).includes("good_key"), "the key is never written to GitHub");
  await shot(page, "23-settings-synced");
  // another device adds a line, and the sleep widget writes a file
  const mth = await page.evaluate(() => today().slice(0, 7)), mp = "log/" + mth.slice(0, 4) + "/" + mth + ".jsonl";
  GHFILES[mp] = { text: GHFILES[mp].text + JSON.stringify({ id: "zzforeign1", ts: new Date().toISOString(), d: mth + "-01", type: "weight.logged", v: 1, dev: "other", p: { kg: 61.1 } }) + "\n" + '{"id":"zzfuture","ts":"2030-01-01T00:00:00.000Z","d":"' + mth + '-01","type":"future.thing","v":9,"p":{"x":1}}\n', sha: "sha" + (shaN++) };
  GHFILES["sleep/" + mth.slice(0, 4) + "/" + mth + ".jsonl"] = { text: JSON.stringify({ id: "s1", d: await page.evaluate(() => today()), type: "sleep.logged", p: { minutes: 380 } }) + "\n", sha: "sha" + (shaN++) };
  await page.evaluate(async () => { addEvent("weight.logged", { kg: 60.5 }); await syncNow(); });
  ok(GHFILES[mp].text.includes("zzforeign1") && GHFILES[mp].text.includes("zzfuture"), "lines from another device are never dropped");
  ok(await page.evaluate(() => EVIDS.has("zzforeign1")), "the other device's entry arrived here");
  ok(await page.evaluate(() => S.sleepManual[today()] ? true : sleepFor(today()).min === 380), "sleep file is read");
  const n2 = await page.evaluate(() => EV.length);
  // offline then back
  netDown = true; await page.evaluate(async () => { addEvent("weight.logged", { kg: 60.6 }); await syncNow(); });
  ok(await page.evaluate(() => !!KV.syncErr && KV.dirty.length > 0 && syncStatus().c !== "green"), "offline keeps the entry waiting: " + await page.evaluate(() => KV.syncErr));
  netDown = false; await page.evaluate(() => syncNow()); ok(remoteCount() === n2 + 1, "it saves when back online");
  const stateA = await page.evaluate(() => JSON.stringify([Object.keys(S.sets).length, Object.keys(S.sessions).length, weightList().length, S.food.length, S.measures.length, S.settings.kcal, S.plan]));
  // ----- brand new phone -----
  await ctx.close(); ({ ctx, page } = await mk());
  await page.goto("http://localhost:8123/nitfit/"); await page.waitForSelector("#keyIn");
  ok(await page.evaluate(() => EV.length) === 0, "new phone starts empty");
  await page.fill("#keyIn", "good_key"); await tap(page, '[data-a="keyConnect"]'); await page.waitForFunction(() => !document.querySelector("#sheet").classList.contains("on"), null, { timeout: 30000 });
  ok(await page.evaluate(() => EV.length) === n2 + 1, "new phone got every entry back: " + await page.evaluate(() => EV.length) + " of " + (n2 + 1));
  const stateB = await page.evaluate(() => JSON.stringify([Object.keys(S.sets).length, Object.keys(S.sessions).length, weightList().length, S.food.length, S.measures.length, S.settings.kcal, S.plan]));
  ok(stateA === stateB, "new phone shows the same numbers");
  const before = puts; await page.evaluate(() => syncNow(true)); ok(puts === before, "nothing is rewritten when nothing changed");
  await shot(page, "24-newphone-today");
  // iPhone Safari guard
  const g = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1", serviceWorkers: "block" });
  const gp = await g.newPage(); await gp.goto("http://localhost:8123/nitfit/"); await gp.waitForTimeout(400);
  ok(/Home Screen/.test(await gp.textContent("#app")) && await gp.evaluate(() => S === null), "Safari on iPhone is blocked from logging"); await shot(gp, "25-guard");
  await browser.close(); server.close();
  console.log(fails ? fails + " FAILED" : "ALL PASSED"); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e); process.exit(2); });
