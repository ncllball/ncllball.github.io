# Player Development Date Formatting Standard (Tag Strip)

Canonical rules for the `Dates:` line in Player Development (PD) tag strips. This ensures consistency, readability, and future automation.

## Objectives

- Parent-friendly, compact, and scannable.
- Year shown once when possible.
- Clear distinction between discrete dates vs spans.
- Easy to parse later (if we export JSON).

## Month & Day Style

- Use three-letter month abbreviations: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec.
- Numeric day only (no ordinals: no "18th").
- Always title case month abbreviations.

## Year Placement

- If all dates in same calendar year: show year once at end.
  - Example: `Jan 11, 18, 25 & Feb 1, 2025`.
- If crossing a year boundary, include year on both sides of a range or after each month cluster if discrete:
  - Range: `Dec 10, 2025 - Jan 14, 2026`
  - Discrete: `Dec 10, 17, 2025 & Jan 7, 14, 2026`

## Core Patterns

| Scenario | Pattern | Example |
|----------|---------|---------|
| Single date | Mon D, YYYY | `May 18, 2025` |
| Two dates (same month) | Mon D & D, YYYY | `Mar 1 & 8, 2025` |
| 3–4 dates (same month) | Mon D, D, D, YYYY | `Jan 11, 18, 25, 2025` |
| Cross-month list | MonA D, D, D & MonB D, YYYY | `Jan 11, 18, 25 & Feb 1, 2025` |
| Cross-month (2+2) | MonA D, D & MonB D, D, YYYY | `Jan 22, 29 & Feb 5, 12, 2025` |
| Span (multi-month) | MonA D - MonB D, YYYY | `Nov 9 - Feb 22, 2025` |
| Span (same month) | Mon D - D, YYYY | `Mar 1 - 8, 2025` (only if truly continuous) |
| Multi clusters (advanced) | MonA D; MonB D, D; MonC D, D, YYYY | `Mar 23; Apr 6, 13, 27; May 4, 11, 2025` |
| Session count suffix | (append) (N sessions) | `Feb 1, 8 & 22, 2025 (6 sessions)` |

## Separators & Symbols

- Date list separator: comma + space.
- Use `&` with spaces around it to join:
  - The last item in a two-date same-month case.
  - Two different month clusters (one `&` only) when listing two months.
- Use semicolons to separate three month clusters (avoid unless clarity needed).
- Use spaced hyphen for ranges: `Nov 4 - Jan 27, 2025`.

## When to Use a Range vs List

- Use a range when the program continuously spans a period (weekly meetings, etc.) but individual session dates are either too numerous or described below.
- Use a list when discrete event dates matter (clinics, finite sessions).

## Session Count

- Only include `(N sessions)` when the time structure below changes or count is not visually obvious.
- Omit for short obvious lists (≤4 dates) unless marketing value.

## DO NOT

- Do not mix times into the Dates line (times belong in the `Time:` tag or program body).
- Do not use ordinals (7th, 21st). Use plain numbers.
- Do not repeat the year per date when same year.
- Do not append status (Free, Closed) in the Dates tag—belongs elsewhere.

## Examples in Production (2025)

- `Nov 9 - Feb 22, 2025` (Teen Training span)
- `Feb 22, Mar 1 & 8, 2025` (AA Pitching discrete set spanning two months)
- `Mar 23; Apr 6, 13, 27; May 4, 11, 2025` (clustered multi-month list)
- `Feb 1, 8 & 22, 2025 (6 sessions)` (Free February with session count)

## Future Automation Hooks (Optional)

Add machine-readable attributes if needed later:

- Range form: `<ul class="tag" data-range-start="2025-11-09" data-range-end="2025-02-22">`
- List form: `<ul class="tag" data-dates="2025-02-01;2025-02-08;2025-02-22">`

## Change Log

- 2025-09-11: Initial standard authored.

---

## Tag Strip Canonical Mapping (Divisions & Age Group)

| Canonical Division Text | data-sport | data-division-levels (semicolon) | Notes |
|-------------------------|-----------|----------------------------------|-------|
| Baseball (Single-A) | baseball | single-a | Entry / foundational coach-pitch / machine-pitch level. |
| Baseball (AA) | baseball | aa | Player pitch introduction. |
| Baseball (AAA & Majors) | baseball | aaa;majors | Use for combined eligibility group. |
| Baseball (Teen) | baseball | teen | League Age 13-16. |
| Baseball (AA - Seniors) | baseball | aa;aaa;majors;juniors;seniors | Multi-level clinic/camp spanning upper path. |
| Softball (AAA & Majors) | softball | aaa;majors | Upper competitive skill consolidation. |
| Softball (AA & Up) | softball | aa;aaa;majors | AA through Majors inclusive. |
| Softball (All) | softball | multi | Wide range (e.g., grades 3-12) when not division‑specific. |

### Age Group Canonical Text Patterns
| Scenario | Pattern | Example |
|----------|---------|---------|
| League Age range | League Age N-M | League Age 9-12 |
| Single division named | \<Division Name\> Baseball/Softball | Single-A Baseball |
| Grade range | Grades G1-G2 | Grades 3-12 |
| Plain ages span | Ages N-M | Ages 8-14 |
| Division + qualifier | AA & Up Softball | AA & Up Softball |

Capitalization Rules:

- Always capitalize “League Age”.
- Use title case for “Ages”, “Grades”.
- Use ampersand with spaces: `AAA & Majors`, `AA & Up`.
- Use spaced hyphen for multi-level span label inside parentheses: `AA - Seniors`.

---

## Tag Strip Linter Checklist

Run this manually (or future script) whenever adding a new PD page:

1. Tag Order (exact): Dates → Location → Time → Cost → Age Group → Division(s) → Led by.
2. Labels (exact spelling/punctuation): `Dates:`, `Location:`, `Time:`, `Cost:`, `Age Group:`, `Division(s):`, `Led by:`.
3. Dates formatting conforms to this doc (abbrev months, single year at end, range vs list logic).
4. Time uses spaced hyphen in ranges (`5:00 - 6:30 PM`). Multiple options separated by `|` or `&` consistent with existing patterns.
5. Cost formatting: `$<amount> / <unit>` or `FREE` (all caps). Sponsored note appended in parentheses only.
6. Age Group text follows canonical pattern table (League Age capitalized, Ages/Grades title case).
7. Division(s) text matches one of the canonical division rows (introduce new only if justified—then update table).
8. Data attributes present on `<ul class="tag">`: either `data-range-start` + `data-range-end` or `data-dates` list.
9. Each `<li>` has `data-tag` attribute with category; Cost has `data-cost-amount` (or `data-cost-type="free"` / `data-cost-status="tbd"`).
10. Division item includes `data-sport`, `data-division-levels`, and stable `data-division-scope` slug.
11. No stray capitalization inconsistencies (“League age” must not appear).
12. No trailing spaces; no double spaces after colons.
13. Email addresses entity-encoded if present elsewhere on page.
14. External links include `rel="noopener noreferrer"` when `target="_blank"`.
15. All `<time>` elements (in schedules) use ISO `datetime` attribute.

If any rule diverges intentionally, add a brief HTML comment explaining why.

---
Questions or refinements? Update this file and the reference list together.
