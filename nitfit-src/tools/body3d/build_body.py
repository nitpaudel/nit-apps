# Builds NitFit's 3D muscle body.
# Runs headless with the "bpy" Python module (Blender as a library), so nobody has to open Blender.
#
#   python build_body.py <Z-Anatomy Startup.blend> <MakeHuman data dir> <out.glb>
#
# Sources (both free):
#   Z-Anatomy (CC BY-SA 4.0), built on BodyParts3D by DBCLS: the muscles, tendons, bones, eyes, hand and foot skin.
#   MakeHuman / MPFB base mesh and targets (CC0): the head and face.
#
# Each mesh in the output is named after a tappable part. Most names are the app's own muscle groups.
# A few are sub-parts that open their parent group (see BOPEN in ui.js): Upper/Mid/Lower Chest,
# Outer/Inner Calf, Abductors. "x_..." meshes are for looks only.
#
# Every vertex carries "_FIB" (a custom glTF attribute): rgb = the muscle's fibre direction, alpha = how much tendon-cream to show.
import sys, re, math, bpy, bmesh
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

SRC, MH_DIR, OUT = sys.argv[-3], sys.argv[-2], sys.argv[-1]

# base name (without .l / .r) -> part name
M = {}
def put(part, *names):
    for n in names: M[n] = part

put("Upper Chest", "Clavicular head of pectoralis major muscle")
put("Mid Chest", "Sternocostal head of pectoralis major muscle")
put("Lower Chest", "(Abdominal part of pectoralis major muscle)")
put("Front Delts", "Clavicular part of deltoid muscle")
put("Side Delts", "Acromial part of deltoid muscle")
put("Rear Delts", "Scapular spinal part of deltoid muscle")
put("Traps", "Descending part of trapezius muscle", "Transverse part of trapezius muscle", "Ascending part of trapezius muscle")
put("Upper Back", "Rhomboid major muscle", "Rhomboid minor muscle", "Infraspinatus muscle", "Teres major muscle",
    "Teres minor muscle", "Supraspinatus muscle", "Serratus posterior superior muscle")
put("Lats", "Latissimus dorsi muscle")
put("Biceps", "Long head of biceps brachii", "Short head of biceps brachii", "Brachialis muscle", "Coracobrachialis muscle")
put("Triceps", "Long head of triceps brachii", "Lateral head of triceps brachii", "Medial head of triceps brachii", "Anconeus muscle")
put("Forearms", "Brachioradialis muscle", "Extensor carpi radialis longus", "Extensor carpi radialis brevis", "Extensor digitorum",
    "Extensor digiti minimi", "Humeral head of extensor carpi ulnaris", "Ulnar head of extensor carpi ulnaris",
    "Flexor carpi radialis", "Palmaris longus muscle", "Humeral head of flexor carpi ulnaris", "Ulnar head of flexor carpi ulnaris",
    "Humero-ulnar head of flexor digitorum superficialis", "Radial head of flexor digitorum superficialis",
    "Superficial head of pronator teres", "Deep head of pronator teres", "Abductor pollicis longus", "Extensor pollicis brevis",
    "Extensor pollicis longus", "Flexor digitorum profundus", "Flexor pollicis longus", "Supinator", "Pronator quadratus",
    "Extensor indicis", "Extensor retinaculum of wrist", "Flexor retinaculum of wrist")
put("Neck", "Sternocleidomastoid muscle", "Splenius capitis muscle", "Splenius colli muscle", "Scalenus anterior muscle",
    "Scalenus medius muscle", "Scalenus posterior muscle", "Levator scapulae", "Omohyoid muscle", "Sternohyoid muscle",
    "Sternothyroid muscle", "Thyrohyoid muscle", "Anterior belly of digastric muscle", "Posterior belly of digastric muscle",
    "Mylohyoid muscle", "Stylohyoid muscle", "Semispinalis capitis muscle", "Longissimus capitis muscle")
put("Abs", "Rectus abdominis muscle", "Pyramidalis muscle", "Linea alba")
put("Obliques", "External abdominal oblique muscle", "Serratus anterior muscle")
put("Lower Back", "Iliocostalis lumborum muscle", "Iliocostalis thoracis muscle", "Longissimus thoracis muscle",
    "Spinalis thoracis muscle", "Quadratus lumborum muscle", "Multifidus lumborum muscle", "Serratus posterior inferior muscle",
    "Posterior layer of thoracolumbar fascia")
put("Glutes", "Gluteus maximus muscle", "Gluteus medius muscle", "Gluteus minimus muscle")
put("Abductors", "Tensor fasciae latae", "Iliotibial tract")
put("Quads", "Rectus femoris muscle", "Vastus lateralis muscle", "Vastus medialis muscle", "Vastus intermedius muscle", "Sartorius muscle")
put("Hamstrings", "Long head of biceps femoris", "Short head of biceps femoris", "Semitendinosus muscle", "Semimembranosus muscle")
put("Adductors", "Adductor longus", "Adductor brevis", "Adductor magnus", "Gracilis muscle", "Pectineus muscle", "Iliacus muscle", "Psoas major")
put("Outer Calf", "Lateral head of gastrocnemius")
put("Inner Calf", "Medial head of gastrocnemius")
put("Calves", "Soleus muscle", "Plantaris muscle", "Calcaneal tendon")
# looks only: muscles the app does not track, so the body is complete
put("x_muscle", "Tibialis anterior muscle", "Extensor digitorum longus", "Extensor hallucis longus", "Fibularis longus muscle",
    "Fibularis brevis muscle", "Fibularis tertius muscle", "Tibialis posterior muscle", "Flexor digitorum longus",
    "Flexor hallucis longus", "Popliteus muscle", "Superior extensor retinaculum of ankle", "Inferior extensor retinaculum of ankle", "Tendon of extensor digitorum longus",
    "Obturator internus", "Piriformis muscle", "Superior gemellus muscle", "Inferior gemellus muscle",
    "Quadratus femoris muscle", "Inguinal ligament", "Medial patellar retinaculum", "Lateral patellar retinaculum")
# bones only fill the small gaps between muscles; they are drawn tendon-cream, like the reference art
BONES = ["Clavicle", "Scapula", "Humerus", "Radius", "Ulna", "Manubrium of sternum", "Body of sternum", "Xiphoid process",
         "Hip bone", "Sacrum", "Coccyx", "Femur", "Patella", "Tibia", "Fibula", "Hyoid bone", "Thyroid cartilage", "Cricoid cartilage",
         "Calcaneus", "Talus"] + [n + " rib" for n in ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth",
                                                      "Ninth", "Tenth", "Eleventh", "Twelfth"]]
BONE_RX = re.compile(r"^(Vertebra |Atlas|Axis|Costal cartilage)")
# skin for hands and feet (the same body's own skin, so it fits exactly)
SKIN_RX = re.compile(r"^(Palm|Dorsum of hand|(Dorsal|Palmar) surfaces of digits of hand|Nail plate|(Anterior|Posterior) region of wrist|"
                     r"Dorsum of foot|(Dorsal|Plantar) surfaces of digits of foot|Nail plate \(foot\)|Perionyx \(foot\)|Heel region|"
                     r"(Lateral|Medial) border of foot|Metatarsal region|Hallucial eminence|Sole|.*arch of foot|(Lateral|Medial) malleolus|"
                     r"(Lateral|Medial) retromalleolar region|Anterior region of ankle)$")
EYES = {"Sclera": "x_eye", "Iris": "x_iris"}   # the clear cornea is left out

def base_of(name): return re.sub(r"\.(l|r|j|g)$", "", name)
def part_of(obj, coll):
    base = base_of(obj.name)
    if coll == "mus": return M.get(base)
    if coll == "bone": return "x_bone" if (base in BONES or BONE_RX.match(base)) else None
    if coll == "eye": return EYES.get(base)
    if coll == "skin": return "x_skin" if SKIN_RX.match(base) else None


# ---- how much each muscle grows (metres, at the middle of the muscle) to match the reference art's
# bodybuilder build. The ends of each muscle stay put, so it swells like a real muscle belly.
BULK = {"Upper Chest": .0165, "Mid Chest": .0180, "Lower Chest": .0135, "Front Delts": .0240, "Side Delts": .0285,
        "Rear Delts": .0225, "Traps": .0195, "Upper Back": .0120, "Lats": .0150, "Biceps": .0263, "Triceps": .0263,
        "Forearms": .0147, "Neck": .0105, "Abs": .0090, "Obliques": .0040, "Lower Back": .0105, "Glutes": .0170,
        "Abductors": .0035, "Quads": .0260, "Hamstrings": .0190, "Adductors": .0130, "Outer Calf": .0283,
        "Inner Calf": .0305, "Calves": .0196, "x_muscle": .0060}
# sheets of tendon: drawn cream all over, like the art
TENDON = {"Inguinal ligament", "Medial patellar retinaculum", "Lateral patellar retinaculum", "Calcaneal tendon", "Iliotibial tract", "Linea alba", "Posterior layer of thoracolumbar fascia",
          "Extensor retinaculum of wrist", "Flexor retinaculum of wrist", "Superior extensor retinaculum of ankle",
          "Inferior extensor retinaculum of ankle", "Tendon of extensor digitorum longus"}
MUSCLE_TRIS = 140000
END = {"Lats": 0.34, "Lower Back": 0.3, "Traps": 0.16, "Upper Back": 0.12, "Obliques": 0.12, "Forearms": 0.2, "Calves": 0.16, "Outer Calf": 0.12, "Inner Calf": 0.12,
       "Quads": 0.11, "Triceps": 0.12, "Biceps": 0.1}   # one side; the other side is a mirror copy

bpy.ops.wm.open_mainfile(filepath=SRC)
dg = bpy.context.evaluated_depsgraph_get()
# The body's midline, from the breastbone. The right-side (".r") muscles are cleaner in the source data,
# so the left side is built as their mirror image, which also makes the body perfectly even.
st = bpy.data.objects["Body of sternum"]
xs = [(st.matrix_world @ v.co).x for v in st.data.vertices]
MID = (min(xs) + max(xs)) / 2
MIRROR = Matrix.Translation((MID, 0, 0)) @ Matrix.Scale(-1, 4, (1, 0, 0)) @ Matrix.Translation((-MID, 0, 0))

def objs(cname):
    seen, out = set(), []
    def walk(c):
        for o in c.objects:
            if o.type == "MESH" and o.name not in seen: seen.add(o.name); out.append(o)
        for ch in c.children: walk(ch)
    walk(bpy.data.collections[cname]); return out

def grab(o, mods=True):
    if mods:
        ev = o.evaluated_get(dg); me = ev.to_mesh()
    else:
        me = o.data
    bm = bmesh.new(); bm.from_mesh(me); bm.transform(o.matrix_world)
    if mods: ev.to_mesh_clear()
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-6)
    bmesh.ops.triangulate(bm, faces=bm.faces[:]); bm.normal_update()
    return bm

def apply_mod(bm, kind, **kw):
    me = bpy.data.meshes.new("t"); bm.to_mesh(me); ob = bpy.data.objects.new("t", me)
    bpy.context.scene.collection.objects.link(ob)
    md = ob.modifiers.new("m", kind)
    for k, v in kw.items(): setattr(md, k, v)
    ev = ob.evaluated_get(bpy.context.evaluated_depsgraph_get()); m2 = ev.to_mesh()
    out = bmesh.new(); out.from_mesh(m2); ev.to_mesh_clear()
    bpy.data.objects.remove(ob); bpy.data.meshes.remove(me)
    bmesh.ops.triangulate(out, faces=out.faces[:]); out.normal_update()
    return out

def axis(bm):
    # the muscle's long direction (its fibres mostly run this way), from the spread of its points
    pts = [v.co.copy() for v in bm.verts]; n = len(pts); c = sum(pts, Vector()) / n
    C = [[0.0] * 3 for _ in range(3)]
    for p in pts:
        d = p - c
        for i in range(3):
            for j in range(3): C[i][j] += d[i] * d[j]
    a = Vector((0.3, 0.9, 0.3))
    for _ in range(40):
        a = Vector([sum(C[i][j] * a[j] for j in range(3)) for i in range(3)]); a.normalize()
    ts = [(p - c).dot(a) for p in pts]
    return c, a, min(ts), max(ts)

def colour(bm, ax=None, c=None, t0=0, t1=1, tendon=0.0, end=0.085):
    # vertex colour: rgb = fibre direction, alpha = how much tendon-cream to show
    L = bm.verts.layers.float_color.get("_FIB") or bm.verts.layers.float_color.new("_FIB")
    span = max(t1 - t0, 1e-6)
    for v in bm.verts:
        w = tendon
        if ax is not None and tendon < 1 and span > 0.12:
            t = ((v.co - c).dot(ax) - t0) / span; e = min(t, 1 - t)
            w = max(w, 1 - min(1, max(0, e / end)))
        d = ax if ax is not None else Vector((0, 0, 1))
        v[L] = (d.x * .5 + .5, d.y * .5 + .5, d.z * .5 + .5, w)

def mirrored(bm):
    b2 = bm.copy(); b2.transform(MIRROR)
    bmesh.ops.reverse_faces(b2, faces=b2.faces[:])   # mirroring turns faces inside out; turn them back
    L = b2.verts.layers.float_color.get("_FIB")
    if L:
        for v in b2.verts: r, g, b, a = v[L]; v[L] = (1 - r, g, b, a)
    return b2

parts = {}
def add(p, bm): parts.setdefault(p, []).append(bm)
def pair(o): return o.name.endswith(".r") and (o.name[:-2] + ".l") in bpy.data.objects
def skip_left(o): return o.name.endswith(".l") and (o.name[:-2] + ".r") in bpy.data.objects

# --- muscles
mus = [(o, part_of(o, "mus")) for o in objs("4: Muscular system")]
mus = [(o, p) for o, p in mus if p and not skip_left(o)]
raw = sum(len(o.data.polygons) for o, p in mus) * 1.6
ratio = min(1.0, MUSCLE_TRIS / raw)
print("muscles", len(mus), "decimate ratio %.3f" % ratio)
abs_bms = []
for o, p in mus:
    bm = grab(o); base = base_of(o.name)
    c, ax, t0, t1 = axis(bm)
    d = BULK.get(p, 0) if base not in TENDON else 0.002
    if d:
        off = {}
        for v in bm.verts:
            t = ((v.co - c).dot(ax) - t0) / max(t1 - t0, 1e-6)
            off[v] = v.normal * d * math.sin(math.pi * min(1, max(0, t))) ** 0.6
        # smooth the push across neighbours so bumpy source normals can't fold the surface inside out
        for _ in range(8):
            nxt = {}
            for v in bm.verts:
                nb = [e.other_vert(v) for e in v.link_edges]
                nxt[v] = off[v] * 0.4 + (sum((off[u] for u in nb), Vector()) / len(nb)) * 0.6 if nb else off[v]
            off = nxt
        for v in bm.verts: v.co += off[v]
    n = len(bm.faces)
    if n > 1200: bm2 = apply_mod(bm, "DECIMATE", ratio=max(ratio, 1200 / n)); bm.free(); bm = bm2
    colour(bm, ax, c, t0, t1, 1.0 if base in TENDON else 0.0, END.get(p, 0.085))
    add(p, bm)
    if p == "Abs": abs_bms.append(bm)
    if pair(o): add(p, mirrored(bm))

# The oblique's flat tendon sheet runs over the six-pack. True to life, but it hides the abs,
# so every bit of the obliques that sits right in front of the abs is cut away.
from mathutils.bvhtree import BVHTree
ab = bmesh.new()
for b in parts["Abs"]:
    me = bpy.data.meshes.new("t"); b.to_mesh(me); ab.from_mesh(me); bpy.data.meshes.remove(me)
tree = BVHTree.FromBMesh(ab); FWD = Vector((0, 1, 0))   # the body faces -Y here
cut = 0
for b in parts["Obliques"]:
    kill = [f for f in b.faces if tree.ray_cast(f.calc_center_median(), FWD, 0.05)[0] is not None]
    cut += len(kill); bmesh.ops.delete(b, geom=kill, context="FACES")
print("cut", cut, "oblique faces off the abs")

# --- bones (only peek through gaps) and eyes
for cname, kind, keep in [("1: Skeletal system", "bone", 0.07), ("7: Nervous system & Sense organs", "eye", 0.25)]:
    for o in objs(cname):
        p = part_of(o, kind)
        if not p: continue
        bm = grab(o); n = len(bm.faces)
        if n > 300: bm2 = apply_mod(bm, "DECIMATE", ratio=max(keep, 300 / n)); bm.free(); bm = bm2
        colour(bm, tendon=1.0); add(p, bm)

# --- skin of hands and feet: patches joined, then smoothed
sk = bmesh.new()
for o in objs("9: Regions of human body"):
    if not part_of(o, "skin") or skip_left(o): continue
    bm = grab(o, mods=False)
    for b in [bm] + ([mirrored(bm)] if pair(o) else []):
        me = bpy.data.meshes.new("t"); b.to_mesh(me); sk.from_mesh(me); bpy.data.meshes.remove(me)
bmesh.ops.remove_doubles(sk, verts=sk.verts[:], dist=0.0008)
sk2 = apply_mod(sk, "SUBSURF", levels=1); sk.free()
colour(sk2); add("x_skin", sk2)
skin_tree = BVHTree.FromBMesh(sk2)
gone = 0
for p in ("Forearms", "x_muscle", "Calves"):
    for b in parts[p]:
        kill = []
        for f in b.faces:
            q = f.calc_center_median(); hit = skin_tree.find_nearest(q, 0.02)
            if hit[0] is not None and (q - hit[0]).dot(hit[1]) < 0.001: kill.append(f)
        gone += len(kill); bmesh.ops.delete(b, geom=kill, context="FACES")
print("removed", gone, "faces hidden inside hand and foot skin")

# --- the head: MakeHuman's CC0 base body (young muscular man), cut at the neck and fitted onto the skull by the eyes
import gzip
def load_mh(path, targets):
    V, F, grp, groups = [], [], None, {}
    for line in open(path):
        if line.startswith("v "): V.append([float(x) for x in line.split()[1:4]])
        elif line.startswith("g "): grp = line.split()[1]
        elif line.startswith("f "):
            idx = [int(t.split("/")[0]) - 1 for t in line.split()[1:]]
            groups.setdefault(grp, []).append(idx)
    for t, w in targets:
        for line in gzip.open(t, "rt"):
            s = line.split()
            if len(s) == 4 and s[0].isdigit():
                i = int(s[0]); V[i] = [V[i][k] + w * float(s[k + 1]) for k in range(3)]
    # MakeHuman is y-up and faces +z; here z is up and the body faces -y
    V = [Vector((x, -z, y)) for x, y, z in V]
    return V, groups

MH, MHT = MH_DIR + "/3dobjs/base.obj", MH_DIR + "/targets/macrodetails/"
V, G = load_mh(MH, [(MHT + "caucasian-male-young.target.gz", 1.0), (MHT + "universal-male-young-maxmuscle-averageweight.target.gz", 1.0)])
def centre(ix): s = set(i for f in ix for i in f); return sum((V[i] for i in s), Vector()) / len(s)
el, er = centre(G["joint-l-eye"]), centre(G["joint-r-eye"])
sc = [b for b in objs("7: Nervous system & Sense organs") if base_of(b.name) == "Sclera"]
def wc(o): return sum((o.matrix_world @ v.co for v in o.data.vertices), Vector()) / len(o.data.vertices)
bl, br = sorted([wc(o) for o in sc], key=lambda p: p.x)
ml, mr = sorted([el, er], key=lambda p: p.x)
s = (br - bl).length / (mr - ml).length
mid_mh, mid_bp = (ml + mr) / 2, (bl + br) / 2
top = max(V[i].z for f in G["body"] for i in f)
cutz = mid_mh.z - 1.55 * (top - mid_mh.z)    # a little under the chin
hb = bmesh.new(); vmap = {}
for f in G["body"]:
    if min(V[i].z for i in f) < cutz: continue
    vs = []
    for i in f:
        if i not in vmap: vmap[i] = hb.verts.new(mid_bp + (V[i] - mid_mh) * s)
        vs.append(vmap[i])
    try: hb.faces.new(vs)
    except ValueError: pass
hb.normal_update()
hd = apply_mod(hb, "SUBSURF", levels=1); hb.free()
colour(hd); add("x_head", hd)
print("head scale %.4f" % s)

# ---- one mesh per part
joined = {}
for p, bms in parts.items():
    bm = bmesh.new()
    for b in bms:
        me = bpy.data.meshes.new("t"); b.to_mesh(me); bm.from_mesh(me); bpy.data.meshes.remove(me)
    bm.normal_update(); joined[p] = bm

# ---- baked shadow in the creases between muscles ("ambient occlusion"), stored per vertex as "_AO".
# Rays go out from each point; the more of them hit the body close by, the darker that point is drawn.
allb = bmesh.new()
for bm in joined.values():
    me = bpy.data.meshes.new("t"); bm.to_mesh(me); allb.from_mesh(me); bpy.data.meshes.remove(me)
world = BVHTree.FromBMesh(allb); allb.free()
import random
random.seed(7)
DIRS = []
while len(DIRS) < 20:   # evenly spread directions over a ball; flipped onto each point's outward side
    v = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)))
    if 0.05 < v.length <= 1: DIRS.append(v.normalized())
for p, bm in joined.items():
    L = bm.verts.layers.float.new("_AO")
    for v in bm.verts:
        n = v.normal; o = v.co + n * 0.0015; hit = 0.0; tot = 0.0
        for d in DIRS:
            c = d.dot(n)
            if c < 0: d = -d; c = -c
            tot += c
            if world.ray_cast(o, d, 0.07)[0] is not None: hit += c
        v[L] = 1.0 - hit / max(tot, 1e-6)
    print("shadow baked:", p)

bpy.ops.wm.read_factory_settings(use_empty=True)
made = []
for p, bm in joined.items():
    me = bpy.data.meshes.new(p); bm.to_mesh(me); bm.free()
    for f in me.polygons: f.use_smooth = True
    ob = bpy.data.objects.new(p, me); bpy.context.scene.collection.objects.link(ob); made.append(ob)
    print("%-12s %7d tris" % (p, len(me.polygons)))

# stand it up, centre it, feet on the floor, real size in metres (a 178 cm man)
mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
for ob in made:
    for v in ob.data.vertices:
        for i in range(3): mn[i] = min(mn[i], v.co[i]); mx[i] = max(mx[i], v.co[i])
scale = 1.78 / (mx.z - mn.z)
T = Matrix.Scale(scale, 4) @ Matrix.Translation((-(mn.x + mx.x) / 2, -(mn.y + mx.y) / 2, -mn.z))
for ob in made: ob.data.transform(T)
# heroic proportions like the reference art: legs 7% longer, a narrower waist (V-taper), then back to 178 cm
HIP, LEG, WZ = 0.95, 1.07, 1.06
def shape(co):
    x, y, z = co
    k = 1 - 0.075 * math.exp(-((z - WZ) / 0.10) ** 2) * min(1, max(0, (0.19 - abs(x)) / 0.06))
    x, y = x * k, y * (1 - (1 - k) * 0.4)
    if z < HIP: z = HIP - (HIP - z) * LEG
    return Vector((x, y, z + HIP * (LEG - 1)))
for ob in made:
    for v in ob.data.vertices: v.co = shape(v.co)
top = max(v.co.z for ob in made for v in ob.data.vertices)
for ob in made: ob.data.transform(Matrix.Scale(1.78 / top, 4))
print("height before", round(mx.z - mn.z, 3), "scale", round(scale, 4))
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_normals=True, export_texcoords=False,
                          export_materials="NONE", export_vertex_color="NONE", export_attributes=True, export_yup=True)
print("wrote", OUT)
