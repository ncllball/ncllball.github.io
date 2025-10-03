/**
 * School Name Normalization Mappings
 * 
 * Maps various school name variations to standardized canonical names.
 * Use this for normalizing school data across different registration years.
 */

const schoolNormalization = {
  // Elementary Schools
  'B.F. Day Elementary': 'BF Day Elementary',
  'B. F. Day Elementary': 'BF Day Elementary',
  'BF Day Elementary': 'BF Day Elementary',
  'BF Day': 'BF Day Elementary',
  'BF Day Elementary, 3921 Linden Ave N, Seattle, WA 98103': 'BF Day Elementary',
  
  'Daniel Bagley Elementary': 'Bagley Elementary',
  'Bagley': 'Bagley Elementary',
  'Bagley Elementary': 'Bagley Elementary',
  'Daniel Bagley Elementary, 7821 Stone Ave N, Seattle, WA 98103': 'Bagley Elementary',
  
  'Cascadia Elementary': 'Cascadia Elementary',
  'Cascadia': 'Cascadia Elementary',
  
  'Greenwood Elementary': 'Greenwood Elementary',
  'Greenwood ES': 'Greenwood Elementary',
  'Greenwood Elementary, 144 NW 80th St, Seattle, WA 98117': 'Greenwood Elementary',
  
  'John Stanford Int\'l Elementary': 'John Stanford Elementary',
  'John Stanford International Elementary': 'John Stanford Elementary',
  'JSIS': 'John Stanford Elementary',
  'John Stanford Elementary, 4057 5th Ave NE, Seattle, WA 98105': 'John Stanford Elementary',
  
  'McDonald Int\'l Elementary': 'McDonald Elementary',
  'McDonald International Elementary': 'McDonald Elementary',
  'McDonald Elementary': 'McDonald Elementary',
  'McDonald International Elementary, 144 NE 54th St, Seattle, WA 98105': 'McDonald Elementary',
  
  'West Woodland Elementary': 'West Woodland Elementary',
  'West Woodland ES': 'West Woodland Elementary',
  'West Woodland Elementary, 5601 4th Ave NW, Seattle, WA 98107': 'West Woodland Elementary',
  
  // Middle Schools
  'Hamilton Int\'l Middle': 'Hamilton International Middle School',
  'Hamilton International Middle School': 'Hamilton International Middle School',
  'Hamilton International Middle School, 1610 N 41st St, Seattle, WA 98103': 'Hamilton International Middle School',
  
  'Robert Eagle Staff Middle School': 'Robert Eagle Staff Middle School',
  'Robert eagle staff': 'Robert Eagle Staff Middle School',
  'Robert Eagle Staff Middle School, 1330 N 90th St, Seattle, WA 98103': 'Robert Eagle Staff Middle School',
  
  // High Schools
  'Lincoln High': 'Lincoln High School',
  'Lincoln High School': 'Lincoln High School',
  'Lincoln High School, 4400 Interlake Ave N, Seattle, WA 98103': 'Lincoln High School',
  
  // K-8 Schools
  'St. John School': 'St John School',
  'St John School': 'St John School',
  'St John\'s School': 'St John School',
  'St. John\'s': 'St John School',
  'St. John School, 120 N 79th St, Seattle, WA 98103': 'St John School',
  
  'St. Benedict School': 'St Benedict School',
  'St Benedict School': 'St Benedict School',
  'St. Benedict School ,4811 Wallingford Ave N, Seattle, WA 98103': 'St Benedict School',
  
  'TOPS K-8': 'TOPS K-8',
  
  'Salmon Bay': 'Salmon Bay K-8',
  'Salmon bay': 'Salmon Bay K-8',
  'Salmon Bay K-8': 'Salmon Bay K-8',
  
  // Private/Other Schools
  'The Meridian School': 'The Meridian School',
  'Meridian School': 'The Meridian School',
  'Meridian School, 4649 Sunnyside Ave N #242, Seattle, WA 98103': 'The Meridian School',
  
  'The Northwest School': 'The Northwest School',
  'The Northwest School, 1415 Summit Ave, Seattle, WA 98122': 'The Northwest School',
  
  'Seattle Academy (SAAS)': 'Seattle Academy',
  'Seattle Academy': 'Seattle Academy',
  'Seattle Academy (SAAS), 1201 E Union St, Seattle, WA 98122': 'Seattle Academy',
  
  'Pacific Crest School': 'Pacific Crest School',
  
  'UCDS': 'UCDS',
  'UCDS- University Child Development School': 'UCDS',
  'University Child Development School': 'UCDS',
  
  'Paragon Prep in Austin TX': 'Paragon Prep',
  
  // Generic
  'Other': 'Other'
};

/**
 * Get normalized school name
 * @param {string} schoolName - Raw school name from registration
 * @returns {string} - Normalized canonical school name
 */
function normalizeSchoolName(schoolName) {
  if (!schoolName || typeof schoolName !== 'string') {
    return 'Other';
  }
  
  const trimmed = schoolName.trim();
  return schoolNormalization[trimmed] || trimmed;
}

module.exports = {
  schoolNormalization,
  normalizeSchoolName
};
