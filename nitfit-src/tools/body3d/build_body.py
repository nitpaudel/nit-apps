# Builds NitFit's 3D muscle body from the free Z-Anatomy model (BodyParts3D data).
# Runs headless with the "bpy" Python module, so nobody has to open Blender.
#
#   python build_body.py <Startup.blend> <out.glb>
#
# Each mesh in the output is named after a tappable part. Most names are the app's own muscle groups.
# A few are sub-parts that open their parent group (see BOPEN in ui.js): Upper/Mid/Lower Chest,
# Outer/Inner Calf, Abductors. "x_..." meshes are for looks only (bones, face, hands, feet, shins).
#
# Licence of the source model: CC BY-SA 4.0 (Z-Anatomy), built on BodyParts3D (DBCLS).
import sys, re, math, bpy, bmesh
from mathutils import Matrix, Vector

SRC, OUT = sys.argv[-2], sys.argv[-1]

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
    "Flexor hallucis longus", "Popliteus muscle", "Extensor digitorum brevis", "Extensor hallucis brevis", "Abductor hallucis",
    "Abductor digiti minimi of foot", "Flexor digitorum brevis", "Dorsal interossei muscles of foot",
    "Superior extensor retinaculum of ankle", "Inferior extensor retinaculum of ankle", "Tendon of extensor digitorum longus",
    "Abductor digiti minimi of hand", "Abductor pollicis brevis", "Deep head of flexor pollicis brevis",
    "Superficial head of flexor pollicis brevis", "Opponens pollicis muscle", "Dorsal interossei muscles of hand",
    "Oblique head of adductor pollicis", "Transverse head of adductor pollicis", "Flexor digiti minimi of hand",
    "Opponens digiti minimi muscle of hand", "Palmar aponeurosis", "Lumbrical muscles of hand",
    "Temporalis muscle", "Superficial part of masseter", "Deep part of masseter", "Frontalis muscle", "Occipitalis muscle",
    "Epicranial aponeurosis", "Temporoparietalis muscle", "Orbital part of orbicularis oculi", "Palpebral part of orbicularis oculi",
    "Orbicularis oris muscle", "Zygomaticus major muscle", "Zygomaticus minor muscle", "Levator labii superioris",
    "Levator nasolabialis", "Levator anguli oris", "Depressor anguli oris", "Depressor labii inferioris", "Mentalis muscle",
    "Buccinator", "Bucinator", "Risorius muscle", "Nasalis muscle", "Procerus muscle", "Corrugator supercilii",
    
    "Obturator internus", "Piriformis muscle", "Superior gemellus muscle", "Inferior gemellus muscle",
    "Quadratus femoris muscle")
BONES = ["Frontal bone", "Parietal bone", "Occipital bone", "Temporal bone", "Sphenoid bone", "Zygomatic bone", "Maxilla", "Mandible",
         "Nasal bone", "Lacrimal bone", "Ethmoid bone", "Vomer", "Palatine bone", "Inferior nasal concha bone",
         "Clavicle", "Scapula", "Humerus", "Radius", "Ulna", "Manubrium of sternum", "Body of sternum", "Xiphoid process",
         "Hip bone", "Sacrum", "Coccyx", "Femur", "Patella", "Tibia", "Fibula", "Hyoid bone", "Thyroid cartilage",
         "Cricoid cartilage"] + [r for r in ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth",
                                                "Tenth", "Eleventh", "Twelfth"] for r in [r + " rib"]]
BONE_RX = re.compile(r"^(Vertebra |Atlas|Axis|Costal cartilage|.*(phalanx|metacarp|metatars)|Calcaneus|Talus|Cuboid|Navicular|"
                     r".*cuneiform|Scaphoid|Lunate|Triquetrum|Pisiform|Trapezium|Trapezoid|Capitate|Hamate|Sesamoid)")
EYES = ["Sclera", "Cornea", "Iris"]

def part_of(obj, coll):
    base = re.sub(r"\.(l|r|j|g)$", "", obj.name)
    if coll == "mus": return M.get(base)
    if coll == "bone": return "x_bone" if (base in BONES or BONE_RX.match(base)) else None
    if coll == "eye": return "x_eye" if base in EYES else None

bpy.ops.wm.open_mainfile(filepath=SRC)
dg = bpy.context.evaluated_depsgraph_get()
# the body's midline, from the breastbone. The right-side (".r") muscles are cleaner in the source data,
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

parts = {}  # part -> list of (vertices, faces)
missing = set(M)
for cname, kind in [("4: Muscular system", "mus"), ("1: Skeletal system", "bone"), ("7: Nervous system & Sense organs", "eye")]:
    for o in objs(cname):
        p = part_of(o, kind)
        if not p: continue
        if kind == "mus" and o.name.endswith(".l") and (o.name[:-2] + ".r") in bpy.data.objects: continue
        missing.discard(re.sub(r"\.(l|r|j|g)$", "", o.name))
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        mw = o.matrix_world
        bm = bmesh.new(); bm.from_mesh(me); bm.transform(mw)
        bmesh.ops.triangulate(bm, faces=bm.faces[:])
        parts.setdefault(p, []).append(bm)
        if kind == "mus" and o.name.endswith(".r") and (o.name[:-2] + ".l") in bpy.data.objects:
            bm2 = bm.copy(); bm2.transform(MIRROR)
            bmesh.ops.reverse_faces(bm2, faces=bm2.faces[:])   # mirroring turns faces inside out; turn them back
            parts[p].append(bm2)
        ev.to_mesh_clear()
print("not found:", sorted(n for n in missing if not n.startswith("(")) )

# The oblique's flat tendon sheet runs over the six-pack. True to life, but it hides the abs,
# so every bit of the obliques that sits right in front of the abs is cut away.
from mathutils.bvhtree import BVHTree
ab = bmesh.new()
for b in parts["Abs"]:
    tmp = bpy.data.meshes.new("t"); b.to_mesh(tmp); ab.from_mesh(tmp); bpy.data.meshes.remove(tmp)
tree = BVHTree.FromBMesh(ab)
FWD = Vector((0, 1, 0))   # the body faces -Y here, so +Y points into the body
cut = 0
for b in parts["Obliques"]:
    kill = [f for f in b.faces if tree.ray_cast(f.calc_center_median(), FWD, 0.04)[0] is not None]
    cut += len(kill)
    bmesh.ops.delete(b, geom=kill, context="FACES")
print("cut", cut, "oblique faces off the abs")

# clear the scene and build one object per part
bpy.ops.wm.read_factory_settings(use_empty=True)
BUDGET = {"x_bone": 30000, "x_muscle": 40000, "x_eye": 1500}
made = []
for p, bms in parts.items():
    me = bpy.data.meshes.new(p); bm = bmesh.new()
    for b in bms:
        tmp = bpy.data.meshes.new("t"); b.to_mesh(tmp); bm.from_mesh(tmp); bpy.data.meshes.remove(tmp); b.free()
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=0.0001)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(p, me); bpy.context.scene.collection.objects.link(ob)
    n = len(me.polygons)
    target = BUDGET.get(p) or max(8000, n * 0.16)   # small muscles stay full detail
    if n > target:
        d = ob.modifiers.new("dec", "DECIMATE"); d.ratio = target / n; d.use_collapse_triangulate = True
        bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier="dec")
    for f in me.polygons: f.use_smooth = True
    made.append(ob)
    print("%-12s %7d -> %6d tris" % (p, n, len(me.polygons)))

# stand it up, centre it, feet on the floor, real size in metres
mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
for ob in made:
    for v in ob.data.vertices:
        for i in range(3): mn[i] = min(mn[i], v.co[i]); mx[i] = max(mx[i], v.co[i])
size = mx - mn
print("bounds", tuple(round(x, 3) for x in size))
H = max(size)   # height axis is the longest one
up = list(size).index(H)
scale = 1.78 / H   # a 178 cm man
cx, cy = (mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2
T = Matrix.Scale(scale, 4) @ Matrix.Translation((-cx, -cy, -mn[2]))
for ob in made: ob.data.transform(T)
print("up axis", "xyz"[up], "scale", scale)

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_normals=True,
                          export_texcoords=False, export_materials="NONE", export_yup=True)
print("wrote", OUT)
