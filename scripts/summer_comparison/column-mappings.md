# Column Mappings - Summerball Registration Data (2022-2025)

## Overview

This document maps source columns from different registration systems to a standardized master schema.

- **2022-2024**: SportsEngine system (similar structure)
- **2025**: Sports Connect system (completely different structure)

---

## Master Schema (Target Columns)

The consolidated master file uses these standardized columns:

| Column Name | Description | Data Type | Required |
|------------|-------------|-----------|----------|
| `index` | Unique index: summerballXX (e.g., summerball22) | String | Yes |
| `registration_year` | Year of registration (2022-2025) | Integer | Yes |
| `registration_date` | Date/time of registration | DateTime | Yes |
| `order_number` | Unique order/registration ID | String | Yes |
| `player_first_name` | Player's first name | String | Yes |
| `player_middle_name` | Player's middle name | String | No |
| `player_last_name` | Player's last name | String | Yes |
| `player_gender` | Player's gender (M/F) | String | Yes |
| `player_dob` | Player's date of birth | Date | Yes |
| `player_age` | Calculated age at registration | Integer | No |
| `player_email` | Player's email (if provided) | String | No |
| `school_name` | School name (NORMALIZED) | String | Yes |
| `grade` | Current grade level | String | Yes |
| `division_name` | Division/program (NORMALIZED) | String | Yes |
| `sport` | BASEBALL or SOFTBALL (extracted) | String | Yes |
| `age_group` | Majors, AAA, AA, etc. (extracted) | String | Yes |
| `previous_division` | Previous division played | String | No |
| `team_name` | Assigned team name | String | No |
| `team_request` | Requested teammate(s) | String | No |
| `guardian1_first_name` | Primary guardian first name | String | Yes |
| `guardian1_last_name` | Primary guardian last name | String | Yes |
| `guardian1_email` | Primary guardian email | String | Yes |
| `guardian1_phone` | Primary guardian phone | String | Yes |
| `guardian1_phone_secondary` | Primary guardian secondary phone | String | No |
| `guardian1_relationship` | Relationship to player | String | No |
| `guardian2_first_name` | Secondary guardian first name | String | No |
| `guardian2_last_name` | Secondary guardian last name | String | No |
| `guardian2_email` | Secondary guardian email | String | No |
| `guardian2_phone` | Secondary guardian phone | String | No |
| `guardian2_relationship` | Relationship to player | String | No |
| `address_street` | Street address | String | Yes |
| `address_unit` | Unit/Apt number | String | No |
| `address_city` | City | String | Yes |
| `address_state` | State (2-letter abbrev) | String | Yes |
| `address_zip` | ZIP code (5-digit) | String | Yes |
| `emergency_contact1_first_name` | Emergency contact 1 first name | String | No |
| `emergency_contact1_last_name` | Emergency contact 1 last name | String | No |
| `emergency_contact1_phone` | Emergency contact 1 phone | String | No |
| `emergency_contact1_relationship` | Emergency contact 1 relationship | String | No |
| `medical_conditions` | Medical conditions/notes | Text | No |
| `insurance_company` | Insurance company name | String | No |
| `insurance_policy_holder` | Policy holder name | String | No |
| `insurance_policy_number` | Policy number | String | No |
| `photo_waiver` | Photo waiver agreement (Y/N) | String | No |
| `volunteer_willing` | Willing to volunteer (Y/N) | String | No |
| `order_status` | Order status (Complete, etc.) | String | Yes |
| `order_amount_gross` | Gross order amount | Decimal | No |
| `order_amount_net` | Net order amount | Decimal | No |

---

## Source Column Mappings by Year

### 2025 (Sports Connect)

| Master Column | Source Column (2025) | Transform/Notes |
|--------------|---------------------|-----------------|
| `index` | `[GENERATED]` | Format: `summerball25` |
| `registration_year` | `[HARDCODED]` | Always `2025` |
| `registration_date` | `Order Date` | Parse datetime format |
| `order_number` | `Order No` | Direct copy |
| `player_first_name` | `Player First Name` | Trim whitespace |
| `player_middle_name` | `Player Middle Initial` | May be empty |
| `player_last_name` | `Player Last Name` | Trim whitespace |
| `player_gender` | `Player Gender` | Direct copy (M/F) |
| `player_dob` | `Player Birth Date` | Parse date format |
| `player_age` | `Player Age` | Direct copy or calculate |
| `player_email` | `Player Email` | May be empty |
| `school_name` | `School Name` | **NORMALIZE via school-mappings.js** |
| `grade` | `Current Grade` | Direct copy |
| `division_name` | `Division Name` | **NORMALIZE via division-mappings.js** |
| `sport` | `[DERIVED]` | Extract from normalized division |
| `age_group` | `[DERIVED]` | Extract from normalized division |
| `previous_division` | `[N/A]` | Not available in 2025 data |
| `team_name` | `Team Name` | May be empty |
| `team_request` | `Teammate Request` | May be empty |
| `guardian1_first_name` | `Account First Name` | Trim whitespace |
| `guardian1_last_name` | `Account Last Name` | Trim whitespace |
| `guardian1_email` | `User Email` | Primary email |
| `guardian1_phone` | `Telephone` | **FORMAT via data-quality-rules** |
| `guardian1_phone_secondary` | `Cellphone` | **FORMAT via data-quality-rules** |
| `guardian1_relationship` | `Relationship to Participant` | May be empty |
| `guardian2_first_name` | `Additional First Name` | May be empty |
| `guardian2_last_name` | `Additional Last Name` | May be empty |
| `guardian2_email` | `Additional Email` or `Secondary Email` | May be empty |
| `guardian2_phone` | `Additional Telephone` | May be empty |
| `guardian2_relationship` | `[N/A]` | Not available in 2025 data |
| `address_street` | `Street Address` | Trim whitespace |
| `address_unit` | `Unit` | May be empty |
| `address_city` | `City` | Trim whitespace |
| `address_state` | `State` | **NORMALIZE to 2-letter abbrev** |
| `address_zip` | `Postal Code` | **FORMAT to 5-digit** |
| `emergency_contact1_first_name` | `Player Emergency Contact First Name` | May be empty |
| `emergency_contact1_last_name` | `Player Emergency Contact Last Name` | May be empty |
| `emergency_contact1_phone` | `Player Emergency Telephone` | May be empty |
| `emergency_contact1_relationship` | `[N/A]` | Not available in 2025 data |
| `medical_conditions` | `Player Physical Conditions` | May be empty |
| `insurance_company` | `Player Insurance Company` | May be empty |
| `insurance_policy_holder` | `Player Insurance Policy Holder` | May be empty |
| `insurance_policy_number` | `Player Insurance Policy Number` | May be empty |
| `photo_waiver` | `Player Waiver` | Convert to Y/N |
| `volunteer_willing` | `[N/A]` | Not available in 2025 data |
| `order_status` | `Order Status` | Direct copy |
| `order_amount_gross` | `Order Amount` | Parse decimal |
| `order_amount_net` | `[N/A]` | Not available in 2025 data |

### 2024 (SportsEngine)

| Master Column | Source Column (2024) | Transform/Notes |
|--------------|---------------------|-----------------|
| `index` | `[GENERATED]` | Format: `summerball24` |
| `registration_year` | `[HARDCODED]` | Always `2024` |
| `registration_date` | `Registration Date` | Parse datetime format |
| `order_number` | `Order Number` | Direct copy |
| `player_first_name` | `athlete_1_first_name` | Trim whitespace |
| `player_middle_name` | `athlete_1_middle_name` | May be empty |
| `player_last_name` | `athlete_1_last_name` | Trim whitespace |
| `player_gender` | `athlete_1_gender` | Direct copy |
| `player_dob` | `athlete_1_dob` | Parse date format |
| `player_age` | `[CALCULATE]` | Calculate from DOB |
| `player_email` | `[N/A]` | Not available in 2024 data |
| `school_name` | `School` | **NORMALIZE via school-mappings.js** |
| `grade` | `Grade` | Direct copy |
| `division_name` | `Baseball Division` OR `Softball Division` | **NORMALIZE via division-mappings.js** |
| `sport` | `[DERIVED]` | Extract from normalized division |
| `age_group` | `[DERIVED]` | Extract from normalized division |
| `previous_division` | `previous_division` | Direct copy |
| `team_name` | `Rostered Team` | May be empty |
| `team_request` | `Team Request` | May be empty |
| `guardian1_first_name` | `guardian_1_first_name` | Trim whitespace |
| `guardian1_last_name` | `guardian_1_last_name` | Trim whitespace |
| `guardian1_email` | `Guardian_1_Email` | Primary email |
| `guardian1_phone` | `Guardian_1_Primary_Phone` | **FORMAT via data-quality-rules** |
| `guardian1_phone_secondary` | `Guardian_1_Secondary_Phone` | **FORMAT via data-quality-rules** |
| `guardian1_relationship` | `guardian_1_relationship` | Direct copy |
| `guardian2_first_name` | `guardian_2_first_name` | May be empty |
| `guardian2_last_name` | `guardian_2_last_name` | May be empty |
| `guardian2_email` | `guardian_2_email_1` | May be empty |
| `guardian2_phone` | `guardian_2_phone_1` | May be empty |
| `guardian2_relationship` | `guardian_2_relationship` | Direct copy |
| `address_street` | `athlete_1_address_1` | Trim whitespace |
| `address_unit` | `athlete_1_address_1_cont` | May be empty |
| `address_city` | `athlete_1_city_1` | Trim whitespace |
| `address_state` | `athlete_1_state_1` | **NORMALIZE to 2-letter abbrev** |
| `address_zip` | `athlete_1_zip_1` | **FORMAT to 5-digit** |
| `emergency_contact1_first_name` | `emergency_contact_1_first_name` | May be empty |
| `emergency_contact1_last_name` | `emergency_contact_1_last_name` | May be empty |
| `emergency_contact1_phone` | `emergency_1_phone_1` | May be empty |
| `emergency_contact1_relationship` | `emergency_1_relationship` | May be empty |
| `medical_conditions` | `Does the player have any other medical conditions that we need to be aware of?` | May be empty |
| `insurance_company` | `guardian_1_medical_insurance_company` | May be empty |
| `insurance_policy_holder` | `guardian_1_last_name_insurance_policy_holder` | May be empty |
| `insurance_policy_number` | `guardian_1_medical_insurance_policy_number` | May be empty |
| `photo_waiver` | `Photo Waiver` | Convert to Y/N |
| `volunteer_willing` | `willing-volunteer` | Convert to Y/N |
| `order_status` | `Order Status` | Direct copy |
| `order_amount_gross` | `Gross` | Parse decimal |
| `order_amount_net` | `Net` | Parse decimal |

### 2023 (SportsEngine)

**Note**: 2023 structure is similar to 2024. Use same mappings as 2024.

**Index**: Generate as `summerball23`

Key differences:

- Verify column names match exactly (may have slight variations)
- Test with sample data before full conversion

### 2022 (SportsEngine)

**Note**: 2022 structure is similar to 2023/2024. Use same mappings as 2024.

**Index**: Generate as `summerball22`

Key differences:

- Some additional columns: `Higher Division Request`, `Waitlist - Softball Division`
- Column name variations (spaces vs underscores)
- Test with sample data before full conversion

---

## Special Handling Notes

### Index Column Generation

The `index` column provides a unique identifier for each year's dataset:

- **Format**: `summerballXX` where XX is the 2-digit year
- **Examples**:
  - 2022 → `summerball22`
  - 2023 → `summerball23`
  - 2024 → `summerball24`
  - 2025 → `summerball25`
- **Purpose**:
  - Quick year identification
  - Consistent naming across all records
  - Useful for grouping/filtering in analysis
  - Matches source file naming convention
- **Generation**: Concatenate `"summerball"` + last 2 digits of `registration_year`

### Division Selection Logic (2022-2024)

SportsEngine has separate columns for baseball and softball divisions:

- Check `Baseball Division` first
- If empty, check `Softball Division`
- One will be populated, the other empty
- Use the populated one for `division_name`

### Division Selection Logic (2025)

Sports Connect has a single `Division Name` column that contains the full program name.

### Email Priority (2025)

Multiple email fields exist:

1. `User Email` (primary account email)
2. `Additional Email` (secondary contact)
3. `Secondary Email` (alternate field)

Use `User Email` for `guardian1_email`, fall back to others for `guardian2_email`.

### Phone Number Normalization

Apply these transformations to ALL phone fields:

- Remove `+1` prefix
- Format as `###-###-####`
- Remove any parentheses, spaces, or dots
- Example: `+1 (714) 625-9909` → `714-625-9909`

### State Normalization

Convert all state values to 2-letter uppercase abbreviations:

- `Washington` → `WA`
- `washington` → `WA`
- `WA` → `WA` (already correct)

### ZIP Code Normalization

Strip extended ZIP+4 format:

- `98103-1234` → `98103`
- `98103` → `98103` (already correct)

---

## Validation Checklist

After mapping each year:

- [ ] Index column generated correctly (format: `summerballXX`)
- [ ] All required fields are populated (no empty values)
- [ ] School names normalized to canonical format
- [ ] Division names normalized to canonical format
- [ ] Sport and age_group extracted correctly
- [ ] Phone numbers formatted consistently
- [ ] States are 2-letter abbreviations
- [ ] ZIP codes are 5-digit format
- [ ] Dates parsed correctly
- [ ] Row count matches source file
- [ ] No duplicate order_numbers within same year

---

## Extensibility & Adding New Fields

### Philosophy

The master schema is designed to be **extensible**. If you need additional information later:

1. Original source CSV files are preserved and unchanged
2. Full column inventory available in `source-columns-inventory.md`
3. Can always go back and re-extract additional fields
4. Master file can be regenerated with new columns added

### When You Need a New Field

**Example**: You later realize you need "Volunteer Willing" data

1. **Check inventory**: Open `source-columns-inventory.md` to see which years have that field
2. **Update master schema**: Add new column to the "Master Schema" table above
3. **Add mappings**: Update the year-by-year mapping tables with the new source column
4. **Mark unavailable**: Use `[N/A]` for years where data doesn't exist
5. **Regenerate**: Rerun transformation script to rebuild master file with new column

### Non-Destructive Additions

- Always **add** columns, never remove existing ones
- Original CSVs remain untouched as source of truth
- Can regenerate master file anytime with updated schema
- Use `[N/A]` or empty values for missing historical data

### Complete Field Reference

See `source-columns-inventory.md` for:

- Complete list of ALL columns in each source file (~170 in 2025, ~115 in 2024)
- Organized by category (Player, Medical, Financial, etc.)
- Quick reference for finding available fields
- Usage examples for adding new fields

---

## Next Steps

1. Build transformation script using these mappings
2. Process each year's CSV file
3. Validate output against checklist
4. Merge into master file
5. Run final validation on master file
6. Keep source files for future field additions (see Extensibility section)
