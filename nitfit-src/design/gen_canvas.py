import json, os, datetime
OUT = "/home/claude/canvas/project"
W, H = 390, 844

def page(title, theme_vars, body, extra_css="", fonts=""):
    vars_ = ";".join(f"--{k}:{v}" for k, v in theme_vars.items())
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{fonts}
<style>
body{{margin:0}}
a{{color:inherit}}a:hover{{color:inherit}}
{extra_css}
</style>
</helmet>
<div style="{vars_};width:{W}px;height:{H}px;box-sizing:border-box;position:relative;overflow:hidden;background:var(--bg);color:var(--fg);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{W},"height":{H}}}}}'>
class Component extends DCLogic {{
renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''

INTER = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap">'
BARLOW = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap">'

# ---------- shared data ----------
PLAN = [("Smith incline press", "3 × 35 kg × 9"), ("Dumbbell lateral raise", "4 × 7.5 kg × 15"), ("Dips", "3 × 10"),
        ("Low to high cable fly", "2 × 15 kg × 12"), ("Overhead cable extension", "3 × 20 kg × 12"), ("Dead bug", "2 × 10")]
HIST = [("12 Nov", "35 × 12, 9, 8"), ("5 Nov", "35 × 9, 8, 8"), ("29 Oct", "32.5 × 10, 9, 9"), ("22 Oct", "32.5 × 9, 9, 8"), ("15 Oct", "30 × 11, 10, 9")]
PTS = [(8,127.6),(50.5,122),(93,103.8),(135.5,103.8),(178,84.2),(220.5,66),(263,73),(305.5,50.6),(348,24)]
poly = " ".join(f"{x},{y}" for x, y in PTS)

def icon(name, size=24, sw=1.8):
    p = {
      "today": '<path d="M13 3L5 13.5h6L10 21l9-11.5h-6.5L13 3z"/>',
      "progress": '<path d="M4 19V5M4 19h16M8 15l3.5-4 3 2.5L19 8"/>',
      "food": '<path d="M4 11h16a8 8 0 01-16 0z"/><path d="M9 7.5c0-1.5 1-1.5 1-3M14 7.5c0-1.5 1-1.5 1-3"/>',
      "body": '<circle cx="12" cy="4.8" r="2.2"/><path d="M5.5 9.5h13M12 9.5v5M9.2 21l2.8-6.5 2.8 6.5"/>',
      "settings": '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
      "back": '<path d="M15 5l-7 7 7 7"/>',
      "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
      "plus": '<path d="M12 5v14M5 12h14"/>',
      "flame": '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2.5 1.5-4 2.5-5 .3 2 1.3 3 2.5 3-1-3 0-6 0-8z"/>',
      "more": '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
      "chev": '<path d="M9 5l7 7-7 7"/>',
    }[name]
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" style="stroke:currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{p}</svg>'

def tabbar(active, style):
    names = [("today","Today"),("progress","Progress"),("food","Food"),("body","Body"),("settings","Settings")]
    items = ""
    for k, lbl in names:
        col = "var(--fg)" if k == active else "var(--fg3)"
        if style == "bold": lbl = lbl.upper()
        lab_css = "font-size:10px;font-weight:600;letter-spacing:.06em" if style=="bold" else "font-size:10px;font-weight:600"
        items += f'<button type="button" style="flex:1;background:none;border:0;padding:6px 0 0;display:flex;flex-direction:column;align-items:center;gap:3px;color:{col};font-family:inherit">{icon(k,26,1.9 if k==active else 1.6)}<span style="{lab_css}">{lbl}</span></button>'
    return f'<nav aria-label="Tabs" style="position:absolute;left:0;right:0;bottom:0;height:84px;background:var(--bar);border-top:0.5px solid var(--sep);display:flex;padding:0 8px 26px;box-sizing:border-box">{items}</nav>'

# ================= A: CLEAN (Apple Health) =================
A_L = dict(bg="#F2F2F7", card="#FFFFFF", fg="#000000", fg2="rgba(60,60,67,.6)", fg3="rgba(60,60,67,.32)", sep="rgba(60,60,67,.2)", fill="rgba(118,118,128,.12)", btn="#000000", btnfg="#FFFFFF", bar="rgba(249,249,249,.94)", seg="#FFFFFF")
A_D = dict(bg="#000000", card="#1C1C1E", fg="#FFFFFF", fg2="rgba(235,235,245,.6)", fg3="rgba(235,235,245,.32)", sep="rgba(84,84,88,.6)", fill="rgba(118,118,128,.24)", btn="#FFFFFF", btnfg="#000000", bar="rgba(22,22,24,.94)", seg="#636366")
ROUND = "ui-rounded,'SF Pro Rounded',-apple-system,'Inter',system-ui,sans-serif"

def a_today(t):
    rows = "".join(f'<div style="display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-top:0.5px solid var(--sep);font-size:15px"><span>{n}</span><span style="color:var(--fg2);white-space:nowrap">{v}</span></div>' for n, v in PLAN[:5])
    body = f'''
<div style="padding:60px 16px 0;display:flex;flex-direction:column">
  <div style="font-size:15px;color:var(--fg2);font-weight:500">Thursday, 12 November</div>
  <h1 style="margin:2px 0 16px;font-size:34px;line-height:41px;font-weight:700;letter-spacing:.011em">Today</h1>
  <div style="background:var(--card);border-radius:22px;padding:14px 16px;margin-bottom:12px">
    <div style="font-size:13px;font-weight:600;color:var(--fg2);margin-bottom:4px">Coach</div>
    <div style="font-size:17px;line-height:22px;font-weight:500">Weigh in before breakfast. Push B is waiting, and you beat it last week.</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:28px">
    <div style="background:var(--card);border-radius:22px;padding:14px 16px">
      <div style="font-size:13px;font-weight:600;color:var(--fg2)">Weight</div>
      <div style="margin-top:6px;font-family:{ROUND};font-size:28px;font-weight:700;letter-spacing:.01em">60.4<span style="font-size:17px;font-weight:600;color:var(--fg2)"> kg</span></div>
      <div style="font-size:13px;color:var(--fg2);margin-top:2px">Trend +0.18 a week</div>
    </div>
    <div style="background:var(--card);border-radius:22px;padding:14px 16px">
      <div style="font-size:13px;font-weight:600;color:var(--fg2)">Food</div>
      <div style="margin-top:6px;font-family:{ROUND};font-size:28px;font-weight:700;letter-spacing:.01em">1,840<span style="font-size:17px;font-weight:600;color:var(--fg2)"> left</span></div>
      <div style="font-size:13px;color:var(--fg2);margin-top:2px">64 g protein to go</div>
    </div>
  </div>
  <h2 style="margin:0 0 10px;font-size:22px;line-height:28px;font-weight:700">Workout</h2>
  <div style="background:var(--card);border-radius:22px;padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
      <div style="font-size:20px;font-weight:600">Push B</div>
      <div style="font-size:13px;color:var(--fg2)">Week 1 of 6</div>
    </div>
    {rows}
    <button type="button" style="margin-top:14px;width:100%;height:50px;border:0;border-radius:14px;background:var(--btn);color:var(--btnfg);font-family:inherit;font-size:17px;font-weight:600">Start workout</button>
  </div>
</div>
{tabbar("today","clean")}'''
    return body

def set_row(style, n, prev, kg, reps, state):
    # state: done, current, todo
    if style == "clean":
        fld = lambda v, s: f'<div style="height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;{s}">{v}</div>'
        if state == "done":
            k, r = fld(kg, "font-weight:600"), fld(reps, "font-weight:600")
            chk = f'<button type="button" aria-label="Set {n} done" style="width:30px;height:30px;border-radius:9px;border:0;background:var(--fg);color:var(--card);display:flex;align-items:center;justify-content:center;justify-self:end">{icon("check",18,2.6)}</button>'
        else:
            s = "background:var(--fill);font-weight:500" + (";box-shadow:inset 0 0 0 1.5px var(--fg)" if state == "current" else "")
            k, r = fld(kg, s), fld(reps, s)
            chk = f'<button type="button" aria-label="Log set {n}" style="width:30px;height:30px;border-radius:9px;border:1.5px solid var(--fg3);background:none;justify-self:end"></button>'
        return f'<div style="display:grid;grid-template-columns:28px 1fr 72px 60px 40px;gap:8px;align-items:center;padding:5px 0"><span style="font-size:15px;font-weight:600;color:var(--fg2);text-align:center">{n}</span><span style="font-size:15px;color:var(--fg2)">{prev}</span>{k}{r}{chk}</div>'

def a_workout(t):
    hdr = '<div style="display:grid;grid-template-columns:28px 1fr 72px 60px 40px;gap:8px;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--fg2);padding:0 0 4px"><span style="text-align:center">SET</span><span>LAST TIME</span><span style="text-align:center">KG</span><span style="text-align:center">REPS</span><span></span></div>'
    ex1 = hdr + set_row("clean",1,"35 × 8","35","9","done") + set_row("clean",2,"35 × 8","35","9","done") + set_row("clean",3,"35 × 7","35","9","current")
    ex2 = hdr + "".join(set_row("clean",i,"7.5 × 14","7.5","15","todo") for i in range(1,5))
    body = f'''
<div style="padding:56px 16px 0;display:flex;align-items:center;justify-content:space-between">
  <div><div style="font-size:17px;font-weight:600">24:17</div><div style="font-size:13px;color:var(--fg2)">6 of 17 sets</div></div>
  <button type="button" style="height:36px;padding:0 18px;border:0;border-radius:18px;background:var(--btn);color:var(--btnfg);font-family:inherit;font-size:15px;font-weight:600">Finish</button>
</div>
<div style="padding:10px 16px 0">
  <h1 style="margin:0 0 14px;font-size:28px;line-height:34px;font-weight:700;letter-spacing:.013em">Push B</h1>
  <div style="background:var(--card);border-radius:22px;padding:16px 12px 10px;margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:0 4px">
      <div><div style="font-size:20px;font-weight:600">Smith incline press</div><div style="font-size:15px;color:var(--fg2);margin-top:2px">3 × 35 kg × 9 · rest 2:30</div></div>
      <button type="button" aria-label="More" style="border:0;background:var(--fill);color:var(--fg2);width:32px;height:32px;border-radius:16px;display:flex;align-items:center;justify-content:center">{icon("more",20,2)}</button>
    </div>
    <div style="font-size:15px;line-height:20px;padding:10px 4px 12px">Last time 35 × 8, 8, 7. Same weight. Beat it by one rep.</div>
    {ex1}
  </div>
  <div style="background:var(--card);border-radius:22px;padding:16px 12px 10px">
    <div style="padding:0 4px 12px"><div style="font-size:20px;font-weight:600">Dumbbell lateral raise</div><div style="font-size:15px;color:var(--fg2);margin-top:2px">4 × 7.5 kg × 15 · rest 1:15</div></div>
    {ex2}
  </div>
</div>
<div style="position:absolute;left:0;right:0;bottom:0;background:var(--bar);border-top:0.5px solid var(--sep);padding:0 16px 30px">
  <div style="height:3px;background:var(--fill);border-radius:2px;margin:0 -16px 12px"><div style="width:44%;height:3px;background:var(--fg)"></div></div>
  <div style="display:flex;align-items:center;gap:10px">
    <div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--fg2)">Rest</div><div style="font-size:34px;line-height:38px;font-weight:600;font-family:{ROUND}">1:24</div></div>
    <button type="button" style="height:44px;padding:0 14px;border:0;border-radius:12px;background:var(--fill);color:var(--fg);font-family:inherit;font-size:15px;font-weight:600">−15</button>
    <button type="button" style="height:44px;padding:0 14px;border:0;border-radius:12px;background:var(--fill);color:var(--fg);font-family:inherit;font-size:15px;font-weight:600">+15</button>
    <button type="button" style="height:44px;padding:0 16px;border:0;border-radius:12px;background:var(--fill);color:var(--fg);font-family:inherit;font-size:15px;font-weight:600">Skip</button>
  </div>
</div>'''
    return body

def chart_svg(kind, h=170, w=326):
    gw = w - 36 if kind in ("clean","soft") else w
    grid = ""
    if kind in ("clean","soft"):
        for i, y in enumerate([10, 52, 94, 136]):
            lab = ["50","47","44","41"][i]
            dash = 'stroke-dasharray="3 4"' if kind == "soft" else ""
            grid += f'<line x1="0" x2="{gw}" y1="{y}" y2="{y}" style="stroke:var(--sep)" stroke-width="1" {dash}/><text x="{gw+8}" y="{y+4}" font-size="11" style="fill:var(--fg2)">{lab}</text>'
    if kind == "bold":
        grid += f'<rect x="0" y="60" width="{w}" height="50" style="fill:var(--band)"/><text x="0" y="54" font-size="10" font-weight="600" letter-spacing="1" style="fill:var(--fg2)">YOUR 6 WEEK RANGE</text>'
    sx = (gw - 14) / 348
    pts = [(x*sx + 4, y) for x, y in PTS]
    pl = " ".join(f"{x:.1f},{y}" for x, y in pts)
    dots = ""
    for i, (x, y) in enumerate(pts):
        last = i == len(pts)-1
        if kind == "bold":
            dots += f'<circle cx="{x:.1f}" cy="{y}" r="{5 if last else 3.5}" style="fill:{"var(--fg)" if last else "var(--bg)"};stroke:var(--fg)" stroke-width="2"/>'
        elif kind == "soft":
            if last: dots += f'<circle cx="{x:.1f}" cy="{y}" r="9" style="fill:var(--fg);opacity:.12"/><circle cx="{x:.1f}" cy="{y}" r="5" style="fill:var(--fg)"/>'
        else:
            dots += f'<circle cx="{x:.1f}" cy="{y}" r="{4 if last else 3}" style="fill:var(--fg)"/>'
    lw = 2.5 if kind == "soft" else 2
    return f'<svg role="img" aria-label="Strength score rising from 41.6 to 49 kg over 6 weeks" width="{w}" height="{h}" viewBox="0 0 {w} 160" style="display:block;overflow:visible">{grid}<polyline points="{pl}" fill="none" style="stroke:var(--fg)" stroke-width="{lw}" stroke-linejoin="round" stroke-linecap="round"/>{dots}</svg>'

def a_lift(t):
    seg = "".join(f'<button type="button" style="flex:1;height:28px;border:0;border-radius:7px;font-family:inherit;font-size:13px;font-weight:{600 if s=="3M" else 500};color:var(--fg);background:{"var(--seg)" if s=="3M" else "transparent"};{"box-shadow:0 1px 3px rgba(0,0,0,.12)" if s=="3M" else ""}">{s}</button>' for s in ["1M","3M","6M","1Y","All"])
    hist = "".join(f'<div style="display:flex;justify-content:space-between;padding:12px 0;{"" if i==0 else "border-top:0.5px solid var(--sep);"}font-size:17px"><span>{d}</span><span style="color:var(--fg2)">{s}</span></div>' for i,(d,s) in enumerate(HIST))
    body = f'''
<div style="padding:56px 16px 0">
  <button type="button" style="border:0;background:none;padding:0;color:var(--fg);font-family:inherit;font-size:17px;display:flex;align-items:center;gap:2px;margin-left:-6px">{icon("back",24,2)}Progress</button>
  <h1 style="margin:10px 0 18px;font-size:28px;line-height:34px;font-weight:700;letter-spacing:.013em">Smith incline press</h1>
  <div style="display:flex;background:var(--fill);border-radius:9px;padding:2px;margin-bottom:16px">{seg}</div>
  <div style="font-size:13px;font-weight:600;color:var(--fg2);letter-spacing:.02em">STRENGTH SCORE</div>
  <div style="font-family:{ROUND};font-size:40px;font-weight:700;line-height:46px">49<span style="font-size:20px;font-weight:600;color:var(--fg2)"> kg</span></div>
  <div style="font-size:15px;color:var(--fg2);margin-bottom:12px">1 Oct to 12 Nov · up 7.4 kg</div>
  <div style="background:var(--card);border-radius:22px;padding:18px 16px 10px">
    {chart_svg("clean",170,326)}
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--fg2);padding:6px 40px 0 0"><span>1 Oct</span><span>22 Oct</span><span>12 Nov</span></div>
  </div>
  <h2 style="margin:24px 0 8px;font-size:22px;font-weight:700">History</h2>
  <div style="background:var(--card);border-radius:22px;padding:2px 16px">{hist}</div>
</div>'''
    return body

# ================= B: SOFT (Cal AI) =================
B_L = dict(bg="#F6F6F7", card="#FFFFFF", fg="#0A0A0A", fg2="#86868B", fg3="#B8B8BD", sep="#ECECEE", fill="#F1F1F3", track="#ECECEE", btn="#0A0A0A", btnfg="#FFFFFF", bar="rgba(255,255,255,.96)", shadow="0 1px 2px rgba(0,0,0,.04),0 6px 20px rgba(0,0,0,.05)")
B_D = dict(bg="#000000", card="#141414", fg="#FFFFFF", fg2="#8E8E93", fg3="#55555A", sep="#232325", fill="#1F1F21", track="#2A2A2C", btn="#FFFFFF", btnfg="#000000", bar="rgba(10,10,10,.96)", shadow="none")

def ring(size, sw, pct, inner=""):
    r = (size - sw) / 2; c = 2*3.14159*r
    return f'<div style="position:relative;width:{size}px;height:{size}px;flex:none"><svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" aria-hidden="true" style="transform:rotate(-90deg)"><circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" style="stroke:var(--track)" stroke-width="{sw}"/><circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" style="stroke:var(--fg)" stroke-width="{sw}" stroke-linecap="round" stroke-dasharray="{c*pct:.1f} {c:.1f}"/></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">{inner}</div></div>'

CARD_B = "background:var(--card);border-radius:24px;box-shadow:var(--shadow)"

def b_today(t):
    days = [("S","8","done"),("M","9","done"),("T","10","done"),("W","11","done"),("T","12","today"),("F","13",""),("S","14","")]
    strip = ""
    for l, n, s in days:
        if s == "today": circ = "background:var(--fg);color:var(--bg);"
        elif s == "done": circ = "border:1.5px solid var(--fg);"
        else: circ = "border:1.5px dashed var(--fg3);color:var(--fg2);"
        strip += f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1"><span style="font-size:12px;font-weight:600;color:var(--fg2)">{l}</span><span style="width:34px;height:34px;border-radius:17px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;{circ}">{n}</span></div>'
    macro = lambda v, l, p: f'<div style="{CARD_B};padding:14px 12px 14px;display:flex;flex-direction:column;gap:10px"><div><div style="font-size:20px;font-weight:800;letter-spacing:-.02em">{v}</div><div style="font-size:12px;color:var(--fg2);font-weight:500">{l}</div></div>{ring(52,5,p)}</div>'
    plan = "".join(f'<div style="display:flex;justify-content:space-between;padding:9px 0;font-size:15px;{"border-top:1px solid var(--sep);" if i else ""}"><span style="font-weight:500">{n}</span><span style="color:var(--fg2)">{v}</span></div>' for i,(n,v) in enumerate(PLAN[:3]))
    body = f'''
<div style="padding:58px 20px 0">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div style="font-size:24px;font-weight:800;letter-spacing:-.03em">NitFit</div>
    <div style="{CARD_B};border-radius:20px;height:36px;padding:0 12px;display:flex;align-items:center;gap:5px;font-size:15px;font-weight:700">{icon("flame",18,2)}12</div>
  </div>
  <div style="display:flex;margin:18px -4px 18px">{strip}</div>
  <div style="{CARD_B};padding:20px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <div><div style="font-size:44px;line-height:48px;font-weight:800;letter-spacing:-.035em">1,840</div><div style="font-size:15px;color:var(--fg2);font-weight:500">Calories left</div></div>
    {ring(96,8,0.3,icon("flame",26,2))}
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:22px">{macro("64g","Protein left",0.47)}{macro("212g","Carbs left",0.35)}{macro("41g","Fat left",0.4)}</div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px"><div style="font-size:18px;font-weight:700">Today's workout</div><div style="font-size:13px;color:var(--fg2);font-weight:600">Week 1 of 6</div></div>
  <div style="{CARD_B};padding:16px 18px">
    <div style="font-size:22px;font-weight:800;letter-spacing:-.02em">Push B</div>
    <div style="font-size:14px;color:var(--fg2);font-weight:600;margin-top:2px">Smith incline press, lateral raise, dips and 3 more · 70 min</div>
    <button type="button" style="margin-top:14px;width:100%;height:52px;border:0;border-radius:26px;background:var(--btn);color:var(--btnfg);font-family:inherit;font-size:16px;font-weight:700">Start Push B</button>
  </div>
</div>
<button type="button" aria-label="Add" style="position:absolute;right:20px;bottom:100px;width:58px;height:58px;border-radius:29px;border:0;background:var(--btn);color:var(--btnfg);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.18)">{icon("plus",28,2.4)}</button>
{tabbar("today","soft")}'''
    return body

def b_row(n, prev, kg, reps, state):
    if state == "done":
        badge = f'<span style="width:32px;height:32px;border-radius:16px;background:var(--fg);color:var(--bg);display:flex;align-items:center;justify-content:center">{icon("check",16,2.8)}</span>'
        pill = lambda v, u: f'<div style="height:44px;border-radius:14px;display:flex;align-items:baseline;justify-content:center;gap:3px;padding-top:11px;box-sizing:border-box"><b style="font-size:19px;font-weight:800;letter-spacing:-.02em">{v}</b><span style="font-size:13px;color:var(--fg2);font-weight:600">{u}</span></div>'
    else:
        cur = state == "current"
        badge = f'<span style="width:32px;height:32px;border-radius:16px;box-sizing:border-box;border:1.5px solid {"var(--fg)" if cur else "var(--fg3)"};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:{"var(--fg)" if cur else "var(--fg2)"}">{n}</span>'
        pill = lambda v, u: f'<div style="height:44px;border-radius:14px;background:var(--fill);{"box-shadow:inset 0 0 0 1.5px var(--fg);" if cur else ""}display:flex;align-items:baseline;justify-content:center;gap:3px;padding-top:11px;box-sizing:border-box"><b style="font-size:19px;font-weight:800;letter-spacing:-.02em">{v}</b><span style="font-size:13px;color:var(--fg2);font-weight:600">{u}</span></div>'
    return f'<div style="display:grid;grid-template-columns:32px 1fr 1fr 70px;gap:10px;align-items:center;padding:4px 0">{badge}{pill(kg,"kg")}{pill(reps,"reps")}<span style="font-size:13px;color:var(--fg2);text-align:right;font-weight:500">{prev}</span></div>'

def b_workout(t):
    rows = b_row(1,"35 × 8","35","9","done") + b_row(2,"35 × 8","35","9","done") + b_row(3,"35 × 7","35","9","current")
    body = f'''
<div style="padding:54px 20px 0;display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:10px">
  <button type="button" aria-label="Back" style="width:44px;height:44px;border-radius:22px;border:0;background:var(--card);box-shadow:var(--shadow);color:var(--fg);display:flex;align-items:center;justify-content:center">{icon("back",22,2.2)}</button>
  <div style="text-align:center"><div style="font-size:17px;font-weight:800;letter-spacing:-.01em">Push B</div><div style="font-size:13px;color:var(--fg2);font-weight:600">24:17</div></div>
  <button type="button" style="height:44px;padding:0 18px;border:0;border-radius:22px;background:var(--btn);color:var(--btnfg);font-family:inherit;font-size:15px;font-weight:700">Finish</button>
</div>
<div style="padding:16px 20px 0">
  <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:var(--fg2);margin-bottom:6px"><span>6 of 17 sets</span><span>1,420 kg lifted</span></div>
  <div style="height:6px;border-radius:3px;background:var(--track);margin-bottom:16px"><div style="width:35%;height:6px;border-radius:3px;background:var(--fg)"></div></div>
  <div style="{CARD_B};padding:18px 16px 12px;margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
      <div><div style="font-size:20px;font-weight:800;letter-spacing:-.02em">Smith incline press</div><div style="font-size:14px;color:var(--fg2);font-weight:600;margin-top:2px">3 × 35 kg × 9 · rest 2:30</div></div>
      <button type="button" aria-label="More" style="border:0;background:var(--fill);color:var(--fg);width:36px;height:36px;border-radius:18px;display:flex;align-items:center;justify-content:center">{icon("more",20,2.2)}</button>
    </div>
    <div style="background:var(--fill);border-radius:14px;padding:11px 14px;font-size:14px;line-height:19px;font-weight:500;margin-bottom:12px">Last time 35 × 8, 8, 7. Same weight. Beat it by one rep.</div>
    {rows}
  </div>
  <div style="{CARD_B};padding:16px;display:flex;align-items:center;gap:12px;margin-bottom:10px">
    <span style="width:32px;height:32px;border-radius:16px;border:1.5px solid var(--fg3);box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--fg2)">2</span>
    <div style="flex:1"><div style="font-size:17px;font-weight:700">Dumbbell lateral raise</div><div style="font-size:13px;color:var(--fg2);font-weight:600">4 × 7.5 kg × 15</div></div>
    <span style="color:var(--fg3)">{icon("chev",20,2.2)}</span>
  </div>
  <div style="{CARD_B};padding:16px;display:flex;align-items:center;gap:12px">
    <span style="width:32px;height:32px;border-radius:16px;border:1.5px solid var(--fg3);box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--fg2)">3</span>
    <div style="flex:1"><div style="font-size:17px;font-weight:700">Dips</div><div style="font-size:13px;color:var(--fg2);font-weight:600">3 × 10</div></div>
    <span style="color:var(--fg3)">{icon("chev",20,2.2)}</span>
  </div>
</div>
<div style="position:absolute;left:16px;right:16px;bottom:30px;border-radius:28px;background:var(--btn);color:var(--btnfg);padding:14px 14px 14px 22px;display:flex;align-items:center;gap:8px;box-shadow:0 10px 30px rgba(0,0,0,.2)">
  <div style="flex:1"><div style="font-size:12px;font-weight:700;opacity:.6">Rest</div><div style="font-size:32px;line-height:34px;font-weight:800;letter-spacing:-.03em">1:24</div></div>
  <button type="button" style="height:44px;min-width:52px;border:0;border-radius:22px;background:rgba(128,128,128,.22);color:inherit;font-family:inherit;font-size:15px;font-weight:700">−15</button>
  <button type="button" style="height:44px;min-width:52px;border:0;border-radius:22px;background:rgba(128,128,128,.22);color:inherit;font-family:inherit;font-size:15px;font-weight:700">+15</button>
  <button type="button" style="height:44px;padding:0 16px;border:0;border-radius:22px;background:var(--btnfg);color:var(--btn);font-family:inherit;font-size:15px;font-weight:700">Skip</button>
</div>'''
    return body

def b_lift(t):
    tabs = "".join(f'<button type="button" style="flex:1;height:36px;border:0;border-radius:18px;font-family:inherit;font-size:14px;font-weight:700;background:{"var(--btn)" if s=="3M" else "transparent"};color:{"var(--btnfg)" if s=="3M" else "var(--fg2)"}">{s}</button>' for s in ["1M","3M","6M","1Y","All"])
    hist = "".join(f'<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 0;{"border-top:1px solid var(--sep);" if i else ""}"><span style="font-size:15px;font-weight:600">{d}</span><span style="font-size:15px;color:var(--fg2);font-weight:500">{s}</span></div>' for i,(d,s) in enumerate(HIST[:4]))
    stat = lambda v, l: f'<div style="{CARD_B};padding:16px"><div style="font-size:28px;font-weight:800;letter-spacing:-.03em">{v}</div><div style="font-size:13px;color:var(--fg2);font-weight:600">{l}</div></div>'
    body = f'''
<div style="padding:54px 20px 0">
  <button type="button" aria-label="Back" style="width:44px;height:44px;border-radius:22px;border:0;background:var(--card);box-shadow:var(--shadow);color:var(--fg);display:flex;align-items:center;justify-content:center">{icon("back",22,2.2)}</button>
  <h1 style="margin:16px 0 14px;font-size:28px;line-height:32px;font-weight:800;letter-spacing:-.03em">Smith incline press</h1>
  <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px">{stat("49 kg","Strength score")}{stat("+7.4 kg","In 6 weeks")}</div>
  <div style="{CARD_B};padding:16px 16px 12px;margin-bottom:12px">
    <div style="display:flex;background:var(--fill);border-radius:20px;padding:2px;margin-bottom:18px">{tabs}</div>
    <div style="position:relative">{chart_svg("soft",160,318)}<div style="position:absolute;right:30px;top:-14px;background:var(--btn);color:var(--btnfg);font-size:12px;font-weight:700;border-radius:10px;padding:4px 8px">49 kg · 12 Nov</div></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--fg2);font-weight:600;padding:8px 40px 0 0"><span>1 Oct</span><span>22 Oct</span><span>12 Nov</span></div>
  </div>
  <div style="{CARD_B};padding:4px 18px">{hist}</div>
</div>'''
    return body

# ================= C: BOLD (Nike / WHOOP) =================
C_D = dict(bg="#000000", card="#111111", fg="#FFFFFF", fg2="#8E8E8E", fg3="#4A4A4A", sep="#222222", fill="#1A1A1A", track="#222222", band="rgba(255,255,255,.07)", btn="#FFFFFF", btnfg="#000000", bar="rgba(0,0,0,.96)")
C_L = dict(bg="#FFFFFF", card="#F4F4F4", fg="#111111", fg2="#757575", fg3="#BDBDBD", sep="#E5E5E5", fill="#EFEFEF", track="#E5E5E5", band="rgba(0,0,0,.05)", btn="#111111", btnfg="#FFFFFF", bar="rgba(255,255,255,.96)")
COND = "'Barlow Condensed','Arial Narrow',sans-serif"
LBL = "font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--fg2)"

def dial(val, unit, label, pct):
    size, sw = 104, 6
    r = (size - sw)/2; c = 2*3.14159*r; arc = c*0.75
    return f'''<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1"><div style="position:relative;width:{size}px;height:{size}px"><svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" aria-hidden="true" style="transform:rotate(135deg)"><circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" style="stroke:var(--track)" stroke-width="{sw}" stroke-linecap="round" stroke-dasharray="{arc:.1f} {c:.1f}"/><circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" style="stroke:var(--fg)" stroke-width="{sw}" stroke-linecap="round" stroke-dasharray="{arc*pct:.1f} {c:.1f}"/></svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-family:{COND};font-size:32px;font-weight:700;line-height:1">{val}</span><span style="{LBL};font-size:10px">{unit}</span></div></div><span style="{LBL}">{label}</span></div>'''

def c_today(t):
    rows = "".join(f'<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:10px 0;border-top:1px solid var(--sep)"><span style="font-size:15px;font-weight:500">{n}</span><span style="font-family:{COND};font-size:20px;font-weight:600;white-space:nowrap">{v.upper()}</span></div>' for n, v in PLAN[:4])
    body = f'''
<div style="padding:58px 20px 0">
  <div style="{LBL}">THU 12 NOV</div>
  <h1 style="margin:2px 0 18px;font-family:{COND};font-size:60px;line-height:.9;font-weight:800;letter-spacing:-.01em">TODAY</h1>
  <div style="display:flex;gap:4px;margin-bottom:18px">{dial("60.4","KG","WEIGHT",0.62)}{dial("56","OF 120 G","PROTEIN",0.47)}{dial("4","OF 6","SESSIONS",0.67)}</div>
  <div style="border-top:1px solid var(--sep);padding:14px 0 18px">
    <div style="{LBL};margin-bottom:6px">COACH</div>
    <div style="font-size:17px;line-height:22px;font-weight:600">Weigh in. Then beat last week's Push B. No excuses before 9.</div>
  </div>
  <div style="background:var(--card);border-radius:16px;padding:18px 18px 16px">
    <div style="display:flex;justify-content:space-between;align-items:flex-end"><div style="font-family:{COND};font-size:56px;line-height:.85;font-weight:800">PUSH B</div><div style="{LBL};text-align:right;line-height:16px">WEEK 1 OF 6<br>70 MIN</div></div>
    <div style="height:14px"></div>
    {rows}
    <button type="button" style="margin-top:14px;width:100%;height:52px;border:0;border-radius:26px;background:var(--btn);color:var(--btnfg);font-family:inherit;font-size:14px;font-weight:700;letter-spacing:.12em">START WORKOUT</button>
  </div>
</div>
{tabbar("today","bold")}'''
    return body

def c_row(n, prev, kg, reps, state):
    num = lambda v, c: f'<span style="font-family:{COND};font-size:26px;font-weight:700;text-align:center;color:{c}">{v}</span>'
    if state == "done":
        chk = f'<span style="width:30px;height:30px;border-radius:15px;background:var(--fg);color:var(--bg);display:flex;align-items:center;justify-content:center;justify-self:end">{icon("check",16,3)}</span>'
        k, r, bar = num(kg,"var(--fg)"), num(reps,"var(--fg)"), ""
    else:
        cur = state == "current"
        chk = f'<span style="width:30px;height:30px;border-radius:15px;box-sizing:border-box;border:2px solid {"var(--fg)" if cur else "var(--fg3)"};justify-self:end"></span>'
        col = "var(--fg)" if cur else "var(--fg3)"
        k, r = num(kg,col), num(reps,col)
        bar = "box-shadow:inset 3px 0 0 var(--fg);" if cur else ""
    return f'<div style="display:grid;grid-template-columns:36px 1fr 70px 56px 40px;gap:6px;align-items:center;height:52px;border-top:1px solid var(--sep);{bar}"><span style="font-family:{COND};font-size:20px;font-weight:600;color:var(--fg2);text-align:center">{n}</span><span style="font-size:14px;color:var(--fg2);font-weight:500">{prev}</span>{k}{r}{chk}</div>'

def c_workout(t):
    hdr = f'<div style="display:grid;grid-template-columns:36px 1fr 70px 56px 40px;gap:6px;{LBL};font-size:10px;padding-bottom:8px"><span style="text-align:center">SET</span><span>LAST</span><span style="text-align:center">KG</span><span style="text-align:center">REPS</span><span></span></div>'
    rows = c_row(1,"35 × 8","35","9","done") + c_row(2,"35 × 8","35","9","done") + c_row(3,"35 × 7","35","9","current")
    rows2 = c_row(1,"7.5 × 14","7.5","15","todo") + c_row(2,"7.5 × 14","7.5","15","todo")
    body = f'''
<div style="padding:54px 20px 0;display:flex;justify-content:space-between;align-items:flex-end">
  <div><div style="{LBL}">ELAPSED</div><div style="font-family:{COND};font-size:44px;line-height:.95;font-weight:700">24:17</div></div>
  <button type="button" style="height:40px;padding:0 20px;border:0;border-radius:20px;background:var(--btn);color:var(--btnfg);font-family:inherit;font-size:13px;font-weight:700;letter-spacing:.12em">FINISH</button>
</div>
<div style="padding:8px 20px 0">
  <div style="{LBL};margin-bottom:20px">PUSH B · 6 OF 17 SETS · 1,420 KG</div>
  <div style="display:flex;gap:12px;align-items:baseline"><span style="font-family:{COND};font-size:20px;font-weight:700;color:var(--fg3)">01</span><div style="flex:1"><div style="font-size:20px;font-weight:700;letter-spacing:-.01em">Smith incline press</div><div style="font-family:{COND};font-size:22px;font-weight:600;margin-top:2px">3 × 35 KG × 9 <span style="color:var(--fg2);font-size:18px">· REST 2:30</span></div></div></div>
  <div style="font-size:15px;line-height:20px;color:var(--fg2);margin:8px 0 14px 32px">Last time 35 × 8, 8, 7. Same weight. Beat it by one rep.</div>
  {hdr}{rows}
  <div style="display:flex;gap:12px;align-items:baseline;margin-top:30px"><span style="font-family:{COND};font-size:20px;font-weight:700;color:var(--fg3)">02</span><div><div style="font-size:20px;font-weight:700;letter-spacing:-.01em">Dumbbell lateral raise</div><div style="font-family:{COND};font-size:22px;font-weight:600;margin-top:2px">4 × 7.5 KG × 15</div></div></div>
  <div style="height:10px"></div>{hdr}{rows2}
</div>
<div style="position:absolute;left:0;right:0;bottom:0;background:var(--btn);color:var(--btnfg);padding:16px 20px 32px;display:flex;align-items:center;gap:8px">
  <div style="flex:1"><div style="font-size:11px;font-weight:700;letter-spacing:.12em;opacity:.6">REST</div><div style="font-family:{COND};font-size:52px;line-height:.9;font-weight:800">1:24</div></div>
  <button type="button" style="height:44px;min-width:56px;border-radius:22px;border:1.5px solid currentColor;background:none;color:inherit;font-family:{COND};font-size:20px;font-weight:700">−15</button>
  <button type="button" style="height:44px;min-width:56px;border-radius:22px;border:1.5px solid currentColor;background:none;color:inherit;font-family:{COND};font-size:20px;font-weight:700">+15</button>
  <button type="button" style="height:44px;padding:0 16px;border-radius:22px;border:0;background:var(--btnfg);color:var(--btn);font-size:12px;font-weight:700;letter-spacing:.12em;font-family:inherit">SKIP</button>
</div>'''
    return body

def c_lift(t):
    tabs = "".join(f'<button type="button" style="border:0;background:none;padding:6px 0;font-family:inherit;{LBL};color:{"var(--fg)" if s=="3M" else "var(--fg2)"};{"box-shadow:inset 0 -2px 0 var(--fg)" if s=="3M" else ""}">{s}</button>' for s in ["1M","3M","6M","1Y","ALL"])
    hist = "".join(f'<div style="display:flex;justify-content:space-between;align-items:baseline;padding:11px 0;border-top:1px solid var(--sep)"><span style="{LBL};color:var(--fg2)">{d.upper()}</span><span style="font-family:{COND};font-size:22px;font-weight:600">{s}</span></div>' for d,s in HIST[:4])
    body = f'''
<div style="padding:54px 20px 0">
  <button type="button" aria-label="Back" style="border:0;background:none;padding:0;color:var(--fg);margin-left:-6px">{icon("back",26,2.2)}</button>
  <h1 style="margin:10px 0 18px;font-family:{COND};font-size:44px;line-height:.92;font-weight:800">SMITH INCLINE<br>PRESS</h1>
  <div style="{LBL}">STRENGTH SCORE</div>
  <div style="display:flex;align-items:flex-end;gap:10px"><span style="font-family:{COND};font-size:112px;line-height:.82;font-weight:800;letter-spacing:-.02em">49</span><div style="padding-bottom:6px"><div style="font-family:{COND};font-size:24px;font-weight:700">KG</div><div style="{LBL};color:var(--fg)">+7.4 IN 6 WEEKS</div></div></div>
  <div style="display:flex;justify-content:space-between;margin:22px 0 18px">{tabs}</div>
  {chart_svg("bold",160,350)}
  <div style="display:flex;justify-content:space-between;{LBL};font-size:10px;padding:10px 0 18px"><span>1 OCT</span><span>22 OCT</span><span>12 NOV</span></div>
  {hist}
</div>'''
    return body

# ---------- assemble ----------
DIRS = [
  ("A", "Clean", [("Today", a_today), ("Workout", a_workout), ("Lift", a_lift)], A_L, A_D, INTER),
  ("B", "Soft", [("Today", b_today), ("Workout", b_workout), ("Lift", b_lift)], B_L, B_D, INTER),
  ("C", "Bold", [("Today", c_today), ("Workout", c_workout), ("Lift", c_lift)], C_L, C_D, BARLOW),
]
boards, order, notes = {}, [], {}
GAP, ROWGAP, TITLE = 80, 120, 260
y = TITLE
written = []
for di, (key, name, screens, light, dark, fonts) in enumerate(DIRS):
    notes[f"t{key}"] = {"x": 0, "y": y - 240, "text": f"{key}. {name}", "kind": "title1", "maxW": 2740}
    x = 0
    # light first, then dark, except Bold leads with dark
    modes = [("Light", light), ("Dark", dark)] if key != "C" else [("Dark", dark), ("Light", light)]
    for mode, th in modes:
        for sname, fn in screens:
            fname = "Main.dc.html" if (key == "A" and sname == "Today" and mode == "Light") else f"{name}{sname}{mode}.dc.html"
            html = page(f"{name} {sname} {mode.lower()}", th, fn(th), fonts=fonts)
            assert "—" not in html
            open(os.path.join(OUT, fname), "w").write(html)
            boards[fname] = {"x": x, "y": y, "w": W, "h": H, "title": f"{key} · {sname} · {mode}"}
            order.append(fname); written.append(fname)
            x += W + GAP
    y += H + ROWGAP + TITLE
canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ")}, "title": "NitFit design directions",
          "launch": {"view": "canvas"}, "pages": [], "boards": boards, "order": order, "notes": notes, "designSystems": []}
open(os.path.join(OUT, "canvas.json"), "w").write(json.dumps(canvas, indent=1, ensure_ascii=False))
print(len(written), "artboards")
