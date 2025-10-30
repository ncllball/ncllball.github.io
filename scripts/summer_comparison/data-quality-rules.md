# Data Quality Rules - Summerball Registration Reports

## Overview
This document defines the standards and normalization rules for consolidating Summerball registration data across multiple years (2022-2025).

## Date and Time Format
- **Standard**: `MM/DD/YYYY, HH:MMam/pm TZ`
- **Example**: `05/29/2023, 04:49pm PDT`
- **Rule**: Preserve timezone information when available

## Phone Numbers
- **Format**: `###-###-####`
- **Example**: `714-625-9909`
- **Rules**: 
  - Remove `+1` prefix from US numbers
  - Handle international numbers on as-needed basis
  - Keep consistent dash separators

## Email Addresses
- **Pattern**: Standard RFC 5322 email validation
- **Example**: `dmjorris@hotmail.com`
- **Rules**:
  - Must contain single `@` symbol
  - Valid domain structure
  - Lowercase normalization recommended

## State Normalization
- **Standard**: 2-letter state abbreviations
- **Example**: `WA` (not `Washington`, `washington`, or `Wa`)
- **Rule**: Always convert full state names to uppercase 2-letter codes

## ZIP Codes
- **Format**: 5-digit standard
- **Example**: `98103`
- **Rule**: Strip extended ZIP+4 format (remove `-1234` suffix)

## Quotation Marks
- **Approach**: As-needed basis only
- **Rule**: Use quotes only when necessary for CSV parsing (commas in values, line breaks, etc.)
- **Preference**: Avoid quotes when data doesn't require them

## Required Fields
Fields that must not be empty:
- Player First Name
- Player Last Name
- Parent/Guardian Email
- Registration Date
- Division/Program

## Data Validation Checksums
After each transformation:
- Verify row count matches expected sum
- Check for duplicate registrations
- Validate all required fields are populated
- Confirm date formats are consistent

