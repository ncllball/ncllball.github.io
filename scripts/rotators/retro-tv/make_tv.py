"""Retro TV rotator (1110x510): an 8-bit baseball game on a wood-grain CRT, 'GAME ON!' instead of 'GAME OVER'.
Writes tv.html; render.ps1 screenshots it with Edge."""
from pathlib import Path

HERE = Path(__file__).parent

# ---------- 8-bit screen: 160 x 120 logical pixels, drawn 3x (480 x 360) ----------
# NCLL colours: everyone in NCLL red caps/helmet and trim on white (R = batter, N = fielding team)
PAL = {"R": "#c8102e", "W": "#f4f4f4", "S": "#f2b48a", "G": "#9aa0a8", "K": "#141414", "B": "#c98a3c",
       "N": "#c8102e", "Y": "#ffd23f", "L": "#6b4a2b"}

BATTER = """
....RRRR....
...RRRRRR...
...RRSSSR..B
....SSSS..B.
....WWWW.B..
...WWWWWSS..
...WWRWW....
...WWWWW....
....WWWW....
....GGGG....
...GG..GG...
...GG..GG...
..GG....GG..
..KK....KK..
"""
PITCHER = """
..NNNN.....
.NNNNNN....
..SSSS...SS
..SSSS..WW.
.WWWWWWWW..
WWWNWWWW...
LL.WWWWW...
LL.WWWWW...
...GGGG....
..GG..GG...
..GG..GG...
.GG....GG..
.KK....KK..
"""
CATCHER = """
.NNNN.
NNKKNN
.SSSS.
WWWWWW
WWWWWW
LLWWWW
.GGGG.
GG..GG
KK..KK
"""
FIELDER = """
.NN.
.SS.
WWWW
.WW.
G..G
"""


def sprite(art, x, y, flip=False):
    rows = [r for r in art.strip("\n").split("\n")]
    out = []
    for j, row in enumerate(rows):
        row = row[::-1] if flip else row
        for i, c in enumerate(row):
            if c in PAL:
                out.append(f'<rect x="{x + i}" y="{y + j}" width="1" height="1" fill="{PAL[c]}"/>')
    return "".join(out)


def screen_svg():
    p = []
    # night sky + pixel stars
    p.append('<rect width="160" height="120" fill="#0b1640"/>')
    for sx, sy in [(8, 6), (22, 14), (40, 4), (131, 8), (150, 16), (118, 3), (60, 12), (98, 10), (12, 22), (146, 26)]:
        p.append(f'<rect x="{sx}" y="{sy}" width="1" height="1" fill="#cfd8ff"/>')
    # outfield wall with a yellow top line
    p.append('<rect x="0" y="36" width="160" height="8" fill="#0f5132"/><rect x="0" y="36" width="160" height="1" fill="#ffd23f"/>')
    # light towers
    for lx in (6, 150):
        p.append(f'<rect x="{lx}" y="14" width="2" height="22" fill="#5a5f6a"/><rect x="{lx - 3}" y="12" width="8" height="3" fill="#fff6c8"/>')
    # grass with mowing stripes
    for k, y in enumerate(range(44, 120, 6)):
        p.append(f'<rect x="0" y="{y}" width="160" height="6" fill="{"#2f8f3a" if k % 2 else "#37a344"}"/>')
    # infield dirt, a diamond seen from behind home plate
    p.append('<polygon points="80,58 122,82 80,112 38,82" fill="#b9773a"/>')
    p.append('<polygon points="80,68 108,82 80,100 52,82" fill="#37a344"/>')   # infield grass
    p.append('<rect x="76" y="78" width="8" height="5" fill="#c98a4a"/>')       # mound
    # chalk lines + bases
    p.append('<polygon points="80,108 0,62 0,64 78,110" fill="#f4f4f4" opacity=".9"/><polygon points="80,108 160,62 160,64 82,110" fill="#f4f4f4" opacity=".9"/>')
    for bx, by in [(118, 81), (79, 57), (39, 81)]:
        p.append(f'<rect x="{bx}" y="{by}" width="3" height="2" fill="#ffffff"/>')
    p.append('<polygon points="78,107 82,107 82,108 80,110 78,108" fill="#ffffff"/>')   # home plate
    # fielders
    for fx, fy in [(60, 66), (97, 66), (114, 72), (43, 72), (30, 48), (78, 46), (126, 48)]:
        p.append(sprite(FIELDER, fx, fy))
    # pitcher, batter, catcher
    p.append(sprite(PITCHER, 74, 67))
    p.append(sprite(BATTER, 64, 95))
    p.append(sprite(CATCHER, 81, 104))
    # the pitch on its way, with speed dots
    p.append('<rect x="80" y="90" width="2" height="2" fill="#ffffff"/><rect x="81" y="86" width="1" height="1" fill="#ffffff" opacity=".6"/><rect x="81" y="83" width="1" height="1" fill="#ffffff" opacity=".35"/>')
    return f'<svg viewBox="0 0 160 120" width="480" height="360" shape-rendering="crispEdges">{"".join(p)}</svg>'


def page():
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block" rel="stylesheet">
<style>
html,body{{margin:0;width:1110px;height:510px;overflow:hidden}}
body{{position:relative;font-family:'Press Start 2P',monospace;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 2px, transparent 2px 74px),
    linear-gradient(180deg,#5a3a22,#4a2f1c 70%,#3a2415)}}
/* 70s stripes across the wall */
.stripes{{position:absolute;left:0;right:0;top:118px;height:66px;
  background:linear-gradient(180deg,#f2b134 0 22px,#e8722b 22px 44px,#c8402e 44px 66px);opacity:.92}}
.floor{{position:absolute;left:0;right:0;bottom:0;height:42px;background:repeating-linear-gradient(90deg,#3b2a1f 0 6px,#33241a 6px 12px);
  box-shadow:inset 0 6px 10px rgba(0,0,0,.45)}}
/* TV */
.tv{{position:absolute;left:48px;top:46px;width:660px;height:410px;border-radius:26px;
  background:repeating-linear-gradient(92deg,#8b5a2b 0 5px,#7a4d24 5px 9px,#955f2d 9px 15px,#6f4520 15px 18px);
  box-shadow:0 18px 30px rgba(0,0,0,.55), inset 0 0 0 6px #3a2412, inset 0 0 30px rgba(0,0,0,.35)}}
.bezel{{position:absolute;left:28px;top:24px;width:508px;height:362px;border-radius:30px;background:#1a1a1a;
  box-shadow:inset 0 0 0 4px #0c0c0c, inset 0 4px 12px rgba(255,255,255,.08)}}
.screen{{position:absolute;left:14px;top:1px;width:480px;height:360px;border-radius:38px / 30px;overflow:hidden;
  box-shadow:inset 0 0 40px rgba(0,0,0,.75)}}
.screen svg{{display:block}}
.scan{{position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);pointer-events:none}}
.glare{{position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 30% 18%,rgba(255,255,255,.16),transparent 60%),
  radial-gradient(ellipse 120% 110% at 50% 50%,transparent 60%,rgba(0,0,0,.55));pointer-events:none}}
.hud{{position:absolute;inset:0;text-align:center;color:#fff}}
.hud .score{{position:absolute;left:0;right:0;top:12px;font-size:10px;color:#9fe3ff;letter-spacing:1px}}
.hud .go{{position:absolute;left:0;right:0;top:42px;font-size:46px;color:#ffd23f;
  text-shadow:4px 4px 0 #d8283c, 8px 8px 0 #0b1640}}
.hud .press{{position:absolute;left:0;right:0;top:102px;font-size:11px;color:#fff;text-shadow:2px 2px 0 #0b1640}}
.panel{{position:absolute;right:22px;top:26px;width:92px;height:360px;border-radius:14px;background:#2a1a0e;
  box-shadow:inset 0 0 0 3px #1a0f07}}
.knob{{position:absolute;left:21px;width:50px;height:50px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%,#d9d9d9,#8a8a8a 60%,#4a4a4a);box-shadow:0 3px 5px rgba(0,0,0,.6)}}
.knob::after{{content:"";position:absolute;left:23px;top:4px;width:4px;height:16px;background:#2a2a2a;border-radius:2px}}
.grille{{position:absolute;left:16px;right:16px;top:150px;height:120px;
  background:repeating-linear-gradient(180deg,#0f0a06 0 4px,#3a2614 4px 8px);border-radius:6px}}
.badge{{position:absolute;left:12px;right:12px;bottom:20px;height:22px;border-radius:4px;background:linear-gradient(#e9e9e9,#a9a9a9);
  font-size:9px;color:#3a2412;display:flex;align-items:center;justify-content:center}}
.legs{{position:absolute;top:454px;width:14px;height:22px;background:#2a1a0e;border-radius:0 0 4px 4px}}
.ant{{position:absolute;top:-2px;width:5px;height:96px;background:linear-gradient(#e6e6e6,#9a9a9a);border-radius:3px;transform-origin:bottom center}}
.antbase{{position:absolute;left:330px;top:22px;width:58px;height:26px;border-radius:30px 30px 6px 6px;background:#2a2a2a}}
/* right side: the call to action, styled like a game box */
.box{{position:absolute;left:744px;top:52px;width:322px;height:398px;border-radius:14px;background:#111827;
  box-shadow:0 14px 24px rgba(0,0,0,.5), inset 0 0 0 4px #000}}
.box .bar{{height:56px;border-radius:12px 12px 0 0;background:linear-gradient(180deg,#f2b134 0 33%,#e8722b 33% 66%,#c8402e 66%)}}
.box img{{position:absolute;left:50%;top:70px;width:132px;transform:translateX(-50%)}}
.box .t1{{position:absolute;left:0;right:0;top:200px;text-align:center;font-size:24px;color:#ffd23f;text-shadow:3px 3px 0 #c8402e}}
.box .t2{{position:absolute;left:18px;right:18px;top:252px;text-align:center;font-size:13px;line-height:1.7;color:#fff}}
.box .t2 b{{color:#ffd23f;font-weight:400}}
.box .t3{{position:absolute;left:0;right:0;bottom:22px;text-align:center;font-size:12px;color:#9fe3ff}}
</style></head><body>
<div class="stripes"></div>
<div class="floor"></div>
<div class="antbase"></div>
<div class="ant" style="left:352px;transform:rotate(-28deg)"></div>
<div class="ant" style="left:362px;transform:rotate(26deg)"></div>
<div class="tv">
 <div class="bezel"><div class="screen">{screen_svg()}
  <div class="hud"><div class="score">NCLL 0 &nbsp; SPRING 0 &nbsp; INN 1</div><div class="go">GAME ON!</div><div class="press">PLAYER 1 &mdash; PRESS START</div></div>
  <div class="scan"></div><div class="glare"></div></div></div>
 <div class="panel"><div class="knob" style="top:24px"></div><div class="knob" style="top:88px"></div><div class="grille"></div><div class="badge">NCLL</div></div>
</div>
<div class="legs" style="left:110px"></div><div class="legs" style="left:640px"></div>
<div class="box">
 <div class="bar"></div>
 <img src="ncll_badge_1.png" alt="">
 <div class="t1">SPRING 2027</div>
 <div class="t2">REGISTRATION<br>OPENS <b>MON NOV 2</b></div>
 <div class="t3">ncllball.com</div>
</div>
</body></html>"""


if __name__ == "__main__":
    (HERE / "tv.html").write_text(page(), encoding="utf-8")
    print("wrote tv.html")
