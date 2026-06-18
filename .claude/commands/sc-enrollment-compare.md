# sc-enrollment-compare

Compare Sports Connect Enrollment Summary Report numbers across multiple programs for matching date windows (auto-shifted per program year).

## Usage

```
/sc-enrollment-compare <programs> <start_date> <end_date>
```

**Arguments:**
- `programs` — comma-separated program names as they appear in SC (e.g., `Summerball26, Summerball25`)
- `start_date` — start date in M/D/YYYY format, anchored to the first program's year
- `end_date` — end date in M/D/YYYY format, anchored to the first program's year

**Example:**
```
/sc-enrollment-compare "Summerball26, Summerball25" 6/1/2026 6/18/2026
```

---

## Steps

### 1 — Parse arguments

Split `$ARGUMENTS` on the first two spaces after the quoted program list, or accept three positional args:
1. Program list (comma-separated, trim whitespace from each)
2. Start date
3. End date

Extract the **base year** from the start date (4-digit year in M/D/YYYY).

For each program name, extract its year:
- Look for a 4-digit year anywhere in the name → use as-is (e.g., `2026 Regular Season BASEBALL` → 2026)
- Look for a 2-digit suffix (e.g., `Summerball26` → 2026, `Summerball25` → 2025) — add 2000
- If no year found, use the base year (no shift)

Calculate the **year offset** for each program: `program_year - base_year`.

Shift the start and end dates for each program by that offset (e.g., offset -1 turns `6/1/2026` → `6/1/2025`).

---

### 2 — Open the reporting page

Use `mcp__chrome-devtools__list_pages` to check if a reporting.bluesombrero.com page is already open.

If not, use `mcp__chrome-devtools__navigate_page` to open:
```
https://reporting.bluesombrero.com/83437/admin/program-enrollment-summary
```

Select that page with `mcp__chrome-devtools__select_page`.

Wait 2 seconds for the Angular app to load.

---

### 3 — Run report for each program

For the **first program** (no prior report loaded), use "View Report". For subsequent programs, use "Update".

For each program:

**a) Select the program:**
```javascript
const matSelects = Array.from(document.querySelectorAll('mat-select'));
const programSelect = matSelects.find(s => s.getAttribute('formcontrolname') === 'operatorValue');
programSelect.click();
// wait 800ms
const opts = Array.from(document.querySelectorAll('mat-option'));
opts.find(o => o.innerText.trim() === '<PROGRAM_NAME>').click();
// wait 500ms
```

**b) Set the shifted dates** using the native value setter (required for Angular):
```javascript
const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
const dateInputs = Array.from(document.querySelectorAll('input[formcontrolname="operatorValue"]'));
nativeSet.call(dateInputs[0], '<SHIFTED_START>');
dateInputs[0].dispatchEvent(new Event('input', {bubbles: true}));
nativeSet.call(dateInputs[1], '<SHIFTED_END>');
dateInputs[1].dispatchEvent(new Event('input', {bubbles: true}));
```

**c) Click View Report (first program) or Update (subsequent):**
- First program: find button/span with text `View Report`, click it
- Subsequent: find button with text `Update`, click it

**d) Wait 3 seconds for results to load.**

**e) Scrape division rows and total:**
```javascript
const body = document.body.innerText;
const reportStart = body.indexOf('Enrollment Summary Report: <PROGRAM_NAME>');
const settingsStart = body.indexOf('Settings', reportStart);
const reportText = body.slice(reportStart, settingsStart);

// Also grab total from Total Summary block
const totalMatch = body.match(/Division Enrollments:\s*\n(\d+)/);
```

Parse each tab-separated row: `DIVISION_NAME\tCOUNT\t1000\t0\t0`

Store results as: `{ program, dates, divisions: [{name, count}], total }`

---

### 4 — Build comparison table

Output a markdown table with one column per program.

**Header row:** Program names + date ranges
**Division rows:** Show all unique division names across all programs. Where a division doesn't exist for a program, show `—`.
For the division name, strip the program-specific prefix (e.g., `BASEBALL - Summerball26 - ` → `Baseball`) and format for readability.
**Total row:** Bold totals for each program, with Δ column if exactly 2 programs.

**Example output:**
```
**Jun 1–18 Enrollment Comparison**

| Division | SB25 (Jun 1–18, 2025) | SB26 (Jun 1–18, 2026) | Δ |
|---|---|---|---|
| Baseball A | 7 | 12 | +5 |
| Baseball AA | 36 | 20 | -16 |
| ...
| **Total** | **119** | **118** | **-1** |
```

If more than 2 programs are compared, omit the Δ column.

---

## Portal

Hardcoded to NCLL portal `83437`. To move to global use, extract this as a parameter.

## Notes

- The reporting site requires an active session. If the page shows a login screen, log in manually at `https://reporting.bluesombrero.com/83437` and re-run.
- Program names must match exactly as they appear in the SC dropdown (check `https://reporting.bluesombrero.com/83437/admin/program-enrollment-summary` → Settings → Program Name dropdown).
- Date shifting uses the year extracted from the program name. If a program name has no year, its dates are not shifted.
