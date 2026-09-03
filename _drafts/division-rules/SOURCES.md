# Sources for the NCLL division rules build

## 1. Little League Official Rulebook — the base layer
- Get the current-year **Baseball** rulebook PDF from littleleague.org (free download, or
  the RuleBook app).
- **2025 Baseball Rulebook FULL TEXT is available** — John's de-bound print copy, OCR'd
  2026-09-02: `../../rulebooks/little-league/2025-baseball-rulebook-scan/2025-LL-Baseball-Rulebook.{pdf,txt}`
  (193/195 pp good). Softball too: `2025-softball-rulebook-scan/2025-LL-Softball-Rulebook.{pdf,txt}`
  (213/214 pp). Challenger: `2025-challenger-rulebook-scan/2025-LL-Challenger-Rulebook.{pdf,txt}` (204 pp).
  Check the `⚠ verify` rows against these; layer the free 2026 changes on top.
- The FREE Rulebook App (not extractable) / paid Kindle also exist as fallback.
- What we DID pull into `../../rulebooks/little-league/` (all free from littleleague.org):
  the 2026 significant rule updates (minor — see that folder's README), the baseball
  age chart, field + pitching-mound diagrams for every division, the full published
  tournament rules, residency/eligibility docs, the two age waivers, pitch-count forms,
  and the Coach-Pitch / Tee-Ball program guides. See `forms-and-diagrams/INDEX.md`.
- Sections that matter for a division doc: the division's own section; **Regulation IV(i)**
  (mandatory play + penalty); **Regulation VI** (pitch counts, rest, catcher/pitcher);
  the current **bat rule** (USABat); tournament eligibility regulations for All-Stars.
- Every `⚠ verify` line in `baseball-majors-rules.md` is checked against this.

## 2. District 8 interleague supplements — the constraint layer
Downloaded 2026-09-01 from `llwadistrict8.org` → Baseball → Rules (docs are hosted on the
D8 Google Drive). Location: `../../rulebooks/wa-state-and-district8/d8-baseball-rules-2026/`
— each has a `.pdf` and a `.txt` extraction.

| File | Covers | Notes |
|---|---|---|
| `D8-Supplemental-Majors-Baseball-Rules` | Majors | rev. 2024-03-22 — **seeded into `baseball-majors-rules.md`** |
| `D8-Supplemental-AAA-Baseball-Rules` | AAA | rev. 2024-03-22 |
| `Intermediate-Baseball-Rules` | Intermediate | 2024 D8 interleague |
| `D8-Supplemental-Intermediate-Baseball-Rules` | Intermediate | 2025 supplement |
| `Junior-Baseball-Rules` | Juniors | 2024 D8 interleague |
| `D8-Supplemental-Junior-Baseball-Rules` | Juniors | |
| `D8-Supplemental-Senior-Baseball-Rules` | Seniors | |
| `D7-D8-D9-Senior-Baseball-Interleague-Rules` | Seniors | 2025 cross-district options |
| `D7-D8-Intermediates-and-Juniors-Rules-Options` | Int / Jr | 2025 cross-district options |

**No D8 supplement exists for AA, A, Rookie, or Tee Ball** — confirming those are local-
league rules. Before finalizing, re-check the D8 Rules page for newer revision dates; also
check the D8 Baseball **"Playoff Schedules and Rules"** page for the Tournament of Champions
format (referenced in the Majors doc, G9).

Structure note: the Majors and AAA supplements are **byte-for-byte identical** in the
"COMMON RULES" section and in structure — which is exactly why Majors works as the master
template.

## 3. Comparable-league research — the "what do others do" layer
- **Pitching-format comparison** — what 44 leagues (all 12 WA D8 siblings + one per state)
  do for the tee-ball → kid-pitch bridge. Use this for the C1 rows in AA / A / Rookie.
  HTML page: `../../research/pitching-format/pitching-comparison.html` (not yet published
  as an artifact — open the file, or ask to publish it).
- Raw crawl data (division text pulled from each league's site):
  `homeserver:/mnt/user/appdata/.claude/backstop/research/pitching-format/`
  - `digest_combined.txt` — the readable per-league division descriptions
  - `pages/<charter>/` — full page text
  - `sample.json` — the 63 leagues sampled
- Key finding: no LL rule sets coach-vs-machine; it's a board call. Coach-pitch bridge is
  the majority; a machine-pitch division shows up in ~1 in 4 and has LL's Machine Pitch
  Manual behind it; **hybrid coach-assisted player pitch at AA is the distinctive D8 move**
  (Roosevelt, North Bothell, North Lake).

## 4. NCLL's current rules — the starting point
- Find NCLL's existing Majors / division rules (old site pages, prior coach handbooks, a
  doc from a previous VP of Baseball). Save alongside as `*-CURRENT-as-of-YYYY.md`.
- The crawl of `ncllball.com` only captured NCLL's **softball** division descriptions
  (A = coach pitch 6–7; AA = coach/player blend 7–9). The baseball divisions page wasn't
  captured — pull it from the live site.
