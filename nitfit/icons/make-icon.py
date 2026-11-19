import math
from playwright.sync_api import sync_playwright
S = 1024
# ---- proportions measured from the MF logo (in its own units) ----
RW, RH, RS, RGAP = 236, 156, 40, 22          # letter width, letter height, stroke, gap between letters
k = 471 / (2*RH + RGAP)                        # NF fits the apple glyph's height in the Apple icon
W, H, s, gap = RW*k, RH*k, RS*k, RGAP*k
a = s / 2
def arc_corner(p_prev, p, p_next, r):
    # points where a rounded corner of centre-line radius r starts and ends
    v1 = ((p_prev[0]-p[0]), (p_prev[1]-p[1])); l1 = math.hypot(*v1); v1 = (v1[0]/l1, v1[1]/l1)
    v2 = ((p_next[0]-p[0]), (p_next[1]-p[1])); l2 = math.hypot(*v2); v2 = (v2[0]/l2, v2[1]/l2)
    return (p[0]+v1[0]*r, p[1]+v1[1]*r), (p[0]+v2[0]*r, p[1]+v2[1]*r)
def rounded_poly(pts, r):
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(1, len(pts)-1):
        a1, a2 = arc_corner(pts[i-1], pts[i], pts[i+1], r)
        d += f" L{a1[0]:.1f},{a1[1]:.1f} Q{pts[i][0]:.1f},{pts[i][1]:.1f} {a2[0]:.1f},{a2[1]:.1f}"
    return d + f" L{pts[-1][0]:.1f},{pts[-1][1]:.1f}"
# N: left stem up, diagonal down to the right, right stem up. Outer corners rounded like the F.
n = rounded_poly([(a, H), (a, a), (W-a, H-a), (W-a, 0)], 0.55*s)
# F: stem up into a full-width top bar (rounded outer corner, ~0.75 stroke like the MF), full-width middle bar
fy = H + gap
f_top = rounded_poly([(a, fy+H), (a, fy+a), (W, fy+a)], 0.55*s)
mid = fy + (68 + 20) * k                     # middle bar centre, measured (68..108 of 156)
f_mid = f"M{a:.1f},{mid:.1f} L{W:.1f},{mid:.1f}"
gw, gh = W, 2*H + gap
ox, oy = (S-gw)/2, (S-gh)/2
letters = f'<g transform="translate({ox:.1f},{oy:.1f})" fill="none" stroke="#fff" stroke-width="{s:.1f}" stroke-linecap="butt" stroke-linejoin="miter"><path d="{n}"/><path d="{f_top}"/><path d="{f_mid}"/></g>'
# ---- scanner: near the edges, glassy tube like the Visual Look Up icon ----
inset, arm, r, w = 158, 170, 105, 48
brk = []
for sx, sy in [(1,1),(-1,1),(1,-1),(-1,-1)]:
    x0 = inset if sx == 1 else S-inset; y0 = inset if sy == 1 else S-inset
    brk.append(f"M{x0},{y0+sy*arm} L{x0},{y0+sy*r} A{r},{r} 0 0 {1 if sx*sy==1 else 0} {x0+sx*r},{y0} L{x0+sx*arm},{y0}")
bp = " ".join(brk)
scanner = f'''
<path d="{bp}" fill="none" stroke="#b0b0b2" stroke-width="{w}" stroke-linecap="round"/>
<g filter="url(#soft)"><path d="{bp}" fill="none" stroke="#7f7f81" stroke-width="{w-22}" stroke-linecap="round"/></g>'''
defs = f'''<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#212121"/><stop offset="1" stop-color="#0e0e0e"/></linearGradient>
<linearGradient id="tube" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a4a4a9"/><stop offset=".5" stop-color="#85858a"/><stop offset="1" stop-color="#6c6c71"/></linearGradient>
<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
<mask id="inner"><rect width="{S}" height="{S}" fill="#fff"/></mask>
<mask id="clip"><path d="{bp}" fill="none" stroke="#fff" stroke-width="{w}" stroke-linecap="round" transform="translate(6,7)"/></mask>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feOffset dy="6"/><feGaussianBlur stdDeviation="7"/></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5"/></filter>
</defs>'''
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">{defs}<rect width="{S}" height="{S}" fill="url(#bg)"/>{scanner}{letters}</svg>'
open("/home/claude/nitfit-icon/nitfit4.svg", "w").write(svg)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": S, "height": S}); pg.set_content(f'<html><body style="margin:0">{svg}</body></html>')
    pg.screenshot(path="/home/claude/nitfit-icon/nitfit4-1024.png"); b.close()
print("ok")
