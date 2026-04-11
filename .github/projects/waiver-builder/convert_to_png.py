#!/usr/bin/env python3
"""Convert all jpg/jpeg waivers to png in-place, delete originals."""
from pathlib import Path
from PIL import Image

root = Path(r"C:\Tools\ncllball.github.io\.github\projects\waiver-builder\blank_forms")
converted = 0
for src in root.rglob("*"):
    if src.suffix.lower() not in (".jpg", ".jpeg"):
        continue
    dst = src.with_suffix(".png")
    if dst.exists():
        src.unlink()
        print(f"  SKIP (png exists): {src.name}")
        continue
    try:
        with Image.open(src) as im:
            im.save(dst, "PNG")
        src.unlink()
        print(f"  {src.name} -> {dst.name}")
        converted += 1
    except Exception as e:
        print(f"  FAILED {src.name}: {e}")

print(f"\nDone. Converted {converted} files.")
