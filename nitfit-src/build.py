import sys, os, re

src, out = sys.argv[1], sys.argv[2]
rd = lambda f: open(os.path.join(src, f), encoding="utf-8").read()

js = "\n".join(rd(f) for f in ["data.js", "bodymap.js", "coach.js", "core.js", "ui.js"])
js = re.sub(r'^if \(typeof module !== "undefined"\).*$', "", js, flags=re.M)

import base64
FD = "/home/claude/fonts/node_modules/@fontsource/"
def ff(fam, path, w):
    p = path if os.path.isabs(path) else os.path.join(src, path)
    return "@font-face{font-family:'%s';font-weight:%d;font-style:normal;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, w, base64.b64encode(open(p, "rb").read()).decode())
fonts_dir = os.path.join(src, "fonts")
def fpath(name, alt):
    p = os.path.join(fonts_dir, name)
    return p if os.path.exists(p) else alt
fonts = ff("NF Title", fpath("unbounded-800.woff2", FD + "unbounded/files/unbounded-latin-800-normal.woff2"), 800)
for w in (400, 500, 600, 700):
    fonts += ff("NF Sans", fpath("dmsans-%d.woff2" % w, FD + "dm-sans/files/dm-sans-latin-%d-normal.woff2" % w), w)
css = rd("style.css").replace("/*FONTS*/", fonts)
html = rd("index.tpl.html").replace("/*CSS*/", css).replace("/*JS*/", js)

# Guards. Em dashes are out by Nit's rule, and no other app's name ships inside his app.
bad = [n for n in ["—", "Hevy", "MacroFactor", "Strong app", "Fitbod", "Caliber", "Cal AI"] if n in html]
if bad:
    sys.exit("banned text found: " + repr(bad))

os.makedirs(os.path.join(out, "icons"), exist_ok=True)
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(html)
for f in ["sw.js", "manifest.webmanifest"]:
    open(os.path.join(out, f), "w", encoding="utf-8").write(rd(f))
print("built %s  (%.0f KB)" % (os.path.join(out, "index.html"), len(html.encode()) / 1024))
