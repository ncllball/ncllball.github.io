# Summerball Data Consolidation - System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      SOURCE FILES (Preserved)                    │
├─────────────────────────────────────────────────────────────────┤
│  summerball22.csv (SportsEngine) - ~115 columns                 │
│  summerball23.csv (SportsEngine) - ~115 columns                 │
│  summerball24.csv (SportsEngine) - ~115 columns                 │
│  summerball25.csv (Sports Connect) - ~170 columns               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  📄 source-columns-inventory.md                                 │
│     → Complete catalog of ALL available fields                  │
│     → Organized by category                                     │
│     → Reference for future additions                            │
│                                                                  │
│  📄 column-mappings.md                                          │
│     → Master schema (43 standardized columns)                   │
│     → Year-by-year source mappings                              │
│     → Transformation notes                                      │
│     → Validation checklist                                      │
│                                                                  │
│  📄 data-quality-rules.md                                       │
│     → Phone format: ###-###-####                                │
│     → State: 2-letter uppercase                                 │
│     → ZIP: 5-digit                                              │
│     → Date format standards                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NORMALIZATION MODULES                         │
├─────────────────────────────────────────────────────────────────┤
│  📦 school-mappings.js                                          │
│     → normalizeSchoolName()                                     │
│     → Handles 20+ school name variations                        │
│     → Returns canonical names                                   │
│                                                                  │
│  📦 division-mappings.js                                        │
│     → normalizeDivisionName()                                   │
│     → extractSport()                                            │
│     → extractAgeGroup()                                         │
│     → Handles SportsEngine ↔ Sports Connect differences        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  TRANSFORMATION SCRIPT (Future)                  │
├─────────────────────────────────────────────────────────────────┤
│  🔧 consolidate.js (to be created)                              │
│     1. Read source CSV                                          │
│     2. Apply column mappings                                    │
│     3. Run normalization functions                              │
│     4. Validate data quality                                    │
│     5. Output standardized rows                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MASTER FILE                               │
├─────────────────────────────────────────────────────────────────┤
│  summerball22-25.master.csv                                     │
│     → 44 standardized columns                                   │
│     → Index column: summerball22, summerball23, etc.            │
│     → All years combined                                        │
│     → Normalized & validated                                    │
│     → Ready for analysis                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow

### Initial Build
1. Define master schema → `column-mappings.md`
2. Create normalization modules → `school-mappings.js`, `division-mappings.js`
3. Build transformation script → `consolidate.js`
4. Process each year → Apply mappings + normalizations
5. Merge to master → `summerball22-25.master.csv`
6. Validate → Run quality checks

### Adding New Fields (Extensible Design)
1. **Identify need** → "We need volunteer data"
2. **Check inventory** → Open `source-columns-inventory.md`
3. **Find availability** → Available in 2022-2024 as `willing-volunteer`
4. **Update schema** → Add column to master schema in `column-mappings.md`
5. **Add mappings** → Map source columns for each year
6. **Regenerate master** → Rerun transformation with updated script
7. **Source files intact** → Original CSVs never modified

## Key Design Principles

✅ **Source Preservation** - Original CSVs never modified  
✅ **Complete Inventory** - All available fields documented  
✅ **Extensible Schema** - Easy to add new fields later  
✅ **Idempotent Transforms** - Safe to rerun scripts  
✅ **Clear Mappings** - Explicit year-by-year transformations  
✅ **Data Quality** - Consistent normalization rules  

## File Locations

```
c:\Tools\ncllball.github.io\
├── .github\projects\Reports\
│   ├── summerball22.csv          ← Source (2022)
│   ├── summerball23.csv          ← Source (2023)
│   ├── summerball24.csv          ← Source (2024)
│   ├── summerball25.csv          ← Source (2025)
│   └── summerball22-25.master.csv ← Master (output)
│
└── scripts\summer_comparison\
    ├── README.md                  ← This overview
    ├── SYSTEM-OVERVIEW.md         ← Visual diagram (this file)
    ├── column-mappings.md         ← Primary mapping reference
    ├── source-columns-inventory.md ← Complete field catalog
    ├── data-quality-rules.md      ← Normalization standards
    ├── school-mappings.js         ← School normalization module
    ├── division-mappings.js       ← Division normalization module
    └── consolidate.js             ← (Future) Main transformation script
```

## Benefits of This Approach

1. **Transparency** - Every transformation is documented and traceable
2. **Flexibility** - Can add fields without starting over
3. **Maintainability** - Clear separation of concerns
4. **Repeatability** - Process can be rerun with same results
5. **Scalability** - Pattern applies to other programs (Regular Season, Winter Training)
6. **Data Integrity** - Source files remain untouched as source of truth

## Next Phase

Apply this same pattern to:
- Regular Season registration data
- Winter Training registration data
- Other program registrations

Each with its own mappings but using the same architectural approach.
