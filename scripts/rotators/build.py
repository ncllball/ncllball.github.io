"""Build a homepage rotator slide from a slide config.

    python scripts/rotators/build.py scripts/rotators/slides/2027-spring-game-on.json

Writes three files to scripts/rotators/out/ (git-ignored):
    <output>.png              1110x510, transparent corners (what goes in the CMS rotator)
    <output>-dark.png         same slide on a dark background
    <output>-phone.png        360px-wide preview, to check it reads on a phone
Copy the transparent one to images/rotators/ when it's final, then upload it in the CMS (see README.md).
"""
import json
import subprocess
import sys
import time
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
OUT = HERE / "out"


def shoot(html, png, transparent):
    """Render the page at 2x with headless Edge, then downsample to 1110x510."""
    shot = png.with_name(png.stem + "@2x.png")
    shot.unlink(missing_ok=True)
    args = [str(EDGE), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
            "--window-size=1110,510", "--virtual-time-budget=6000", f"--screenshot={shot}"]
    if transparent:
        args.append("--default-background-color=00000000")
    subprocess.run(args + [html.as_uri()], capture_output=True)
    for _ in range(60):                      # Edge returns before the file is written
        if shot.is_file() and shot.stat().st_size:
            break
        time.sleep(0.5)
    time.sleep(0.5)
    im = Image.open(shot)
    im.resize((1110, 510), Image.LANCZOS).save(png)
    shot.unlink()
    return im


def main(cfg_path):
    cfg = json.loads(Path(cfg_path).read_text(encoding="utf-8"))
    if cfg.get("template") != "retro-tv":
        sys.exit(f"unknown template {cfg.get('template')!r} (only 'retro-tv' so far)")
    sys.path.insert(0, str(HERE / "retro-tv"))
    import make_tv_center as C

    page = C.page(cfg)
    transparent = (page.replace("background:radial-gradient(ellipse 120% 120% at 50% 50%,#1c1c1f,#0b0b0c)", "background:transparent", 1)
                       .replace("filter:drop-shadow(0 8px 14px rgba(0,0,0,.6))", "", 1))
    tpl = HERE / "retro-tv"
    (tpl / "_dark.html").write_text(page, encoding="utf-8")
    (tpl / "_transparent.html").write_text(transparent, encoding="utf-8")
    OUT.mkdir(exist_ok=True)
    name = cfg["output"]
    shoot(tpl / "_transparent.html", OUT / f"{name}.png", True)
    shoot(tpl / "_dark.html", OUT / f"{name}-dark.png", False)
    Image.open(OUT / f"{name}-dark.png").resize((360, 165), Image.LANCZOS).save(OUT / f"{name}-phone.png")
    for f in ("_dark.html", "_transparent.html"):
        (tpl / f).unlink()
    print("wrote", ", ".join(str((OUT / n).relative_to(HERE.parents[1])) for n in (f"{name}.png", f"{name}-dark.png", f"{name}-phone.png")))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
