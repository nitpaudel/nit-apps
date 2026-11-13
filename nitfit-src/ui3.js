// ---------------------------------------------------------------------------
// Screens, part 3: Body, Settings, the router and start-up.
// ---------------------------------------------------------------------------

const latestM = site => S.measures.filter(m => m.site === site).sort((a, b) => a.d < b.d ? -1 : 1);
const PH_URL = {};
function curWeight() { const tr = trendSeries(weightList()); return tr.length ? tr[tr.length - 1].trend : 60; }

function bfRange() {
  const w = latestM("waist").pop(), n = latestM("neck").pop(), g = S.settings.bfGuess;
  if (w && n) {
    const v = navyBf(w.cm, n.cm, S.settings.heightCm);
    if (v != null) { const mid = (v + 2.6 + g) / 2; return { lo: Math.max(4, Math.round(mid - 3)), hi: Math.round(mid + 3), mid, measured: true }; }
  }
  return { lo: Math.max(4, g - 4), hi: g + 1, mid: g, measured: false };
}

function vBody() {
  const st = S.settings, hM = st.heightCm / 100, W = curWeight(), bf = bfRange(), lean = W * (1 - bf.mid / 100);
  const sh = latestM("shoulders").pop(), wa = latestM("waist").pop();
  const ratio = sh && wa ? sh.cm / wa.cm : null;

  let h = '<div class="top"><div><div class="eyebrow">The shape you are chasing</div><h1>Body</h1></div>' + syncChip() + "</div>";

  // the V
  h += '<div class="card"><div class="top" style="margin-bottom:6px">'
    + '<div><div class="eyebrow">Shoulder to waist</div><div class="display num">' + (ratio ? ratio.toFixed(2) : "?") + "</div></div>"
    + '<div style="text-align:right"><div class="eyebrow">Target</div><div class="num" style="font-size:26px;font-weight:800;letter-spacing:-.03em">1.60</div></div></div>';
  if (ratio) {
    h += '<div class="meter"><i style="width:' + Math.max(4, Math.min(100, (ratio - 1.2) / 0.4 * 100)) + '%"></i></div>'
      + '<p class="tiny" style="margin-top:10px">At the waist you have now, 1.60 means <b style="color:var(--t0)">' + Math.round(wa.cm * 1.6)
      + ' cm shoulders</b>. You are at ' + Math.round(sh.cm) + " cm. Keep the waist, build the shoulders.</p>";
  } else {
    h += '<p class="tiny" style="margin-top:10px">Measure your shoulders and waist below and this switches on. It is the single number that decides whether you look the way you want.</p>';
  }
  h += "</div>";

  h += '<div class="card flush">'
    + '<div class="row"><div class="grow"><div class="t">Body fat</div><div class="s">'
    + (bf.measured ? "Worked out from your waist and neck. Always a range." : "A guess until you measure waist and neck.")
    + '</div></div><div class="r num" style="color:var(--t0);font-weight:800">' + bf.lo + " to " + bf.hi + '%</div></div>'
    + '<div class="row"><div class="grow"><div class="t">Muscle score</div><div class="s">Muscle for your height. About 25 is the natural ceiling.</div></div>'
    + '<div class="r num" style="color:var(--t0);font-weight:800">' + ffmi(lean, hM).toFixed(1) + "</div></div></div>";

  // tape
  h += '<h2>Tape, once a month</h2><div class="card flush">' + MEASURE_SITES.map(m => {
    const l = latestM(m[0]), last = l[l.length - 1], prev = l[l.length - 2];
    const df = last && prev ? last.cm - prev.cm : null;
    return '<button class="row" data-a="measure" data-site="' + m[0] + '"><div class="grow"><div class="t">' + m[1] + '</div>'
      + '<div class="s">' + (last ? niceDate(last.d) + (df != null ? ", " + (Math.abs(df) < 0.4 ? "no real change" : (df > 0 ? "+" : "") + df.toFixed(1) + " cm") : "") : esc(m[2])) + "</div></div>"
      + '<div class="r num">' + (last ? last.cm.toFixed(1) + " cm" : "Add") + '</div><span class="chev">' + ICON.chev + "</span></button>";
  }).join("") + "</div>";

  // photos
  h += '<h2>Photos, once a month</h2><div class="card"><div class="btns">'
    + POSES.map(p => {
      const l = S.photos.filter(x => x.pose === p[0]);
      return '<button class="btn ghost sm" data-a="compare" data-pose="' + p[0] + '">' + p[1] + (l.length ? " (" + l.length + ")" : "") + "</button>";
    }).join("") + "</div>"
    + '<div style="height:10px"></div><button class="btn" data-a="addPhoto">Add photos</button>'
    + '<p class="tiny" style="margin-top:14px">Same spot, same light, same time of day, relaxed and no pump. Photos never leave this phone. Keep the originals in your camera roll too.</p></div>';

  // future
  h += "<h2>Where this ends up</h2>" + futureCard(W, bf, hM);
  return h;
}

function futureCard(W, bf, hM) {
  const lean = W * (1 - bf.mid / 100), cap = leanCap(hM);
  const at = (mo, k) => { const b = mo <= 12 ? 0.13 : mo <= 24 ? 0.12 : 0.11; return Math.min(cap, lean + leanGain(mo, k)) / (1 - b); };
  const rows = [[3, "3 months"], [6, "6 months"], [12, "1 year"], [24, "2 years"], [60, "5 years"]];
  const t0 = dayNum(today()), xs = [0, 3, 6, 9, 12, 18, 24];
  const line = k => xs.map(m => [t0 + m * 30.44, at(m, k)]);
  const tr = trendSeries(weightList()).map(x => [dayNum(x.d), x.trend]);
  const move = (dayNum("2027-06-25") - t0) / 30.44;

  let h = '<div class="card"><p class="tiny" style="margin:0 0 14px">No fake before and after pictures. These are honest ranges for someone training natural who eats and sleeps properly. Slow, average, fast.</p>'
    + lineChart([
        { pts: line(1), color: "var(--t3)", w: 1.8, dash: "4 4" },
        { pts: line(3), color: "var(--t3)", w: 1.8, dash: "4 4" },
        { pts: line(2), color: "var(--t1)", w: 2.4 },
      ].concat(tr.length > 1 ? [{ pts: tr, color: "var(--t0)", w: 2.6 }] : []),
      { xf: n => { const t = new Date(n * 864e5); return MONTHS[t.getUTCMonth()] + " " + String(t.getUTCFullYear()).slice(2); }, h: 180, yf: v => Math.round(v) })
    + '<div style="overflow-x:auto;margin-top:14px"><table class="num" style="width:100%;border-collapse:collapse;font-size:14px">'
    + '<tr><th style="text-align:left;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--t2);padding-bottom:8px">When</th>'
    + '<th style="font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--t2)">Slow</th>'
    + '<th style="font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--t2)">Likely</th>'
    + '<th style="font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--t2)">Fast</th></tr>'
    + rows.map(r => '<tr><td style="padding:7px 0;color:var(--t1);font-weight:600">' + r[1] + '</td>'
      + '<td style="text-align:center;color:var(--t2)">' + at(r[0], 1).toFixed(0) + '</td>'
      + '<td style="text-align:center;font-weight:800">' + at(r[0], 2).toFixed(0) + ' kg</td>'
      + '<td style="text-align:center;color:var(--t2)">' + at(r[0], 3).toFixed(0) + "</td></tr>").join("") + "</table></div>";
  if (move > 0.5) {
    h += '<p class="tiny" style="margin-top:14px">When you fly out in mid 2027: about <b style="color:var(--t0)">' + at(move, 1).toFixed(0)
      + " to " + at(move, 3).toFixed(0) + " kg</b>, lean. Anything above that is fat, not muscle.</p>";
  }
  h += '<p class="tiny" style="margin-top:8px">The solid line is your real trend. Weights shown lean, around 11 to 13 percent. At your height the natural ceiling is roughly '
    + Math.round(cap / 0.89) + " kg. Almost nobody gets there.</p></div>";
  return h;
}

ACT.measure = el => {
  const m = MEASURE_SITES.find(x => x[0] === el.dataset.site), l = latestM(m[0]);
  UI.mUnit = "cm";
  openSheet("<h3>" + m[1] + "</h3><p>Measure " + esc(m[2]) + ". Morning, before food. Tape snug, not tight. Breathe out normally.</p>"
    + '<div class="field" style="margin-bottom:14px"><input class="inp num" id="mIn" inputmode="decimal" placeholder="number">'
    + '<div class="seg" style="margin:0;flex:none;width:118px"><button class="on" data-a="mUnit" data-v="cm">cm</button><button data-a="mUnit" data-v="in">inch</button></div></div>'
    + '<button class="btn" data-a="measureSave" data-site="' + m[0] + '">Save</button>'
    + (l.length ? '<h2>History</h2><div class="card flush">' + l.slice().reverse().slice(0, 24).map(x =>
        '<div class="row"><div class="grow"><div class="t num">' + x.cm.toFixed(1) + ' cm <span class="mut" style="font-weight:500">(' + (x.cm / 2.54).toFixed(1) + ' in)</span></div>'
        + '<div class="s">' + niceDate(x.d) + '</div></div><button class="r" style="color:var(--m2)" data-a="measureDel" data-id="' + x.id + '">Delete</button></div>').join("") + "</div>" : ""));
};
ACT.mUnit = el => { UI.mUnit = el.dataset.v; $$("[data-a=mUnit]").forEach(b => b.classList.toggle("on", b === el)); };
ACT.measureSave = el => {
  let v = numIn($("#mIn").value);
  if (!(v > 0)) return toast("Type the number.");
  if (UI.mUnit === "in") v *= 2.54;
  if (v < 15 || v > 200) return toast("That looks wrong. Check cm or inch.");
  addEvent("measure.logged", { site: el.dataset.site, cm: Math.round(v * 10) / 10 });
  closeSheet(); haptic(); render();
};
ACT.measureDel = el => { addEvent("entity.deleted", { ref: el.dataset.id }); closeSheet(); render(); };

// ----- photos -----

ACT.addPhoto = () => openSheet('<h3>Add photos</h3><p>Same spot, same light, same time of day. Phone at belly height, about two metres back. Relaxed, no pump, no flexing.</p>'
  + '<div class="field" style="margin-bottom:14px"><span class="mut" style="flex:none;font-size:14px">Taken on</span>'
  + '<input class="inp" type="date" id="phD" value="' + today() + '" max="' + today() + '"></div>'
  + '<div class="btns">' + POSES.map(p => '<button class="btn ghost" data-a="pickPhoto" data-pose="' + p[0] + '">' + p[1] + "</button>").join("") + "</div>");
ACT.pickPhoto = el => {
  const inp = $("#photoIn");
  inp.dataset.pose = el.dataset.pose;
  inp.dataset.d = ($("#phD") && $("#phD").value) || today();
  inp.value = ""; inp.click();
};
async function onPhoto(file, pose, d) {
  try {
    const url = URL.createObjectURL(file), img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const sc = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    const blob = await new Promise(res => c.toBlob(res, "image/jpeg", 0.82));
    const buf = await blob.arrayBuffer(), photoId = "p" + uid();
    await mediaPut(photoId, buf, "image/jpeg");
    addEvent("photo.added", { pose, photoId }, d);
    toast("Saved on this phone"); render();
  } catch (e) { toast("Could not read that photo. Try another."); }
}
async function photoUrl(id) {
  if (PH_URL[id]) return PH_URL[id];
  const m = await mediaGet(id).catch(() => null);
  if (!m) return null;
  return PH_URL[id] = URL.createObjectURL(new Blob([m.buf], { type: m.type }));
}
function hydratePhotos(root) {
  $$("img[data-ph]", root).forEach(async im => {
    const u = await photoUrl(im.dataset.ph);
    if (u) im.src = u;
    else im.replaceWith(Object.assign(document.createElement("span"), { textContent: "On another phone", className: "mut tiny" }));
  });
}
ACT.compare = el => { UI.cmpPose = el.dataset.pose || UI.cmpPose; UI.cmpA = UI.cmpB = null; compareSheet(); };
function compareSheet() {
  const l = S.photos.filter(x => x.pose === UI.cmpPose).sort((a, b) => a.d < b.d ? -1 : 1);
  const a = l.find(x => x.id === UI.cmpA) || l[0], b = l.find(x => x.id === UI.cmpB) || l[l.length - 1];
  const sel = (cur, key) => '<select class="inp" style="font-size:15px" data-sel="' + key + '">'
    + l.map(x => '<option value="' + x.id + '"' + (cur && x.id === cur.id ? " selected" : "") + ">" + niceDate(x.d) + "</option>").join("") + "</select>";
  let h = "<h3>Compare</h3>" + '<div class="chips" style="margin-bottom:14px">'
    + POSES.map(p => '<button class="chip' + (p[0] === UI.cmpPose ? " on" : "") + '" data-a="compare" data-pose="' + p[0] + '">' + p[1] + "</button>").join("") + "</div>";
  if (!l.length) h += "<p>No " + UI.cmpPose + " photos yet.</p><button class=\"btn\" data-a=\"addPhoto\">Add photos</button>";
  else if (l.length === 1) h += '<div class="cmp"><img data-ph="' + a.photoId + '" alt=""><div class="lab" style="left:10px">' + niceDate(a.d) + "</div></div>"
    + "<p style=\"margin-top:14px\">One photo so far. Add the next in a month and you can slide between them.</p>"
    + '<button class="btn danger" data-a="photoDel" data-id="' + a.id + '">Delete this photo</button>';
  else h += '<div class="cmp" id="cmp"><img data-ph="' + b.photoId + '" alt="">'
    + '<div class="topw" style="width:50%"><img data-ph="' + a.photoId + '" alt="" id="cmpTop"></div>'
    + '<div class="hnd" style="left:50%"></div><div class="lab" style="left:10px">' + niceDate(a.d) + '</div>'
    + '<div class="lab" style="right:10px">' + niceDate(b.d) + "</div></div>"
    + '<p style="margin:12px 0">Drag the line across.</p>'
    + '<div class="field" style="margin-bottom:14px">' + sel(a, "cmpA") + sel(b, "cmpB") + "</div>"
    + '<button class="btn danger" data-a="photoDel" data-id="' + b.id + '">Delete the ' + niceDate(b.d) + " photo</button>";
  openSheet(h); hydratePhotos($("#sheet")); fitCmp();
}
function fitCmp() {
  const box = $("#cmp"); if (!box) return;
  const top = $("#cmpTop");
  top.style.width = box.clientWidth + "px"; top.style.height = box.clientHeight + "px";
}
function cmpDrag(e) {
  const box = e.target.closest && e.target.closest("#cmp"); if (!box) return;
  const r = box.getBoundingClientRect();
  const pc = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
  $(".topw", box).style.width = pc + "%";
  $(".hnd", box).style.left = pc + "%";
  e.preventDefault();
}
document.addEventListener("pointerdown", cmpDrag);
document.addEventListener("pointermove", e => { if (e.buttons || e.pointerType === "touch") cmpDrag(e); }, { passive: false });
document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset && el.dataset.sel) { UI[el.dataset.sel] = el.value; compareSheet(); }
  if (el.id === "photoIn" && el.files[0]) { closeSheet(); onPhoto(el.files[0], el.dataset.pose, el.dataset.d); }
  if (el.id === "importIn" && el.files[0]) doImport(el.files[0]);
  if (el.id === "volIn") { addEvent("settings.upserted", { vol: +el.value }); ensureAudio(); beep(); }
});
ACT.photoDel = el => {
  const p = S.photos.find(x => x.id === el.dataset.id);
  if (p) { addEvent("entity.deleted", { ref: p.id }, p.d); mediaDel(p.photoId).catch(() => {}); }
  closeSheet(); render();
};

// ----- Settings -----

function vMore() {
  const st = S.settings, s = syncStatus(), wi = weekInfo(today());
  let h = '<div class="top"><div><div class="eyebrow">NitFit ' + APP_VERSION + '</div><h1>Settings</h1></div></div>' + bannerHtml();

  h += '<h2>Look</h2><div class="card"><div class="seg" style="margin:0">'
    + [["dark", "Dark"], ["light", "Light"], ["system", "System"]].map(t =>
      '<button class="' + ((st.theme || "dark") === t[0] ? "on" : "") + '" data-a="theme" data-v="' + t[0] + '">' + t[1] + "</button>").join("")
    + "</div></div>";

  h += '<h2>Your data</h2><div class="card">'
    + '<div class="top" style="margin-bottom:14px"><div style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:9px">'
    + '<span class="dot ' + s.c + '" data-syncdot></span><span data-synctxt>' + esc(s.t) + "</span></div>"
    + '<div class="mut num" style="font-size:13px;font-weight:600">' + EV.length + " entries</div></div>"
    + (KV.token
      ? '<div class="btns"><button class="btn sm" data-a="syncNow">Save now</button><button class="btn ghost sm" data-a="restore">Pull it all back</button></div>'
      : '<button class="btn" data-a="keySetup">Set up the backup</button>')
    + '<div class="btns" style="margin-top:10px"><button class="btn ghost sm" data-a="exportAll">Export a file</button>'
    + '<button class="btn ghost sm" data-a="importAll">Import a file</button></div>'
    + (KV.token ? '<div style="height:10px"></div><button class="btn ghost sm" data-a="keySetup">Change the key</button>' : "")
    + '<p class="tiny" style="margin-top:14px">The real copy lives in your private box on GitHub. This phone only holds a copy. New phone: add NitFit to the Home Screen, paste the key, everything comes back.</p></div>';

  h += '<h2>Your week</h2><div class="card flush">'
    + DAY_ORDER.map(k => rowBtn("planDay", DAY_NAMES[k], WEEKDAYS[S.dayMap.indexOf(k)] + ", " + (S.plan[k] || []).length + " exercises", ' data-day="' + k + '"')).join("")
    + rowBtn("newEx", "Add your own exercise", "For a machine that is not on the list")
    + "</div>";

  h += '<h2>Coach</h2><div class="card flush">'
    + rowBtn("targets", "Your numbers", st.heightCm + " cm, " + st.bfGuess + "% body fat, bad sleep under " + st.sleepBadH + " h")
    + '<div class="row"><div class="grow"><div class="t">Easy week</div><div class="s">Week ' + wi.week + " of 6. "
    + (wi.easy ? "This one is easy." : "Comes round every sixth week.") + '</div></div>'
    + '<button class="chip' + (wi.easy ? " on" : "") + '" data-a="easySet">' + (wi.easy ? "On" : "Make it easy") + "</button></div></div>";

  h += '<h2>Rest timer</h2><div class="card flush">'
    + '<div class="row"><div class="grow"><div class="t">Rest timer</div><div class="s">Starts the moment you tick a set</div></div>'
    + '<button class="chip' + (st.restOn ? " on" : "") + '" data-a="setFlag" data-k="restOn">' + (st.restOn ? "On" : "Off") + "</button></div>"
    + '<div class="row"><div class="grow"><div class="t">Sound</div><div class="s">Slide it to hear it</div></div>'
    + '<input type="range" id="volIn" min="0" max="1" step="0.1" value="' + st.vol + '" style="width:128px;accent-color:var(--t0)"></div>'
    + '<div class="row"><div class="grow"><div class="t">Play over music</div><div class="s">'
    + (st.mix ? "Mixes in. Silent if the phone is on silent." : "Always plays. May pause your music.") + '</div></div>'
    + '<button class="chip' + (st.mix ? " on" : "") + '" data-a="setFlag" data-k="mix">' + (st.mix ? "Mix" : "Always") + "</button></div>"
    + '<div class="row"><div class="grow"><div class="t">Test it</div></div><button class="chip" data-a="testSound">Play</button></div></div>';

  h += '<h2>Earbuds</h2><div class="card">'
    + '<div class="row" style="padding:0"><div class="grow"><div class="t">Squeeze to log a set</div>'
    + '<div class="s">Squeeze the AirPods to tick the next set and start the rest</div></div>'
    + '<button class="chip' + (st.earbud ? " on" : "") + '" data-a="setFlag" data-k="earbud">' + (st.earbud ? "On" : "Off") + "</button></div>"
    + '<p class="tiny" style="margin-top:14px">Honest warning: this only works when NitFit owns the phone\'s audio. If music is playing, the squeeze goes to the music app instead and nothing happens here. Try it and see.</p></div>';

  h += '<h2>Reminders</h2><div class="card"><p class="tiny" style="margin:0">NitFit cannot send you alerts on its own. Set them in the iPhone Reminders app: one for the gym at 6:45 AM, repeating daily. That is the one that matters.</p></div>';

  h += '<p class="tiny" style="text-align:center;margin-top:28px;color:var(--t3)">NitFit ' + APP_VERSION
    + (KV.persist === true ? " · storage protected" : "") + "</p>";
  return h;
}

ACT.syncNow = async () => { toast("Saving..."); const ok = await syncNow(); toast(ok ? "Saved to GitHub" : (KV.syncErr || "Could not save")); render(); };
ACT.restore = async () => { toast("Pulling everything back..."); const ok = await syncNow(true); toast(ok ? "All here. " + EV.length + " entries." : (KV.syncErr || "Could not reach GitHub")); render(); };
ACT.keySetup = () => openSheet('<h3>Set up the backup</h3><p>This key lets NitFit write into your private box on GitHub. One time, about three minutes. Much easier on a laptop, then send yourself the key.</p>'
  + '<ol class="steps"><li><a href="https://github.com/settings/personal-access-tokens/new?name=NitFit&expires_in=none&contents=write" target="_blank" rel="noopener">Open the key page</a> and sign in.</li>'
  + "<li><b>Expiration:</b> pick <b>No expiration</b>.</li>"
  + "<li><b>Repository access:</b> tap <b>Only select repositories</b>, then pick your data repo.</li>"
  + "<li><b>Permissions:</b> add <b>Contents</b>, set it to <b>Read and write</b>.</li>"
  + "<li>Tap <b>Generate token</b> and copy the long code.</li><li>Paste it here.</li></ol>"
  + '<input class="inp" id="keyIn" placeholder="github_pat_..." autocomplete="off" autocapitalize="off" spellcheck="false" style="font-size:15px;font-weight:500">'
  + '<div class="err" id="keyErr"></div><button class="btn" data-a="keyConnect">Connect</button>'
  + '<div style="height:10px"></div><button class="btn ghost" data-a="keyLater">Later</button>'
  + '<p class="tiny" style="margin-top:14px">Treat the key like a password. It is saved on this phone only, never inside the app code.</p>');
ACT.keyLater = () => { kvSet("skipSetup", true); closeSheet(); };
ACT.keyConnect = async el => {
  const err = $("#keyErr"); err.textContent = ""; el.disabled = true; el.textContent = "Connecting...";
  try { await connectKey($("#keyIn").value); closeSheet(); toast("Connected. It is backed up now."); render(); }
  catch (e) { err.textContent = e.message || "Could not connect."; el.disabled = false; el.textContent = "Connect"; }
};
ACT.exportAll = async () => {
  const text = JSON.stringify(buildExport()), name = "nitfit-backup-" + today() + ".json";
  const file = new File([text], name, { type: "application/json" });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return; } }
  catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
};
ACT.importAll = () => { const i = $("#importIn"); i.value = ""; i.click(); };
async function doImport(file) {
  try { const n = await importExport(JSON.parse(await file.text())); toast(n ? n + " entries added" : "Nothing new in that file"); render(); }
  catch (e) { toast(e.message || "Could not read that file"); }
}
ACT.setFlag = el => {
  const k = el.dataset.k;
  addEvent("settings.upserted", { [k]: !S.settings[k] });
  if (k === "mix") ensureAudio();
  if (k === "earbud") { if (S.settings.earbud && $("#wk").classList.contains("on")) earbudOn(); else earbudOff(); }
  haptic(); render();
};
ACT.testSound = () => { ensureAudio(); beep(); haptic(); };
ACT.easySet = () => {
  const wi = weekInfo(today());
  addEvent("settings.upserted", wi.easy ? { easyOff: wi.ws, easyOn: null } : { easyOn: wi.ws, easyOff: null });
  if (!S.settings.blockStart) addEvent("settings.upserted", { blockStart: today() });
  render();
};
ACT.targets = () => {
  const st = S.settings;
  const f = (id, label, v, hint) => '<div class="row"><div class="grow"><div class="t">' + label + '</div><div class="s">' + hint + "</div></div>"
    + '<input class="inp num" id="' + id + '" inputmode="decimal" value="' + v + '" style="width:104px;min-height:42px"></div>';
  openSheet('<h3>Your numbers</h3><p>Only change these if you know why.</p><div class="card flush">'
    + f("tH", "Height", st.heightCm, "cm") + f("tB", "Body fat guess", st.bfGuess, "percent")
    + f("tS", "Bad sleep is under", st.sleepBadH, "hours") + '</div><div style="height:14px"></div>'
    + '<button class="btn" data-a="targetsSave">Save</button>');
};
ACT.targetsSave = () => {
  const g = id => numIn($("#" + id).value);
  const p = { heightCm: g("tH"), bfGuess: g("tB"), sleepBadH: g("tS") };
  if (!(p.heightCm > 120 && p.heightCm < 230 && p.bfGuess > 3 && p.bfGuess < 50 && p.sleepBadH > 3 && p.sleepBadH < 12)) return toast("One of those looks wrong.");
  addEvent("settings.upserted", p); closeSheet(); render();
};

// ----- plan editor -----

ACT.planDay = el => { UI.planDraft = clone(S.plan); UI.planK = el.dataset.day; planSheet(); };
function planSheet() {
  const k = UI.planK, items = UI.planDraft[k] || (UI.planDraft[k] = []);
  const sc = $("#sheet .pn").scrollTop;
  openSheet("<h3>" + DAY_NAMES[k] + '</h3><p>Change it, then save. Keep the first big lift the same for a whole six weeks, that is how you see progress.</p>'
    + '<div class="card flush">' + items.map((it, i) => {
      const ex = getEx(it.ex);
      return '<div class="row"><div class="grow"><div class="t">' + esc(ex ? ex.n : it.ex) + '</div><div class="s">'
        + '<button data-a="planMove" data-i="' + i + '" data-v="-1">Up</button> · '
        + '<button data-a="planMove" data-i="' + i + '" data-v="1">Down</button> · '
        + '<button style="color:var(--m2)" data-a="planDel" data-i="' + i + '">Remove</button></div></div>'
        + '<div class="chips"><button class="chip" data-a="planSets" data-i="' + i + '" data-v="-1">&#8722;</button>'
        + '<span class="num" style="min-width:20px;text-align:center;font-weight:700;align-self:center">' + it.sets + "</span>"
        + '<button class="chip" data-a="planSets" data-i="' + i + '" data-v="1">+</button></div></div>';
    }).join("") + "</div>"
    + '<div style="height:12px"></div><button class="btn ghost" data-a="planAddPick">Add an exercise</button>'
    + '<div style="height:10px"></div><button class="btn" data-a="planSave">Save</button>');
  $("#sheet .pn").scrollTop = sc;
}
ACT.planSets = el => { const it = UI.planDraft[UI.planK][+el.dataset.i]; it.sets = Math.max(1, Math.min(8, it.sets + +el.dataset.v)); planSheet(); };
ACT.planMove = el => {
  const a = UI.planDraft[UI.planK], i = +el.dataset.i, j = i + +el.dataset.v;
  if (j < 0 || j >= a.length) return;
  const t = a[i]; a[i] = a[j]; a[j] = t; planSheet();
};
ACT.planDel = el => { UI.planDraft[UI.planK].splice(+el.dataset.i, 1); planSheet(); };
ACT.planAddPick = () => exPicker("planAdd", "Add to " + DAY_NAMES[UI.planK]);
ACT.planAdd = el => { const a = UI.planDraft[UI.planK]; if (!a.some(x => x.ex === el.dataset.ex)) a.push({ ex: el.dataset.ex, sets: 3 }); planSheet(); };
ACT.planSave = () => { addEvent("plan.upserted", { plan: UI.planDraft }); closeSheet(); toast("Plan saved"); render(); };
ACT.newEx = () => openSheet('<h3>Add your own exercise</h3>'
  + '<input class="inp" id="nxN" placeholder="Name" style="margin-bottom:12px"><h2>Muscle</h2>'
  + '<select class="inp" id="nxM">' + MUSCLES.map(m => "<option>" + m + "</option>").join("") + "</select>"
  + '<h2>What you lift</h2><select class="inp" id="nxE"><option value="machine">Machine</option><option value="cable">Cable</option>'
  + '<option value="db">Dumbbells</option><option value="bb">Barbell</option><option value="smith">Smith machine</option><option value="bw">Bodyweight</option></select>'
  + '<div style="height:16px"></div><button class="btn" data-a="newExSave">Save</button>');
ACT.newExSave = () => {
  const n = $("#nxN").value.trim(), eq = $("#nxE").value;
  if (!n) return toast("Give it a name.");
  addEvent("exercise.upserted", { exId: "c_" + uid(), custom: true, n, m: $("#nxM").value, s: [], eq, kind: "i", r: [10, 15], rest: 90, step: STEP_BY_EQ[eq], cue: "" });
  closeSheet(); toast("Saved. Add it to a day in Your week."); render();
};

// ----- router and start-up -----

const VIEWS = { today: vToday, progress: vProgress, body: vBody, more: vMore };
function render() {
  if (!S) return;
  const app = $("#app");
  app.innerHTML = VIEWS[TAB]();
  hydratePhotos(app);
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === TAB));
}
ACT.tab = el => { if (TAB !== el.dataset.tab) { TAB = el.dataset.tab; UI.tapped = null; haptic(); render(); window.scrollTo(0, 0); } };

document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]");
  if (!el) return;
  const f = ACT[el.dataset.a];
  if (f) f(el, e);
});

async function boot() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  if (ios && !standalone) {
    $("#tabs").style.display = "none";
    $("#app").innerHTML = '<div class="center"><h1>Put NitFit on your Home Screen</h1>'
      + '<p class="sub">NitFit only runs from its own icon. That is what keeps your data in one safe place.</p>'
      + '<div class="card" style="text-align:left"><ol class="steps" style="margin:0">'
      + "<li>Tap the <b>Share</b> button, the square with the arrow.</li>"
      + "<li>Scroll down, tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li>"
      + "<li>Close Safari and open <b>NitFit</b> from the new icon.</li></ol></div>"
      + '<p class="tiny">Always open it from the icon, never from a link.</p></div>';
    return;
  }
  try { await coreBoot(); }
  catch (e) {
    $("#app").innerHTML = '<div class="center"><h1>Storage is blocked</h1><p class="sub">NitFit could not open its storage on this phone. Close it and open it again. If you are in Private Browsing, turn that off.</p></div>';
    return;
  }
  applyTheme();
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { if (S.settings.theme === "system") applyTheme(); });
  try { if (navigator.storage && navigator.storage.persist && KV.persist == null) kvSet("persist", await navigator.storage.persist()); } catch (_) {}
  try {
    const r = JSON.parse(localStorage.getItem("nitfit:rest") || "null");
    if (r && r.end > Date.now() - 15000) { REST = r; REST.fired = REST.end < Date.now(); restIv = setInterval(paintRest, 250); }
  } catch (_) {}
  render();
  if (KV.token) syncNow();
  else if (!KV.skipSetup) ACT.keySetup();
  setInterval(() => { if (!document.hidden && KV.token) syncNow(); syncPaint(); }, 5 * 60e3);
  setInterval(syncPaint, 30e3);
  addEventListener("online", () => syncNow());
  addEventListener("resize", fitCmp);
  let lastDay = today();
  setInterval(() => { if (today() !== lastDay) { lastDay = today(); UI.side = null; render(); } }, 60e3);
}
boot();
