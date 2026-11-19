"""Makes a Settle statement PDF from settle.json, using the same design as the app (statement.js).

usage: python3 make_statement.py settle.json START END out.pdf [--sample]
       START and END are dates like 2026-11-01, or use: month (this month so far), 1m, 3m, 6m, 1y, all
"""
import json, sys, os, datetime as dt, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent

def pick_range(db, a, b):
    today = dt.date.today()
    back = {"1m": 1, "3m": 3, "6m": 6, "1y": 12}
    if a == "month": return today.replace(day=1), today
    if a in back:
        m = today.month - back[a]; y = today.year + (m - 1) // 12; m = (m - 1) % 12 + 1
        start = dt.date(y, m, min(today.day, 28)) + dt.timedelta(days=1)
        return start, today
    if a == "all":
        dates = [e["at"][:10] for e in db.get("entries", []) if not e.get("del")] + [v.get("at", k + "-13")[:10] for k, v in db.get("balances", {}).items()]
        return (dt.date.fromisoformat(min(dates)) if dates else today), today
    return dt.date.fromisoformat(a), dt.date.fromisoformat(b)

def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    src, a = args[0], args[1]
    b = args[2] if len(args) > 3 else None
    out = args[-1]
    db = json.load(open(src))
    start, end = pick_range(db, a, b)
    exe = next((p for p in ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"] if os.path.exists(p)), None)
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=exe, args=["--no-sandbox"]) if exe else p.chromium.launch()
        pg = br.new_page()
        pg.goto((HERE / "print.html").as_uri())
        pg.evaluate("""([db, s, e, sample]) => { document.getElementById('stmt').innerHTML =
            renderStatement(db, new Date(s + 'T00:00'), new Date(e + 'T00:00'), { base: '../', sample }); }""",
            [db, start.isoformat(), end.isoformat(), "--sample" in sys.argv])
        pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(600)
        pg.pdf(path=out, width="210mm", height="297mm", print_background=True, margin=dict(top="0", bottom="0", left="0", right="0"))
        br.close()
    print(f"saved {out} ({start} to {end})")

if __name__ == "__main__":
    main()
