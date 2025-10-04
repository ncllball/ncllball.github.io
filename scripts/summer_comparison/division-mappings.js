/**
 * Division/Program Name Normalization Mappings
 * 
 * Maps various division names from different registration systems to standardized format.
 * SportsEngine (2022-2024) and Sports Connect (2025) use different naming conventions.
 */

const divisionNormalization = {
  // ========================================
  // BASEBALL DIVISIONS
  // ========================================

  // Majors (10-11 year olds)
  'Baseball-Major Division (Age 10-11)': 'BASEBALL - Summerball - Majors (Interleague)',
  'Baseball Majors': 'BASEBALL - Summerball - Majors (Interleague)',

  // AAA (9-10 year olds)
  'Baseball-AAA Division (Age 9-10)': 'BASEBALL - Summerball - Triple-AAA (Interleague)',
  'Baseball AAA': 'BASEBALL - Summerball - Triple-AAA (Interleague)',
  'Waitlist - Baseball-AAA (Age 9-10)': 'BASEBALL - Summerball - Triple-AAA (Interleague)',

  // AA (8-9 year olds, Player Pitch)
  'Baseball AA Division (Age 8-9 Player Pitch)': 'BASEBALL - Summerball - Double-AA (Interleague)',
  'Baseball AA': 'BASEBALL - Summerball - Double-AA (Interleague)',
  "Baseball-AA Division (Age 8-9 Player Pitch)": 'BASEBALL - Summerball - Double-AA (Interleague)',

  // Single-A (Sandlot)
  'Baseball A': 'BASEBALL - Summerball - Single-A (Sandlot)',
  'Baseball A Division (Age 6-7)': 'BASEBALL - Summerball - Single-A (Sandlot)',
  'Pre-approved younger players': 'BASEBALL - Summerball - Single-A (Sandlot)',

  // Teen/Junior (12-15 year olds, 90' basepaths)
  'Baseball-Teen Division (Age 12-15; 90\' basepaths)': 'BASEBALL - Summerball - TEEN/JUNIOR (Interleague)',
  'Baseball JR/SR': 'BASEBALL - Summerball - TEEN/JUNIOR (Interleague)',
  'Waitlist - Baseball-Teen Division (Age 12-15; 90\' basepaths)': 'BASEBALL - Summerball - TEEN/JUNIOR (Interleague)',

  // 2025 format variations (Summerball25)
  'BASEBALL - Summerball25 - Single-A (Sandlot)': 'BASEBALL - Summerball - Single-A (Sandlot)',
  'BASEBALL - Summerball25 - Double-AA (Interleague)': 'BASEBALL - Summerball - Double-AA (Interleague)',
  'BASEBALL - Summerball25 - Triple-AAA (Interleague)': 'BASEBALL - Summerball - Triple-AAA (Interleague)',
  'BASEBALL - Summerball25 - Majors (Interleague)': 'BASEBALL - Summerball - Majors (Interleague)',
  'BASEBALL - Summerball25 - TEEN/JUNIOR (Interleague)': 'BASEBALL - Summerball - TEEN/JUNIOR (Interleague)',

  // ========================================
  // SOFTBALL DIVISIONS
  // ========================================

  'SOFTBALL - Summerball25 - AAA/Majors (Sandlot)': 'SOFTBALL - Summerball - AAA/Majors (Sandlot)',
  'SOFTBALL - Summerball25 - AA/AAA (Sandlot)': 'SOFTBALL - Summerball - AA/AAA (Sandlot)',
  'SOFTBALL - Summerball25 - AAA/Majors (Sandlot)': 'SOFTBALL - Summerball - AAA/Majors (Sandlot)',
  'SOFTBALL - Summerball25 - AA/AAA (Sandlot)': 'SOFTBALL - Summerball - AA/AAA (Sandlot)',

  // Combined Division (2022-2024)
  'Softball-Combined Division': 'SOFTBALL - Summerball - Combined Division',
  'Waitlist - Softball-Combined Division': 'SOFTBALL - Summerball - Combined Division',
  
  // Short form (from previous_division field)
  'Softball AA': 'SOFTBALL - Summerball - AA/AAA (Sandlot)',
  'Softball AAA': 'SOFTBALL - Summerball - AAA/Majors (Sandlot)',
  'Softball Majors': 'SOFTBALL - Summerball - AAA/Majors (Sandlot)',
  'Baseball AA': 'BASEBALL - Summerball - Double-AA (Interleague)',
  'Baseball AAA': 'BASEBALL - Summerball - Triple-AAA (Interleague)',
  'Baseball Majors': 'BASEBALL - Summerball - Majors (Interleague)',
  'Baseball JR/SR': 'BASEBALL - Summerball - TEEN/JUNIOR (Interleague)',
};

/**
 * Get normalized division name
 * @param {string} divisionName - Raw division name from registration
 * @param {number} year - Registration year (2022-2025)
 * @returns {string} - Normalized canonical division name
 */
function normalizeDivisionName(divisionName, year) {
  if (!divisionName || typeof divisionName !== 'string') {
    return 'UNKNOWN';
  }

  const trimmed = divisionName.trim();

  // Remove year-specific suffixes (Summerball25 -> Summerball)
  const yearAgnostic = trimmed.replace(/Summerball\d{2}/, 'Summerball');

  // Try direct mapping first
  if (divisionNormalization[trimmed]) {
    return divisionNormalization[trimmed];
  }

  // Try year-agnostic mapping
  if (divisionNormalization[yearAgnostic]) {
    return divisionNormalization[yearAgnostic];
  }

  // Return original if no mapping found (will need manual review)
  console.warn(`No division mapping found for: "${trimmed}" (year: ${year})`);
  return trimmed;
}

/**
 * Extract sport from division name
 * @param {string} divisionName - Normalized division name
 * @returns {string} - 'BASEBALL' or 'SOFTBALL'
 */
function extractSport(divisionName) {
  if (divisionName.toUpperCase().includes('BASEBALL')) {
    return 'BASEBALL';
  }
  if (divisionName.toUpperCase().includes('SOFTBALL')) {
    return 'SOFTBALL';
  }
  return 'UNKNOWN';
}

/**
 * Extract age group from division name
 * @param {string} divisionName - Normalized division name
 * @returns {string} - 'Majors', 'AAA', 'AA', 'A', 'TEEN/JUNIOR', etc.
 */
function extractAgeGroup(divisionName) {
  if (divisionName.includes('Majors')) return 'Majors';
  if (divisionName.includes('Triple-AAA')) return 'AAA';
  if (divisionName.includes('Double-AA')) return 'AA';
  if (divisionName.includes('Single-A')) return 'A';
  if (divisionName.includes('TEEN/JUNIOR')) return 'TEEN/JUNIOR';
  if (divisionName.includes('AAA/Majors')) return 'AAA/Majors';
  if (divisionName.includes('AA/AAA')) return 'AA/AAA';
  return 'UNKNOWN';
}

module.exports = {
  divisionNormalization,
  normalizeDivisionName,
  extractSport,
  extractAgeGroup
};
