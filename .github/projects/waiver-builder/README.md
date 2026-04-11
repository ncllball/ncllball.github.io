# NCLL Waiver Builder

Builds coach-ready medical waiver packets (PDFs) for each team at the start of every season. Each packet contains a cover letter, a roster/forms summary, a blank waiver, and all submitted waivers for that team.

---

## Folder Structure

```
waiver-builder/
├── build_packets.py              # Main script — classify and build PDFs
├── convert_to_png.py             # Converts downloaded JPEGs to PNG in-place
├── dedupe_waivers.py             # Cross-references downloaded waivers against roster; archives misplaced files
├── blank_forms/
│   └── medical.release.waiver.YYYY.empty.pdf   # Blank waiver form for the current season
├── rosters/
│   └── YYYY.final.ncll.roster.xlsx             # Master roster export from Sports Connect
├── coach_packets/                # Created on first build run — output goes here
│   ├── MANIFEST.xlsx
│   ├── SUMMARY.xlsx
│   └── [division folders]/
│       └── [Team Name].pdf
└── templates/
    ├── coach-drive-message-template.md          # Message to send coaches when packets are ready
    └── waiver-resubmit-email-template.md        # Email to parents who need to resubmit
```

---

## Each Season — Setup Checklist

1. **Export the master roster** from Sports Connect and drop it in `rosters/` named `YYYY.final.ncll.roster.xlsx`
   - Required columns: Program (0), Division (1), AcctFirst (2), AcctLast (3), PlayerFirst (4), PlayerLast (5), TeamName (17)

2. **Download all submitted waivers** from Sports Connect into `blank_forms/` — one subfolder per team, named to match the roster's TeamName column
   - Run `convert_to_png.py` afterward to normalize all images to PNG
   - Run `dedupe_waivers.py` to catch any misplaced or duplicate files

3. **Drop the current season's blank waiver form** into `blank_forms/` named `medical.release.waiver.YYYY.empty.pdf`

4. **Update the year** in `build_packets.py` if any year-specific labels need changing

5. **Update `BASE_DIR`** in all three scripts if the folder has moved:
   - `build_packets.py` line 67
   - `convert_to_png.py` line 6
   - `dedupe_waivers.py` line 12–13

---

## Running the Scripts

### Phase 1 — Classify

```bash
python build_packets.py --classify
```

Reads the roster and all downloaded waivers. Classifies every form and writes `coach_packets/MANIFEST.xlsx`. Open the manifest to review flagged forms — set the **Override** column to `Acceptable` for any you want to force-accept.

### Phase 2 — Build

```bash
python build_packets.py --build
```

Reads the manifest (respecting overrides) and generates one PDF per team in `coach_packets/`, organized by division. Also writes `SUMMARY.xlsx` with counts by team.

---

## Each Coach Packet — Page Layout

| Page | Content |
|------|---------|
| 1 | Cover letter — ziplock instructions, quality disclaimer, reference to pages 2 and 3 |
| 2 | Team roster (from master roster) alongside "Forms in This Packet" and "No Form on File" tables |
| 3 | Blank waiver form — coaches can print extras for re-collects |
| 4+ | Individual waivers, one per player, sorted by last name |

---

## After Building — Distribution

1. Move `coach_packets/` to the Safety shared drive: `G:\Shared drives\NCLL\Safety\YYYY_waivers`
2. Use `templates/coach-drive-message-template.md` to notify coaches their packets are ready
3. For players flagged as needing resubmission, use `templates/waiver-resubmit-email-template.md` to contact parents directly

---

## Common Waiver Issues

| Issue | Likely Cause |
|-------|-------------|
| Black pages | Parent interacted with the e-signature field in Acrobat — upload bug |
| Wrong document | Parent uploaded the wrong file (driver's license, etc.) during registration |
| Blank or empty form | Parent uploaded a blank form or didn't upload anything |
| Blurry | Photo taken in poor lighting or out of focus |

Coaches are instructed to review each waiver and judge usability themselves. A blank form is included in every packet for re-collects.

---

## Dependencies

```bash
pip install openpyxl pillow numpy opencv-python reportlab pypdf
```
