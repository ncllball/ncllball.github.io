#!/usr/bin/env python3
"""
dedupe_waivers.py
Cross-reference blank_forms against the master roster to find duplicates.
Keeps each waiver only in the player's correct team folder.
Moves extras to blank_forms/_archive/
"""
import re, shutil, openpyxl
from pathlib import Path
from collections import defaultdict

WAIVERS  = Path(r"C:\Tools\ncllball.github.io\.github\projects\waiver-builder\blank_forms")
ROSTER   = Path(r"C:\Tools\ncllball.github.io\.github\projects\waiver-builder\rosters\2026.final.ncll.roster.xlsx")
ARCHIVE  = WAIVERS / "_archive"
ARCHIVE.mkdir(exist_ok=True)


def sanitize(name):
    """Mirror the sanitize() used when creating folder/file names."""
    return re.sub(r'[<>:"/\\|?*]', "", name).strip()


# ── Build roster: player_name -> canonical team folder name ──────────────────
print("Loading roster...")
wb = openpyxl.load_workbook(ROSTER)
ws = wb.active
# Columns (0-indexed): 4=PlayerFirst, 5=PlayerLast, 17=TeamName
player_to_team = {}   # "First Last" -> sanitized folder name
for row in ws.iter_rows(min_row=2, values_only=True):
    first, last, team = row[4], row[5], row[17]
    if not (first and last and team):
        continue
    player = f"{first} {last}".strip()
    folder = sanitize(team)
    player_to_team[player] = folder

print(f"  {len(player_to_team)} players in roster")


# ── Find all waiver files and group by player name ───────────────────────────
# Filename format: "TeamFolder - Player Name.png"
# Extract player by stripping the folder name prefix from the stem.
by_player = defaultdict(list)
for f in WAIVERS.rglob("*.png"):
    if "_archive" in f.parts:
        continue
    folder_name = f.parent.name
    stem = f.stem
    prefix = folder_name + " - "
    if not stem.startswith(prefix):
        continue
    player = stem[len(prefix):].strip()
    by_player[player].append(f)


# ── Process duplicates ────────────────────────────────────────────────────────
moved = 0
kept  = 0
unknown = []

for player, files in sorted(by_player.items()):
    if len(files) == 1:
        continue  # no duplicate

    correct_folder = player_to_team.get(player)
    if not correct_folder:
        unknown.append((player, [f.parent.name for f in files]))
        continue

    # Separate correct file from extras
    correct = [f for f in files if f.parent.name == correct_folder]
    extras  = [f for f in files if f.parent.name != correct_folder]

    if not correct:
        # Player found in roster but no file in correct folder yet — keep all, flag
        print(f"  WARN: {player} -> correct folder '{correct_folder}' has no file; keeping all")
        continue

    # Move extras to archive
    for f in extras:
        dest = ARCHIVE / f.parent.name
        dest.mkdir(exist_ok=True)
        shutil.move(str(f), str(dest / f.name))
        print(f"  ARCHIVE  {f.parent.name}/{f.name}")
        moved += 1

    kept += len(correct)

print(f"\nDone. Moved {moved} duplicates to _archive/, kept {kept} correct files.")

if unknown:
    print(f"\nPlayers with duplicates NOT found in roster ({len(unknown)}):")
    for name, folders in unknown:
        print(f"  {name}  -> {folders}")
