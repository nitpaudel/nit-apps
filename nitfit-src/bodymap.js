// ---------------------------------------------------------------------------
// NitFit's own body map. Left half is drawn, the right half is its mirror.
// viewBox 0 0 200 460, centre line x = 100. Every muscle is its own shape so
// it can be lit up blue by how many sets it got.
// ---------------------------------------------------------------------------
const BODY = {
  // the body underneath (skin), drawn whole
  base: {
    front: "M100 6 C88 6 82 16 82 30 C82 42 86 50 90 54 L89 62 C80 68 70 72 58 76 C46 80 40 90 38 104 C36 120 36 140 37 160 C36 172 34 186 32 202 C29 218 27 232 26 244 C24 252 22 260 24 270 C26 278 32 278 34 270 C35 262 35 254 37 246 C40 230 44 214 47 198 C49 186 51 176 52 168 C54 182 58 196 62 208 C60 224 58 240 58 262 C58 290 60 312 64 330 C62 350 62 374 66 398 C68 412 68 424 66 434 C64 444 66 452 76 452 C84 452 86 446 84 436 C82 424 82 410 84 396 C88 372 90 352 88 334 C92 310 96 286 98 262 L100 252 Z",
    back: "M100 6 C88 6 82 16 82 30 C82 42 86 50 90 54 L89 62 C80 68 70 72 58 76 C46 80 40 90 38 104 C36 120 36 140 37 160 C36 172 34 186 32 202 C29 218 27 232 26 244 C24 252 22 260 24 270 C26 278 32 278 34 270 C35 262 35 254 37 246 C40 230 44 214 47 198 C49 186 51 176 52 168 C54 182 58 196 62 208 C60 224 58 240 58 262 C58 290 60 312 64 330 C62 350 62 374 66 398 C68 412 68 424 66 434 C64 444 66 452 76 452 C84 452 86 446 84 436 C82 424 82 410 84 396 C88 372 90 352 88 334 C92 310 96 286 98 262 L100 252 Z",
  },
  front: [
    { m: "Neck", d: "M89 50 L94 53 L99 80 L95 81 L88 60 Z" },
    { m: "Traps", d: "M86 60 L92 70 L94 79 C84 79 74 79 64 78 C72 74 80 68 86 60 Z" },
    { m: "Front Delts", d: "M62 80 C54 81 48 86 46 94 C46 102 48 110 51 117 C55 108 60 98 66 88 Z" },
    { m: "Side Delts", d: "M58 78 C48 80 41 88 39 100 C38 108 39 116 41 122 L47 118 C45 108 45 98 49 90 C52 85 55 81 58 78 Z" },
    { m: "Chest", d: "M68 84 C78 82 88 83 98 86 L98 99 C88 100 76 99 62 95 C63 91 65 87 68 84 Z" },
    { m: "Chest", d: "M61 98 C74 102 86 103 98 102 L98 122 C90 128 78 128 68 122 C62 117 57 111 55 105 C57 102 59 100 61 98 Z" },
    { m: "Serratus", d: "M60 114 L67 124 L64 128 L58 120 Z M61 128 L68 136 L65 140 L60 133 Z M62 142 L68 148 L66 152 L62 147 Z" },
    { m: "Biceps", d: "M46 124 C42 134 41 150 43 164 C45 168 48 168 49 165 L49 123 C48 122 47 122 46 124 Z" },
    { m: "Biceps", d: "M51 123 C54 124 56 132 56 142 C56 152 54 160 51 166 L51 123 Z" },
    { m: "Forearms", d: "M42 172 C45 170 48 170 50 173 C48 192 44 212 40 232 C37 234 35 232 34 229 C34 208 37 188 42 172 Z" },
    { m: "Forearms", d: "M52 175 C54 177 55 181 54 187 C53 203 49 219 45 234 L42 234 C46 214 49 194 52 175 Z" },
    { m: "Abs", d: "M87 130 L98 131 L98 148 L86 148 C85 142 85 136 87 130 Z" },
    { m: "Abs", d: "M86 151 L98 151 L98 169 L86 169 Z" },
    { m: "Abs", d: "M86 172 L98 172 L98 191 L87 191 Z" },
    { m: "Abs", d: "M87 194 L98 194 L98 238 C93 232 89 222 87 210 Z" },
    { m: "Obliques", d: "M70 130 C75 133 79 134 83 134 L83 196 C79 204 75 208 70 210 C68 196 67 178 67 160 C67 148 68 138 70 130 Z" },
    { m: "Quads", d: "M64 226 C60 250 59 280 62 306 C63 316 65 324 68 330 L73 328 C72 300 72 270 73 244 C72 236 69 230 64 226 Z" },
    { m: "Quads", d: "M75 236 C80 236 86 240 89 248 C89 276 87 300 83 318 L77 324 C75 296 74 266 75 236 Z" },
    { m: "Quads", d: "M85 296 C90 304 91 318 86 330 C82 334 77 332 76 328 C80 318 83 306 85 296 Z" },
    { m: "Adductors", d: "M91 246 L98 250 C98 266 96 280 92 290 C90 280 90 262 91 246 Z" },
    { m: "Calves", d: "M66 342 C62 356 62 376 66 394 L72 394 C72 376 72 358 70 342 Z" },
    { m: "Tibialis", d: "M75 340 C80 342 84 344 86 348 C86 372 84 396 81 420 L77 420 C77 394 75 366 75 340 Z" },
  ],
  back: [
    { m: "Traps", d: "M100 52 L100 92 C92 90 80 86 66 80 C76 74 84 66 89 58 C92 54 96 52 100 52 Z" },
    { m: "Traps", d: "M100 95 L100 142 C96 128 92 114 86 101 C80 96 74 92 69 88 C79 91 90 94 100 95 Z" },
    { m: "Rear Delts", d: "M62 80 C54 81 48 86 46 94 C46 102 48 110 51 116 C55 106 60 96 66 88 Z" },
    { m: "Side Delts", d: "M58 78 C48 80 41 88 39 100 C38 108 39 116 41 122 L47 118 C45 108 45 98 49 90 C52 85 55 81 58 78 Z" },
    { m: "Upper Back", d: "M68 94 C74 96 80 100 84 106 C86 114 86 120 84 124 L70 120 C67 112 66 102 68 94 Z" },
    { m: "Upper Back", d: "M70 123 L84 127 L87 135 L71 130 Z" },
    { m: "Lats", d: "M68 133 L88 138 L93 150 L94 172 C94 184 92 194 90 200 C82 196 74 186 70 172 C67 158 66 144 68 133 Z" },
    { m: "Lower Back", d: "M95 150 L99 152 L99 214 C95 214 91 212 88 210 C91 200 95 186 95 172 Z" },
    { m: "Triceps", d: "M46 120 C42 132 41 148 43 162 L48 165 C48 148 48 134 48 119 C47 118 47 118 46 120 Z" },
    { m: "Triceps", d: "M50 118 C54 122 55 134 54 150 C53 158 51 164 50 166 L50 118 Z" },
    { m: "Forearms", d: "M42 172 C45 170 48 170 50 173 C48 192 44 212 40 232 C37 234 35 232 34 229 C34 208 37 188 42 172 Z" },
    { m: "Forearms", d: "M52 175 C54 177 55 181 54 187 C53 203 49 219 45 234 L42 234 C46 214 49 194 52 175 Z" },
    { m: "Glutes", d: "M70 196 C78 196 87 200 92 206 L72 210 C70 206 69 201 70 196 Z" },
    { m: "Glutes", d: "M70 213 C64 224 63 237 67 247 C75 256 88 258 99 252 L99 219 C90 213 80 210 70 213 Z" },
    { m: "Hamstrings", d: "M64 262 C60 284 61 306 66 328 L76 330 C76 306 76 284 78 264 C74 262 69 262 64 262 Z" },
    { m: "Hamstrings", d: "M80 264 C86 264 92 262 96 260 C96 284 92 306 86 328 L79 330 C78 306 78 286 80 264 Z" },
    { m: "Calves", d: "M66 342 C61 356 61 378 67 398 C72 404 78 402 80 396 L80 344 C76 340 70 340 66 342 Z" },
    { m: "Calves", d: "M82 344 C86 340 92 342 94 346 C96 366 94 384 88 398 C86 402 83 402 82 398 Z" },
  ],
};
// Which body region each muscle belongs to (for the Levels lists)
const MUSCLE_GROUPS = {
  Upper: ["Chest", "Upper Back", "Lats", "Traps", "Front Delts", "Side Delts", "Rear Delts", "Biceps", "Triceps", "Forearms", "Neck"],
  Lower: ["Abs", "Obliques", "Lower Back", "Glutes", "Quads", "Hamstrings", "Adductors", "Calves"],
};
const ALL_MUSCLES = MUSCLE_GROUPS.Upper.concat(MUSCLE_GROUPS.Lower);
// which side shows each muscle best, and the crop box for small thumbnails
const MUSCLE_VIEW = {
  Chest: ["front", "up"], "Front Delts": ["front", "up"], "Side Delts": ["front", "up"], Biceps: ["front", "up"], Forearms: ["front", "up"], Abs: ["front", "mid"], Obliques: ["front", "mid"], Neck: ["front", "up"],
  Quads: ["front", "low"], Adductors: ["front", "low"], Traps: ["back", "up"], "Rear Delts": ["back", "up"], "Upper Back": ["back", "up"], Lats: ["back", "up"],
  "Lower Back": ["back", "mid"], Triceps: ["back", "up"], Glutes: ["back", "mid"], Hamstrings: ["back", "low"], Calves: ["back", "low"],
};
const CROP = { up: "26 40 148 150", mid: "26 120 148 150", low: "36 220 128 200", full: "14 0 172 460" };

// level: 0..1 for each muscle (0 = untrained). opts: {side, crop, only: [muscles] , theme}
function bodySvg(side, level, opts) {
  opts = opts || {};
  const dark = document.documentElement.dataset.theme !== "light";
  const skin = dark ? "#3a3a3c" : "#d9d9de", off = dark ? "#505054" : "#c3c3ca", line = dark ? "#1c1c1e" : "#f7f7f5";
  const blue = v => { const t = Math.max(0, Math.min(1, v)); const a = [37, 72, 160], b = [79, 140, 255]; return "rgb(" + a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(",") + ")"; };
  const fill = m => { if (opts.only) return opts.only.includes(m) ? "#3b7bff" : off; const v = level ? level[m] || 0 : 0; return v > 0 ? blue(v) : off; };
  const parts = BODY[side].map(p => '<path d="' + p.d + '" fill="' + fill(p.m === "Tibialis" || p.m === "Serratus" ? "-" : p.m) + '" stroke="' + line + '" stroke-width="1.6" stroke-linejoin="round"/>').join("");
  const half = '<path d="' + BODY.base[side] + '" fill="' + skin + '"/>' + parts;
  const head = '<ellipse cx="100" cy="30" rx="16" ry="22" fill="' + skin + '"/>';
  const vb = opts.crop ? CROP[opts.crop] : CROP.full;
  return '<svg class="body" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg">' + head + '<g>' + half + '</g><g transform="translate(200 0) scale(-1 1)">' + half + "</g></svg>";
}
if (typeof module !== "undefined") module.exports = { BODY, MUSCLE_GROUPS, ALL_MUSCLES, MUSCLE_VIEW, CROP, bodySvg };
