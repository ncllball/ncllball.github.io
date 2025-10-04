#!/usr/bin/env node

/**
 * Summerball Registration Data Consolidation Script
 * 
 * Transforms yearly registration CSVs (2022-2025) into a single standardized master file.
 * 
 * Usage:
 *   node consolidate.js                    # Dry run (preview only)
 *   node consolidate.js --write            # Write to master file
 *   node consolidate.js --verbose          # Show detailed progress
 *   node consolidate.js --write --verbose  # Both
 * 
 * Input:  .github/projects/Reports/summerball{22,23,24,25}.csv
 * Output: .github/projects/Reports/summerball22-25.master.csv
 */

const fs = require('fs');
const path = require('path');

// Try to load CSV modules, fall back to built-in parsing if not available
let parse, stringify;
try {
  parse = require('csv-parse/sync').parse;
  stringify = require('csv-stringify/sync').stringify;
} catch (e) {
  console.error('❌ CSV parsing modules not found.');
  console.error('   Please run: npm install');
  console.error('   Or if npm is not available, install Node.js from https://nodejs.org/');
  process.exit(1);
}

const { normalizeSchoolName } = require('./school-mappings');
const { normalizeDivisionName, extractSport, extractAgeGroup } = require('./division-mappings');

// Configuration
const REPO_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(REPO_ROOT, '.github/projects/Reports');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'summerball22-25.master.csv');

const SOURCE_FILES = [
  { year: 2022, file: 'summerball22.csv', system: 'SportsEngine' },
  { year: 2023, file: 'summerball23.csv', system: 'SportsEngine' },
  { year: 2024, file: 'summerball24.csv', system: 'SportsEngine' },
  { year: 2025, file: 'summerball25.csv', system: 'SportsConnect' }
];

// Master schema column order
const MASTER_COLUMNS = [
  'registration_year',
  'registration_date',
  'order_number',
  'player_first_name',
  'player_last_name',
  'player_gender',
  'player_dob',
  'player_age',
  'school_name',
  'grade',
  'division_name',
  'sport',
  'guardian1_first_name',
  'guardian1_last_name',
  'guardian1_email',
  'guardian1_phone',
  'guardian1_phone_secondary',
  'guardian1_relationship',
  'guardian2_first_name',
  'guardian2_last_name',
  'guardian2_email',
  'guardian2_phone',
  'guardian2_relationship',
  'address_street',
  'address_unit',
  'address_city',
  'address_state',
  'address_zip',
  'emergency_contact1_first_name',
  'emergency_contact1_last_name',
  'emergency_contact1_phone',
  'emergency_contact1_relationship',
  'medical_conditions',
  'insurance_company',
  'insurance_policy_holder',
  'insurance_policy_number',
  'photo_waiver',
  'volunteer_willing',
  'order_status',
  'order_amount_net'
];

// Parse command-line arguments
const args = process.argv.slice(2);
const WRITE_MODE = args.includes('--write');
const VERBOSE = args.includes('--verbose');

// Statistics tracking
const stats = {
  totalRows: 0,
  processedRows: 0,
  skippedRows: 0,
  warnings: [],
  errors: []
};

/**
 * Log message based on verbosity level
 */
function log(message, level = 'info') {
  if (level === 'error') {
    console.error(`❌ ${message}`);
  } else if (level === 'warn') {
    console.warn(`⚠️  ${message}`);
  } else if (VERBOSE) {
    console.log(`ℹ️  ${message}`);
  }
}

/**
 * Normalize phone number to ###-###-#### format
 */
function normalizePhone(phone) {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Remove leading +1
  const cleaned = digits.startsWith('1') && digits.length === 11 
    ? digits.slice(1) 
    : digits;
  
  // Format as ###-###-####
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if can't format
  return phone;
}

/**
 * Normalize state to 2-letter uppercase abbreviation
 */
function normalizeState(state) {
  if (!state) return '';
  
  const stateMap = {
    'washington': 'WA',
    'wa': 'WA',
    'oregon': 'OR',
    'or': 'OR',
    'california': 'CA',
    'ca': 'CA',
    // Add more as needed
  };
  
  const normalized = state.trim().toLowerCase();
  return stateMap[normalized] || state.trim().toUpperCase();
}

/**
 * Normalize ZIP code to 5-digit format
 */
function normalizeZip(zip) {
  if (!zip) return '';
  
  // Remove spaces and hyphens, take first 5 digits
  const cleaned = zip.toString().replace(/[\s-]/g, '').slice(0, 5);
  return cleaned;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dob, referenceDate = new Date()) {
  if (!dob) return '';
  
  try {
    const birthDate = new Date(dob);
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  } catch (error) {
    log(`Failed to calculate age from DOB: ${dob}`, 'warn');
    return '';
  }
}

/**
 * Convert Y/N or Yes/No to consistent Y/N format
 */
function normalizeYesNo(value) {
  if (!value) return '';
  const normalized = value.toString().trim().toLowerCase();
  if (normalized === 'yes' || normalized === 'y' || normalized === 'true') return 'Y';
  if (normalized === 'no' || normalized === 'n' || normalized === 'false') return 'N';
  return '';
}

/**
 * Transform 2025 (Sports Connect) row to master schema
 */
function transform2025Row(row, year) {
  const yearSuffix = year.toString().slice(-2);
  
  // Get division and extract sport/age group
  const rawDivision = row['Division Name'] || '';
  const normalizedDivision = normalizeDivisionName(rawDivision, year);
  const sport = extractSport(normalizedDivision);
  const ageGroup = extractAgeGroup(normalizedDivision);
  
  // Normalize school - check for 'Other' and use fallback
  let schoolValue = row['School Name'] || '';
  if (schoolValue === 'Other' && row['Little League School Name']) {
    schoolValue = row['Little League School Name'];
  }
  const normalizedSchool = normalizeSchoolName(schoolValue);
  
  return {
    index: `summerball${yearSuffix}`,
    registration_year: year.toString(),
    registration_date: normalizeDate(row['Order Date'] || ''),
    order_number: row['Order No'] || '',
    player_first_name: (row['Player First Name'] || '').trim(),
    player_last_name: (row['Player Last Name'] || '').trim(),
    player_gender: row['Player Gender'] || '',
    player_dob: row['Player Birth Date'] || '',
    player_age: row['Player Age'] || calculateAge(row['Player Birth Date']),
    school_name: normalizedSchool,
    grade: normalizeGrade(row['Current Grade'] || ''),
    division_name: normalizedDivision,
    sport: sport,
    guardian1_first_name: (row['Account First Name'] || '').trim(),
    guardian1_last_name: (row['Account Last Name'] || '').trim(),
    guardian1_email: row['User Email'] || '',
    guardian1_phone: normalizePhone(row['Telephone']),
    guardian1_phone_secondary: normalizePhone(row['Cellphone']),
    guardian1_relationship: row['Relationship to Participant'] || '',
    guardian2_first_name: (row['Additional First Name'] || '').trim(),
    guardian2_last_name: (row['Additional Last Name'] || '').trim(),
    guardian2_email: row['Additional Email'] || row['Secondary Email'] || '',
    guardian2_phone: normalizePhone(row['Additional Telephone']),
    guardian2_relationship: '',
    address_street: (row['Street Address'] || '').trim(),
    address_unit: (row['Unit'] || '').trim(),
    address_city: (row['City'] || '').trim(),
    address_state: normalizeState(row['State']),
    address_zip: normalizeZip(row['Postal Code']),
    emergency_contact1_first_name: (row['Player Emergency Contact First Name'] || '').trim(),
    emergency_contact1_last_name: (row['Player Emergency Contact Last Name'] || '').trim(),
    emergency_contact1_phone: normalizePhone(row['Player Emergency Telephone']),
    emergency_contact1_relationship: '',
    medical_conditions: row['Player Physical Conditions'] || '',
    insurance_company: row['Player Insurance Company'] || '',
    insurance_policy_holder: row['Player Insurance Policy Holder'] || '',
    insurance_policy_number: row['Player Insurance Policy Number'] || '',
    photo_waiver: normalizeYesNo(row['Player Waiver']),
    volunteer_willing: '',
    order_status: row['Order Status'] || '',
    order_amount_net: row['Order Amount'] || ''
  };
}

/**
 * Transform 2024/2023/2022 (SportsEngine) row to master schema
 * Note: Years 2022-2024 all use SportsEngine, but 2022 has different baseball column name
 */
function transform2024Row(row, year) {
  const yearSuffix = year.toString().slice(-2);
  
  // Get division (check both Baseball and Softball columns)
  // 2022 uses "Baseball Divisions for league age", 2023-2024 use "Baseball Division"
  let rawDivision = row['Baseball Division'] || row['Baseball Divisions for league age'] || row['Softball Division'] || '';
  
  // Fallback: If division is empty but previous_division exists, use that
  // This handles cases where registration didn't capture current division
  if (!rawDivision || rawDivision.trim() === '') {
    const prevDiv = row['previous_division'] || '';
    if (prevDiv && prevDiv.trim() !== '') {
      rawDivision = prevDiv;
      console.log(`ℹ️  Using previous_division for ${row['athlete_1_first_name']} ${row['athlete_1_last_name']}: ${prevDiv}`);
    } else {
      // Final fallback: If still no division and gender is Female, assume Softball Combined
      // If gender is Male, assume Baseball AA (most common entry level)
      const gender = row['athlete_1_gender'] || '';
      if (gender.toUpperCase() === 'FEMALE' || gender.toUpperCase() === 'F') {
        rawDivision = 'Softball-Combined Division';
        console.log(`ℹ️  Using gender-based fallback for ${row['athlete_1_first_name']} ${row['athlete_1_last_name']}: Softball Combined (Female)`);
      } else if (gender.toUpperCase() === 'MALE' || gender.toUpperCase() === 'M') {
        rawDivision = 'Baseball AA';
        console.log(`ℹ️  Using gender-based fallback for ${row['athlete_1_first_name']} ${row['athlete_1_last_name']}: Baseball AA (Male)`);
      }
    }
  }
  
  const normalizedDivision = normalizeDivisionName(rawDivision, year);
  const sport = extractSport(normalizedDivision);
  const ageGroup = extractAgeGroup(normalizedDivision);
  
  // Normalize school - check for 'Other' and use 'School if Other' column
  let schoolValue = row['School'] || '';
  if (schoolValue === 'Other' && row['School if Other']) {
    schoolValue = row['School if Other'];
  }
  const normalizedSchool = normalizeSchoolName(schoolValue);
  
  return {
    index: `summerball${yearSuffix}`,
    registration_year: year.toString(),
    registration_date: normalizeDate(row['Registration Date'] || ''),
    order_number: row['Order Number'] || '',
    player_first_name: (row['athlete_1_first_name'] || '').trim(),
    player_last_name: (row['athlete_1_last_name'] || '').trim(),
    player_gender: row['athlete_1_gender'] || '',
    player_dob: row['athlete_1_dob'] || '',
    player_age: calculateAge(row['athlete_1_dob']),
    school_name: normalizedSchool,
    grade: normalizeGrade(row['Grade'] || ''),
    division_name: normalizedDivision,
    sport: sport,
    guardian1_first_name: (row['guardian_1_first_name'] || '').trim(),
    guardian1_last_name: (row['guardian_1_last_name'] || '').trim(),
    guardian1_email: row['Guardian_1_Email'] || '',
    guardian1_phone: normalizePhone(row['Guardian_1_Primary_Phone']),
    guardian1_phone_secondary: normalizePhone(row['Guardian_1_Secondary_Phone']),
    guardian1_relationship: row['guardian_1_relationship'] || '',
    guardian2_first_name: (row['guardian_2_first_name'] || '').trim(),
    guardian2_last_name: (row['guardian_2_last_name'] || '').trim(),
    guardian2_email: row['guardian_2_email_1'] || '',
    guardian2_phone: normalizePhone(row['guardian_2_phone_1']),
    guardian2_relationship: row['guardian_2_relationship'] || '',
    address_street: (row['athlete_1_address_1'] || '').trim(),
    address_unit: (row['athlete_1_address_1_cont'] || '').trim(),
    address_city: (row['athlete_1_city_1'] || '').trim(),
    address_state: normalizeState(row['athlete_1_state_1']),
    address_zip: normalizeZip(row['athlete_1_zip_1']),
    emergency_contact1_first_name: (row['emergency_contact_1_first_name'] || '').trim(),
    emergency_contact1_last_name: (row['emergency_contact_1_last_name'] || '').trim(),
    emergency_contact1_phone: normalizePhone(row['emergency_1_phone_1']),
    emergency_contact1_relationship: row['emergency_1_relationship'] || '',
    medical_conditions: row['Does the player have any other medical conditions that we need to be aware of?'] || '',
    insurance_company: row['guardian_1_medical_insurance_company'] || '',
    insurance_policy_holder: row['guardian_1_last_name_insurance_policy_holder'] || '',
    insurance_policy_number: row['guardian_1_medical_insurance_policy_number'] || '',
    photo_waiver: normalizeYesNo(row['Photo Waiver']),
    volunteer_willing: normalizeYesNo(row['willing-volunteer']),
    order_status: row['Order Status'] || '',
    order_amount_net: row['Net'] || ''
  };
}

/**
 * Check if row has required fields
 */
function validateRequiredFields(row) {
  const required = [
    'order_number',
    'player_first_name',
    'player_last_name',
    'player_gender',
    'player_dob',
    'guardian1_first_name',
    'guardian1_last_name',
    'guardian1_email',
    'school_name',
    'division_name',
    'order_status'
  ];
  
  const missing = [];
  for (const field of required) {
    if (!row[field] || row[field].trim() === '') {
      missing.push(field);
    }
  }
  
  // If only missing order fields but have index (member number), allow it
  // These are valid registrations where order info wasn't exported
  if (missing.length > 0) {
    const hasIndex = row.index && row.index.trim() !== '';
    const onlyMissingOrderFields = missing.every(field => 
      field === 'order_number' || field === 'order_status'
    );
    
    if (hasIndex && onlyMissingOrderFields) {
      // Valid registration - use "Unknown" for missing order fields
      if (!row.order_number || row.order_number.trim() === '') {
        row.order_number = 'UNKNOWN';
      }
      if (!row.order_status || row.order_status.trim() === '') {
        row.order_status = 'Unknown';
      }
      return []; // No missing fields after filling in defaults
    }
  }
  
  return missing;
}

/**
 * Process a single source file
 */
function processSourceFile(sourceInfo) {
  const filePath = path.join(REPORTS_DIR, sourceInfo.file);
  
  log(`Processing ${sourceInfo.year} (${sourceInfo.system}): ${sourceInfo.file}`);
  
  if (!fs.existsSync(filePath)) {
    const error = `File not found: ${filePath}`;
    stats.errors.push(error);
    log(error, 'error');
    return [];
  }
  
  // Read and parse CSV
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true
  });
  
  log(`Read ${records.length} rows from ${sourceInfo.file}`);
  stats.totalRows += records.length;
  
  // Transform rows
  const transformedRows = [];
  const seenPlayers = new Map(); // Track unique players (by name + DOB)
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    try {
      // Transform based on year/system
      let transformed;
      if (sourceInfo.year === 2025) {
        transformed = transform2025Row(record, sourceInfo.year);
      } else {
        transformed = transform2024Row(record, sourceInfo.year);
      }
      
      // Validate required fields
      const missingFields = validateRequiredFields(transformed);
      if (missingFields.length > 0) {
        const warning = `Row ${i + 1} in ${sourceInfo.file} missing required fields: ${missingFields.join(', ')}`;
        stats.warnings.push(warning);
        stats.skippedRows++;
        log(warning, 'warn');
        continue;
      }
      
      // Skip failed/cancelled payments FIRST (invalid registrations - not real duplicates)
      const orderStatus = (transformed.order_status || '').toLowerCase();
      if (orderStatus.includes('failed') || orderStatus.includes('cancelled')) {
        stats.skippedRows++;
        if (VERBOSE) {
          log(`Skipping row ${i + 1}: Order ${transformed.order_number} status is "${transformed.order_status}" (payment failed/cancelled)`, 'warn');
        }
        continue;
      }
      
      // Create unique player key (name + DOB)
      const playerKey = `${transformed.player_first_name}|${transformed.player_last_name}|${transformed.player_dob}`.toLowerCase();
      
      // Deduplicate by player (not order_number - families can have multiple kids on same order!)
      if (seenPlayers.has(playerKey)) {
        const warning = `Duplicate player detected: ${transformed.player_first_name} ${transformed.player_last_name} (${transformed.player_dob}) - keeping first occurrence`;
        stats.warnings.push(warning);
        stats.skippedRows++;
        log(warning, 'warn');
        continue;
      }
      
      seenPlayers.set(playerKey, true);
      transformedRows.push(transformed);
      stats.processedRows++;
      
      if (VERBOSE && (i + 1) % 100 === 0) {
        log(`Processed ${i + 1}/${records.length} rows...`);
      }
      
    } catch (error) {
      const errorMsg = `Error processing row ${i + 1} in ${sourceInfo.file}: ${error.message}`;
      stats.errors.push(errorMsg);
      stats.skippedRows++;
      log(errorMsg, 'error');
    }
  }
  
  log(`Transformed ${transformedRows.length} valid rows from ${sourceInfo.file}`);
  return transformedRows;
}

/**
 * Normalize registration date to sortable format: YYYY-MM-DD HH:MM:SS
 */
function normalizeDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return '';
  }
  
  try {
    // Handle SportsEngine format: "06/16/2022, 04:18pm PDT"
    const seMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4}),\s+(\d{2}):(\d{2})(am|pm)\s+[A-Z]{3}$/);
    if (seMatch) {
      const [, month, day, year, hour, minute, meridiem] = seMatch;
      let hour24 = parseInt(hour, 10);
      
      if (meridiem === 'pm' && hour24 !== 12) {
        hour24 += 12;
      } else if (meridiem === 'am' && hour24 === 12) {
        hour24 = 0;
      }
      
      return `${year}-${month}-${day} ${hour24.toString().padStart(2, '0')}:${minute}:00`;
    }
    
    // Handle Sports Connect format: "06/24/2025 05:37:53 PM"
    const scMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+(AM|PM)$/);
    if (scMatch) {
      const [, month, day, year, hour, minute, second, meridiem] = scMatch;
      let hour24 = parseInt(hour, 10);
      
      if (meridiem === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (meridiem === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      return `${year}-${month}-${day} ${hour24.toString().padStart(2, '0')}:${minute}:${second}`;
    }
    
    // If no match, return original
    return dateStr;
  } catch (error) {
    return dateStr;
  }
}

/**
 * Normalize grade values (standardize Kindergarten to K)
 */
function normalizeGrade(grade) {
  if (!grade || typeof grade !== 'string') {
    return '';
  }
  
  const trimmed = grade.trim();
  
  // Normalize Kindergarten variations to "K"
  if (trimmed.toLowerCase() === 'kindergarten') {
    return 'K';
  }
  
  // Already "K", "Pre-K", or standard format (1st, 2nd, etc.)
  return trimmed;
}

/**
 * Normalize city name (title case, remove state/zip suffix)
 */
function normalizeCity(city) {
  if (!city || typeof city !== 'string') {
    return '';
  }
  
  // Remove state/zip suffix like "Seattle WA 98103" -> "Seattle"
  let cleaned = city.split(/\s+[A-Z]{2}\s+\d{5}/)[0].trim();
  
  // Title case (first letter uppercase, rest lowercase)
  return cleaned
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Clean team name by removing season suffix
 */
function cleanTeamName(teamName) {
  if (!teamName || typeof teamName !== 'string') {
    return '';
  }
  
  // Remove patterns like:
  // " - summer 2022 Regular Season"
  // " - 2023 Regular Season"
  // " Regular Season"
  return teamName
    .replace(/\s*-\s*summer\s+\d{4}\s+Regular\s+Season$/i, '')
    .replace(/\s*-\s*\d{4}\s+Regular\s+Season$/i, '')
    .replace(/\s+Regular\s+Season$/i, '')
    .trim();
}

/**
 * Trim all string values in a row and normalize whitespace
 */
function trimRow(row) {
  const trimmed = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'string') {
      // Trim and normalize multiple spaces/newlines to single space
      let cleaned = value.trim().replace(/\s+/g, ' ');
      
      // Special handling for address_city
      if (key === 'address_city') {
        cleaned = normalizeCity(cleaned);
      }
      
      trimmed[key] = cleaned;
    } else {
      trimmed[key] = value;
    }
  }
  return trimmed;
}

/**
 * Write master CSV file
 */
function writeMasterFile(allRows) {
  // Trim all string values to remove trailing spaces
  const trimmedRows = allRows.map(trimRow);
  
  const csv = stringify(trimmedRows, {
    header: true,
    columns: MASTER_COLUMNS
  });
  
  fs.writeFileSync(OUTPUT_FILE, csv, 'utf-8');
  log(`✅ Master file written: ${OUTPUT_FILE}`, 'info');
}

/**
 * Main execution
 */
function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Summerball Registration Data Consolidation');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Mode: ${WRITE_MODE ? '✍️  WRITE' : '👁️  DRY RUN (preview only)'}`);
  console.log(`Verbose: ${VERBOSE ? 'ON' : 'OFF'}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Process all source files
  const allTransformedRows = [];
  
  for (const sourceInfo of SOURCE_FILES) {
    const rows = processSourceFile(sourceInfo);
    allTransformedRows.push(...rows);
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total source rows:     ${stats.totalRows}`);
  console.log(`Processed successfully: ${stats.processedRows}`);
  console.log(`Skipped/Duplicate:     ${stats.skippedRows}`);
  console.log(`Warnings:              ${stats.warnings.length}`);
  console.log(`Errors:                ${stats.errors.length}`);
  console.log(`Master file rows:      ${allTransformedRows.length}`);
  
  if (stats.warnings.length > 0 && !VERBOSE) {
    console.log(`\n⚠️  ${stats.warnings.length} warnings (run with --verbose to see details)`);
  }
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    stats.errors.forEach(err => console.log(`   ${err}`));
  }
  
  // Write or preview
  if (WRITE_MODE) {
    console.log('\n📝 Writing master file...');
    writeMasterFile(allTransformedRows);
    console.log(`\n✅ Consolidation complete! Output: ${OUTPUT_FILE}`);
  } else {
    console.log('\n👁️  DRY RUN complete. No files written.');
    console.log('   Run with --write to save master file.');
    
    if (allTransformedRows.length > 0 && VERBOSE) {
      console.log('\n📋 Sample row (first entry):');
      console.log(JSON.stringify(allTransformedRows[0], null, 2));
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run
main();
