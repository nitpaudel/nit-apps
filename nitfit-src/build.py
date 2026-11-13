import sys, os, re, base64, json

# Usage:  build.py <src> <out>            builds the real app
#         build.py <src> <out> --demo     builds the demo, filled with invented data

src, out = sys.argv[1], sys.argv[2]
DEMO = "--demo" in sys.argv[3:]
rd = lambda f: open(os.path.join(src, f), encoding="utf-8").read()

# --- fonts: baked straight into the page so there is no font flash and it works offline ---
WEIGHTS = [400, 500, 600, 700, 800]
def font_css():
    css = []
    for w in WEIGHTS:
        p = os.path.join(src, "fonts", "pjs-%d.woff2" % w)
        b64 = base64.b64encode(open(p, "rb").read()).decode("ascii")
        css.append(
            "@font-face{font-family:Jakarta;font-style:normal;font-weight:%d;font-display:block;"
            "src:url(data:font/woff2;base64,%s) format('woff2')}" % (w, b64)
        )
    return "\n".join(css)

files = ["data.js", "coach.js", "core.js", "ui1.js", "ui2.js", "ui3.js"]
if DEMO:
    files.insert(4, "demo.js")          # after ui1, where ACT exists for it to hang off

js = "const DEMO = %s;\n" % ("true" if DEMO else "false")
js += "\n".join(rd(f) for f in files)
js = re.sub(r'^if \(typeof module !== "undefined"\).*$', "", js, flags=re.M)

css = rd("style.css").replace("/*FONTS*/", font_css())
html = rd("index.tpl.html").replace("/*CSS*/", css).replace("/*JS*/", js)

if DEMO:
    html = html.replace("<title>NitFit</title>", "<title>NitFit Demo</title>")
    html = html.replace('content="NitFit"', 'content="NitFit Demo"')

# Guards. Em dashes are out by Nit's rule, and no other app's name ships inside his app.
bad = [n for n in ["—", "Hevy", "MacroFactor", "Strong app", "Fitbod", "Caliber", "Cal AI"] if n in html]
if bad:
    sys.exit("banned text found: " + repr(bad))

os.makedirs(os.path.join(out, "icons"), exist_ok=True)
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(html)

# The demo needs its own cache name and its own manifest id, so the phone
# treats it as a separate app and the two never share anything.
sw = rd("sw.js")
man = json.loads(rd("manifest.webmanifest"))
if DEMO:
    sw = sw.replace('const CACHE = "nitfit-', 'const CACHE = "nitfitdemo-')
    man["name"] = "NitFit Demo"
    man["short_name"] = "NitFit Demo"
    man["id"] = "/nit-apps/nitfit-demo/"
open(os.path.join(out, "sw.js"), "w", encoding="utf-8").write(sw)
open(os.path.join(out, "manifest.webmanifest"), "w", encoding="utf-8").write(json.dumps(man, indent=2) + "\n")

print("built %s%s  (%.0f KB)" % (os.path.join(out, "index.html"), "  [demo]" if DEMO else "", len(html.encode()) / 1024))
