"""Chalkboard rotator (1110x510): writes chalk-<variant>.html; render.ps1 screenshots it with Edge."""
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "badge"))
import build as B  # noqa: E402  (bat outlines from the badge work)

CHALK, RED = "#f3f0e6", "#ec6a7c"

VARIANTS = {
    # name: (headline font, list font)
    "a": ("'Fredericka the Great'", "'Kalam'"),
    "b": ("'Cabin Sketch'", "'Gloria Hallelujah'"),
    "c": ("'Cabin Sketch'", "'Kalam'"),
}


def bats_svg():
    """The two bat outlines from 10742137.ai, scaled into a 360-wide box, as chalk strokes."""
    s = 0.265
    dx, dy = -320 * s, -625 * s
    paths = [B.path_d(d, s, s, dx, dy) for d in B.shapes(B.AI, {2, 5})]
    return "".join(f'<path d="{p}"/>' for p in paths)


def page(hfont, lfont):
    items = ["play baseball &amp; softball", "hang out with friends", "meet new people", "have fun"]
    lis = "".join(f'<li><svg class="ck" viewBox="0 0 30 26"><path d="M3 14 L11 22 L27 3"/></svg>{t}</li>' for t in items)
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fredericka+the+Great&family=Cabin+Sketch:wght@400;700&family=Kalam:wght@400;700&family=Gloria+Hallelujah&display=block" rel="stylesheet">
<style>
html,body{{margin:0;width:1110px;height:510px;overflow:hidden;background:#3b2a1a}}
.frame{{position:absolute;inset:0;background:linear-gradient(90deg,#6b4a2b,#8a6238 30%,#6e4c2c 60%,#916a3e);}}
.board{{position:absolute;left:16px;top:16px;right:16px;bottom:30px;border-radius:3px;overflow:hidden;
  background:radial-gradient(ellipse 60% 70% at 30% 40%,#33463c 0%,#2a3a32 55%,#202c26 100%);
  box-shadow:inset 0 0 40px rgba(0,0,0,.55)}}
.tray{{position:absolute;left:10px;right:10px;bottom:6px;height:14px;background:linear-gradient(#a37847,#6b4a2b);border-radius:2px;box-shadow:0 2px 3px rgba(0,0,0,.4)}}
.stick{{position:absolute;bottom:14px;height:7px;border-radius:3px}}
.dust,.smudge{{position:absolute;inset:0;pointer-events:none}}
.dust{{opacity:.22;mix-blend-mode:screen}}
.smudge{{background:
  radial-gradient(ellipse 22% 14% at 74% 22%,rgba(255,255,255,.07),transparent 70%),
  radial-gradient(ellipse 30% 12% at 40% 86%,rgba(255,255,255,.06),transparent 70%),
  radial-gradient(ellipse 18% 20% at 12% 70%,rgba(255,255,255,.05),transparent 70%);filter:blur(6px)}}
.chalk{{position:absolute;inset:0;filter:url(#chalk)}}
.content{{position:absolute;left:50px;top:30px;width:640px;color:{CHALK}}}
h1{{font-family:{hfont};font-weight:400;font-size:54px;line-height:1.02;margin:0;letter-spacing:.5px}}
h1 .red{{color:{RED}}}
.swash{{display:block;width:330px;height:16px;margin:2px 0 0 250px}}
ul{{list-style:none;margin:14px 0 0;padding:0;font-family:{lfont};font-size:31px;line-height:1.28}}
li{{display:flex;align-items:center;gap:12px}}
.ck{{width:26px;height:24px;flex:none;fill:none;stroke:{CHALK};stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}}
li.ice{{font-size:29px;opacity:.95;margin-left:4px}}
.cta{{position:absolute;left:50px;bottom:46px;font-family:{lfont};font-size:27px;color:{CHALK}}}
.cta b{{color:{RED};font-weight:700}}
.right{{position:absolute;left:705px;top:42px;width:360px;height:420px}}
.doodle{{fill:none;stroke:{CHALK};stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}}
.doodle .r{{stroke:{RED}}}
.logo{{position:absolute;right:40px;bottom:38px;width:186px;filter:url(#chalklogo) saturate(.85);opacity:.93}}
</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>
 <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="1.9" numOctaves="1" seed="8" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.3 1.45" result="m"/>
  <feComposite in="d" in2="m" operator="in"/>
 </filter>
 <filter id="chalklogo" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="11" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.5 1.4" result="m"/>
  <feComposite in="d" in2="m" operator="in"/>
 </filter>
 <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="2"/><feColorMatrix type="saturate" values="0"/></filter>
</defs></svg>
<div class="frame"></div>
<div class="board">
 <svg class="dust" width="100%" height="100%"><rect width="100%" height="100%" filter="url(#grain)"/></svg>
 <div class="smudge"></div>
</div>
<div class="tray"></div>
<div class="stick" style="left:120px;width:58px;background:#f1eee6"></div>
<div class="stick" style="left:196px;width:40px;background:#e58a98"></div>
<div class="chalk">
 <div class="content">
  <h1>Come play with us<br><span class="red">this spring!</span></h1>
  <svg class="swash" viewBox="0 0 330 16"><path d="M4 11 C 80 3, 200 2, 326 8" fill="none" stroke="{RED}" stroke-width="3.4" stroke-linecap="round"/></svg>
  <ul>{lis}<li class="ice"><svg class="ck" viewBox="0 0 30 26"><path d="M3 14 L11 22 L27 3"/></svg>…and maybe some ice cream!</li></ul>
 </div>
 <div class="cta">Spring registration opens <b>Monday, Nov 2</b> · ncllball.com</div>
 <svg class="right doodle" viewBox="0 0 360 420">
  <!-- baseball diamond, chalk-drawn: foul lines, outfield fence, infield dirt arc, base paths, bases, mound, home plate -->
  <path d="M180 236 L36 92 M180 236 L324 92"/>
  <path d="M36 92 C 80 30, 280 30, 324 92"/>
  <path d="M96 160 C 120 92, 240 92, 264 160" stroke-dasharray="2 9"/>
  <path class="r" d="M180 236 L246 170 L180 104 L114 170 Z"/>
  <path d="M246 160 l10 10 l-10 10 l-10 -10 Z M180 94 l10 10 l-10 10 l-10 -10 Z M114 160 l10 10 l-10 10 l-10 -10 Z"/>
  <circle cx="180" cy="172" r="11"/>
  <path d="M172 228 h16 v7 l-8 7 l-8 -7 Z"/>
  <circle class="r" cx="252" cy="60" r="7"/>
  <path d="M234 70 l-14 7 M236 78 l-16 2"/>
  <!-- ice cream cone -->
  <g transform="translate(40,262) scale(.92)">
   <path d="M18 62 L44 140 L70 62 Z"/>
   <path d="M24 78 L62 100 M28 96 L58 116 M64 78 L28 100 M60 96 L32 118"/>
   <path d="M14 64 C 0 60, 2 38, 20 40 C 18 18, 46 10, 54 28 C 72 20, 90 40, 74 64 Z"/>
   <path class="r" d="M30 14 C 36 2, 50 4, 48 16"/><circle class="r" cx="44" cy="6" r="5"/>
  </g>
  <!-- stars -->
  <path class="r" d="M10 250 l4 9 l10 1 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 -1 z"/>
  <path d="M320 20 l3 7 l8 1 l-6 4 l2 8 l-7 -5 l-7 5 l2 -8 l-6 -4 l8 -1 z"/>
 </svg>
 <img class="logo" src="ncll_badge_1.png" alt="">
</div>
</body></html>"""


if __name__ == "__main__":
    for v, (h, l) in VARIANTS.items():
        (HERE / f"chalk-{v}.html").write_text(page(h, l), encoding="utf-8")
    print("wrote", ", ".join(f"chalk-{v}.html" for v in VARIANTS))
