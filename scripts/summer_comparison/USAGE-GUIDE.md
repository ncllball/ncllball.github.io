# Consolidation Script Usage Guide

## Quick Start

```bash
# Preview what will happen (dry run)
node scripts/summer_comparison/consolidate.js

# Preview with detailed progress
node scripts/summer_comparison/consolidate.js --verbose

# Actually write the master file
node scripts/summer_comparison/consolidate.js --write

# Write with detailed progress
node scripts/summer_comparison/consolidate.js --write --verbose
```

## What It Does

1. **Reads** all 4 source CSV files (2022-2025)
2. **Transforms** each row to master schema
3. **Normalizes** data:
   - School names → canonical format
   - Division names → standardized format
   - Phone numbers → ###-###-####
   - States → 2-letter uppercase
   - ZIP codes → 5-digit
4. **Deduplicates** by order_number (keeps only "Complete" status)
5. **Validates** required fields
6. **Skips** problematic rows with warnings
7. **Generates** index column (summerball22, summerball23, etc.)
8. **Extracts** sport and age_group from division
9. **Outputs** single master CSV with 44 standardized columns

## Output

**File**: `.github/projects/Reports/summerball22-25.master.csv`

**Format**:
- UTF-8 encoding
- Header row with column names
- Quotes only when necessary (as-needed)
- Empty fields stay empty (no extra quotes)

## Validation & Quality Checks

The script automatically:
- ✅ Validates all required fields are present
- ✅ Skips rows with incomplete/missing data
- ✅ Removes duplicate order numbers
- ✅ Keeps only "Complete" order status
- ✅ Logs warnings for problematic data
- ✅ Tracks statistics (processed, skipped, errors)

## Understanding the Output

### Dry Run Mode (default)
```
═══════════════════════════════════════════════════════════
  Summerball Registration Data Consolidation
═══════════════════════════════════════════════════════════
Mode: 👁️  DRY RUN (preview only)
Verbose: OFF
═══════════════════════════════════════════════════════════

Processing 2022 (SportsEngine): summerball22.csv
Read 150 rows from summerball22.csv
Transformed 145 valid rows from summerball22.csv

[... similar for 2023, 2024, 2025 ...]

═══════════════════════════════════════════════════════════
  Summary
═══════════════════════════════════════════════════════════
Total source rows:     600
Processed successfully: 580
Skipped/Duplicate:     20
Warnings:              15
Errors:                0
Master file rows:      580

👁️  DRY RUN complete. No files written.
   Run with --write to save master file.
═══════════════════════════════════════════════════════════
```

### Write Mode
Same output plus:
```
📝 Writing master file...
✅ Master file written: .github/projects/Reports/summerball22-25.master.csv

✅ Consolidation complete!
```

## Common Scenarios

### First Time Running
```bash
# See what will happen
node scripts/summer_comparison/consolidate.js --verbose

# If it looks good, write it
node scripts/summer_comparison/consolidate.js --write
```

### Check for Issues
```bash
# Verbose mode shows all warnings
node scripts/summer_comparison/consolidate.js --verbose
```

### Regenerate Master File
```bash
# Just run with --write again (safe to rerun)
node scripts/summer_comparison/consolidate.js --write
```

### Adding New Fields Later
1. Update `column-mappings.md` with new field
2. Update `MASTER_COLUMNS` array in `consolidate.js`
3. Update transform functions to include new field
4. Rerun: `node scripts/summer_comparison/consolidate.js --write`

## Troubleshooting

### "File not found" error
- Check that CSV files exist in `.github/projects/Reports/`
- Verify filenames: `summerball22.csv`, `summerball23.csv`, etc.

### Many skipped rows
- Check `--verbose` output to see specific warnings
- Verify source CSV data quality
- Check that Order Status column contains "Complete"

### Missing required fields
- Review the warnings in verbose mode
- Check source CSV for empty required columns
- Script will skip those rows and log warnings

### CSV parsing errors
- Check for malformed CSV (quotes, commas, line breaks)
- Script uses relaxed parsing but may need adjustment

## Script Features

✅ **Idempotent** - Safe to run multiple times  
✅ **Non-destructive** - Source files never modified  
✅ **Validated** - Required fields checked  
✅ **Normalized** - Consistent data format  
✅ **Deduplicated** - One row per order  
✅ **Logged** - Clear warnings and errors  
✅ **Flexible** - Easy to extend with new fields  

## Next Steps After Running

1. Open master CSV in Excel/spreadsheet tool
2. Verify data looks correct
3. Check row counts match expectations
4. Review any warnings from verbose output
5. Use for analysis, reporting, or further processing
