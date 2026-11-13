import sys, os, re, base64

src, out = sys.argv[1], sys.argv[2]
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

js = "\n".join(rd(f) for f in ["data.js", "body.js", "coach.js", "core.js", "ui1.js", "ui2.js", "ui3.js"])
js = re.sub(r'^if \(typeof module !== "undefined"\).*$', "", js, flags=re.M)

css = rd("style.css").replace("/*FONTS*/", font_css())
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
