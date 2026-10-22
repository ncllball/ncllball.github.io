"""The 'GAME ON!' slide (first used 2026-10-22): chrome TV, game dimmed like a game-over screen, big headline centred,
supporting lines under it, the key date on a red bar, an action line, on-deck circles with the NC logo, and the
copyright line. All wording comes from a slide config (see ../slides/*.json and ../build.py)."""
import html as _html
import re
from pathlib import Path

import make_tv_wide as T

HERE = Path(__file__).parent


def page(cfg):
    esc = _html.escape
    html = T.page()
    pad = 4
    hx, hy, hw, hh = T.HOLE
    outline = ", ".join(f"{x}px {y}px 0 #111" for x, y in [(-3, 0), (3, 0), (0, -3), (0, 3), (-3, -3), (3, -3), (-3, 3), (3, 3)])
    drop = ", ".join(f"{k}px {k}px 0 #c8102e" for k in range(4, 11))
    css = f"""
.dim{{position:absolute;inset:0;background:rgba(5,5,8,.62)}}
.center{{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding-top:18px;color:#fff;text-align:center}}
.big{{font-size:84px;line-height:1;text-shadow:{outline}, {drop}, 12px 12px 0 #111}}
.sub{{margin-top:30px;font-size:15px;line-height:2.1;text-shadow:2px 2px 0 #111}}
.sub .y{{background:#c8102e;padding:4px 10px 3px;box-shadow:3px 3px 0 #000;text-shadow:none}}
.start{{margin-top:14px;font-size:15px;text-shadow:2px 2px 0 #111}}
.copy{{position:absolute;left:0;right:0;bottom:24px;font-size:10px;letter-spacing:1px;color:#d9d9d9;text-shadow:2px 2px 0 #111}}
.start .cur{{display:inline-block;width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-left:12px solid #fff;margin-right:12px}}
"""
    html = html.replace("</style>", css + "</style>", 1)
    # replace the HUD: keep the score line, drop the small title, ready line and text box
    hud = re.search(r'<div class="hud">.*?</div></div>\n', html, re.S).group(0)
    score = re.search(r'<div class="score">.*?</div>', hud, re.S).group(0)
    # on-deck circles: the NC logo painted on the grass either side of home plate, foreshortened like the field
    gx = (hw + 2 * pad) / T.M.W                      # screen px per game pixel
    home_x, home_y = (80 + T.M.OX) * gx, (110 + T.M.OY) * gx
    ond = ""
    for side in (-1, 1):
        cx, cy = home_x + side * 80 * gx, home_y - 3 * gx      # out past the copyright line, level with the batter
        w, h = 17 * gx, 7 * gx
        ond += (f'<div class="ondeck" style="left:{cx - w / 2:.1f}px;top:{cy - h / 2:.1f}px;width:{w:.1f}px;height:{h:.1f}px">'
                f'<img src="{T.LOGO}" alt=""></div>')
    html = html.replace('</style>', '''.ondeck{{position:absolute;border-radius:50%;background:#e9e6dc;border:3px solid #c8102e;box-shadow:0 0 0 2px #f4f4f4;
  display:flex;align-items:center;justify-content:center;overflow:hidden}}
.ondeck img{{height:150%;transform:scaleY(.62)}}
</style>'''.replace('{{', '{').replace('}}', '}'), 1)
    html = html.replace('<div class="dim"></div>', ond + '<div class="dim"></div>', 1) if '<div class="dim"></div>' in html else html
    score = (f'<div class="score"><span class="r">{esc(cfg["score_left_red"])}</span> {esc(cfg["score_left"])} '
             f'&nbsp;&nbsp;&nbsp; {esc(cfg["score_right"])}</div>')
    new = (f'<div class="dim"></div><div class="hud">{score}'
           f'<div class="center"><div class="big">{esc(cfg["headline"])}</div>'
           f'<div class="sub">{esc(cfg["line"])}<br><span class="y">{esc(cfg["date_bar"])}</span></div>'
           f'<div class="start"><span class="cur"></span>{esc(cfg["action"])}</div></div>'
           f'<div class="copy">&copy; {esc(cfg["copyright"])}</div></div>\n')
    html = html.replace(hud, new, 1)
    return html.replace('<div class="dim"></div>', ond + '<div class="dim"></div>', 1)
