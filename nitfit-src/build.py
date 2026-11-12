import sys, os, re
src, out = sys.argv[1], sys.argv[2]
rd = lambda f: open(os.path.join(src, f), encoding="utf-8").read()
js = "\n".join(rd(f) for f in ["data.js", "coach.js", "core.js", "ui1.js", "ui2.js", "ui3.js"])
js = re.sub(r'^if \(typeof module !== "undefined"\).*$', "", js, flags=re.M)
html = rd("index.tpl.html").replace("/*CSS*/", rd("style.css")).replace("/*JS*/", js)
bad = [n for n in ["—", "Hevy", "MacroFactor", "Strong app", "Fitbod"] if n in html]
if bad: sys.exit("banned text found: " + repr(bad))
os.makedirs(os.path.join(out, "icons"), exist_ok=True)
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(html)
for f in ["sw.js", "manifest.webmanifest"]: open(os.path.join(out, f), "w", encoding="utf-8").write(rd(f))
print("built", len(html), "bytes")
