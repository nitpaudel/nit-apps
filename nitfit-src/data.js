// ---------------------------------------------------------------------------
// Everything NitFit knows before Nit touches it: his gym's exercises, his
// week, the back fix, the cool downs and his day. Locked 20 Nov 2026.
// Smallest jump on anything in his gym is 2.5 kg.
// ---------------------------------------------------------------------------

// id, n name, m main muscle, eq kit, kind c compound / i isolation / core,
// r default rep range, rest seconds, cue one line on how to do it well.
// bw = bodyweight, t = timed in seconds.
const EXERCISES = [
  // ----- legs -----
  { id: "squat", n: "Back squat", m: "Quads", eq: "bb", kind: "c", r: [6, 8], rest: 180, cue: "Brace hard before you go down. Knees follow the toes, chest up. Start light." },
  { id: "smith_squat", n: "Smith squat", m: "Quads", eq: "smith", kind: "c", r: [8, 12], rest: 150, cue: "Feet a step in front of the bar. Easier on the lower back than a free squat." },
  { id: "leg_press", n: "Leg press", m: "Quads", eq: "machine", kind: "c", r: [10, 12], rest: 150, cue: "Feet in the middle. Never let your lower back peel off the pad at the bottom." },
  { id: "leg_press_high", n: "Leg press, feet high and wide", m: "Glutes", eq: "machine", kind: "c", r: [10, 12], rest: 150, cue: "Feet high and wide on the plate. Push through the heels. Hits glutes and hamstrings." },
  { id: "bulgarian", n: "Dumbbell Bulgarian split squat", m: "Quads", eq: "db", kind: "c", r: [8, 10], rest: 120, each: 1, cue: "Back foot on the bench. Go straight down. Weight is per dumbbell, reps per leg." },
  { id: "leg_ext", n: "Leg extension", m: "Quads", eq: "machine", kind: "i", r: [12, 15], rest: 75, cue: "Pause and squeeze at the top for a second. Lower slowly." },
  { id: "leg_curl", n: "Leg curl", m: "Hamstrings", eq: "machine", kind: "i", r: [10, 12], rest: 75, cue: "Hips stay down on the pad. Slow on the way back." },
  { id: "rdl", n: "Romanian deadlift", m: "Hamstrings", eq: "bb", kind: "c", r: [8, 10], rest: 150, cue: "Push your hips back, bar close to your legs. Stop when your back wants to round." },
  { id: "good_morning", n: "Seated good morning", m: "Lower back", eq: "bb", kind: "i", r: [12, 12], rest: 75, cue: "Sit on the bench end, light bar on your back. Lean forward with a flat back, then sit tall. Keep it light." },
  { id: "hip_thrust", n: "Hip thrust (machine)", m: "Glutes", eq: "machine", kind: "c", r: [8, 12], rest: 120, cue: "Chin tucked, ribs down. Squeeze hard at the top for a second." },
  { id: "abductor", n: "Hip abductor", m: "Glutes", eq: "machine", kind: "i", r: [15, 20], rest: 60, cue: "Lean forward a little. Slow on the way back in." },
  { id: "calf_standing", n: "Standing calf raise", m: "Calves", eq: "machine", kind: "i", r: [10, 15], rest: 75, cue: "Full stretch at the bottom, 2 second hold at the top. No bouncing." },
  { id: "calf_seated", n: "Seated calf raise", m: "Calves", eq: "machine", kind: "i", r: [12, 20], rest: 60, cue: "Hits the lower calf. Slow, and all the way down on every rep." },
  { id: "back_ext", n: "Hyperextension", m: "Lower back", eq: "bw", kind: "i", r: [12, 15], rest: 75, cue: "Rise until your body is straight, not past it. Slow and controlled." },
  { id: "lunge", n: "Dumbbell walking lunge", m: "Quads", eq: "db", kind: "c", r: [10, 12], rest: 120, each: 1, cue: "Long steps, upright chest. Reps per leg." },

  // ----- neck -----
  { id: "neck_flex", n: "Neck flexion", m: "Neck", eq: "plate", kind: "i", r: [15, 15], rest: 60, cue: "Face up on a bench, head off the end, light plate on your forehead over a towel. Slow, small range." },
  { id: "neck_side", n: "Side neck raise", m: "Neck", eq: "plate", kind: "i", r: [15, 15], rest: 60, each: 1, cue: "Lie on your side, head off the bench, light plate on the side of your head. Each side." },

  // ----- chest -----
  { id: "inc_smith_press", n: "Incline Smith press", m: "Chest", eq: "smith", kind: "c", r: [6, 10], rest: 150, cue: "Bench at 30 degrees. Touch just below the collarbone. No bouncing." },
  { id: "inc_db_press", n: "Incline dumbbell press", m: "Chest", eq: "db", kind: "c", r: [6, 10], rest: 150, cue: "Bench at 30 degrees. Elbows about 45 degrees from your body. Weight is per dumbbell." },
  { id: "flat_db_press", n: "Flat dumbbell press", m: "Chest", eq: "db", kind: "c", r: [8, 12], rest: 150, cue: "Shoulder blades pulled back and down into the bench the whole set." },
  { id: "mach_inc_press", n: "Machine incline press", m: "Chest", eq: "machine", kind: "c", r: [8, 12], rest: 120, cue: "Seat so the handles start at upper chest height. Control the way back." },
  { id: "mach_inc_fly", n: "Machine incline fly", m: "Chest", eq: "machine", kind: "i", r: [12, 15], rest: 75, cue: "Soft elbows. Squeeze for a second where the hands meet." },
  { id: "cable_fly_low", n: "Low-to-high cable fly", m: "Chest", eq: "cable", kind: "i", r: [12, 15], rest: 75, cue: "Pulleys at the bottom, hands finish at chin height. This is the upper chest." },
  { id: "pec_deck", n: "Pec deck", m: "Chest", eq: "machine", kind: "i", r: [12, 15], rest: 75, cue: "Squeeze for a full second in the middle. Do not slam the pads." },
  { id: "flat_smith", n: "Flat Smith press", m: "Chest", eq: "smith", kind: "c", r: [6, 10], rest: 150, cue: "Bar to the nipple line. Shoulder blades squeezed back." },
  { id: "dip", n: "Dips", m: "Chest", eq: "bw", kind: "c", r: [6, 12], rest: 150, cue: "Lean forward for chest. Stop when the upper arm is level." },
  { id: "pushup", n: "Push-ups", m: "Chest", eq: "bw", kind: "c", r: [12, 30], rest: 90, cue: "Body in one straight line. Hips do not sag." },

  // ----- arms -----
  { id: "preacher_curl", n: "Preacher curl", m: "Biceps", eq: "db", kind: "i", r: [10, 14], rest: 75, cue: "Armpits on the top of the pad. Don't fully lock out at the bottom." },
  { id: "incline_curl", n: "Incline dumbbell curl", m: "Biceps", eq: "db", kind: "i", r: [10, 15], rest: 75, cue: "Bench at 45, arms hanging behind you. The biggest stretch of any curl." },
  { id: "db_curl", n: "Dumbbell curl", m: "Biceps", eq: "db", kind: "i", r: [10, 14], rest: 75, cue: "Elbows still at your sides. Lower slowly, that half builds the arm." },
  { id: "rope_hammer", n: "Rope hammer curl", m: "Biceps", eq: "cable", kind: "i", r: [12, 15], rest: 75, cue: "Rope on the low pulley, thumbs up the whole way. Builds arm thickness." },
  { id: "cable_curl", n: "Cable curl", m: "Biceps", eq: "cable", kind: "i", r: [12, 15], rest: 75, cue: "Tension never drops. Stop just short of the top." },
  { id: "hammer_curl", n: "Hammer curl", m: "Biceps", eq: "db", kind: "i", r: [10, 14], rest: 75, cue: "Thumbs up the whole way." },
  { id: "tri_overhead", n: "Overhead cable triceps extension", m: "Triceps", eq: "cable", kind: "i", r: [10, 14], rest: 75, cue: "Face away from the cable. Get a full stretch behind your head." },
  { id: "tri_pushdown", n: "Cable pushdown", m: "Triceps", eq: "cable", kind: "i", r: [10, 15], rest: 75, cue: "Elbows pinned to your sides. Only the forearm moves." },
  { id: "rope_pushdown", n: "Rope pushdown", m: "Triceps", eq: "cable", kind: "i", r: [12, 15], rest: 75, cue: "Spread the rope apart at the bottom. Elbows stay pinned." },
  { id: "skullcrusher", n: "Dumbbell skullcrusher", m: "Triceps", eq: "db", kind: "i", r: [10, 14], rest: 75, cue: "Lower behind your head, not to your face. Elbows point up." },
  { id: "reverse_curl", n: "Reverse curl", m: "Forearms", eq: "db", kind: "i", r: [12, 15], rest: 60, cue: "Palms down. Go lighter than you think." },
  { id: "wrist_curl", n: "Wrist curl", m: "Forearms", eq: "db", kind: "i", r: [15, 20], rest: 60, cue: "Forearms on your thighs. Small movement." },

  // ----- back -----
  { id: "pullup", n: "Pull-ups", m: "Lats", eq: "bw", kind: "c", r: [6, 12], rest: 180, cue: "Dead hang at the bottom, chin clearly over the bar. Tag a set Cheated if you kipped." },
  { id: "chinup", n: "Chin-ups", m: "Lats", eq: "bw", kind: "c", r: [6, 12], rest: 180, cue: "Palms facing you. Dead hang at the bottom." },
  { id: "pulldown", n: "Lat pulldown", m: "Lats", eq: "cable", kind: "c", r: [6, 10], rest: 120, cue: "Bar to the top of your chest. Drive the elbows down, not back." },
  { id: "pulldown_close", n: "Close grip pulldown", m: "Lats", eq: "cable", kind: "c", r: [8, 12], rest: 120, cue: "Neutral grip. Lean back a touch, pull to the bottom of your chest." },
  { id: "rope_pullover", n: "Rope pullover", m: "Lats", eq: "cable", kind: "i", r: [10, 15], rest: 75, cue: "High pulley, arms almost straight. Sweep the rope to your thighs with control. Not heavy." },
  { id: "chest_sup_row", n: "Chest-supported row", m: "Upper back", eq: "db", kind: "c", r: [8, 12], rest: 120, cue: "Face down on the incline bench. Zero strain on your lower back." },
  { id: "cable_row", n: "Seated cable row, neutral grip", m: "Upper back", eq: "cable", kind: "c", r: [8, 12], rest: 120, cue: "Chest up, pull to your belly button. No rocking." },
  { id: "db_row", n: "One-arm dumbbell row", m: "Upper back", eq: "db", kind: "c", r: [8, 12], rest: 120, cue: "Knee and hand on the bench, flat back, pull to your hip." },
  { id: "straight_arm", n: "Straight-arm pulldown", m: "Lats", eq: "cable", kind: "i", r: [12, 15], rest: 75, cue: "Arms almost locked. Sweep the bar to your thighs." },
  { id: "y_raise", n: "Y-raise", m: "Upper back", eq: "db", kind: "i", r: [12, 15], rest: 60, cue: "Face down on the incline bench, light dumbbells, raise in a Y shape. Feel the middle back." },
  { id: "shrug", n: "Dumbbell shrug", m: "Traps", eq: "db", kind: "i", r: [10, 15], rest: 75, cue: "Straight up and down. No rolling." },

  // ----- shoulders -----
  { id: "cable_ohp_1arm", n: "One-arm cable shoulder press", m: "Shoulders", eq: "cable", kind: "c", r: [8, 12], rest: 90, each: 1, cue: "Low pulley, handle at your shoulder, press straight up. Each arm." },
  { id: "bb_ohp", n: "Barbell overhead press", m: "Shoulders", eq: "bb", kind: "c", r: [6, 10], rest: 150, cue: "Squeeze your bum and keep your ribs down so your lower back doesn't arch." },
  { id: "db_ohp", n: "Seated dumbbell shoulder press", m: "Shoulders", eq: "db", kind: "c", r: [8, 10], rest: 120, cue: "Back flat on the bench. Weight is per dumbbell." },
  { id: "cable_lat_raise", n: "Cable lateral raise (cuff)", m: "Side delts", eq: "cable", kind: "i", r: [12, 15], rest: 60, each: 1, cue: "Cuff on the wrist, cable behind you. Lead with the elbow. Each arm." },
  { id: "db_lat_raise", n: "Dumbbell lateral raise", m: "Side delts", eq: "db", kind: "i", r: [12, 20], rest: 60, cue: "Lead with the elbow, stop at shoulder height. No swinging." },
  { id: "rev_pec_deck", n: "Reverse pec deck", m: "Rear delts", eq: "machine", kind: "i", r: [12, 20], rest: 60, cue: "Face the pad. Push out with the back of the shoulder, not by squeezing the shoulder blades." },
  { id: "face_pull", n: "Face pull", m: "Rear delts", eq: "cable", kind: "i", r: [15, 20], rest: 60, cue: "Rope to your forehead, knuckles to the ceiling. This keeps your shoulders back." },

  // ----- core -----
  { id: "plank", n: "Plank", m: "Core", eq: "bw", kind: "core", t: 1, r: [30, 60], rest: 60, cue: "Squeeze the glutes, ribs tucked." },
  { id: "hang_leg_raise", n: "Hanging leg raise", m: "Core", eq: "bw", kind: "core", r: [8, 15], rest: 75, cue: "Curl the hips up, don't just swing the legs." },
  { id: "cable_crunch", n: "Cable crunch", m: "Core", eq: "cable", kind: "core", r: [12, 18], rest: 75, cue: "Round your spine down. Hips don't move." },
];
const EXMAP = {};
EXERCISES.forEach(e => { e.step = e.eq === "bw" ? 0 : 2.5; EXMAP[e.id] = e; });
const MUSCLE_ORDER = ["Chest", "Shoulders", "Side delts", "Rear delts", "Lats", "Upper back", "Traps", "Biceps", "Triceps", "Forearms", "Quads", "Hamstrings", "Glutes", "Calves", "Lower back", "Neck", "Core"];

// ---------------------------------------------------------------------------
// The week. sets = full sets (weeks 3 and 4). p5 = sets from week 5.
// ss = superset letter. light = never to failure.
// ---------------------------------------------------------------------------
const DAYS = {
  legsA: { name: "Legs A", sub: "Quads", cool: "legs", items: [
    { ex: "squat", sets: 3, r: [6, 8] },
    { ex: "leg_press", sets: 3, r: [10, 12] },
    { ex: "bulgarian", sets: 2, r: [8, 10] },
    { ex: "leg_ext", sets: 3, r: [12, 15] },
    { ex: "leg_curl", sets: 2, r: [10, 12] },
    { ex: "calf_standing", sets: 4, r: [10, 15] },
    { ex: "good_morning", sets: 2, r: [12, 12] },
    { ex: "neck_flex", sets: 2, r: [15, 15] },
    { ex: "neck_side", sets: 2, r: [15, 15] },
  ] },
  chestA: { name: "Chest + Arms A", sub: "Free weights and cables", cool: "chest", items: [
    { ex: "inc_smith_press", sets: 3, p5: 4, r: [6, 10] },
    { ex: "flat_db_press", sets: 3, r: [8, 12] },
    { ex: "cable_fly_low", sets: 3, r: [12, 15] },
    { ex: "preacher_curl", sets: 3, r: [10, 14], ss: "A" },
    { ex: "tri_overhead", sets: 3, r: [10, 14], ss: "A" },
    { ex: "incline_curl", sets: 3, r: [10, 15], ss: "B" },
    { ex: "tri_pushdown", sets: 3, r: [10, 15], ss: "B" },
    { ex: "face_pull", sets: 2, r: [15, 20] },
  ] },
  backA: { name: "Back + Shoulders A", sub: "Width", cool: "back", items: [
    { ex: "pullup", sets: 3, p5: 4, r: [6, 12] },
    { ex: "pulldown", sets: 3, r: [6, 10], ss: "A" },
    { ex: "rope_pullover", sets: 3, r: [10, 15], ss: "A" },
    { ex: "cable_ohp_1arm", sets: 3, p5: 4, r: [8, 12] },
    { ex: "chest_sup_row", sets: 3, r: [8, 12] },
    { ex: "cable_lat_raise", sets: 3, p5: 4, r: [12, 15] },
    { ex: "rev_pec_deck", sets: 3, r: [12, 20] },
    { ex: "y_raise", sets: 2, r: [12, 15] },
    { ex: "reverse_curl", sets: 2, r: [12, 15] },
  ] },
  legsB: { name: "Legs B", sub: "Hamstrings and glutes", cool: "legs", items: [
    { ex: "rdl", sets: 3, r: [8, 10] },
    { ex: "hip_thrust", sets: 3, r: [8, 12] },
    { ex: "leg_curl", sets: 3, r: [10, 12] },
    { ex: "leg_press_high", sets: 3, r: [10, 12] },
    { ex: "abductor", sets: 2, r: [15, 20] },
    { ex: "calf_seated", sets: 4, r: [12, 20] },
    { ex: "neck_flex", sets: 2, r: [15, 15] },
    { ex: "neck_side", sets: 2, r: [15, 15] },
  ] },
  chestB: { name: "Chest + Arms B", sub: "Machines", cool: "chest", items: [
    { ex: "inc_db_press", sets: 3, p5: 4, r: [6, 10] },
    { ex: "mach_inc_press", sets: 3, r: [8, 12] },
    { ex: "mach_inc_fly", sets: 3, r: [12, 15] },
    { ex: "db_curl", sets: 3, r: [10, 14], ss: "A" },
    { ex: "skullcrusher", sets: 3, r: [10, 14], ss: "A" },
    { ex: "rope_hammer", sets: 3, r: [12, 15], ss: "B" },
    { ex: "rope_pushdown", sets: 3, r: [12, 15], ss: "B" },
    { ex: "face_pull", sets: 2, r: [15, 20] },
  ] },
  backB: { name: "Back + Shoulders B", sub: "Width, calves, arm pump", cool: "back", items: [
    { ex: "pulldown", sets: 3, p5: 5, r: [6, 10], ss: "A" },
    { ex: "rope_pullover", sets: 3, p5: 5, r: [10, 15], ss: "A" },
    { ex: "cable_row", sets: 3, r: [8, 12] },
    { ex: "db_lat_raise", sets: 4, p5: 5, r: [12, 20] },
    { ex: "bb_ohp", sets: 3, p5: 4, r: [6, 10] },
    { ex: "rev_pec_deck", sets: 2, r: [15, 20] },
    { ex: "calf_standing", sets: 3, r: [12, 15] },
    { ex: "cable_curl", sets: 2, r: [12, 15], ss: "B", light: 1 },
    { ex: "tri_overhead", sets: 2, r: [12, 15], ss: "B", light: 1 },
  ] },
};
// Sunday first
const DAYMAP = ["legsA", "chestA", "backA", "legsB", "chestB", "backB", null];
const DAY_KEYS = ["legsA", "chestA", "backA", "legsB", "chestB", "backB"];


// Muscle tags for every exercise, main muscle first (these names match the body map).
// Weekly sets: the first tag counts a full set, the others count half.
const TAGS = {
  squat: ["Quads", "Glutes", "Adductors", "Lower Back"], smith_squat: ["Quads", "Glutes", "Adductors"], leg_press: ["Quads", "Glutes", "Adductors"],
  leg_press_high: ["Glutes", "Hamstrings", "Quads"], bulgarian: ["Quads", "Glutes", "Adductors"], leg_ext: ["Quads"], leg_curl: ["Hamstrings"],
  rdl: ["Hamstrings", "Glutes", "Lower Back"], good_morning: ["Lower Back", "Hamstrings", "Glutes"], hip_thrust: ["Glutes", "Hamstrings"], abductor: ["Glutes"],
  calf_standing: ["Calves"], calf_seated: ["Calves"], back_ext: ["Lower Back", "Glutes", "Hamstrings"], lunge: ["Quads", "Glutes"],
  neck_flex: ["Neck"], neck_side: ["Neck"],
  inc_smith_press: ["Chest", "Front Delts", "Triceps"], inc_db_press: ["Chest", "Front Delts", "Triceps"], flat_db_press: ["Chest", "Front Delts", "Triceps"],
  mach_inc_press: ["Chest", "Front Delts", "Triceps"], mach_inc_fly: ["Chest", "Front Delts"], cable_fly_low: ["Chest", "Front Delts"], pec_deck: ["Chest"],
  flat_smith: ["Chest", "Front Delts", "Triceps"], dip: ["Chest", "Triceps", "Front Delts"], pushup: ["Chest", "Triceps", "Front Delts"],
  preacher_curl: ["Biceps"], incline_curl: ["Biceps"], db_curl: ["Biceps", "Forearms"], rope_hammer: ["Biceps", "Forearms"], cable_curl: ["Biceps"], hammer_curl: ["Biceps", "Forearms"],
  tri_overhead: ["Triceps"], tri_pushdown: ["Triceps"], rope_pushdown: ["Triceps"], skullcrusher: ["Triceps"], reverse_curl: ["Forearms", "Biceps"], wrist_curl: ["Forearms"],
  pullup: ["Lats", "Upper Back", "Biceps"], chinup: ["Lats", "Biceps", "Upper Back"], pulldown: ["Lats", "Upper Back", "Biceps"], pulldown_close: ["Lats", "Biceps"],
  rope_pullover: ["Lats"], chest_sup_row: ["Upper Back", "Lats", "Rear Delts", "Biceps"], cable_row: ["Upper Back", "Lats", "Biceps"], db_row: ["Lats", "Upper Back", "Biceps"],
  straight_arm: ["Lats"], y_raise: ["Upper Back", "Traps", "Rear Delts"], shrug: ["Traps"],
  cable_ohp_1arm: ["Front Delts", "Side Delts", "Triceps"], bb_ohp: ["Front Delts", "Side Delts", "Triceps"], db_ohp: ["Front Delts", "Side Delts", "Triceps"],
  cable_lat_raise: ["Side Delts"], db_lat_raise: ["Side Delts"], rev_pec_deck: ["Rear Delts", "Upper Back"], face_pull: ["Rear Delts", "Upper Back", "Traps"],
  plank: ["Abs", "Obliques"], hang_leg_raise: ["Abs", "Obliques"], cable_crunch: ["Abs"],
};
const PROGRAM_NAME = "Nit's V-Taper Plan";

// Week 1 starts Sunday 22 Nov 2026. Anything before counts as week 1.
const PROGRAM_START = "2026-11-22";

const BACK_FIX = [
  { n: "Dead bug", dose: "2 × 8 each side", how: "On your back, arms up, knees bent in the air. Lower the opposite arm and leg slowly. Lower back stays pressed into the floor." },
  { n: "Bird dog", dose: "2 × 8 each side", how: "On hands and knees. Stretch the opposite arm and leg into a straight line, hold 2 seconds. Hips stay level." },
  { n: "Side plank", dose: "2 × 20 to 30 sec each side", how: "On your elbow, hips up, body straight from head to feet." },
  { n: "Glute bridge", dose: "2 × 12", how: "On your back, feet flat. Squeeze your bum and push your hips up. Hold 1 second." },
  { n: "Chin tuck", dose: "2 × 10", how: "Sit tall. Pull your chin straight back like a double chin. Hold 3 seconds." },
];
const COOLDOWN = {
  legs: [{ n: "Hip flexor stretch", dose: "45 sec each side" }, { n: "Hamstring stretch", dose: "45 sec each side" }, { n: "Quad stretch", dose: "30 sec each side" }],
  chest: [{ n: "Doorway chest stretch", dose: "45 sec each side" }],
  back: [{ n: "Lat stretch", dose: "45 sec each side" }],
};
const ROUTINE = [
  { t: "06:00", n: "Wake, weigh in, water, creatine 5g" },
  { t: "06:30", n: "Shake: oats, milk, banana, peanut butter" },
  { t: "07:00", n: "Gym" },
  { t: "09:30", n: "Dal bhat and eggs" },
  { t: "13:30", n: "Roti or chiura with milk or dahi" },
  { t: "16:30", n: "Banana with peanuts or chana" },
  { t: "19:30", n: "Dal bhat (chicken twice a week)" },
  { t: "21:30", n: "Sleep. Side, pillow between knees" },
];

if (typeof module !== "undefined") module.exports = { TAGS, PROGRAM_NAME, EXERCISES, EXMAP, DAYS, DAYMAP, DAY_KEYS, PROGRAM_START, BACK_FIX, COOLDOWN, ROUTINE, MUSCLE_ORDER };
