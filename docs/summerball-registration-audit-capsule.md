# Summerball Registration Audit Content Capsule

Use this capsule to build a wiki page summarizing NCLL Summerball registration counts and the supporting audit.

## Working Title

Summerball Registration Counts, 2022-2026

## One-Sentence Summary

NCLL reviewed Summerball registration records from SportsEngine/Sports Connect exports, Summerball source workbooks, the Ultimate Master Registrar, and annual registration data sheets to establish defensible paid/completed registration counts by year.

## Recommended Count Table

| Year | Recommended Count | Basis | Notes |
|---|---:|---|---|
| 2022 | 134 | Paid registrations | Excludes 5 blank/Unknown-status rows with no order/payment evidence. |
| 2023 | 154 | Named paid registrations | Excludes 13 blank-status rows and one blank-player duplicate paid row for order `ITQW86169`. |
| 2024 | 193 | Paid registrations | Excludes 2 Open/$0 rows unless manually verified as participants. |
| 2025 | 207 | Completed registrations | User confirmed `Completed` equals real registration and `Cancelled` should be excluded. |
| 2026 | 0 | User confirmation and annual registration check | Summerball26 had no registrations at time of review. |

## Counting Rule

Use **paid/completed registrations** as the headline count.

Keep open, cancelled, blank-status, duplicate, and unmatched rows visible in the audit workbook, but do not include them in the headline count unless manually verified as real participants.

## Key Findings

- The compact Summerball master and the Ultimate Master Registrar agree on year counts: 2022 = 139 raw rows, 2023 = 167 raw rows, 2024 = 195 raw rows, 2025 = 207 rows.
- The Ultimate Master Registrar row count around 711 is sheet grid size/noise, not registration count.
- The wider `master.summerball.csv` has useful 2025 context but shows column-mapping drift for older years, so it should not drive 2022-2024 headline counts.
- The 2025 wide master has 246 rows but only 207 unique player/DOB records. The extra 39 rows are duplicate/change/move records across 31 players, not additional players.
- The 2025 `Enrollment_Details_Summerball25` sheet shows 207 `Completed` and 29 `Cancelled`; cancelled rows are excluded.
- Annual NCLL Registration Data sheets for 2022-2026 did not add Summerball rows. 2023 had one incidental match in an email address only.

## Edge Cases

### 2022 Blank-Status Rows

There are 5 blank/Unknown-status rows. They show `Entry Status = Active`, but no order number, no order status, no net/payment, and no team fields. Exclude from headline/planning count unless manually verified.

### 2023 Blank-Status Rows

There are 13 blank-status rows with the same issue: `Active` entry status but no order/payment/team evidence. Exclude unless manually verified.

### 2023 Paid Order `ITQW86169`

The source workbook has two rows with order `ITQW86169`. One row is a named player, Edison Fishback. The second row has the same order/date/net but blank player fields. Treat the blank row as a duplicate, not an additional player. Count 2023 as 154, not 155.

### 2024 Open/$0 Rows

Two rows are `Order Status = Open`, `Net = 0`, with no team fields populated:

- Jonathan Rubin, order `VEGD70899`
- Leo Kalanquin, order `XRYA99739`

Exclude unless manually verified as participants.

## Sources Reviewed

Primary/supporting files:

- `Summerball_registration_organic_audit.xlsx`
- `summerball22-25.master.csv`
- `NCLL Summer Ball 2022-2024.xlsx`
- `Enrollment_Details_Summerball25`
- `The_Ultimate_Master_Registrar (2022-2025)`
- `master.summerball.csv` and Google Sheet copies
- Annual `NCLL Registration Data` sheets for 2022, 2023, 2024, 2025, and 2026

Key Google Sheet links:

- 2025 Enrollment Details: https://docs.google.com/spreadsheets/d/1qN9GlXxnJnxMdHjWeIY5K5a_P6zlpwdVAEgUerPlVs0
- Ultimate Master Registrar: https://docs.google.com/spreadsheets/d/1kHQnXzyq1BEJwG3H1HAj8ElgLgUsUqP-sZ2V2k7V3Ts
- 2022-2024 NCLL Summer Ball: https://docs.google.com/spreadsheets/d/1j6HkCZPIvITrtdIyrOdVHsTSrkUu18731cFijItecN4
- 2026 Registration Data: https://docs.google.com/spreadsheets/d/1-OZOzQBtd2REYKpw_PyI2_PjAm6frQPqNRLi95ehfog

## Suggested Wiki Structure

1. Overview
2. Final Counts
3. Counting Method
4. Source Review
5. Exceptions and Exclusions
6. Supporting Audit Workbook
7. Citation / Footnote

## Suggested Citation

North Central Little League. *Summerball Registration Organic Audit, 2022-2026*. Internal registration data workbook compiled from SportsEngine/Sports Connect exports, NCLL Summer Ball source workbooks, and Google Drive registration records. Prepared June 2026.

Short footnote:

Source: NCLL internal registration audit, compiled from SportsEngine/Sports Connect Summerball registration exports and reconciled source workbooks, June 2026. Counts reflect paid/completed registrations; open, cancelled, blank-status, duplicate, and unmatched audit rows were excluded unless manually verified.

## Attachment

Attach or link the supporting workbook:

`docs/summerball-registration-organic-audit.xlsx`

