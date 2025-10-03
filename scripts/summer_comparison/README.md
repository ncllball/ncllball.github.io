# Summerball Registration Data Normalization

## Overview
Utility modules for normalizing registration data from different sources (SportsEngine 2022-2024, Sports Connect 2025).

## Files

### `column-mappings.md`
**PRIMARY REFERENCE** - Complete column mapping documentation showing how to transform source columns to master schema for each year (2022-2025).

**Use this when:**
- Building transformation scripts
- Understanding data structure differences
- Mapping new fields to master schema

### `source-columns-inventory.md`
**COMPLETE FIELD CATALOG** - Exhaustive list of ALL available columns in each source file.

**Use this when:**
- Need to add new fields to master schema
- Want to see what data is available
- Planning future data additions
- Understanding data availability across years

### `data-quality-rules.md`
Standards and normalization rules for data quality.

**Covers:**
- Date/time formats
- Phone number formatting
- Email validation
- State abbreviations
- ZIP code formatting
- Required fields

### `school-mappings.js`
Handles normalization of school names to canonical format.

**Usage:**
```javascript
const { normalizeSchoolName } = require('./school-mappings');

const normalized = normalizeSchoolName('B.F. Day Elementary');
// Returns: 'BF Day Elementary'
```

**Canonical Names:**
- Elementary: BF Day, Bagley, Cascadia, Greenwood, John Stanford, McDonald, West Woodland
- Middle: Hamilton International, Robert Eagle Staff
- K-8: St John School, TOPS K-8, Salmon Bay K-8
- Private/Other: The Meridian School, UCDS, Paragon Prep, Other

### `division-mappings.js`
Handles normalization of division/program names to standardized format.

**Usage:**
```javascript
const { normalizeDivisionName, extractSport, extractAgeGroup } = require('./division-mappings');

const division = normalizeDivisionName('Baseball-Major Division (Age 10-11)', 2025);
// Returns: 'BASEBALL - Summerball - Majors (Interleague)'

const sport = extractSport(division);
// Returns: 'BASEBALL'

const ageGroup = extractAgeGroup(division);
// Returns: 'Majors'
```

**Canonical Format:**
- Baseball: `BASEBALL - Summerball - {Division} (Interleague|Sandlot)`
- Softball: `SOFTBALL - Summerball - {Division} (Sandlot)`

**Baseball Divisions:**
- Majors (10-11 years, Interleague)
- Triple-AAA (9-10 years, Interleague)
- Double-AA (8-9 years, Player Pitch, Interleague)
- Single-A (Sandlot)
- TEEN/JUNIOR (12-15 years, 90' basepaths, Interleague)

**Softball Divisions:**
- AAA/Majors (Sandlot)
- AA/AAA (Sandlot)

### `data-quality-rules.md`
Comprehensive documentation of data quality standards and normalization rules.

## Adding New Mappings

1. Open the appropriate mapping file (`school-mappings.js` or `division-mappings.js`)
2. Add new mapping to the normalization object
3. Follow the pattern: `'Variant Name': 'Canonical Name'`
4. Test with the normalization function
5. Document any new canonical names in this README

## Idempotency
All normalization functions are idempotent - running them multiple times on the same data produces the same result. Canonical names map to themselves.
