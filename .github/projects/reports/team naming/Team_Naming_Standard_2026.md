# Team Naming Standard (2026)

## Why this format
- Sponsors arrive after teams need names. A two-phase format keeps a stable identifier early, then swaps in sponsors later without breaking internal tracking.
- Coach/sponsor name is placed **first** so it remains visible in GameChanger mobile standings, which truncate team names after ~12-15 characters.

## Standard format

### Phase 1 (pre-sponsor)
`[Coach] - NCLL - [Year] - [Program] - [Division]`

### Phase 2 (sponsors assigned)
`[Sponsor] - NCLL - [Year] - [Program] - [Division]`

Swap only the first segment from coach to sponsor. Everything else stays the same.

## Program codes
| Code | Program |
|------|---------|
| BB   | Baseball |
| SB   | Softball |

## Division codes
| Code | Division |
|------|----------|
| TB   | T-ball |
| KCP  | Kindergarten Coach Pitch |
| A    | A |
| AA   | AA |
| AAA  | AAA |
| MAJ  | Majors |
| JR   | Juniors |
| SR   | Seniors |

## Examples

### Phase 1 (coach name)
| Team name | Mobile shows |
|---|---|
| `Smith - NCLL - 2026 - BB - MAJ` | `Smith - NCLL...` |
| `Garcia - NCLL - 2026 - BB - AAA` | `Garcia - NCL...` |
| `Jones - NCLL - 2026 - SB - MAJ` | `Jones - NCLL...` |
| `Lee - NCLL - 2026 - BB - TB` | `Lee - NCLL -...` |
| `Park - NCLL - 2026 - SB - A` | `Park - NCLL...` |
| `Randall - NCLL - 2026 - BB - KCP` | `Randall - NC...` |

### Phase 2 (sponsor swap)
| Phase 1 | Phase 2 |
|---|---|
| `Smith - NCLL - 2026 - BB - MAJ` | `KensMarket - NCLL - 2026 - BB - MAJ` |
| `Garcia - NCLL - 2026 - BB - AAA` | `PetesPizza - NCLL - 2026 - BB - AAA` |

## Rules
1. Only the first segment (coach/sponsor) changes between phases.
2. Phase 1 names are never a sponsor.
3. Use the same program and division codes every season; only update the year.

## Notes
- Previous format (`[DivisionShort]-[Year]-[Team#]-[PrimaryName]`) put the division first, causing all teams to appear identical in GameChanger mobile standings due to truncation.
- Current SportsConnect exports mix numbering, coach name, and sponsor formats. This standard unifies them.

## 2026 AI Team Rostering
- Apply this naming standard in the 2026 AI Team Rostering sheet:
  `https://docs.google.com/spreadsheets/d/1TfapIZsr3ToNmJkUMM9rgm5kc2xniIJ-WyI1I47fv9Y/edit?gid=1118485375#gid=1118485375`
- Use:
  - Phase 1: `[Coach] - NCLL - [Year] - [Program] - [Division]`
  - Phase 2: `[Sponsor] - NCLL - [Year] - [Program] - [Division]`

## Files
- `.github/projects/reports/team naming/Team_Naming_Proposed_2026.csv` - Includes Division Short, Team#, Primary Name, Phase 1 Name, Phase 2 Name.
