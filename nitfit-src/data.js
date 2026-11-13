// ---------------------------------------------------------------------------
// Everything NitFit knows before Nit touches it.
//
// Only machines and weights that exist in his gym are in here. No T-bar row,
// no bands, no mat, no V-shape machine. Smallest jump on anything is 2.5 kg.
// Muscle names here must match the names the drawing understands.
// ---------------------------------------------------------------------------

const MUSCLES = ["Chest", "Shoulders", "Lats", "Traps", "Biceps", "Triceps",
  "Forearms", "Abs", "Lower back", "Quads", "Hamstrings", "Glutes", "Calves"];

// How many hard sets a week each muscle wants. Low end keeps it, high end grows it.
const SET_BAND = {
  Chest: [10, 18], Shoulders: [12, 22], Lats: [12, 20], Traps: [6, 14],
  Biceps: [8, 16], Triceps: [8, 16], Forearms: [4, 10], Abs: [6, 14],
  "Lower back": [4, 10], Quads: [8, 16], Hamstrings: [8, 14],
  Glutes: [6, 12], Calves: [8, 16],
};

const STEP_BY_EQ = { db: 2.5, bb: 2.5, smith: 2.5, cable: 5, machine: 5, bw: 2.5 };

// id, n name, m main muscle, s helper muscles, eq kit, kind c compound i isolation,
// r rep range, rest seconds, cue one line of form that matters.
const EXERCISES = [

  // ---------- chest ----------
  { id: "inc_db_press", n: "Incline dumbbell press", m: "Chest", s: ["Shoulders", "Triceps"], eq: "db", kind: "c", r: [6, 10], rest: 150, cue: "Bench at 30 degrees. Elbows about 45 from your body, not flared wide." },
  { id: "inc_smith_press", n: "Incline Smith press", m: "Chest", s: ["Shoulders", "Triceps"], eq: "smith", kind: "c", r: [6, 10], rest: 150, cue: "Touch the upper chest, just below the collarbone. Do not bounce it." },
  { id: "flat_db_press", n: "Flat dumbbell press", m: "Chest", s: ["Shoulders", "Triceps"], eq: "db", kind: "c", r: [6, 12], rest: 150, cue: "Shoulder blades pulled back and down into the bench the whole set." },
  { id: "flat_smith_press", n: "Flat Smith press", m: "Chest", s: ["Shoulders", "Triceps"], eq: "smith", kind: "c", r: [6, 12], rest: 150, cue: "Bar to the nipple line. Keep your shoulder blades squeezed back." },
  { id: "dip", n: "Dips", m: "Chest", s: ["Triceps", "Shoulders"], eq: "bw", kind: "c", r: [6, 12], rest: 150, cue: "Lean forward for chest. Stop when the upper arm is level, no deeper." },
  { id: "pec_deck", n: "Pec deck", m: "Chest", s: ["Shoulders"], eq: "machine", kind: "i", r: [10, 15], rest: 75, cue: "Squeeze for a full second in the middle. Do not slam the pads together." },
  { id: "cable_fly_low", n: "Low to high cable fly", m: "Chest", s: ["Shoulders"], eq: "cable", kind: "i", r: [12, 15], rest: 75, cue: "Pulleys at the bottom, hands finish at chin height. This hits upper chest." },
  { id: "cable_fly_high", n: "High to low cable fly", m: "Chest", s: [], eq: "cable", kind: "i", r: [12, 15], rest: 75, cue: "Soft bend in the elbow, hold it there. Hands meet in front of your hips." },
  { id: "pushup", n: "Push-ups", m: "Chest", s: ["Triceps", "Abs"], eq: "bw", kind: "c", r: [12, 30], rest: 90, cue: "Body in one straight line. Hips do not sag." },

  // ---------- shoulders ----------
  { id: "db_ohp", n: "Seated dumbbell press", m: "Shoulders", s: ["Triceps"], eq: "db", kind: "c", r: [6, 10], rest: 150, cue: "Back flat on the bench. Do not lean back and turn it into a press." },
  { id: "smith_ohp", n: "Smith overhead press", m: "Shoulders", s: ["Triceps"], eq: "smith", kind: "c", r: [6, 10], rest: 150, cue: "Bar to chin level. Ribs down, do not arch your lower back." },
  { id: "lat_raise", n: "Dumbbell lateral raise", m: "Shoulders", s: ["Traps"], eq: "db", kind: "i", r: [12, 20], rest: 60, cue: "Lead with the elbow, stop at shoulder height. Light weight, no swinging." },
  { id: "cable_lat_raise", n: "Cable lateral raise", m: "Shoulders", s: [], eq: "cable", kind: "i", r: [12, 20], rest: 60, cue: "Cable behind your back, one arm at a time. Slow all the way down." },
  { id: "lean_lat_raise", n: "Leaning lateral raise", m: "Shoulders", s: [], eq: "db", kind: "i", r: [12, 18], rest: 60, cue: "Hold the rack and lean away. The stretch at the bottom is the point." },
  { id: "rear_delt_fly", n: "Rear delt fly", m: "Shoulders", s: ["Traps"], eq: "machine", kind: "i", r: [12, 20], rest: 60, cue: "Pull with the back of the shoulder, not by squeezing the shoulder blades." },
  { id: "face_pull", n: "Cable face pull", m: "Shoulders", s: ["Traps"], eq: "cable", kind: "i", r: [12, 20], rest: 60, cue: "Rope to your forehead, knuckles to the ceiling. This fixes posture." },
  { id: "front_raise", n: "Dumbbell front raise", m: "Shoulders", s: [], eq: "db", kind: "i", r: [12, 15], rest: 60, cue: "Stop at eye level. No body swing." },

  // ---------- triceps ----------
  { id: "tri_pushdown", n: "Cable pushdown", m: "Triceps", s: [], eq: "cable", kind: "i", r: [10, 15], rest: 75, cue: "Elbows pinned to your sides. Only the forearm moves." },
  { id: "tri_overhead", n: "Overhead cable extension", m: "Triceps", s: [], eq: "cable", kind: "i", r: [10, 15], rest: 75, cue: "Get a full stretch behind your head. That is where the growth is." },
  { id: "skullcrusher", n: "Skullcrusher", m: "Triceps", s: [], eq: "db", kind: "i", r: [10, 14], rest: 90, cue: "Lower behind your head, not to your face. Elbows stay pointed up." },
  { id: "close_smith", n: "Close grip Smith press", m: "Triceps", s: ["Chest", "Shoulders"], eq: "smith", kind: "c", r: [8, 12], rest: 120, cue: "Hands shoulder width, no narrower. Elbows tucked in close." },
  { id: "bench_dip", n: "Bench dips", m: "Triceps", s: ["Shoulders"], eq: "bw", kind: "i", r: [10, 20], rest: 75, cue: "Stay upright and close to the bench. Do not drop below a right angle." },

  // ---------- back and lats ----------
  { id: "pulldown_wide", n: "Wide lat pulldown", m: "Lats", s: ["Biceps", "Traps"], eq: "cable", kind: "c", r: [8, 12], rest: 150, cue: "Bar to the top of your chest. Drive the elbows down, not back." },
  { id: "pulldown_close", n: "Close grip pulldown", m: "Lats", s: ["Biceps"], eq: "cable", kind: "c", r: [8, 12], rest: 150, cue: "Neutral grip. Lean back a touch and pull to the bottom of your chest." },
  { id: "pullup", n: "Pull-ups", m: "Lats", s: ["Biceps", "Forearms"], eq: "bw", kind: "c", r: [4, 12], rest: 180, cue: "Dead hang at the bottom, chin clearly over the bar. No kipping." },
  { id: "chinup", n: "Chin-ups", m: "Lats", s: ["Biceps"], eq: "bw", kind: "c", r: [4, 12], rest: 180, cue: "Palms facing you. Easier than pull-ups and hits the biceps harder." },
  { id: "cable_row", n: "Seated cable row", m: "Lats", s: ["Traps", "Biceps"], eq: "cable", kind: "c", r: [8, 12], rest: 150, cue: "Chest up, pull to your belly button. Do not rock back and forth." },
  { id: "db_row", n: "One arm dumbbell row", m: "Lats", s: ["Traps", "Biceps"], eq: "db", kind: "c", r: [8, 12], rest: 120, cue: "Knee and hand on the bench. Flat back, pull the dumbbell to your hip." },
  { id: "chest_sup_row", n: "Chest supported row", m: "Lats", s: ["Traps", "Biceps"], eq: "db", kind: "c", r: [10, 14], rest: 120, cue: "Face down on the incline bench. Zero strain on your lower back." },
  { id: "smith_row", n: "Smith machine row", m: "Lats", s: ["Traps", "Lower back"], eq: "smith", kind: "c", r: [8, 12], rest: 150, cue: "Hinge to about 45 degrees and hold it. Back stays flat the whole set." },
  { id: "straight_arm", n: "Straight arm pulldown", m: "Lats", s: [], eq: "cable", kind: "i", r: [12, 15], rest: 75, cue: "Arms almost locked. Sweep the bar to your thighs and feel the lat." },
  { id: "shrug", n: "Dumbbell shrug", m: "Traps", s: ["Forearms"], eq: "db", kind: "i", r: [10, 15], rest: 75, cue: "Straight up and down. No rolling the shoulders." },

  // ---------- biceps and forearms ----------
  { id: "db_curl", n: "Dumbbell curl", m: "Biceps", s: ["Forearms"], eq: "db", kind: "i", r: [8, 12], rest: 75, cue: "Elbows still at your sides. Lower slowly, that half builds the arm." },
  { id: "preacher_curl", n: "Preacher curl", m: "Biceps", s: [], eq: "db", kind: "i", r: [10, 14], rest: 75, cue: "Armpits into the top of the pad. Do not fully lock out at the bottom." },
  { id: "incline_curl", n: "Incline dumbbell curl", m: "Biceps", s: [], eq: "db", kind: "i", r: [10, 14], rest: 75, cue: "Bench at 45, arms hanging behind you. Biggest stretch of any curl." },
  { id: "hammer_curl", n: "Hammer curl", m: "Biceps", s: ["Forearms"], eq: "db", kind: "i", r: [10, 14], rest: 75, cue: "Thumbs up the whole way. This builds the thickness on the outside." },
  { id: "cable_curl", n: "Cable curl", m: "Biceps", s: ["Forearms"], eq: "cable", kind: "i", r: [10, 15], rest: 75, cue: "Tension never drops. Stop just short of the top." },
  { id: "wrist_curl", n: "Wrist curl", m: "Forearms", s: [], eq: "db", kind: "i", r: [15, 20], rest: 60, cue: "Forearms on your thighs. Small movement, let the weight roll to the fingers." },
  { id: "rev_curl", n: "Reverse curl", m: "Forearms", s: ["Biceps"], eq: "db", kind: "i", r: [12, 15], rest: 60, cue: "Palms down. Go lighter than you think, the forearm is the weak link." },

  // ---------- legs ----------
  { id: "squat", n: "Back squat", m: "Quads", s: ["Glutes", "Lower back", "Hamstrings"], eq: "bb", kind: "c", r: [5, 8], rest: 180, cue: "Brace hard before you drop. Knees track over the toes, chest up." },
  { id: "smith_squat", n: "Smith squat", m: "Quads", s: ["Glutes"], eq: "smith", kind: "c", r: [8, 12], rest: 180, cue: "Feet a step in front. Easier on the back than a free squat." },
  { id: "leg_press", n: "Leg press", m: "Quads", s: ["Glutes", "Hamstrings"], eq: "machine", kind: "c", r: [10, 15], rest: 150, cue: "Never let your lower back round off the pad at the bottom." },
  { id: "leg_ext", n: "Leg extension", m: "Quads", s: [], eq: "machine", kind: "i", r: [12, 18], rest: 75, cue: "Pause and squeeze at the top. Lower under control." },
  { id: "bulgarian", n: "Bulgarian split squat", m: "Quads", s: ["Glutes", "Hamstrings"], eq: "db", kind: "c", r: [8, 12], rest: 120, cue: "Back foot on the bench. Lean forward slightly for more glute." },
  { id: "rdl", n: "Romanian deadlift", m: "Hamstrings", s: ["Glutes", "Lower back"], eq: "db", kind: "c", r: [8, 12], rest: 150, cue: "Push the hips back, bar close to the legs. Stop when the back wants to round." },
  { id: "leg_curl", n: "Leg curl", m: "Hamstrings", s: ["Calves"], eq: "machine", kind: "i", r: [10, 15], rest: 75, cue: "Hips stay down on the pad. Do not lift them to help." },
  { id: "hip_thrust", n: "Hip thrust", m: "Glutes", s: ["Hamstrings"], eq: "machine", kind: "c", r: [10, 15], rest: 120, cue: "Chin tucked, ribs down. Squeeze hard at the top for a second." },
  { id: "abductor", n: "Hip abductor", m: "Glutes", s: [], eq: "machine", kind: "i", r: [15, 20], rest: 60, cue: "Lean forward a little. Slow on the way back in." },
  { id: "calf_standing", n: "Standing calf raise", m: "Calves", s: [], eq: "machine", kind: "i", r: [10, 15], rest: 75, cue: "Full stretch at the bottom, two second hold at the top. No bouncing." },
  { id: "calf_seated", n: "Seated calf raise", m: "Calves", s: [], eq: "machine", kind: "i", r: [12, 20], rest: 60, cue: "This one hits the lower calf. Slow, and all the way down each rep." },

  // ---------- core, lower back and neck ----------
  { id: "hang_leg_raise", n: "Hanging leg raise", m: "Abs", s: ["Forearms"], eq: "bw", kind: "core", r: [8, 15], rest: 75, cue: "Curl the hips up, do not just swing the legs. Stop the swinging between reps." },
  { id: "cable_crunch", n: "Cable crunch", m: "Abs", s: [], eq: "cable", kind: "core", r: [12, 18], rest: 75, cue: "Round your spine down toward the floor. Hips do not move." },
  { id: "plank", n: "Plank", m: "Abs", s: ["Lower back"], eq: "bw", kind: "core", t: 1, r: [30, 60], rest: 60, cue: "Squeeze the glutes, tuck the ribs. Quality beats a long sloppy hold." },
  { id: "side_plank", n: "Side plank", m: "Obliques", s: ["Abs"], eq: "bw", kind: "core", t: 1, r: [20, 45], rest: 45, cue: "Hips stacked and lifted. Each side." },
  { id: "pallof", n: "Pallof press", m: "Obliques", s: ["Abs"], eq: "cable", kind: "core", r: [10, 15], rest: 60, cue: "Stand side on, press straight out. Fight the pull, do not twist." },
  { id: "back_ext", n: "Back extension", m: "Lower back", s: ["Glutes", "Hamstrings"], eq: "bw", kind: "core", r: [12, 20], rest: 75, cue: "Rise to straight, not past it. Never hyperextend at the top." },
  { id: "dead_bug", n: "Dead bug", m: "Abs", s: ["Lower back"], eq: "bw", kind: "core", r: [10, 16], rest: 45, cue: "Lower back pressed to the floor the whole time. Slow and boring is right." },
  { id: "bird_dog", n: "Bird dog", m: "Lower back", s: ["Abs", "Glutes"], eq: "bw", kind: "core", r: [8, 12], rest: 45, cue: "Opposite arm and leg. Do not let the hips tip. Each side." },
  { id: "neck_ext", n: "Neck extension", m: "Traps", s: [], eq: "bw", kind: "core", r: [12, 20], rest: 60, cue: "Plate on the back of the head, face down on the bench. Slow, small range." },
  { id: "neck_flex", n: "Neck curl", m: "Traps", s: [], eq: "bw", kind: "core", r: [12, 20], rest: 60, cue: "Face up on the bench, plate on the forehead over a towel. Go very light." },
];

const EXMAP = {};
EXERCISES.forEach(e => (EXMAP[e.id] = e));

// ---------------------------------------------------------------------------
// The week. Six training days and one short reset day.
// Each day is different from its pair, so nothing repeats twice in a week.
// ---------------------------------------------------------------------------

const DAY_NAMES = {
  pushA: "Push A", pullA: "Pull A", legsA: "Legs A",
  pushB: "Push B", pullB: "Pull B", legsB: "Legs B",
  reset: "Core and posture",
};
const DAY_ORDER = ["pushA", "pullA", "legsA", "pushB", "pullB", "legsB", "reset"];

// Sunday first, to match how the week is read. Sun legs, Mon push, Tue pull,
// Wed legs, Thu push, Fri pull, Sat the short reset day.
const DEFAULT_DAYMAP = ["legsA", "pushA", "pullA", "legsB", "pushB", "pullB", "reset"];

const DEFAULT_PLAN = {
  pushA: [
    { ex: "inc_db_press", sets: 4 },
    { ex: "smith_ohp", sets: 3 },
    { ex: "cable_fly_low", sets: 3 },
    { ex: "cable_lat_raise", sets: 4 },
    { ex: "tri_pushdown", sets: 3 },
    { ex: "hang_leg_raise", sets: 3 },
  ],
  pushB: [
    { ex: "inc_smith_press", sets: 4 },
    { ex: "db_ohp", sets: 3 },
    { ex: "dip", sets: 3 },
    { ex: "lean_lat_raise", sets: 4 },
    { ex: "tri_overhead", sets: 3 },
    { ex: "cable_crunch", sets: 3 },
  ],
  pullA: [
    { ex: "pulldown_wide", sets: 4 },
    { ex: "cable_row", sets: 3 },
    { ex: "straight_arm", sets: 3 },
    { ex: "face_pull", sets: 3 },
    { ex: "incline_curl", sets: 3 },
    { ex: "hammer_curl", sets: 3 },
  ],
  pullB: [
    { ex: "pullup", sets: 4 },
    { ex: "chest_sup_row", sets: 3 },
    { ex: "pulldown_close", sets: 3 },
    { ex: "rear_delt_fly", sets: 3 },
    { ex: "preacher_curl", sets: 3 },
    { ex: "shrug", sets: 3 },
  ],
  legsA: [
    { ex: "smith_squat", sets: 4 },
    { ex: "rdl", sets: 3 },
    { ex: "leg_ext", sets: 3 },
    { ex: "calf_standing", sets: 4 },
    { ex: "back_ext", sets: 3 },
  ],
  legsB: [
    { ex: "leg_press", sets: 4 },
    { ex: "leg_curl", sets: 3 },
    { ex: "hip_thrust", sets: 3 },
    { ex: "calf_seated", sets: 4 },
    { ex: "pallof", sets: 3 },
  ],
  reset: [
    { ex: "dead_bug", sets: 3 },
    { ex: "bird_dog", sets: 3 },
    { ex: "side_plank", sets: 3 },
    { ex: "back_ext", sets: 3 },
    { ex: "neck_ext", sets: 2 },
  ],
};

// ---------------------------------------------------------------------------
// Warm-up and cool-down. Eight minutes before, five after. Thirteen total,
// under the fifteen minute ceiling.
// ---------------------------------------------------------------------------

const WARMUP = [
  { n: "Easy cardio", d: "Treadmill or bike, enough to break a light sweat. Not a workout.", s: 180 },
  { n: "Dead hang", d: "Hang off the pull-up bar, shoulders relaxed. Resets the spine after a night in bed.", s: 30 },
  { n: "Chin tucks", d: "Pull the chin straight back, hold two seconds. Ten of them. Undoes the phone posture.", s: 45 },
  { n: "Wall slides", d: "Back to the wall, arms up and down slowly. Ten slow ones. Opens the shoulders.", s: 60 },
  { n: "Cat cow", d: "On the floor, arch and round the spine slowly. Ten rounds. Wakes the lower back gently.", s: 60 },
  { n: "Hip hinge drill", d: "Hands on hips, push them back and come up. Fifteen. Grooves the pattern before you load it.", s: 45 },
  { n: "Light face pulls", d: "One easy set of fifteen on the cable. Switches the rear shoulders on.", s: 60 },
];

const COOLDOWN = [
  { n: "Dead hang", d: "Thirty seconds again. Decompresses everything you just loaded.", s: 30 },
  { n: "Chest stretch", d: "Forearm on the rack upright, turn away. Thirty seconds each side.", s: 60 },
  { n: "Hip flexor stretch", d: "Half kneeling, squeeze the back glute, push the hips forward. Thirty each side.", s: 60 },
  { n: "Hamstring stretch", d: "Heel on a bench, hinge forward with a flat back. Thirty each side.", s: 60 },
  { n: "Child's pose", d: "Sit back on your heels, arms long. Breathe out slowly. Sixty seconds.", s: 60 },
];

// Poses for progress photos, and the tape sites worth tracking.
const POSES = [["front", "Front"], ["back", "Back"], ["side", "Side"]];
const MEASURE_SITES = [
  ["shoulders", "Shoulders", "the widest point, arms relaxed at your sides"],
  ["chest", "Chest", "across the nipple line, breathing out normally"],
  ["waist", "Waist", "right over the belly button, do not suck in"],
  ["arm", "Arm", "the biggest part of the upper arm, flexed"],
  ["forearm", "Forearm", "the biggest part, hand open"],
  ["thigh", "Thigh", "the biggest part, standing relaxed"],
  ["calf", "Calf", "the biggest part, standing"],
  ["neck", "Neck", "just under the Adam's apple"],
];

if (typeof module !== "undefined") module.exports = { MUSCLES, SET_BAND, STEP_BY_EQ, EXERCISES, EXMAP, DAY_NAMES, DAY_ORDER, DEFAULT_DAYMAP, DEFAULT_PLAN, WARMUP, COOLDOWN, POSES, MEASURE_SITES };
