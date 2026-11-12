// ---------- NitFit screens, part 3: Body, Future you, Settings, start-up ----------
const latestM = site => S.measures.filter(m => m.site === site).sort((a, b) => a.d < b.d ? -1 : 1);
const PH_URL = {};
function curWeight() { const tr = trendSeries(weightList()); return tr.length ? tr[tr.length - 1].trend : 59.9; }
function bfRange() {
  const w = latestM("waist").pop(), n = latestM("neck").pop(), g = S.settings.bfGuess;
  if (w && n) { const v = navyBf(w.cm, n.cm, S.settings.heightCm); if (v != null) { const mid = (v + 2.6 + g) / 2; return { lo: Math.max(4, Math.round(mid - 3)), hi: Math.round(mid + 3), mid, measured: true }; } }
  return { lo: Math.max(4, g - 4), hi: g + 1, mid: g, measured: false };
}
function vBody() {
  const st = S.settings, hM = st.heightCm / 100, W = curWeight(), bf = bfRange(), lean = W * (1 - bf.mid / 100);
  const sh = latestM("shoulders").pop(), wa = latestM("waist").pop(), ratio = sh && wa ? sh.cm / wa.cm : null;
  let h = '<div class="top"><div><h1>Body</h1></div>' + syncChip() + "</div>";
  // shape
  h += '<div class="card"><div class="kv"><div><div class="mut" style="font-size:13px;font-weight:700">V-TAPER</div><div class="big num">' + (ratio ? ratio.toFixed(2) : "?") + '</div></div><div style="text-align:right"><div class="mut" style="font-size:13px;font-weight:700">GOAL</div><div class="num" style="font-size:24px;font-weight:800">1.60</div></div></div>' +
    (ratio ? '<div class="meter"><i style="width:' + Math.max(4, Math.min(100, (ratio - 1.2) / 0.4 * 100)) + '%"></i></div><p class="sub" style="margin:6px 0 0">Shoulders divided by waist. At your waist now, 1.60 means ' + Math.round(wa.cm * 1.6) + " cm shoulders. You are at " + Math.round(sh.cm) + " cm.</p>"
           : '<p class="sub" style="margin:8px 0 0">Shoulders divided by waist. Measure both below and this turns on.</p>') + "</div>";
  h += '<div class="card tight"><div class="row"><div class="grow"><div class="t">Body fat</div><div class="s">' + (bf.measured ? "From your waist and neck. Always a range." : "A rough guess until you measure waist and neck.") + '</div></div><div class="r num" style="color:var(--txt);font-weight:800">' + bf.lo + " to " + bf.hi + '%</div></div><div class="row"><div class="grow"><div class="t">Muscle score</div><div class="s">Muscle for your height. The natural limit is about 25.</div></div><div class="r num" style="color:var(--txt);font-weight:800">' + ffmi(lean, hM).toFixed(1) + "</div></div></div>";
  // measurements
  h += '<h2>Tape, once a month</h2><div class="card tight">' + MEASURE_SITES.map(m => { const l = latestM(m[0]), last = l[l.length - 1], prev = l[l.length - 2], df = last && prev ? last.cm - prev.cm : null;
    return '<button class="row" style="width:100%" data-a="measure" data-site="' + m[0] + '"><div class="grow"><div class="t">' + m[1] + '</div><div class="s">' + (last ? niceDate(last.d) + (df != null ? ", " + (Math.abs(df) < 1 ? "no clear change" : (df > 0 ? "+" : "") + df.toFixed(1) + " cm") : "") : esc(m[2])) + '</div></div><div class="r num">' + (last ? last.cm.toFixed(1) + " cm" : "Add") + '</div><span class="chev">›</span></button>'; }).join("") + "</div>";
  // photos
  h += '<h2>Photos, once a month</h2><div class="card"><div class="pgrid">' + POSES.map(p => { const l = S.photos.filter(x => x.pose === p[0]).sort((a, b) => a.d < b.d ? -1 : 1), last = l[l.length - 1];
    return '<button class="ph" data-a="compare" data-pose="' + p[0] + '">' + (last ? '<img data-ph="' + last.photoId + '" alt=""><div class="cap">' + niceDate(last.d) + "</div>" : p[1]) + "</button>"; }).join("") +
    '</div><div class="btns" style="margin-top:12px"><button class="btn small" data-a="addPhoto">Add photos</button><button class="btn small ghost" data-a="compare" data-pose="' + UI.cmpPose + '">Compare</button></div><p class="sub" style="margin:10px 0 0;font-size:13px">Photos stay on this phone only. They are never uploaded. Keep the originals in your Photos app too.</p></div>';
  // future
  h += "<h2>Future you, honestly</h2>" + futureCard(W, bf, hM);
  return h;
}
function futureCard(W, bf, hM) {
  const lean = W * (1 - bf.mid / 100), cap = leanCap(hM), at = (mo, k) => { const b = mo <= 12 ? 0.13 : mo <= 24 ? 0.12 : 0.11; return Math.min(cap, lean + leanGain(mo, k)) / (1 - b); };
  const rows = [[3, "3 months"], [6, "6 months"], [12, "1 year"], [24, "2 years"], [60, "5 years"]];
  const t0 = dayNum(today()), xs = [0, 3, 6, 9, 12, 18, 24], line = k => xs.map(m => [t0 + m * 30.44, at(m, k)]);
  const tr = trendSeries(weightList()).map(x => [dayNum(x.d), x.trend]);
  const move = (dayNum("2027-06-25") - t0) / 30.44;
  let h = '<div class="card"><p class="sub" style="margin:0 0 10px">No fake pictures. These are honest ranges for a natural lifter who trains, eats and sleeps right. Slow, average and fast.</p>' +
    lineChart([{ pts: line(1), color: "#5b5b63", w: 2, dash: "4 4" }, { pts: line(3), color: "#5b5b63", w: 2, dash: "4 4" }, { pts: line(2), color: "#d6ff3f", w: 2.8 }].concat(tr.length > 1 ? [{ pts: tr, color: "#ffffff", w: 2.4 }] : []), { xf: n => { const t = new Date(n * 864e5); return MONTHS[t.getUTCMonth()] + " " + t.getUTCFullYear(); }, h: 180, yf: v => Math.round(v) }) +
    '<table class="ft num"><tr><th>When</th><th>Slow</th><th>Average</th><th>Fast</th></tr>' + rows.map(r => "<tr><td>" + r[1] + "</td><td>" + at(r[0], 1).toFixed(0) + '</td><td class="mid">' + at(r[0], 2).toFixed(0) + " kg</td><td>" + at(r[0], 3).toFixed(0) + "</td></tr>").join("") + "</table>";
  if (move > 0.5) h += '<p class="sub" style="margin:12px 0 0">When you fly in late June 2027: about <b style="color:var(--txt)">' + at(move, 1).toFixed(0) + " to " + at(move, 3).toFixed(0) + " kg</b>, lean. More than that is mostly fat.</p>";
  h += '<p class="sub" style="margin:8px 0 0;font-size:13px">The white line is your real trend. Body weight is shown lean, at about 11 to 13% body fat. The natural limit at your height is about ' + Math.round(cap / 0.89) + " kg at 11%. Almost nobody gets there.</p></div>";
  return h;
}
ACT.measure = el => {
  const m = MEASURE_SITES.find(x => x[0] === el.dataset.site), l = latestM(m[0]);
  openSheet("<h3>" + m[1] + "</h3><p>Measure " + esc(m[2]) + '. Morning, before food. Tape snug, not tight. Breathe out normally.</p><div class="field" style="margin-bottom:12px"><input class="inp num" id="mIn" inputmode="decimal" placeholder="number"><div class="seg" style="margin:0;flex:none;width:120px"><button class="on" data-a="mUnit" data-v="cm">cm</button><button data-a="mUnit" data-v="in">inch</button></div></div><button class="btn" data-a="measureSave" data-site="' + m[0] + '">Save</button>' +
    (l.length ? '<h2>History</h2><div class="card tight">' + l.slice().reverse().slice(0, 24).map(x => '<div class="row"><div class="grow"><div class="t num">' + x.cm.toFixed(1) + " cm <span class=\"mut\" style=\"font-weight:500\">(" + (x.cm / 2.54).toFixed(1) + ' in)</span></div><div class="s">' + niceDate(x.d) + '</div></div><button class="r red" data-a="measureDel" data-id="' + x.id + '">Delete</button></div>').join("") + "</div>" : ""));
  UI.mUnit = "cm";
};
ACT.mUnit = el => { UI.mUnit = el.dataset.v; $$("[data-a=mUnit]").forEach(b => b.classList.toggle("on", b === el)); };
ACT.measureSave = el => { let v = numIn($("#mIn").value); if (!(v > 0)) return toast("Type the number."); if (UI.mUnit === "in") v *= 2.54; if (v < 15 || v > 200) return toast("That number looks wrong. Check cm or inch."); addEvent("measure.logged", { site: el.dataset.site, cm: Math.round(v * 10) / 10 }); closeSheet(); render(); };
ACT.measureDel = el => { addEvent("entity.deleted", { ref: el.dataset.id }); closeSheet(); render(); };

// photos
ACT.addPhoto = () => openSheet('<h3>Add photos</h3><p>Same spot, same light, same time of day. Phone at belly height, about 2 metres away. Relaxed, no pump.</p><div class="field" style="margin-bottom:12px"><span class="mut" style="flex:none">Taken on</span><input class="inp" type="date" id="phD" value="' + today() + '" max="' + today() + '"></div><div class="fgrid">' + POSES.map(p => '<button class="btn ghost" data-a="pickPhoto" data-pose="' + p[0] + '">' + p[1] + "</button>").join("") + "</div>");
ACT.pickPhoto = el => { const inp = $("#photoIn"); inp.dataset.pose = el.dataset.pose; inp.dataset.d = ($("#phD") && $("#phD").value) || today(); inp.value = ""; inp.click(); };
async function onPhoto(file, pose, d) {
  try {
    const url = URL.createObjectURL(file), img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const sc = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    const blob = await new Promise(res => c.toBlob(res, "image/jpeg", 0.8)), buf = await blob.arrayBuffer(), photoId = "p" + uid();
    await mediaPut(photoId, buf, "image/jpeg"); addEvent("photo.added", { pose, photoId }, d);
    toast("Photo saved on this phone"); render();
  } catch (e) { toast("Could not read that photo. Try another one."); }
}
async function photoUrl(id) { if (PH_URL[id]) return PH_URL[id]; const m = await mediaGet(id).catch(() => null); if (!m) return null; return PH_URL[id] = URL.createObjectURL(new Blob([m.buf], { type: m.type })); }
function hydratePhotos(root) { $$("img[data-ph]", root).forEach(async im => { const u = await photoUrl(im.dataset.ph); if (u) im.src = u; else im.replaceWith(Object.assign(document.createElement("span"), { textContent: "On another phone" })); }); }
ACT.compare = el => { UI.cmpPose = el.dataset.pose || UI.cmpPose; UI.cmpA = UI.cmpB = null; compareSheet(); };
function compareSheet() {
  const l = S.photos.filter(x => x.pose === UI.cmpPose).sort((a, b) => a.d < b.d ? -1 : 1);
  const a = l.find(x => x.id === UI.cmpA) || l[0], b = l.find(x => x.id === UI.cmpB) || l[l.length - 1];
  const sel = (cur, key) => '<select class="inp" style="font-size:15px" data-sel="' + key + '">' + l.map(x => '<option value="' + x.id + '"' + (cur && x.id === cur.id ? " selected" : "") + ">" + niceDate(x.d) + (x.d.slice(0, 4) !== today().slice(0, 4) ? "" : "") + "</option>").join("") + "</select>";
  let h = "<h3>Compare</h3>" + '<div class="chips" style="margin-bottom:12px">' + POSES.map(p => '<button class="chip' + (p[0] === UI.cmpPose ? " on" : "") + '" data-a="compare" data-pose="' + p[0] + '">' + p[1] + "</button>").join("") + "</div>";
  if (!l.length) h += '<p>No ' + UI.cmpPose + ' photos yet.</p><button class="btn" data-a="addPhoto">Add photos</button>';
  else if (l.length === 1) h += '<div class="cmp"><img data-ph="' + a.photoId + '" alt=""><div class="lab" style="left:10px">' + niceDate(a.d) + '</div></div><p style="margin-top:12px">One photo so far. Add the next one in a month and slide between them.</p><button class="btn red" data-a="photoDel" data-id="' + a.id + '">Delete this photo</button>';
  else h += '<div class="cmp" id="cmp"><img data-ph="' + b.photoId + '" alt=""><div class="topw" style="width:50%"><img data-ph="' + a.photoId + '" alt="" id="cmpTop"></div><div class="hnd" style="left:50%"></div><div class="lab" style="left:10px">' + niceDate(a.d) + '</div><div class="lab" style="right:10px">' + niceDate(b.d) + '</div></div><p style="margin:10px 0">Drag the line left and right.</p><div class="field" style="margin-bottom:12px">' + sel(a, "cmpA") + sel(b, "cmpB") + '</div><button class="btn red" data-a="photoDel" data-id="' + b.id + '">Delete the ' + niceDate(b.d) + " photo</button>";
  openSheet(h); hydratePhotos($("#sheet")); fitCmp();
}
function fitCmp() { const box = $("#cmp"); if (!box) return; const top = $("#cmpTop"); top.style.width = box.clientWidth + "px"; top.style.height = box.clientHeight + "px"; }
function cmpDrag(e) { const box = e.target.closest && e.target.closest("#cmp"); if (!box) return; const r = box.getBoundingClientRect(), pc = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); $(".topw", box).style.width = pc + "%"; $(".hnd", box).style.left = pc + "%"; e.preventDefault(); }
document.addEventListener("pointerdown", cmpDrag); document.addEventListener("pointermove", e => { if (e.buttons || e.pointerType === "touch") cmpDrag(e); }, { passive: false });
document.addEventListener("change", e => { const el = e.target; if (el.dataset && el.dataset.sel) { UI[el.dataset.sel] = el.value; compareSheet(); } if (el.id === "photoIn" && el.files[0]) { closeSheet(); onPhoto(el.files[0], el.dataset.pose, el.dataset.d); } if (el.id === "importIn" && el.files[0]) doImport(el.files[0]); if (el.id === "volIn") { addEvent("settings.upserted", { vol: +el.value }); ensureAudio(); beep(); } });
ACT.photoDel = el => { const p = S.photos.find(x => x.id === el.dataset.id); if (p) { addEvent("entity.deleted", { ref: p.id }, p.d); mediaDel(p.photoId).catch(() => {}); } closeSheet(); render(); };

// ----- Settings -----
function vMore() {
  const st = S.settings, s = syncStatus(), wi = weekInfo(today());
  let h = '<div class="top"><div><h1>Settings</h1></div></div>' + bannerHtml();
  h += '<h2>Your data</h2><div class="card"><div class="kv" style="margin-bottom:12px"><div style="font-weight:800;font-size:17px"><span class="dot ' + s.c + '" style="display:inline-block;margin-right:8px" data-syncdot></span><span data-synctxt>' + esc(s.t) + '</span></div><div class="mut num" style="font-size:13px">' + EV.length + " entries</div></div>" +
    (KV.token ? '<div class="btns"><button class="btn small" data-a="syncNow">Save now</button><button class="btn small ghost" data-a="restore">Get everything back</button></div>' : '<button class="btn" data-a="keySetup">Set up my key</button>') +
    '<div class="btns" style="margin-top:10px"><button class="btn small ghost" data-a="exportAll">Export a backup file</button><button class="btn small ghost" data-a="importAll">Import a file</button></div>' + (KV.token ? '<button class="btn small ghost" data-a="keySetup" style="width:100%;margin-top:10px">Change my key</button>' : "") +
    '<p class="sub" style="margin:12px 0 0;font-size:13px">The real copy lives in your private nitfit-data on GitHub. This phone only holds a copy. New phone: add NitFit to the Home Screen, paste your key, done.</p></div>';
  h += '<h2>My plan</h2><div class="card tight">' + DAY_ORDER.map(k => '<button class="row" style="width:100%" data-a="planDay" data-day="' + k + '"><div class="grow"><div class="t">' + DAY_NAMES[k] + '</div><div class="s">' + WEEKDAYS[S.dayMap.indexOf(k)] + ", " + (S.plan[k] || []).length + ' exercises</div></div><span class="chev">›</span></button>').join("") + '<button class="row" style="width:100%" data-a="newEx"><div class="grow"><div class="t">Add my own exercise</div><div class="s">For a machine that is not on the list</div></div><span class="chev">›</span></button></div>';
  h += '<h2>Coach</h2><div class="card tight"><button class="row" style="width:100%" data-a="targets"><div class="grow"><div class="t">My targets</div><div class="s num">' + st.kcal + " kcal, " + st.protein + " g protein, " + st.heightCm + ' cm</div></div><span class="chev">›</span></button>' +
    '<div class="row"><div class="grow"><div class="t">Easy week</div><div class="s">Week ' + wi.week + " of 6. " + (wi.easy ? "This week is easy." : "Comes every 6th week.") + '</div></div><button class="chip' + (wi.easy ? " on" : "") + '" data-a="easySet">' + (wi.easy ? "On" : "Make this week easy") + "</button></div>" +
    '<button class="row" style="width:100%" data-a="excludeWeek"><div class="grow"><div class="t">Skip this week\'s food check</div><div class="s">' + (st.exclude ? "Skipping: " + esc(st.exclude.why) : "Sick, travel, festival or just started creatine") + '</div></div><span class="chev">›</span></button></div>';
  h += '<h2>Rest timer</h2><div class="card tight"><div class="row"><div class="grow"><div class="t">Rest timer</div><div class="s">Starts when you tick a set</div></div><button class="chip' + (st.restOn ? " on" : "") + '" data-a="setFlag" data-k="restOn">' + (st.restOn ? "On" : "Off") + "</button></div>" +
    '<div class="row"><div class="grow"><div class="t">Sound</div><div class="s">Move it to hear it</div></div><input type="range" id="volIn" min="0" max="1" step="0.1" value="' + st.vol + '" style="width:130px;accent-color:#d6ff3f"></div>' +
    '<div class="row"><div class="grow"><div class="t">Play over my music</div><div class="s">' + (st.mix ? "Mixes with music. Silent if the phone is on silent." : "Always plays. May pause your music.") + '</div></div><button class="chip' + (st.mix ? " on" : "") + '" data-a="setFlag" data-k="mix">' + (st.mix ? "Mix" : "Always") + "</button></div>" +
    '<div class="row"><div class="grow"><div class="t">Test</div></div><button class="chip" data-a="testSound">Play sound</button></div></div>';
  h += '<h2>Reminders</h2><div class="card"><p class="sub" style="margin:0">NitFit cannot send alerts by itself. Use the iPhone Reminders app: one for the gym at 6:45 AM, one for each meal. Set them to repeat daily.</p></div>';
  h += '<p class="sub" style="text-align:center;font-size:12px;margin-top:22px">NitFit ' + APP_VERSION + (KV.persist === true ? " · storage protected" : "") + "</p>";
  return h;
}
ACT.syncNow = async () => { toast("Saving..."); const ok = await syncNow(); toast(ok ? "Saved to GitHub" : (KV.syncErr || "Could not save")); render(); };
ACT.restore = async () => { toast("Getting everything from GitHub..."); const ok = await syncNow(true); toast(ok ? "Everything is here. " + EV.length + " entries." : (KV.syncErr || "Could not reach GitHub")); render(); };
ACT.keySetup = () => openSheet('<h3>Set up your key</h3><p>The key lets NitFit save into your private nitfit-data box on GitHub. One time, about 3 minutes. Easier on your laptop, then send the key to your phone.</p><ol class="steps">' +
  '<li><a href="https://github.com/settings/personal-access-tokens/new?name=NitFit&expires_in=none&contents=write" target="_blank" rel="noopener">Open the key page</a> and sign in.</li><li><b>Expiration:</b> pick <b>No expiration</b>.</li><li><b>Repository access:</b> tap <b>Only select repositories</b>, then pick <b>nitfit-data</b>.</li><li><b>Permissions:</b> add <b>Contents</b> and set it to <b>Read and write</b>.</li><li>Tap <b>Generate token</b> and copy the long code. It starts with github_pat_.</li><li>Paste it below.</li></ol>' +
  '<input class="inp" id="keyIn" placeholder="github_pat_..." autocomplete="off" autocapitalize="off" spellcheck="false" style="font-size:15px;font-weight:500"><div class="err" id="keyErr"></div><button class="btn" data-a="keyConnect">Connect</button><div style="height:10px"></div><button class="btn ghost" data-a="keyLater">Later</button><p style="margin-top:12px;font-size:13px">Treat the key like a password. It is saved only on this phone, never in the app code.</p>');
ACT.keyLater = () => { kvSet("skipSetup", true); closeSheet(); };
ACT.keyConnect = async el => {
  const err = $("#keyErr"); err.textContent = ""; el.disabled = true; el.textContent = "Connecting...";
  try { await connectKey($("#keyIn").value); closeSheet(); toast("Connected. Your data is backed up."); render(); }
  catch (e) { err.textContent = e.message || "Could not connect."; el.disabled = false; el.textContent = "Connect"; }
};
ACT.exportAll = async () => {
  const text = JSON.stringify(buildExport()), name = "nitfit-backup-" + today() + ".json", file = new File([text], name, { type: "application/json" });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click(); a.remove();
};
ACT.importAll = () => { const i = $("#importIn"); i.value = ""; i.click(); };
async function doImport(file) { try { const n = await importExport(JSON.parse(await file.text())); toast(n ? n + " entries added" : "Nothing new in that file"); render(); } catch (e) { toast(e.message || "Could not read that file"); } }
ACT.setFlag = el => { const k = el.dataset.k; addEvent("settings.upserted", { [k]: !S.settings[k] }); if (k === "mix") ensureAudio(); render(); };
ACT.testSound = () => { ensureAudio(); beep(); };
ACT.easySet = () => { const wi = weekInfo(today()); addEvent("settings.upserted", wi.easy ? { easyOff: wi.ws, easyOn: null } : { easyOn: wi.ws, easyOff: null }); if (!S.settings.blockStart) addEvent("settings.upserted", { blockStart: today() }); render(); };
ACT.excludeWeek = () => openSheet('<h3>Skip this week\'s food check</h3><p>Some weeks your weight lies. Pick why and NitFit will not change your calories this Saturday.</p><div class="chips">' + ["Sick", "Travel", "Festival", "Started creatine"].map(w => '<button class="chip" data-a="excludeSet" data-v="' + w + '">' + w + "</button>").join("") + '<button class="chip" data-a="excludeSet" data-v="">Count this week</button></div>');
ACT.excludeSet = el => { const t = today(), n = (6 - dow(t) + 7) % 7 || 7; addEvent("settings.upserted", { exclude: el.dataset.v ? { ws: addDays(t, n), why: el.dataset.v.toLowerCase() } : null }); closeSheet(); render(); };
ACT.targets = () => { const st = S.settings, f = (id, label, v, hint) => '<div class="row"><div class="grow"><div class="t">' + label + '</div><div class="s">' + hint + '</div></div><input class="inp num" id="' + id + '" inputmode="decimal" value="' + v + '" style="width:110px"></div>';
  openSheet('<h3>My targets</h3><p>The Saturday check moves calories for you. Change these only if you know why.</p><div class="card tight">' + f("tK", "Calories", st.kcal, "per day") + f("tP", "Protein", st.protein, "grams per day") + f("tH", "Height", st.heightCm, "cm") + f("tB", "Body fat guess", st.bfGuess, "percent") + f("tS", "Bad sleep is under", st.sleepBadH, "hours") + f("tG", "Gain goal", st.goalRate, "kg per week") + '</div><button class="btn" data-a="targetsSave">Save</button>'); };
ACT.targetsSave = () => { const g = id => numIn($("#" + id).value), p = { kcal: Math.round(g("tK")), protein: Math.round(g("tP")), heightCm: g("tH"), bfGuess: g("tB"), sleepBadH: g("tS"), goalRate: g("tG") }; if (!(p.kcal > 1200 && p.kcal < 6000 && p.protein > 30 && p.protein < 300 && p.heightCm > 120 && p.heightCm < 230 && p.bfGuess > 3 && p.bfGuess < 50 && p.sleepBadH > 3 && p.sleepBadH < 10 && p.goalRate >= 0 && p.goalRate < 1)) return toast("One of those numbers looks wrong."); addEvent("settings.upserted", p); closeSheet(); render(); };
// plan editor
ACT.planDay = el => { UI.planDraft = clone(S.plan); UI.planK = el.dataset.day; planSheet(); };
function planSheet() {
  const k = UI.planK, items = UI.planDraft[k] || (UI.planDraft[k] = []), sc = $("#sheet .pn").scrollTop;
  openSheet("<h3>" + DAY_NAMES[k] + '</h3><p>Change it, then tap Save. Keep the first big lift the same for a whole 6 weeks.</p><div class="card tight">' + items.map((it, i) => { const ex = getEx(it.ex); return '<div class="row"><div class="grow"><div class="t">' + esc(ex ? ex.n : it.ex) + '</div><div class="s"><button class="acc" data-a="planMove" data-i="' + i + '" data-v="-1">Up</button> · <button class="acc" data-a="planMove" data-i="' + i + '" data-v="1">Down</button> · <button class="red" data-a="planDel" data-i="' + i + '">Remove</button></div></div><div class="stepper"><button data-a="planSets" data-i="' + i + '" data-v="-1">-</button><span class="num">' + it.sets + '</span><button data-a="planSets" data-i="' + i + '" data-v="1">+</button></div></div>'; }).join("") + '</div><button class="btn ghost" data-a="planAddPick">Add an exercise</button><div style="height:10px"></div><button class="btn" data-a="planSave">Save</button>');
  $("#sheet .pn").scrollTop = sc;
}
ACT.planSets = el => { const it = UI.planDraft[UI.planK][+el.dataset.i]; it.sets = Math.max(1, Math.min(8, it.sets + +el.dataset.v)); planSheet(); };
ACT.planMove = el => { const a = UI.planDraft[UI.planK], i = +el.dataset.i, j = i + +el.dataset.v; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; planSheet(); };
ACT.planDel = el => { UI.planDraft[UI.planK].splice(+el.dataset.i, 1); planSheet(); };
ACT.planAddPick = () => exPicker("planAdd", "Add to " + DAY_NAMES[UI.planK]);
ACT.planAdd = el => { const a = UI.planDraft[UI.planK]; if (!a.some(x => x.ex === el.dataset.ex)) a.push({ ex: el.dataset.ex, sets: 3 }); planSheet(); };
ACT.planSave = () => { addEvent("plan.upserted", { plan: UI.planDraft }); closeSheet(); toast("Plan saved"); render(); };
ACT.newEx = () => openSheet('<h3>Add my own exercise</h3><input class="inp" id="nxN" placeholder="Name" style="margin-bottom:10px;font-size:16px;font-weight:600"><h2>Muscle</h2><select class="inp" id="nxM" style="font-size:16px">' + MUSCLES.concat(["Adductors", "Neck"]).map(m => "<option>" + m + "</option>").join("") + '</select><h2>What you lift</h2><select class="inp" id="nxE" style="font-size:16px"><option value="machine">Machine</option><option value="cable">Cable</option><option value="db">Dumbbells</option><option value="bb">Barbell</option><option value="smith">Smith machine</option><option value="bw">Bodyweight</option></select><div style="height:14px"></div><button class="btn" data-a="newExSave">Save</button>');
ACT.newExSave = () => { const n = $("#nxN").value.trim(), eq = $("#nxE").value; if (!n) return toast("Give it a name."); addEvent("exercise.upserted", { exId: "c_" + uid(), custom: true, n, m: $("#nxM").value, s: [], eq, kind: "i", r: [10, 15], rest: 90, step: STEP_BY_EQ[eq], cue: "" }); closeSheet(); toast("Saved. Add it to a day in My plan."); render(); };

// ----- router and start-up -----
const VIEWS = { today: vToday, progress: vProgress, food: vFood, body: vBody, more: vMore };
function render() {
  if (!S) return; const app = $("#app"); app.innerHTML = VIEWS[TAB](); hydratePhotos(app);
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === TAB));
}
ACT.tab = el => { TAB = el.dataset.tab; render(); window.scrollTo(0, 0); };
document.addEventListener("click", e => { const el = e.target.closest("[data-a]"); if (!el) return; const f = ACT[el.dataset.a]; if (f) f(el, e); });
async function boot() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  if (ios && !standalone) {
    $("#tabs").style.display = "none";
    $("#app").innerHTML = '<div class="center"><h1>Put NitFit on your Home Screen</h1><p class="sub" style="margin:8px 0 18px">NitFit only works from its own icon. That keeps your data in one safe place.</p><div class="card"><ol class="steps" style="margin:0"><li>Tap the <b>Share</b> button (the square with the arrow).</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li><li>Close Safari. Open <b>NitFit</b> from the new icon.</li></ol></div><p class="sub" style="font-size:13px">Always open it from the icon, never from a link in Safari.</p></div>';
    return;
  }
  try { await coreBoot(); } catch (e) { $("#app").innerHTML = '<div class="center"><h1>Storage is blocked</h1><p class="sub">NitFit could not open its storage on this phone. Close it and open it again. If you are in Private Browsing, turn that off.</p></div>'; return; }
  try { if (navigator.storage && navigator.storage.persist && KV.persist == null) kvSet("persist", await navigator.storage.persist()); } catch (_) {}
  try { const r = JSON.parse(localStorage.getItem("nitfit:rest") || "null"); if (r && r.end > Date.now() - 15000) { REST = r; REST.fired = REST.end < Date.now(); restIv = setInterval(paintRest, 250); } } catch (_) {}
  render();
  if (KV.token) syncNow(); else if (!KV.skipSetup) ACT.keySetup();
  setInterval(() => { if (!document.hidden && KV.token) syncNow(); syncPaint(); }, 5 * 60e3);
  setInterval(syncPaint, 30e3);
  addEventListener("online", () => syncNow());
  let lastDay = today(); setInterval(() => { if (today() !== lastDay) { lastDay = today(); render(); } }, 60e3);
}
boot();
