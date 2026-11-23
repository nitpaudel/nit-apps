// ---------- NitFit core: storage, events, state, GitHub sync ----------
const APP_VERSION = "7.0";
const pad2 = n => String(n).padStart(2, "0");
const dstr = dt => dt.getFullYear() + "-" + pad2(dt.getMonth() + 1) + "-" + pad2(dt.getDate());
const today = () => dstr(new Date());
const addDays = (d, n) => { const t = new Date(d + "T12:00:00"); t.setDate(t.getDate() + n); return dstr(t); };
const dow = d => new Date(d + "T12:00:00").getDay();
const daysBetween = (a, b) => Math.round((Date.parse(b + "T12:00:00") - Date.parse(a + "T12:00:00")) / 864e5);
const dayNum = d => Math.round(Date.parse(d + "T00:00:00Z") / 864e5);
let uidT = 0, uidN = 0;
const uid = () => { const t = Date.now(); if (t === uidT) uidN++; else { uidT = t; uidN = 0; } return t.toString(36).padStart(9, "0") + uidN.toString(36).padStart(3, "0") + Math.random().toString(36).slice(2, 7).padEnd(5, "0"); };
const tzOff = () => { const o = -new Date().getTimezoneOffset(), a = Math.abs(o); return (o < 0 ? "-" : "+") + pad2(Math.floor(a / 60)) + ":" + pad2(a % 60); };
const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const niceDate = d => { const t = new Date(d + "T12:00:00"); return t.getDate() + " " + MONTHS[t.getMonth()] + (t.getFullYear() !== new Date().getFullYear() ? " " + t.getFullYear() : ""); };

// ----- phone storage (IndexedDB) -----
let IDB = null; const KV = {};
function idbOpen() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("nitfit", 1);
    r.onupgradeneeded = () => { const db = r.result; db.createObjectStore("events", { keyPath: "id" }); db.createObjectStore("kv"); db.createObjectStore("media"); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
function idbDo(store, mode, fn) {
  return new Promise((res, rej) => {
    const t = IDB.transaction(store, mode), rq = fn(t.objectStore(store));
    t.oncomplete = () => res(rq ? rq.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error("Storage stopped"));
  });
}
function kvSet(k, v) { KV[k] = v; return idbDo("kv", "readwrite", s => { s.put(v, k); }).catch(storageFail); }
async function kvLoad() {
  const keys = await idbDo("kv", "readonly", s => s.getAllKeys()), vals = await idbDo("kv", "readonly", s => s.getAll());
  keys.forEach((k, i) => KV[k] = vals[i]);
}
let storageBroken = "";
function storageFail(e) { storageBroken = (e && e.name === "QuotaExceededError") ? "Your phone is out of space. Free some space now." : "Could not save to the phone. Close NitFit and open it again."; if (typeof render === "function") render(); }

// ----- events and state -----
const DEFAULT_SETTINGS = { theme: "dark", vol: 0.6, restOn: true, smart: true, warmAuto: false, propagate: true, rirTrack: true, ssScroll: true, autoNext: true, keepAlive: true, showClock: true, dashHide: [] };
let EV = []; const EVIDS = new Set(); let S = null;
function freshState() {
  return { sessions: {}, sets: {}, bySession: {}, byEx: {}, weights: {}, waists: {}, measures: {}, settings: clone(DEFAULT_SETTINGS), program: {}, exo: {}, fixDone: {} };
}
const evSort = (a, b) => a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
function rebuild() {
  EV.sort(evSort); S = freshState();
  const dead = new Set(); for (const e of EV) if (e.type === "entity.deleted" && e.p) dead.add(e.p.ref);
  for (const e of EV) if (!dead.has(e.id)) applyEvent(e);
}
function removeRef(id) {
  const st = S.sets[id];
  if (st) { delete S.sets[id]; const a = S.bySession[st.sessionId], b = S.byEx[st.exId]; if (a) a.splice(a.indexOf(id), 1); if (b) b.splice(b.indexOf(id), 1); return; }
  if (S.sessions[id]) { delete S.sessions[id]; return; }
  for (const k of ["weights", "waists", "measures"]) for (const d in S[k]) if (S[k][d].id === id) { delete S[k][d]; return; }
}
function applyEvent(e) {
  const p = e.p || {};
  switch (e.type) {
    case "session.started": if (!p.v2) break; S.sessions[e.id] = { id: e.id, d: e.d, startTs: e.ts, endTs: null, dayKey: p.dayKey, name: p.name || "", items: p.items || [] }; S.bySession[e.id] = S.bySession[e.id] || []; break;
    case "session.edited": if (S.sessions[p.sessionId]) S.sessions[p.sessionId].items = p.items; break;
    case "session.finished": if (S.sessions[p.sessionId]) S.sessions[p.sessionId].endTs = p.endTs || e.ts; break;
    case "set.logged": if (!S.sessions[p.sessionId]) break; S.sets[e.id] = { id: e.id, d: e.d, ts: e.ts, sessionId: p.sessionId, exId: p.exId, idx: p.idx, kg: p.kg || 0, reps: p.reps, p: p.p || 0, note: p.note || "", rir: p.rir == null ? null : p.rir, w: !!p.w, q: p.q || "clean", tKg: p.tKg, tReps: p.tReps, tRir: p.tRir };
      (S.bySession[p.sessionId] = S.bySession[p.sessionId] || []).push(e.id); (S.byEx[p.exId] = S.byEx[p.exId] || []).push(e.id); break;
    case "set.q": if (S.sets[p.ref]) S.sets[p.ref].q = p.q; break;
    case "set.rir": if (S.sets[p.ref]) S.sets[p.ref].rir = p.rir; break;
    case "set.note": if (S.sets[p.ref]) S.sets[p.ref].note = p.note || ""; break;
    case "set.edited": if (S.sets[p.ref]) { if (p.p != null) S.sets[p.ref].p = p.p; if (p.kg != null) S.sets[p.ref].kg = p.kg; if (p.reps != null) S.sets[p.ref].reps = p.reps; } break;
    case "entity.deleted": removeRef(p.ref); break;
    case "weight.logged": S.weights[e.d] = { id: e.id, d: e.d, kg: p.kg, bf: p.bf == null ? null : p.bf }; break;
    case "waist.logged": S.waists[e.d] = { id: e.id, d: e.d, inch: p.inch }; break;
    case "measure.logged": S.measures[e.d] = Object.assign({ id: e.id, d: e.d }, p); break;
    case "settings.upserted": Object.assign(S.settings, p); break;
    case "program.upserted": if (p.dayKey && p.items) S.program[p.dayKey] = p.items; if (p.dayKey && p.reset) delete S.program[p.dayKey]; break;
    case "exercise.upserted": S.exo[p.exId] = Object.assign(S.exo[p.exId] || {}, p); break;
    case "fix.done": S.fixDone[p.sessionId] = p.done || []; break;
  }
}
function addEvent(type, p, d) {
  const e = { id: uid(), ts: new Date().toISOString(), tz: tzOff(), d: d || today(), type, v: 1, dev: KV.dev, p };
  EV.push(e); EVIDS.add(e.id); applyEvent(e);
  idbDo("events", "readwrite", s => { s.put(e); }).catch(storageFail);
  markDirty(e.d.slice(0, 7)); syncSoon();
  return e;
}
const DIRTYSEQ = {};
function markDirty(m) { DIRTYSEQ[m] = (DIRTYSEQ[m] || 0) + 1; const a = KV.dirty || []; if (!a.includes(m)) { a.push(m); kvSet("dirty", a); } }
const getEx = id => { const b = EXMAP[id], o = S.exo[id]; return b || o ? Object.assign({ id, n: id, m: "Other", eq: "machine", kind: "i", r: [10, 15], rest: 90, step: 2.5, cue: "" }, b, o && o.custom ? o : {}) : null; };
const allExercises = () => EXERCISES.map(e => getEx(e.id)).concat(Object.values(S.exo).filter(o => o.custom && !EXMAP[o.exId]).map(o => getEx(o.exId)));

// history of one exercise: finished sets grouped by workout, oldest first
function histFor(exId, skipSid) {
  const by = {};
  for (const id of S.byEx[exId] || []) { const st = S.sets[id]; if (!st || st.w || st.sessionId === skipSid || !S.sessions[st.sessionId]) continue; (by[st.sessionId] = by[st.sessionId] || []).push(st); }
  return Object.keys(by).map(sid => ({ sid, d: S.sessions[sid].d, sets: by[sid].sort((a, b) => a.idx - b.idx) })).sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.sid < b.sid ? -1 : 1);
}
const sessionSets = sid => (S.bySession[sid] || []).map(id => S.sets[id]).filter(x => x && !x.w);
const sessionAllSets = sid => (S.bySession[sid] || []).map(id => S.sets[id]).filter(Boolean);
const sessionsSorted = () => Object.values(S.sessions).sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.startTs < b.startTs ? -1 : a.startTs > b.startTs ? 1 : a.id < b.id ? -1 : 1);
function activeSession() {
  const open = sessionsSorted().filter(s => !s.endTs); if (!open.length) return null;
  const s = open[open.length - 1]; return Date.now() - Date.parse(s.startTs) < 18 * 3600e3 ? s : null;
}
const weightList = () => Object.values(S.weights).sort((a, b) => a.d < b.d ? -1 : 1);
// which program week: weeks 1 and 2 are easy (2 sets), 3 and 4 the planned sets, 5 on the full sets
function programWeek(d) { const n = Math.floor(daysBetween(PROGRAM_START, d) / 7) + 1; return Math.max(1, n); }
function setsFor(item, d) { if (item.fixed) return item.sets; const w = programWeek(d); return w <= 2 ? Math.min(2, item.sets) : w <= 4 ? item.sets : (item.p5 || item.sets); }
function planFor(dayKey) { return S.program[dayKey] || (DAYS[dayKey] ? DAYS[dayKey].items : []); }

// ----- GitHub sync -----
const GH = "https://api.github.com/repos/";
const repoName = () => KV.repo || "nitpaudel/nitfit-data";
const ghH = () => ({ Authorization: "Bearer " + KV.token, Accept: "application/vnd.github+json" });
const toB64 = s => { const b = new TextEncoder().encode(s); let x = ""; for (let i = 0; i < b.length; i += 0x8000) x += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(x); };
const fromB64 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, "")), c => c.charCodeAt(0)));
const ghErr = r => Object.assign(new Error(r.status === 401 ? "Your key stopped working. Paste a new one in Settings." : r.status === 403 ? "GitHub said no. The key needs Contents: Read and write on nitfit-data." : r.status === 404 ? "Can't find nitfit-data. Check the key was given access to it." : "GitHub error " + r.status), { status: r.status });
async function ghGet(path) {
  const r = await fetch(GH + repoName() + "/contents/" + path, { headers: ghH(), cache: "no-store" });
  if (r.status === 404) return null; if (!r.ok) throw ghErr(r);
  const j = await r.json(); if (Array.isArray(j)) return { list: j };
  if (j.size > 0 && !j.content) throw new Error("A data file got too big to read. Tell Claude.");
  return { text: j.content ? fromB64(j.content) : "", sha: j.sha };
}
async function ghPut(path, text, sha, message) {
  const body = { message, content: toB64(text) }; if (sha) body.sha = sha;
  const r = await fetch(GH + repoName() + "/contents/" + path, { method: "PUT", headers: Object.assign({ "Content-Type": "application/json" }, ghH()), body: JSON.stringify(body) });
  if (!r.ok) throw ghErr(r);
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const monthPath = m => "log/" + m.slice(0, 4) + "/" + m + ".jsonl";
let syncing = false, syncAgain = false, syncTimer = null, syncPulled = 0;
function syncSoon() { if (!KV.token) return; clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(), 4000); }
async function syncMonth(m) {
  for (let attempt = 0; ; attempt++) {
    const f = await ghGet(monthPath(m)), remote = [], keep = [];
    for (const line of (f ? f.text : "").split("\n")) { if (!line.trim()) continue; try { const o = JSON.parse(line); if (o && o.id) remote.push(o); else keep.push(line); } catch (_) { keep.push(line); } }
    const fresh = remote.filter(o => !EVIDS.has(o.id));
    if (fresh.length) { await idbDo("events", "readwrite", s => { fresh.forEach(o => s.put(o)); }); fresh.forEach(o => { EV.push(o); EVIDS.add(o.id); }); syncPulled += fresh.length; }
    const rid = new Set(remote.map(o => o.id)), mine = EV.filter(e => e.d && e.d.slice(0, 7) === m && !rid.has(e.id));
    if (!mine.length) return;
    const merged = remote.concat(mine).sort(evSort), mid = new Set(merged.map(o => o.id));
    if (merged.length < remote.length || remote.some(o => !mid.has(o.id))) throw new Error("Safety stop: saving would have removed data. Nothing was changed. Tell Claude.");
    try { await ghPut(monthPath(m), keep.concat(merged.map(o => JSON.stringify(o))).join("\n") + "\n", f && f.sha, "nitfit: " + m + " +" + mine.length); return; }
    catch (e) { if ((e.status === 409 || e.status === 422) && attempt < 5) { await wait(400 * (attempt + 1)); continue; } throw e; }
  }
}
async function listMonths() {
  const out = [], top = await ghGet("log"); if (!top || !top.list) return out;
  for (const y of top.list.filter(x => x.type === "dir")) { const l = await ghGet("log/" + y.name); if (l && l.list) l.list.forEach(x => { const m = /^(\d{4}-\d{2})\.jsonl$/.exec(x.name); if (m) out.push(m[1]); }); }
  return out;
}
const buildExport = () => ({ app: "NitFit", schema: 1, exported: new Date().toISOString(), events: EV.slice().sort(evSort) });
async function monthlyBackup() {
  const m = today().slice(0, 7); if (KV.backupMonth === m || !EV.length) return;
  const path = "backup/export-" + m + ".json";
  if (!(await ghGet(path))) await ghPut(path, JSON.stringify(buildExport()), null, "nitfit: monthly backup " + m);
  await kvSet("backupMonth", m);
}
async function syncNow(full) {
  if (!KV.token) return false;
  if (syncing) { syncAgain = true; return false; }
  syncing = true; syncPulled = 0; if (typeof syncPaint === "function") syncPaint();
  let okAll = true;
  try {
    const t = today(), months = new Set((KV.dirty || []).concat([t.slice(0, 7), addDays(t, -31).slice(0, 7)]));
    if (full) (await listMonths()).forEach(m => months.add(m));
    for (const m of Array.from(months).sort()) { const seq = DIRTYSEQ[m] || 0; await syncMonth(m); if ((DIRTYSEQ[m] || 0) === seq) await kvSet("dirty", (KV.dirty || []).filter(x => x !== m)); else syncAgain = true; }
    await kvSet("lastSync", Date.now()); await kvSet("syncErr", "");
    try { await monthlyBackup(); } catch (_) {}
  } catch (e) { okAll = false; await kvSet("syncErr", (navigator.onLine === false || e instanceof TypeError) ? "Offline. It will save when you are back online." : (e.message || "Could not reach GitHub.")); }
  syncing = false;
  if (syncPulled) { rebuild(); if (typeof render === "function") render(); }
  if (typeof syncPaint === "function") syncPaint();
  if (syncAgain) { syncAgain = false; setTimeout(() => syncNow(), 300); }
  return okAll;
}
async function connectKey(token) {
  token = (token || "").trim(); if (!token) throw new Error("Paste the key first.");
  const r = await fetch(GH + repoName(), { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" }, cache: "no-store" });
  if (r.status === 401) throw new Error("That key did not work. Copy it again from GitHub.");
  if (r.status === 404) throw new Error("The key can't see nitfit-data. When you make the key, pick Only select repositories, then nitfit-data.");
  if (!r.ok) throw new Error("GitHub said " + r.status + ". Try again.");
  const info = await r.json(); if (!info.private) throw new Error("nitfit-data is public. Make it private first.");
  await kvSet("token", token);
  EV.forEach(e => { if (e.d) markDirty(e.d.slice(0, 7)); });
  const ok = await syncNow(true);
  if (!ok) { const msg = KV.syncErr; if (/Contents|said no/.test(msg)) { await kvSet("token", ""); } throw new Error(msg); }
}
function syncStatus() {                      // {color, text}
  if (storageBroken) return { c: "red", t: storageBroken };
  if (!KV.token) return { c: "red", t: "Not backed up" };
  if (KV.syncErr) return { c: /Offline/.test(KV.syncErr) ? "amber" : "red", t: KV.syncErr };
  if (syncing) return { c: "amber", t: "Saving..." };
  if ((KV.dirty || []).length) return { c: "amber", t: "Waiting to save" };
  if (!KV.lastSync) return { c: "amber", t: "Not saved yet" };
  const s = Math.round((Date.now() - KV.lastSync) / 1000);
  return { c: s > 86400 ? "red" : "green", t: "Saved " + (s < 60 ? "just now" : s < 3600 ? Math.round(s / 60) + " min ago" : s < 86400 ? Math.round(s / 3600) + " h ago" : Math.round(s / 86400) + " days ago") };
}
async function importExport(obj) {
  if (!obj || !Array.isArray(obj.events)) throw new Error("That is not a NitFit backup file.");
  const fresh = obj.events.filter(o => o && o.id && o.type && !EVIDS.has(o.id));
  if (fresh.length) { await idbDo("events", "readwrite", s => { fresh.forEach(o => s.put(o)); }); fresh.forEach(o => { EV.push(o); EVIDS.add(o.id); if (o.d) markDirty(o.d.slice(0, 7)); }); rebuild(); syncSoon(); }
  return fresh.length;
}
async function coreBoot() {
  IDB = await idbOpen(); await kvLoad();
  if (!KV.dev) await kvSet("dev", "d" + Math.random().toString(36).slice(2, 8));
  EV = await idbDo("events", "readonly", s => s.getAll()); EV.forEach(e => EVIDS.add(e.id)); rebuild();
}
