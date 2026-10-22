"""Chrome TV frame: John's chrome TV photo (assets/chrome-tv.png), widened to the slide's exact proportions by repeating
the plain middle of the set (dials, knob and corners untouched) with the stand and feet removed. The 8-bit game shows
through the screen hole; the NC badge sits on the top dial. make_tv_center.py builds the slide on top of this."""
import re
from pathlib import Path

import make_tv_full as M

HERE = Path(__file__).parent

SRC_W, SRC_H = 5006, 2300            # chrome-tv.png's source size (the png is this, downsized to 2220x1020)
TV_W, TV_H = 1110, 510                # fills the whole slide
K = TV_W / SRC_W
TV_X, TV_Y = 0, 0
HOLE = (287 * K, 262 * K, (2279 + (SRC_W - 3146) - 287) * K, (1892 - 262) * K)
DIAL = (4638 * K, 402 * K)           # centre dot of the top dial (measured on the source)
TV_IMG = "../assets/chrome-tv.png"   # paths are relative to the html this writes (this folder)
LOGO = "../../../images/logos/ncll_logo_1.png"

_SW, _SH = HOLE[2] + 8, HOLE[3] + 8
M.LIGHT_IN = 34                      # light towers pulled in toward the middle
M.W, M.OX, M.OY = 287, 63, 2          # scene sits 10 game-pixels lower: room above for 1UP, less grass below home
M.H = round(M.W * _SH / _SW)          # extra rows are more grass at the bottom
SCALE = 3


def screen():
    svg = M.screen_svg().replace(f'width="{M.W * 4}" height="{M.H * 4}"', f'width="{M.W * SCALE}" height="{M.H * SCALE}" preserveAspectRatio="none"', 1)

    def star(m):
        x, y = int(m.group(1)), int(m.group(2))
        return "" if 70 <= x <= 220 and y <= 26 else m.group(0)
    return re.sub(r'<rect x="(\d+)" y="(\d+)" width="1" height="1" fill="#cfd8ff"/>', star, svg)


def page():
    hx, hy, hw, hh = HOLE
    pad = 4
    sx, sy, sw, sh = TV_X + hx - pad, TV_Y + hy - pad, hw + 2 * pad, hh + 2 * pad
    outline = ", ".join(f"{x}px {y}px 0 #111" for x, y in [(-2, 0), (2, 0), (0, -2), (0, 2), (-2, -2), (2, -2), (-2, 2), (2, 2)])
    drop = ", ".join(f"{k}px {k}px 0 #c8102e" for k in range(3, 8))
    dx, dy = TV_X + DIAL[0], TV_Y + DIAL[1]
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block" rel="stylesheet">
<style>
html,body{{margin:0;width:1110px;height:510px;overflow:hidden}}
body{{position:relative;font-family:'Press Start 2P',monospace;background:radial-gradient(ellipse 120% 120% at 50% 50%,#1c1c1f,#0b0b0c)}}
.screen{{position:absolute;left:{sx:.1f}px;top:{sy:.1f}px;width:{sw:.1f}px;height:{sh:.1f}px;overflow:hidden;background:#0c0b10}}
.screen svg{{display:block;width:100%;height:100%}}
.scan{{position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)}}
.glow{{position:absolute;inset:0;background:radial-gradient(ellipse 110% 115% at 50% 50%,transparent 62%,rgba(0,0,0,.6))}}
.hud{{position:absolute;inset:0;color:#fff;text-align:center}}
.score{{position:absolute;left:0;right:0;top:{43 + pad}px;font-size:11px;text-shadow:2px 2px 0 #111}}
.score .r{{color:#c8102e;text-shadow:-1px 0 0 #fff,1px 0 0 #fff,0 -1px 0 #fff,0 1px 0 #fff,2px 2px 0 #111}}
.go{{position:absolute;left:0;right:0;top:{22 + pad}px;font-size:40px;text-shadow:{outline}, {drop}, 9px 9px 0 #111}}
.ready{{position:absolute;left:0;right:0;top:{70 + pad}px;font-size:11px;text-shadow:2px 2px 0 #111}}
.msg{{position:absolute;right:{26 + pad}px;bottom:{20 + pad}px;width:300px;padding:12px 10px 10px;background:#111;border:4px solid #fff;
  box-shadow:0 0 0 4px #111,6px 6px 0 4px rgba(0,0,0,.45);font-size:13px;line-height:1.95;text-align:center}}
.msg .y{{background:#c8102e;padding:3px 8px 2px;box-shadow:2px 2px 0 #000}}
.msg .cur{{display:inline-block;width:0;height:0;border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:9px solid #fff;margin-right:8px}}
.tv{{position:absolute;left:{TV_X}px;top:{TV_Y}px;width:{TV_W}px;height:{TV_H}px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.6))}}
.disc{{position:absolute;left:{dx - 33.5:.1f}px;top:{dy - 33.5:.1f}px;width:59px;height:59px;border-radius:50%;
  background:radial-gradient(circle at 40% 35%,#fff,#e9e9e9 75%);border:4px solid #1d1d1f;
  box-shadow:0 0 0 3px #c8102e,0 2px 4px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}}
.disc img{{width:33px}}
</style></head><body>
<div class="screen">{screen()}
 <div class="hud"><div class="score"><span class="r">1UP</span> 000000 &nbsp;&nbsp;&nbsp; HI-SCORE 002027</div>
  <div class="go">GAME ON!</div><div class="ready">PLAYER 1 READY?</div>
  <div class="msg"><span class="y">SPRING 2027</span><br>REGISTRATION OPENS<br><span class="y">MON NOV 2</span><br><span class="cur"></span>CLICK TO START</div></div>
 <div class="scan"></div><div class="glow"></div></div>
<img class="tv" src="{TV_IMG}" alt="">
<div class="disc"><img src="{LOGO}" alt=""></div>
</body></html>"""


if __name__ == "__main__":
    (HERE / "tv-wide.html").write_text(page(), encoding="utf-8")
    print("wrote tv-wide.html; hole", [round(v, 1) for v in HOLE], "dial", [round(v, 1) for v in DIAL])
