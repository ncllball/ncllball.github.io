Here’s a clean, structured `README.md` draft for your Summerball registration report consolidation project. It’s designed to be clear for collaborators and future you, with sections for purpose, workflow, and expectations:

---

# Summerball Registration Report Consolidation

## 📋 Project Purpose

This project aims to consolidate yearly registration reports for our *Summerball* program into a single, clean, scalable master file. These reports are generated from backend systems when users register for programs via our website.

The goal is to build a reliable, structured dataset that can support analysis, reporting, and future expansion to other programs like Regular Season, Winter Training, etc.

---

## 🗂️ File Overview

### GitHub Paths
- `.github/projects/Reports/summerball22-25.master.csv` – **Master file**. Serves as the clean, canonical reference. Always safe to revert to.
- `.github/projects/Reports/summerball22.csv` – Exported from SportsEngine.
- `.github/projects/Reports/summerball23.csv` – Exported from SportsEngine.
- `.github/projects/Reports/summerball24.csv` – Exported from SportsEngine.
- `.github/projects/Reports/summerball25.csv` – Exported from Sports Connect (different column structure).

### Local Paths
- `c:\Tools\ncllball.github.io\.github\projects\Reports\summerball22-25.master.csv`
- `c:\Tools\ncllball.github.io\.github\projects\Reports\summerball22.csv`
- `c:\Tools\ncllball.github.io\.github\projects\Reports\summerball23.csv`
- `c:\Tools\ncllball.github.io\.github\projects\Reports\summerball24.csv`
- `c:\Tools\ncllball.github.io\.github\projects\Reports\summerball25.csv`

---

## 🛠️ Setup & Workspace

All scripts and automation should live in:

```
scripts/summer_comparison/
```

This folder will contain tools for cleaning, mapping, and merging data.

---

## ✅ Workflow Plan

1. **Start with a blank master file** (`summerball22-25.master.csv`)
2. **Define desired columns** for the master schema
3. **Map columns** from each year’s report to the master schema
4. **Normalize and clean** data:
   - Convert state names to abbreviations (e.g., “Washington” → “WA”)
   - Format ZIP codes to 5-digit standard
   - Remove unnecessary columns
   - Pull in supplemental data from other sources if needed
5. **Verify outputs** before marking tasks complete

---

## 🔍 Notes & Expectations

- Structure and clarity are essential
- Verification is appreciated—don’t mark tasks “done” unless they truly are
- This is phase one. Once complete, we’ll apply the same process to:
  - Regular Season
  - Winter Training
  - Other major programs

---

## 🧠 Lessons from Previous Attempt

- Avoid building one massive file and pruning later—start clean and add only what’s needed
- Work from a **local clone** of the GitHub repository (not OneDrive) to prevent sync issues

---

Let me know if you'd like this version saved into your repo or want a matching CONTRIBUTING.md or script header template.


