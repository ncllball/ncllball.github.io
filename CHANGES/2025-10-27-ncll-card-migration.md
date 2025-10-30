# NCLL Card Component Migration — 2025-10-27

Summary
-------
This change introduces a namespaced `ncll-card` component for program/feature cards and migrates several pages as a safe, incremental proof-of-concept.

## Files changed

- `css.css` — Added `.ncll-card` component rules; commented legacy global clipboard rules for rollback.
- `Volunteer/friendslist.html` — Migrated to `ncll-card` pattern. Clipboard image made the single opt-in control; added descriptive `aria-label`s; images marked decorative (`alt=""` + `aria-hidden="true").`
- `Baseball/index.html` — Added `ncll-card` classes and element classes to division cards as a PoC.
- `Softball/index.html` — Added `ncll-card` classes and element classes as a PoC.
- `Player Development/index.html` — Added `ncll-card` classes and element classes as a PoC.
- `docs/cards.md` — Documentation and migration checklist for `ncll-card`.

## Notes / migration guidance

- Placeholder links: `Volunteer/friendslist.html` contains placeholder Google Form URLs (`https://forms.gle/YOUR_FORM_ID_HERE`). Replace these with the real form links before publishing.
- Accessibility: anchor `aria-label`s were added to improve screen reader clarity. The clipboard images are decorative; the anchor labels are the accessible names.
- Rollback: legacy clipboard rules were commented in `css.css`. To roll back quickly, restore the commented CSS block or revert the commit.

## Recommended follow-ups

1. Replace placeholder form URLs.
2. Visual QA across multiple browsers/devices (desktop/tablet/mobile), especially for pages that still use legacy selectors.
3. Remove legacy CSS selectors permanently after full site migration and QA.

Author: automated change by migration script (applied on 2025-10-27)

