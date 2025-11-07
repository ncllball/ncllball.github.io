# Player Development Tag Strip Reference (2025)

(Relocated from `Player Development/tag-items-reference.md` on 2025-09-23.)

This document captures the standardized tag strip items (the top metadata list) for each 2025 Player Development (PD) program page. Order is preserved exactly as it appears in each file. This serves as a quick audit / source-of-truth for consistency and future automation (e.g., generating summaries or status badges).

<!-- Content mirrored verbatim from original file -->

## 2025 Winter Teen BB Training

- Dates: Nov 9, 2024 - Feb 22, 2025
- Location: Focus Baseball Cages
- Day: Tuesdays
- Time: 5:00 – 6:30 PM
- Cost: TBD
- Division(s): Baseball (Teen)
- Led by: Friends of NCLL — Coach Ray Atkinson

Note: Age Group tag intentionally omitted (scope clear via Division + Eligibility). Cross-year span intentionally uses 2024 start → 2025 end. Datetime attributes now correct.

## 2025 Winter Single-A BB Training

- Dates: Mar 1 & 8, 2025
- Location: Wallingford Boys & Girls Club
- Time: 2:00 – 3:00 PM & 3:00 – 4:00 PM
- Cost: $20 / session
- Division(s): Baseball (Single-A)
- Led by: Friends of NCLL — Coach Mark Linden (Baseball Positive)

Note: Division label normalized to "Baseball (Single-A)" (previously "Baseball (A)").

## 2025 Winter Double-AA BB Pitching

- Dates: Feb 22, Mar 1 & 8, 2025
- Location: The Hive
- Time: 12:00 PM or 1:15 PM
- Cost: $60 / player
- Division(s): Baseball (AA)
- Led by: Friends of NCLL — Northwest Sting Baseball

Note: Tag strip presently omits an Age Group line (consistent with current page). If we want parity, add: `Age Group: AA Baseball (Pitchers)`.

## 2025 Winter AAA+MAJ SB Training

- Dates: Jan 11, 18, 25 & Feb 1, 2025
- Location: Wallingford Boys & Girls Club
- Time: 4:00 - 6:00 PM (single 2-hour block)
- Cost: $0 / player (FREE)
- Division(s): Softball (AAA & Majors)
- Led by: Coach Hunter Mullally

Note: Age Group tag removed (was "AAA & Majors Softball"). Division(s) item conveys scope. Free cost pattern normalized to $0 / player + FREE parenthetical.

## 2025 Winter AAA+MAJ BB Training

- Dates: Nov 4 - Jan 27, 2025
- Location: The Hive
- Time: Evenings, days vary by week
- Cost: $250 / player
- Division(s): Baseball (AAA & Majors)
- Led by: NCLL Volunteer Majors & AAA Coaches

Note: Age Group tag removed (was "League Age 9-12"). Division(s) plus body prose capture range.

## 2025 RHS Fastpitch Winter Batting Clinic

- Dates: Jan 22, 29 & Feb 5, 12, 2025
- Location: Sound Baseball Batting Cages
- Time: 4:00 PM | 5:00 PM | 6:00 PM
- Cost: $50 / session
- Division(s): Softball (Grades 3-12)
- Led by: Roosevelt High School Fastpitch

Note: Grade span expressed inside Division(s); no separate Age/Grade tag.

## 2025 LHS Winter Training (Lincoln HS Skills Camp)

- Dates: May 18, 2025
- Location: Lower Woodland Field #1
- Time: 12:00 - 3:00 PM
- Cost: $60 / player
- Division(s): Baseball (AA & Up)
- Led by: Friends of NCLL — Lincoln High School

Note: Display text uses "AA & Up" (page HTML). Prior reference showed "AA - Seniors" — updated for parity.

## 2025 In-Season Double-AA (and up) SB Pitching

- Dates: Mar 23; Apr 6, 13, 27; May 4, 11, 2025
- Location: LW (behind Field 5 near batting cages)
- Day: Sundays
- Time: 4:00 – 5:00 PM & 5:00 – 6:00 PM (two sessions)
- Cost: $0 / player (FREE)
- Division(s): Softball (AA & Up)
- Led by: Hunter Mullally (Bishop Blanchet HS & Seattle Fastpitch)

Note: Tag strip intentionally omits a separate Age Group line; Division(s) conveys scope (AA & Up). Free cost standardized.

## 2025 Free February

- Dates: Feb 1, 8 & 22, 2025 (6 sessions)
- Location: Robert Eagle Staff MS (turf)
- Sessions: 4:30, 5:30, 6:00 & 7:00 PM (each 1 hr)
- Cost: $0 / session (FREE)
- Division(s): Baseball (AAA & Majors)
- Led by: NCLL Coaches

Note: Location display now mirrors data-location including "(turf)".

---

### Aggregate Label Inventory

Canonical set (target order):

- Dates
- Location
- Day (optional; used when a recurring weekday is a core attribute)
- Time
- Sessions (alternate to Time for multi-slot programs where session times are the key attribute)
- Cost
- Age Group (optional when Division(s) already encodes scope or broad span)
- Division(s)
- Led by

Variations currently in use (post Day-tag adoption on Teen & In-Season SB Pitching):

- Pages WITH Age Group tag: (none at present — Single-A line removed pending policy decision).
- Pages WITHOUT Age Group tag: All current PD pages.
- Pages WITH Day tag: Teen BB, In-Season SB Pitching.
- Pages WITHOUT Day tag: all others (either non-weekly recurrence, variable days, variable-day span, or discrete date list focus).

Observation: Temporary full omission of Age Group across PD. Decision needed: (a) reintroduce uniformly, (b) restrict to narrow single-level offerings, or (c) keep omitted and rely on Division(s) + body Eligibility.

Capitalization normalization applied:

- “AA - Seniors” (spaced hyphen)
- “AA & Up” (ampersand + Title Case Up)
- “League Age” capitalized

Recommended future enforcement: a linter should flag missing Age Group unless:

1. Division(s) spans 3+ adjacent levels (e.g., AA - Seniors or AA & Up), OR
2. Body copy introduces explicit League Age / Grades span within first two sections, OR
3. Program intentionally broad (e.g., pitching clinics) — documented with an inline HTML comment near the tag strip.

### Machine-Readable Attributes Coverage Snapshot

| Page | Dates Mode | Time Structure | Cost Attrs | Age Data | Division Attrs | Led by Attrs |
|------|------------|---------------|-----------|----------|----------------|--------------|
| Teen BB | range (data-range-start/end) | fixed weekly (day + start/end) | status=tbd | (missing – was age-min/max) | sport+levels+scope | coach name |
| Single-A | list (data-dates) | multi-slot (slot-count + per-slot) | amount/unit/status | (none) | sport+levels+scope | coach + org |
| Double-AA Pitching | list | 2 options (option1/2) | amount/unit | (missing) | sport+levels+scope | organization |
| AAA+MAJ SB | list | start/end + duration | free + sponsor | (missing – implicit via divisions) | sport+levels+scope | coach |
| AAA+MAJ BB | range | variable descriptor | amount/unit | (missing – was age-min/max) | sport+levels+scope | staffing levels |
| RHS Batting | list | pipe-separated discrete times | amount/unit | grade span (text only) | sport+levels+scope | org name |
| LHS Camp | single date | start/end + duration | amount/unit | ages span (text only) | multi-level span | org + affiliation |
| In-Season SB Pitching | list | two sessions (session1/2) | free | (omitted) | sport+levels+scope | coach + affiliations |
| Winterball25 Free February | list | sessions-per-date + duration | free | league age range | sport+levels+scope | org + staffing |

Gaps / Enhancements:

- Decide policy: permanently omit Age Group from broad-scope or multi-level pages OR reintroduce it for absolute consistency.
- Standardize grade/age textual patterns into data attributes where missing (RHS Batting grades, LHS ages span) even if not shown as a tag.
- Consider `data-status` (e.g., `open`, `upcoming`, `closed`, `free`) for automation.

### Potential Follow-Ups

- Generate `pd-programs.json` manifest.
- Implement linter script (HTML parser) to enforce ordering & label/capitalization.
- Add `data-status` & surface status badges inline (not only on landing page).
- Backfill missing Age Group lines or document permanent exceptions.
- Convert TBD pricing once confirmed.
- Add normalization rule: all free items use `$0 / <unit> (FREE[; sponsor])`; TBD keeps unit in data-cost-unit for future substitution.

Let me know if you’d like JSON, CSV, or an automated extractor next.

