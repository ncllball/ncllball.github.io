"""Retro TV rotator, full-frame version: the TV fills the 1110x510 slide and everything lives on the screen.
Reuses the sprites from make_tv.py; the scene is widened to 220 x 112 logical pixels, drawn 4x (880 x 448)."""
from pathlib import Path

from make_tv import BATTER, CATCHER, FIELDER, PITCHER, sprite

HERE = Path(__file__).parent
W, H = 220, 112
LIGHT_IN = 10                      # how far in from the screen edge the outer light towers stand
FENCE = "chain"                    # "chain" = chain-link fence; anything else = the green wall with a yellow top
OX, OY = 6, -8                     # the game sits left of centre so the text box (bottom right) has open grass          # where the original 160x120 scene sits inside the wider screen


def screen_svg():
    p = ['<rect width="%d" height="%d" fill="#0c0b10"/>' % (W, H)]
    # dusk sky in 8-bit bands: near-black at the top warming to a deep NCLL red above the outfield wall
    for y0, col in [(0, "#0c0b10"), (8, "#140b11"), (12, "#1e0c14"), (16, "#2b0d17"), (19, "#3b0e1b"), (22, "#50101f"), (24, "#681224"), (26, "#841429")]:
        shift = (36 + OY) - 28 if y0 else 0          # the bands end at the fence wherever the scene sits
        p.append(f'<rect x="0" y="{y0 + shift}" width="{W}" height="{36 + OY - (y0 + shift)}" fill="{col}"/>')
    for sx, sy in [(6, 4), (20, 6), (44, 3), (70, 7), (101, 5), (128, 2), (150, 3), (176, 6), (196, 2), (212, 4), (34, 9), (188, 10)]:   # stars stay in the dark top
        p.append(f'<rect x="{sx}" y="{sy}" width="1" height="1" fill="#cfd8ff"/>')
    wall = 36 + OY
    if FENCE == "chain":
        # chain-link outfield fence: dark-grey backing, diamond mesh, light-grey top rail, posts
        p.append(f'<rect x="0" y="{wall}" width="{W}" height="8" fill="#2b2c30"/>')
        mesh = "".join(f'<rect x="{x}" y="{y}" width="1" height="1" fill="#6e737b"/>'
                       for y in range(wall + 1, wall + 8) for x in range(W) if (x + y) % 4 == 0 or (x - y) % 4 == 0)
        p.append(mesh)
        for px in range(4, W, 24):
            p.append(f'<rect x="{px}" y="{wall - 1}" width="1" height="9" fill="#a3a8b0"/>')
        p.append(f'<rect x="0" y="{wall}" width="{W}" height="1" fill="#b9bec6"/>')
    else:
        p.append(f'<rect x="0" y="{wall}" width="{W}" height="8" fill="#0f5132"/><rect x="0" y="{wall}" width="{W}" height="1" fill="#ffd23f"/>')
    for lx in (LIGHT_IN, LIGHT_IN + 20, W - LIGHT_IN - 22, W - LIGHT_IN - 2):   # two light towers each side
        p.append(f'<rect x="{lx}" y="{wall - 22}" width="2" height="22" fill="#5a5f6a"/><rect x="{lx - 3}" y="{wall - 24}" width="8" height="3" fill="#fff6c8"/>')
    for k, y in enumerate(range(wall + 8, H, 6)):
        p.append(f'<rect x="0" y="{y}" width="{W}" height="6" fill="{"#2f8f3a" if k % 2 else "#37a344"}"/>')
    # foul lines run out to the screen edges
    # aim from the middle of home plate (80, 108.5) through the middle of 3rd/1st base (40.5 / 119.5, 82)
    hx, hy = 80 + OX, 108.5 + OY
    slope = (108.5 - 82) / (80 - 40.5)
    grass = wall + 8                   # lines stop at the foot of the outfield wall (the foul poles), or the screen edge
    lines = []
    for side in (-1, 1):
        # the line is 2 px thick: its upper and lower edges meet the fence at slightly different x, so the end is cut
        # flat along the foot of the wall instead of poking into it
        x_up, x_lo = hx + side * (hy - 1 - grass) / slope, hx + side * (hy + 1 - grass) / slope
        if 0 <= x_up <= W and 0 <= x_lo <= W:
            pts = f"{hx},{hy - 1} {x_up:.2f},{grass} {x_lo:.2f},{grass} {hx},{hy + 1}"
        else:
            xe = 0 if side < 0 else W
            ye = hy - slope * abs(xe - hx)
            pts = f"{hx},{hy - 1} {xe},{ye - 1:.2f} {xe},{ye + 1:.2f} {hx},{hy + 1}"
        lines.append(f'<polygon points="{pts}" fill="#f4f4f4" opacity=".9"/>')
    g = []
    g.append('<polygon points="80,58 122,82 80,112 38,82" fill="#b9773a"/>')
    g.append('<polygon points="80,68 108,82 80,100 52,82" fill="#37a344"/>')
    g.append('<rect x="76" y="78" width="8" height="5" fill="#c98a4a"/>')
    g.append(f'<g transform="translate({-OX},{-OY})">{"".join(lines)}</g>')   # chalk lines on top of the dirt
    for bx, by in [(118, 81), (79, 57), (39, 81)]:
        g.append(f'<rect x="{bx}" y="{by}" width="3" height="2" fill="#ffffff"/>')
    g.append('<polygon points="78,107 82,107 82,108 80,110 78,108" fill="#ffffff"/>')
    for fx, fy in [(60, 66), (97, 66), (114, 72), (43, 72), (22, 48), (78, 46), (134, 48)]:
        g.append(sprite(FIELDER, fx, fy))
    g.append(sprite(PITCHER, 74, 67))
    g.append(sprite(BATTER, 64, 95))
    g.append(sprite(CATCHER, 81, 104))
    g.append('<rect x="80" y="90" width="2" height="2" fill="#ffffff"/><rect x="81" y="86" width="1" height="1" fill="#ffffff" opacity=".6"/><rect x="81" y="83" width="1" height="1" fill="#ffffff" opacity=".35"/>')
    p.append(f'<g transform="translate({OX},{OY})">{"".join(g)}</g>')
    return f'<svg viewBox="0 0 {W} {H}" width="{W * 4}" height="{H * 4}" shape-rendering="crispEdges">{"".join(p)}</svg>'


def page(logo="ncll_badge_1.png", logo_w=112, disc=False):
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block" rel="stylesheet">
<style>
html,body{{margin:0;width:1110px;height:510px;overflow:hidden;background:#2a1a0e}}
body{{font-family:'Press Start 2P',monospace}}
.tv{{position:absolute;inset:0;border-radius:22px;
  background:repeating-linear-gradient(92deg,#8b5a2b 0 5px,#7a4d24 5px 9px,#955f2d 9px 15px,#6f4520 15px 18px);
  box-shadow:inset 0 0 0 6px #3a2412, inset 0 0 40px rgba(0,0,0,.4)}}
.bezel{{position:absolute;left:18px;top:16px;width:908px;height:478px;border-radius:34px;background:#1a1a1a;
  box-shadow:inset 0 0 0 4px #0c0c0c, inset 0 4px 12px rgba(255,255,255,.08)}}
.screen{{position:absolute;left:14px;top:15px;width:880px;height:448px;border-radius:52px / 40px;overflow:hidden;
  box-shadow:inset 0 0 50px rgba(0,0,0,.75)}}
.screen svg{{display:block}}
.scan{{position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);pointer-events:none}}
.glare{{position:absolute;inset:0;background:radial-gradient(ellipse 60% 45% at 28% 16%,rgba(255,255,255,.14),transparent 60%),
  radial-gradient(ellipse 120% 115% at 50% 50%,transparent 62%,rgba(0,0,0,.55));pointer-events:none}}
.hud{{position:absolute;inset:0;color:#fff}}
.score{{position:absolute;left:0;right:0;top:10px;text-align:center;font-size:13px;color:#ffffff;letter-spacing:1px;text-shadow:2px 2px 0 #111}}
.score .r{{color:#c8102e;text-shadow:-1px 0 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, 0 1px 0 #fff, 2px 2px 0 #111}}
.go{{position:absolute;left:0;right:0;top:28px;text-align:center;font-size:52px;color:#ffffff;text-shadow:-2px 0px 0 #111, 2px 0px 0 #111, 0px -2px 0 #111, 0px 2px 0 #111, -2px -2px 0 #111, 2px -2px 0 #111, -2px 2px 0 #111, 2px 2px 0 #111, 3px 3px 0 #c8102e, 4px 4px 0 #c8102e, 5px 5px 0 #c8102e, 6px 6px 0 #c8102e, 7px 7px 0 #c8102e, 8px 8px 0 #c8102e, 10px 10px 0 #111}}
.press{{position:absolute;left:0;right:0;top:90px;text-align:center;font-size:13px;text-shadow:2px 2px 0 #0b1640}}
/* classic game text box, bottom right of the field */
.msg{{position:absolute;right:30px;bottom:30px;width:300px;padding:14px 14px 12px;line-height:2.05;background:#111111;border:4px solid #fff;
  box-shadow:0 0 0 4px #111111, 6px 6px 0 4px rgba(0,0,0,.45);font-size:13px;line-height:1.75;text-align:center}}
.msg .y{{color:#ffffff;background:#c8102e;padding:3px 8px 2px;box-shadow:2px 2px 0 #000}}
.msg .c{{color:#ffffff;font-size:13px}}
.msg .cur{{display:inline-block;width:0;height:0;border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:9px solid #fff;margin-right:8px;vertical-align:0}}
.msg .arrow{{position:absolute;right:10px;bottom:6px;font-size:10px;color:#fff}}
.panel{{position:absolute;right:16px;top:16px;width:150px;height:478px;border-radius:16px;background:#2a1a0e;box-shadow:inset 0 0 0 3px #1a0f07}}
.panel img{{position:absolute;left:50%;top:18px;width:{logo_w}px;transform:translateX(-50%);filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}}
.disc{{position:absolute;left:50%;top:calc((3px + 132px) / 2 - 47px);width:84px;height:84px;transform:translateX(-50%);border-radius:50%;
  background:radial-gradient(circle at 40% 35%,#ffffff,#e9e9e9 75%);border:5px solid #1d1d1f;
  box-shadow:0 0 0 3px #c8102e, 0 4px 8px 3px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}}
.disc img{{position:static;transform:none;width:{logo_w}px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}}
.knob{{position:absolute;left:45px;width:60px;height:60px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%,#d9d9d9,#8a8a8a 60%,#4a4a4a);box-shadow:0 3px 5px rgba(0,0,0,.6)}}
.knob::after{{content:"";position:absolute;left:28px;top:5px;width:4px;height:19px;background:#2a2a2a;border-radius:2px}}
.grille{{position:absolute;left:22px;right:22px;top:290px;height:150px;background:repeating-linear-gradient(180deg,#0f0a06 0 4px,#3a2614 4px 8px);border-radius:6px}}
</style></head><body>
<div class="tv">
 <div class="bezel"><div class="screen">{screen_svg()}
  <div class="hud">
   <div class="score"><span class="r">1UP</span> 000000 &nbsp;&nbsp;&nbsp;&nbsp; HI-SCORE 002027</div>
   <div class="go">GAME ON!</div>
   <div class="press">PLAYER 1 READY?</div>
   <div class="msg"><span class="y">SPRING 2027</span><br>REGISTRATION OPENS<br><span class="y">MON NOV 2</span><br><span class="c"><span class="cur"></span>CLICK TO START</span></div>
  </div>
  <div class="scan"></div><div class="glare"></div></div></div>
 <div class="panel">{f'<div class="disc"><img src="{logo}" alt=""></div>' if disc else f'<img src="{logo}" alt="">'}<div class="knob" style="top:132px"></div><div class="knob" style="top:208px"></div><div class="grille"></div></div>
</div>
</body></html>"""


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:              # e.g. ncll_logo_1.png:100:tv-full-nc  (logo file : width : output name)
        logo, w, name, *flags = sys.argv[1].split(":")
        (HERE / f"{name}.html").write_text(page(logo, int(w), disc="disc" in flags), encoding="utf-8")
    else:
        (HERE / "tv-full.html").write_text(page(), encoding="utf-8")
    print("wrote tv-full.html")
