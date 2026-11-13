// ---------------------------------------------------------------------------
// The body figure.
//
// Drawn by hand as vector shapes so it stays razor sharp at any size, loads
// with the page, and tints instantly. Only the left half is drawn; the right
// half is the same shapes flipped across the middle. Perfect symmetry, half
// the drawing. Nothing is outlined, so the mirror line never shows.
//
// Box is 200 wide, 440 tall. The middle line is x = 100.
// Built on a wide-shoulder, narrow-waist frame, because that is the shape
// being trained towards.
// ---------------------------------------------------------------------------

// ---- the plain body shape, no muscles ----

const SIL_BODY = "M100,40 L90,41 L89,56 C79,60 70,65 63,71 C54,77 45,83 38,91 "
  + "C36,99 36,106 38,114 C45,119 50,125 53,133 C58,145 63,155 67,166 "
  + "C68,171 69,175 69,181 C66,188 64,195 63,203 C63,211 64,216 66,222 "
  + "C68,230 66,241 65,253 C64,268 65,282 68,296 C70,302 72,307 74,312 "
  + "C72,318 70,326 70,336 C71,350 73,364 76,378 C78,386 79,392 80,398 "
  + "C78,404 75,410 73,417 C72,421 74,425 78,425 L94,425 L95,404 "
  + "C96,390 97,374 97,358 C98,342 98,328 97,314 C97,298 97,282 97,266 "
  + "C98,248 99,230 99,214 L100,210 Z";

const SIL_ARM = "M38,90 C34,100 32,110 31,121 C30,133 29,143 28,153 "
  + "C28,164 27,175 27,186 C27,197 27,207 28,217 C29,227 29,236 30,244 "
  + "C31,252 34,258 39,259 C43,259 45,255 44,248 C44,240 43,232 43,224 "
  + "C44,214 45,205 47,196 C49,186 51,177 53,167 C55,156 56,145 57,134 "
  + "C58,123 58,112 57,101 C56,96 55,93 54,91 Z";

// ---- muscle groups ----

const MUSCLES_FRONT = {
  traps: { n: "Traps", d: [
    "M95,62 C89,63 82,65 76,69 C67,74 58,79 51,85 C58,89 69,91 80,90 C86,89 92,87 95,84 Z"] },
  delts: { n: "Shoulders", d: [
    "M43,89 C38,96 36,104 37,114 C42,118 48,119 52,116 C54,106 51,96 46,90 C45,88 44,88 43,89 Z"] },
  chest: { n: "Chest", d: [
    "M95,89 C87,88 76,91 67,97 C63,102 62,109 64,116 C71,125 82,129 91,128 C93,127 95,125 95,120 L95,89 Z"] },
  biceps: { n: "Biceps", d: [
    "M54,113 C49,122 45,133 42,144 C40,153 39,161 40,169 C44,171 48,170 51,166 C53,154 55,141 56,129 C57,121 57,117 54,113 Z"] },
  forearm: { n: "Forearms", d: [
    "M42,182 C39,193 37,204 35,215 C33,225 32,234 33,242 C36,245 40,244 43,240 C44,230 45,219 47,208 C48,197 47,189 42,182 Z"] },
  abs: { n: "Abs", d: [
    "M96,135 L89,136 C86,138 85,142 86,146 C86,150 87,152 89,153 L96,153 Z",
    "M96,157 L89,158 C86,160 85,164 86,168 C86,172 87,174 89,175 L96,175 Z",
    "M96,179 L90,180 C87,182 86,186 87,190 C87,194 88,196 90,197 L96,197 Z",
    "M96,201 L91,202 C89,205 88,209 90,213 C92,216 94,217 96,216 Z"] },
  obliques: { n: "Obliques", d: [
    "M84,150 C80,153 77,158 76,165 C75,173 75,181 77,188 C79,194 81,198 84,200 Z"] },
  quads: { n: "Quads", d: [
    "M96,224 C87,223 77,227 70,234 C66,246 64,261 65,275 C66,288 69,297 74,304 C82,305 89,301 94,295 C96,272 97,248 96,224 Z"] },
  calves: { n: "Calves", d: [
    "M94,318 C88,317 82,320 78,326 C75,338 74,351 76,363 C78,373 80,379 84,383 C88,382 91,378 92,372 C93,354 94,336 94,318 Z"] },
};

const MUSCLES_BACK = {
  traps: { n: "Traps", d: [
    "M97,62 C90,63 83,65 77,69 C68,74 59,79 52,85 C58,92 67,97 76,101 C81,104 85,108 88,112 C91,115 94,116 97,115 Z"] },
  delts: { n: "Shoulders", d: [
    "M43,89 C38,96 36,104 37,114 C42,118 48,119 52,116 C54,106 51,96 46,90 C45,88 44,88 43,89 Z"] },
  lats: { n: "Lats", d: [
    "M96,120 C88,121 78,124 70,129 C66,133 64,140 65,148 C70,158 77,168 84,176 C89,181 93,184 96,185 Z"] },
  triceps: { n: "Triceps", d: [
    "M53,108 C48,118 43,129 39,141 C36,151 34,159 33,168 C37,171 42,170 46,166 C49,153 52,139 55,127 C57,118 56,112 53,108 Z"] },
  forearm: { n: "Forearms", d: [
    "M41,182 C38,193 36,204 34,215 C32,225 31,234 32,242 C35,245 39,244 42,240 C43,230 44,219 46,208 C47,197 46,189 41,182 Z"] },
  lowback: { n: "Lower back", d: [
    "M96,170 C92,170 88,172 85,177 C83,185 83,193 85,200 C88,205 92,208 96,208 Z"] },
  glutes: { n: "Glutes", d: [
    "M96,213 C88,212 79,215 72,222 C67,229 66,239 68,248 C73,257 81,262 90,262 C94,261 96,258 96,252 C97,239 97,226 96,213 Z"] },
  hams: { n: "Hamstrings", d: [
    "M95,268 C87,267 78,270 71,276 C67,285 65,295 66,304 C68,309 71,312 75,313 C81,312 88,309 93,304 C95,292 95,280 95,268 Z"] },
  calves: { n: "Calves", d: [
    "M94,320 C87,319 80,322 75,328 C71,339 70,353 72,366 C74,376 78,382 82,386 C86,385 89,381 91,375 C93,357 94,339 94,320 Z"] },
};

const FIG = { front: { m: MUSCLES_FRONT }, back: { m: MUSCLES_BACK } };

// The exercise list speaks in training words. The drawing speaks in shapes.
const MUSCLE_TO_FIG = {
  Chest: ["chest"],
  Shoulders: ["delts"],
  Back: ["lats", "traps"],
  Lats: ["lats"],
  Traps: ["traps"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Forearms: ["forearm"],
  Abs: ["abs", "obliques"],
  Obliques: ["obliques"],
  "Lower back": ["lowback"],
  Quads: ["quads"],
  Hamstrings: ["hams"],
  Glutes: ["glutes"],
  Calves: ["calves"],
};

// Reverse lookup, so tapping a shape says which training muscles it covers.
const FIG_TO_MUSCLE = {};
for (const m in MUSCLE_TO_FIG) MUSCLE_TO_FIG[m].forEach(k => (FIG_TO_MUSCLE[k] = FIG_TO_MUSCLE[k] || []).push(m));

const FIG_NAME = {};
for (const k in MUSCLES_FRONT) FIG_NAME[k] = MUSCLES_FRONT[k].n;
for (const k in MUSCLES_BACK) FIG_NAME[k] = MUSCLES_BACK[k].n;

// Turn training muscle names into heat on the drawing.
// 2 is today's target, 1 only helps out.
function figHeat(primary, secondary) {
  const heat = {};
  (secondary || []).forEach(m => (MUSCLE_TO_FIG[m] || []).forEach(k => { if (!heat[k]) heat[k] = 1; }));
  (primary || []).forEach(m => (MUSCLE_TO_FIG[m] || []).forEach(k => (heat[k] = 2)));
  return heat;
}

// Which way to open the figure. Counts one vote per exercise, and a muscle that
// only lives on one side votes for that side. A pull day should open on the back.
function bestSide(primaryList) {
  let f = 0, b = 0;
  (primaryList || []).forEach(m => {
    const keys = MUSCLE_TO_FIG[m] || [];
    const onF = keys.some(k => MUSCLES_FRONT[k]), onB = keys.some(k => MUSCLES_BACK[k]);
    if (onF && !onB) f += 2;
    else if (onB && !onF) b += 2;
    else if (onF) { f += 1; b += 1; }
  });
  return b > f ? "back" : "front";
}

// ---- draw it ----
function figSvg(side, heat, opts) {
  opts = opts || {}; heat = heat || {};
  const view = FIG[side] || FIG.front;
  const half = inner => "<g>" + inner + '</g><g transform="translate(200,0) scale(-1,1)">' + inner + "</g>";

  let groups = "";
  for (const key in view.m) {
    const lvl = heat[key] || 0;
    const cls = "mg" + (lvl === 2 ? " lvl2" : lvl === 1 ? " lvl1" : "") + (opts.tapped === key ? " tapped" : "");
    const shapes = view.m[key].d.map(d => '<path d="' + d + '"/>').join("");
    groups += '<g class="' + cls + '"' + (opts.flat ? "" : ' data-a="figTap" data-m="' + key + '"')
      + ' data-mg="' + key + '">' + half(shapes) + "</g>";
  }

  return '<svg class="fig" viewBox="0 0 200 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<ellipse class="skin" cx="100" cy="25" rx="15" ry="19"/>'
    + half('<path class="skin" d="' + SIL_BODY + '"/>')
    + half('<path class="skin" d="' + SIL_ARM + '"/>')
    + groups
    + "</svg>";
}

if (typeof module !== "undefined") module.exports = { SIL_BODY, SIL_ARM, FIG, MUSCLE_TO_FIG, FIG_TO_MUSCLE, FIG_NAME, figHeat, bestSide, figSvg, MUSCLES_FRONT, MUSCLES_BACK };
