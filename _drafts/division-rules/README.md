# NCLL Division Rules — build process

**Goal:** write one clean, current rules document per baseball division for NCLL, using
**Majors as the template**. Every division doc has the same skeleton; only specific values
change between divisions. Do Majors first, get it right, then clone it down.

This folder is the working area. Everything here is plain Markdown — edit in any text
editor, VS Code, Obsidian, or paste into Word. Nothing here is live on the NCLL site yet;
it's the source of truth you copy *from*.

---

## The three inputs for every division

A division rules doc is a stack of three layers. Always in this order of authority:

1. **Little League Official Rulebook** — the base. Governs everything unless amended.
   *(Get the current-year Baseball rulebook PDF from littleleague.org. The relevant parts
   for a division doc: the division's own section, Regulation IV(i) mandatory play,
   Regulation VI pitch counts, the bat rule.)*
2. **District 8 interleague supplement** — what NCLL **must** match to play other D8
   leagues. Non-negotiable for any interleague game. Files are in
   `../../rulebooks/wa-state-and-district8/d8-baseball-rules-2026/` (both `.pdf` and a
   `.txt` extraction). Majors = `D8-Supplemental-Majors-Baseball-Rules`.
3. **NCLL's own choices** — everything D8 leaves open: team formation, draft, assessments,
   playing up/down, roster size, practice cadence, whether standings are kept, All-Star
   selection, in-house vs interleague schedule. This is where the actual board decisions
   live.

D8's supplement only covers **AAA and up**. For AA / A / Rookie / Tee Ball there is no D8
interleague doc — those are almost entirely layer 3 (NCLL's call). That's why Majors is the
right place to start: it's the most constrained, so the template comes out complete, and
the lower divisions are mostly deletions and substitutions from it.

---

## Step by step

### 1. Set up (once)
- Confirm the D8 PDFs in `../../rulebooks/wa-state-and-district8/d8-baseball-rules-2026/`
  are the current season's. Check `llwadistrict8.org` → Baseball → Rules for a newer
  revision date. If newer, re-download and note the date.
- Download the current LL Baseball Official Rulebook PDF; drop it in
  `../../rulebooks/little-league/`.
- Find NCLL's existing Majors rules, if any (old website page, past coach handout, a doc
  from a prior VP of Baseball). Save it here as `majors-CURRENT-as-of-YYYY.md` for
  reference — you're revising, not necessarily starting clean.

### 2. Fill in Majors
Open `_TEMPLATE_division-rules.md` and `baseball-majors-rules.md`. `baseball-majors-rules.md` is already seeded with the
D8 interleague rules transcribed verbatim and the LL/NCLL rows flagged. Go section by
section:

- **LL Rulebook row** — confirm or correct against the actual rulebook PDF. (Seeded rows
  are marked `⚠ verify`.)
- **D8 Interleague row** — already filled from the D8 Majors supplement. Spot-check against
  the PDF; fix if the season's revision changed anything.
- **NCLL row** — this is the work. For each section:
  - If D8 mandates it → NCLL row just says "per D8" (you have no choice for interleague).
  - If D8 is silent → **decide**, and write the decision plainly. Mark anything that's a
    real board-level choice with `» NCLL DECISION:` so it can be pulled into a decision
    list for the board.
  - Add a one-line **rationale** in Notes. Where useful, the research on what comparable
    leagues do is at `../../` … see `SOURCES.md`.

### 3. Review Majors
- Read it as a new Majors coach would. Every question a coach asks mid-game should have an
  answer: time limits, mercy, dropped 3rd strike, courtesy runner, minimum play, pitch
  count, 8-player rule.
- Pull every `» NCLL DECISION:` line into a short list and confirm each with whoever owns
  that call (VP Baseball / board).

### 4. Clone down to the other divisions
For each division below Majors, copy `baseball-majors-rules.md` → `<division>.md` and change **only** the
rows listed in `_division-deltas.md`. That file is the per-division diff — age eligibility,
field/HR distance, pitching format, stealing/bunting/leadoffs, time limits, dropped 3rd
strike, pitch limits, mandatory play. Everything not in the delta table stays identical to
Majors on purpose — that consistency is the point.

Order: Majors → AAA → AA → A → Rookie / Coach-Pitch → Tee Ball. Each step is a smaller doc
than the one above it.

### 5. Produce the parent-facing grid
Once the division docs exist, fill `division-comparison-grid.md` — the one-page table
parents actually read to pick a division (age, pitching, field size, stealing, game
length, time commitment). Several D8 leagues publish exactly this (Northeast Seattle's is a
good model).

### 6. Publish
Copy the finished text into the NCLL website division pages / coach handbook. Keep these
`.md` files as the master; update them first, then the site.

---

## Optional accelerator — the rulebook assistant

Once the local rulebook RAG is running (see the Backstop plan), use it to fill the **LL
Rulebook** rows: ask it "what does the Majors division section say about X" and paste the
cited answer. Until then, that column is filled by hand with the rulebook PDF open. The
assistant does **not** decide the NCLL rows — those are yours.

---

## Files in this folder

| File | What it is |
|---|---|
| `README.md` | this |
| `_TEMPLATE_division-rules.md` | the blank canonical outline — every section a division doc needs |
| `baseball-majors-rules.md` | Majors, seeded with D8 rules + decision flags — **start here** |
| `_division-deltas.md` | per-division change table for cloning Majors down |
| `division-comparison-grid.md` | baseball parent-facing one-pager skeleton |
| `SOURCES.md` | the D8 PDFs, the LL rulebook, and the league-research findings |
| `open-board-decisions.md` | consolidated **baseball** open-items tracker, all 9 divisions |

**Baseball is complete** — all nine divisions (Kindy → T-ball → A → AA → AAA → Majors, +
Intermediate n/a, Junior, Senior — note the corrected Kindy/T-ball order, Kindy sits *above*
T-ball) have their own `baseball-<division>-rules.md` doc.

**Softball exists too**, built the same way but as a separate ladder: `softball-a-rules.md`,
`softball-aa-rules.md`, `softball-aaa-rules.md`, `softball-majors-rules.md`,
`softball-juniors-rules.md`, plus `softball-seniors-rules.md` for the regular-season ladder's
All-Star/tournament-only top division (D8 confirmed no Senior softball regular season exists
at any level — same district-skip shape as baseball Intermediate/Seniors; see
`softball-open-board-decisions.md` item 1). Softball has no T-ball/Kindy — A (coach pitch,
LA 6–8) is the floor. Its own consolidated tracker is
`softball-open-board-decisions.md`, kept separate from the baseball one on purpose. The
softball docs' NCLL-layer sourcing is lower-confidence than baseball's: the closest
NCLL-authored source pages live in `_temp/.cleanup/programs-review/Softball/`, a cleanup/
review staging folder, not a live path the way `Programs/Baseball/` is.
