// ---------- NitFit data: exercises, starter plan, foods ----------
// eq: db dumbbell, bb barbell, smith, cable, machine, bw bodyweight
// kind: c big lift, i small lift, core
const STEP_BY_EQ = { db: 2.5, bb: 5, smith: 5, cable: 5, machine: 5, bw: 0 };
const X = (id, n, m, s, eq, kind, lo, hi, rest, cue, extra) => Object.assign({ id, n, m, s: s || [], eq, kind, r: [lo, hi], rest, cue: cue || "" }, extra || {});
const EXERCISES = [
  // chest
  X("incline_db_press", "Incline dumbbell press", "Chest", ["Triceps", "Shoulders"], "db", "c", 8, 12, 150, "Bench at 30 degrees. Lower slow to the upper chest. Elbows a bit tucked."),
  X("flat_db_press", "Flat dumbbell press", "Chest", ["Triceps"], "db", "c", 8, 12, 150, "Shoulder blades pinned back. Lower until the dumbbells reach chest level."),
  X("smith_incline_press", "Smith incline press", "Chest", ["Triceps", "Shoulders"], "smith", "c", 6, 10, 180, "Bar to the upper chest. Pause for a moment at the bottom."),
  X("bench_press", "Barbell bench press", "Chest", ["Triceps", "Shoulders"], "bb", "c", 6, 10, 180, "Feet planted. Bar to mid chest. Do not bounce."),
  X("smith_bench", "Smith bench press", "Chest", ["Triceps"], "smith", "c", 6, 10, 180, "Bar to mid chest. Control the way down."),
  X("pec_deck", "Pec deck", "Chest", [], "machine", "i", 12, 15, 90, "Slow stretch at the back. Squeeze for a second at the front."),
  X("cable_fly_low_high", "Low to high cable fly", "Chest", [], "cable", "i", 12, 15, 90, "Hands start by the hips and finish at face height. This hits the upper chest."),
  X("dips", "Dips", "Chest", ["Triceps"], "bw", "c", 6, 12, 150, "Lean forward a little. Go down until the shoulders are just below the elbows."),
  X("push_up", "Push-up", "Chest", ["Triceps"], "bw", "i", 10, 25, 90, "Body in one straight line. Chest to the floor."),
  // shoulders
  X("db_shoulder_press", "Dumbbell shoulder press", "Shoulders", ["Triceps"], "db", "c", 8, 12, 150, "Seated, back supported. Lower to ear height."),
  X("smith_shoulder_press", "Smith shoulder press", "Shoulders", ["Triceps"], "smith", "c", 6, 10, 150, "Bar comes down in front of the face to chin height."),
  X("cable_lateral_raise", "Cable lateral raise", "Shoulders", [], "cable", "i", 12, 20, 75, "Cable behind the body. Lead with the elbow. Stop at shoulder height."),
  X("db_lateral_raise", "Dumbbell lateral raise", "Shoulders", [], "db", "i", 12, 20, 75, "Lean forward a little. No swinging. Slow on the way down."),
  // rear delts
  X("reverse_pec_deck", "Reverse pec deck", "Rear delts", [], "machine", "i", 12, 20, 75, "Arms almost straight. Pull wide, not back."),
  X("face_pull", "Face pull", "Rear delts", ["Back"], "cable", "i", 15, 20, 75, "Rope to the forehead. Elbows high. Great for posture."),
  X("cable_rear_fly", "Cable rear delt fly", "Rear delts", [], "cable", "i", 12, 20, 75, "Cross the cables. Pull apart with straight arms."),
  // back
  X("pull_up", "Pull-up", "Back", ["Biceps"], "bw", "c", 5, 12, 180, "Full hang at the bottom. Chin over the bar. No kicking."),
  X("chin_up", "Chin-up", "Back", ["Biceps"], "bw", "c", 5, 12, 180, "Palms face you. Full hang at the bottom."),
  X("lat_pulldown", "Lat pulldown", "Back", ["Biceps"], "machine", "c", 8, 12, 150, "Pull the bar to the upper chest. Elbows drive down, not back."),
  X("neutral_pulldown", "Close grip pulldown", "Back", ["Biceps"], "machine", "c", 8, 12, 150, "Palms face each other. Big stretch at the top."),
  X("chest_supported_row", "Chest supported dumbbell row", "Back", ["Biceps", "Rear delts"], "db", "c", 8, 12, 150, "Lie face down on an incline bench. Pull the elbows to the hips."),
  X("one_arm_db_row", "One arm dumbbell row", "Back", ["Biceps", "Rear delts"], "db", "c", 8, 12, 120, "Flat back. Pull to the hip, not the chest."),
  X("one_arm_cable_row", "One arm cable row", "Back", ["Biceps", "Rear delts"], "cable", "c", 10, 12, 120, "Reach forward for the stretch. Pull the elbow past the body."),
  X("seated_cable_row", "Seated cable row", "Back", ["Biceps", "Rear delts"], "cable", "c", 8, 12, 150, "Chest tall. Do not rock the body."),
  X("straight_arm_pulldown", "Straight arm pulldown", "Back", [], "cable", "i", 12, 15, 90, "Arms stay straight. Pull the bar to the thighs."),
  X("back_extension", "Back extension", "Lower back", ["Glutes", "Hamstrings"], "bw", "i", 10, 15, 90, "Slow. Stop when the body is straight. Do not arch past that."),
  // biceps
  X("db_curl", "Dumbbell curl", "Biceps", [], "db", "i", 8, 12, 90, "Elbows stay by the sides. No swinging."),
  X("incline_db_curl", "Incline dumbbell curl", "Biceps", [], "db", "i", 10, 12, 90, "Lie back on an incline bench. Let the arms hang for a full stretch."),
  X("preacher_curl", "Preacher curl", "Biceps", [], "db", "i", 10, 15, 90, "Slow on the way down. Do not lock out hard at the bottom."),
  X("cable_curl", "Cable curl", "Biceps", [], "cable", "i", 10, 15, 90, "Elbows still. Squeeze at the top."),
  X("hammer_curl", "Hammer curl", "Biceps", [], "db", "i", 10, 15, 90, "Palms face each other. Builds the forearm too."),
  X("cable_hammer_curl", "Cable rope hammer curl", "Biceps", [], "cable", "i", 12, 15, 90, "Rope handle. Palms face each other."),
  // triceps
  X("triceps_pushdown", "Triceps pushdown", "Triceps", [], "cable", "i", 10, 15, 90, "Elbows pinned to the sides. Lock out at the bottom."),
  X("overhead_cable_ext", "Overhead cable triceps extension", "Triceps", [], "cable", "i", 10, 15, 90, "Face away from the stack. Deep stretch behind the head."),
  X("db_overhead_ext", "Dumbbell overhead extension", "Triceps", [], "db", "i", 10, 15, 90, "One dumbbell, both hands. Elbows point up."),
  // legs
  X("smith_squat", "Smith squat", "Quads", ["Glutes"], "smith", "c", 6, 10, 180, "Feet a little forward. Go down until the thighs are level with the floor."),
  X("barbell_squat", "Barbell squat", "Quads", ["Glutes", "Lower back"], "bb", "c", 6, 10, 180, "Brace the belly. Knees track over the toes."),
  X("leg_press", "Leg press", "Quads", ["Glutes"], "machine", "c", 8, 12, 150, "Go deep. Do not let the lower back lift off the pad."),
  X("leg_extension", "Leg extension", "Quads", [], "machine", "i", 10, 15, 90, "Pause for a second at the top."),
  X("split_squat", "Bulgarian split squat", "Quads", ["Glutes"], "db", "c", 8, 12, 120, "Back foot on a bench. Front knee tracks over the toes."),
  X("leg_curl", "Leg curl", "Hamstrings", [], "machine", "i", 10, 15, 90, "Hips stay down. Slow on the way back."),
  X("db_rdl", "Dumbbell Romanian deadlift", "Hamstrings", ["Glutes", "Lower back"], "db", "c", 8, 12, 150, "Push the hips back. Back flat. Stop when you feel the hamstrings stretch."),
  X("hip_thrust", "Hip thrust", "Glutes", ["Hamstrings"], "machine", "c", 8, 12, 150, "Chin tucked. Pause at the top."),
  X("hip_abductor", "Hip abductor", "Glutes", [], "machine", "i", 12, 20, 75, "Push the knees out. Slow on the way back."),
  X("hip_adductor", "Hip adductor", "Adductors", [], "machine", "i", 12, 20, 75, "Squeeze the knees together. Slow on the way back."),
  X("standing_calf_raise", "Standing calf raise", "Calves", [], "machine", "i", 10, 15, 75, "Full stretch at the bottom. Pause 1 second at the top."),
  X("seated_calf_raise", "Seated calf raise", "Calves", [], "machine", "i", 12, 20, 75, "Full stretch at the bottom. Pause 1 second at the top."),
  // core and posture
  X("hanging_knee_raise", "Hanging knee raise", "Core", [], "bw", "core", 8, 15, 75, "No swinging. Curl the hips up at the top."),
  X("cable_crunch", "Cable crunch", "Core", [], "cable", "core", 10, 15, 75, "Round the back. Ribs to hips. Hips do not move."),
  X("plank", "Plank", "Core", [], "bw", "core", 30, 60, 60, "Squeeze the glutes. Body in one straight line.", { t: 1 }),
  X("side_plank", "Side plank (each side)", "Core", [], "bw", "core", 20, 45, 45, "Hips high. Body in one straight line.", { t: 1 }),
  X("curl_up", "Curl-up", "Core", [], "bw", "core", 8, 15, 45, "One knee bent, hands under the lower back. Lift the head and shoulders only. Hold 10 seconds each rep."),
  X("bird_dog", "Bird dog (each side)", "Core", ["Lower back"], "bw", "core", 6, 10, 45, "Opposite arm and leg. Hold 10 seconds each rep. Hips stay level."),
  X("dead_bug", "Dead bug (each side)", "Core", [], "bw", "core", 8, 12, 45, "Lower back pressed into the floor the whole time."),
  X("neck_hold", "Neck hold (each direction)", "Neck", [], "bw", "core", 10, 20, 45, "Push the head into your hand and hold. No jerking. Never to failure.", { t: 1 }),
];
const EXMAP = {}; EXERCISES.forEach(e => { e.step = STEP_BY_EQ[e.eq]; EXMAP[e.id] = e; });

const DAY_NAMES = { legsA: "Legs A", pushA: "Push A", pullA: "Pull A", legsB: "Legs B", pushB: "Push B", pullB: "Pull B", core: "Core and posture" };
const DAY_ORDER = ["legsA", "pushA", "pullA", "legsB", "pushB", "pullB", "core"];
// weekday (0 = Sunday) to day
const DEFAULT_DAYMAP = ["legsA", "pushA", "pullA", "legsB", "pushB", "pullB", "core"];
// starter plan. Each exercise shows up once a week so weeks compare fairly.
const P = (ex, sets) => ({ ex, sets });
const DEFAULT_PLAN = {
  legsA: [P("smith_squat", 4), P("leg_curl", 4), P("leg_extension", 3), P("standing_calf_raise", 4), P("hip_adductor", 2), P("hanging_knee_raise", 3), P("plank", 2)],
  pushA: [P("incline_db_press", 3), P("cable_lateral_raise", 4), P("flat_db_press", 2), P("db_shoulder_press", 2), P("triceps_pushdown", 3), P("curl_up", 2)],
  pullA: [P("pull_up", 3), P("chest_supported_row", 3), P("reverse_pec_deck", 3), P("db_curl", 3), P("preacher_curl", 2), P("back_extension", 2), P("side_plank", 2)],
  legsB: [P("leg_press", 4), P("db_rdl", 3), P("hip_thrust", 3), P("seated_calf_raise", 4), P("hip_abductor", 2), P("cable_crunch", 3)],
  pushB: [P("smith_incline_press", 3), P("db_lateral_raise", 4), P("dips", 3), P("cable_fly_low_high", 2), P("overhead_cable_ext", 3), P("dead_bug", 2)],
  pullB: [P("lat_pulldown", 3), P("one_arm_cable_row", 3), P("straight_arm_pulldown", 2), P("face_pull", 3), P("incline_db_curl", 3), P("cable_hammer_curl", 2), P("bird_dog", 2)],
  core: [P("curl_up", 3), P("side_plank", 3), P("bird_dog", 3), P("back_extension", 2)],
};
const WARMUP = ["Easy walk or bike, 3 minutes", "Bodyweight squats x 10", "Arm circles x 10 each way", "Bird dog x 5 each side", "Light face pulls on the cable x 15"];

const MUSCLES = ["Chest", "Shoulders", "Rear delts", "Back", "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes", "Calves", "Core", "Lower back"];
const PRIORITY = { Chest: 1, Shoulders: 1, Back: 1, Biceps: 1, Triceps: 1, Quads: 1, Hamstrings: 1 };
const setBand = m => PRIORITY[m] ? [12, 16] : m === "Lower back" || m === "Glutes" ? [4, 10] : [8, 12];

// foods: kcal, protein, carbs, fat for one home portion. Portions are best guesses until weighed.
const F = (id, n, unit, kcal, p, c, f) => ({ id, n, unit, kcal, p, c, f });
const FOODS = [
  F("dalbhat", "Dal bhat plate", "rice, dal, tarkari", 551, 15.4, 110.6, 5.2),
  F("shake", "Shake", "milk, oats, banana, peanut butter", 550, 19.9, 67.7, 23.5),
  F("egg", "Egg", "1 egg", 72, 6.3, 0.4, 4.8),
  F("soya", "Soya chunks", "30 g dry", 104, 15.6, 10, 0.2),
  F("peanuts", "Peanuts", "1 handful", 171, 7.9, 8, 11.9),
  F("milk", "Milk", "1 glass", 168, 8, 11, 10.3),
  F("coffee", "Coffee, your usual", "milk and sugar", 300, 4.8, 56.3, 6.2),
  F("chicken_bone", "Chicken curry", "your 250 g, with bone", 294, 32.8, 0, 17),
  F("chicken", "Chicken curry, boneless", "your 250 g", 392, 47.8, 0, 20.7),
  F("waiwai", "Instant noodles", "1 pack", 346, 8, 44, 15),
  F("roti", "Roti", "1 roti", 96, 3.2, 19.3, 0.5),
  F("curd", "Curd", "1 katori", 90, 4.7, 4.5, 6),
  F("banana", "Banana", "1 banana", 105, 1.2, 23.6, 0.3),
  F("pb", "Peanut butter", "1 big spoon", 96, 3.6, 3.6, 8.2),
  F("rice", "Extra rice", "small plate", 258, 5, 58.8, 0.3),
  F("dal", "Extra dal", "1 katori", 72, 5, 11.1, 0.9),
  F("oats", "Oats", "40 g", 148, 5.5, 27.3, 2.7),
  F("ghee", "Oil or ghee", "1 big spoon", 122, 0, 0, 13.6),
];
const FOODMAP = {}; FOODS.forEach(f => FOODMAP[f.id] = f);
const DEFAULT_USUAL = [["dalbhat", 2], ["shake", 1], ["egg", 4], ["coffee", 1]];

const MEASURE_SITES = [["shoulders", "Shoulders", "around the widest part, arms down"], ["chest", "Chest", "across the nipples"], ["waist", "Waist", "at the belly button"], ["neck", "Neck", "just below the Adam's apple"], ["arm", "Arm, flexed", "biggest part"], ["thigh", "Thigh", "middle of the thigh"], ["calf", "Calf", "widest part"]];
const POSES = [["front", "Front"], ["side", "Side"], ["back", "Back"], ["lat", "Lat spread"]];
if (typeof module !== "undefined") module.exports = { EXERCISES, EXMAP, DEFAULT_PLAN, DEFAULT_DAYMAP, FOODS, FOODMAP, MUSCLES, setBand };
