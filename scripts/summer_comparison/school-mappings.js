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
  
  'Daniel Bagley Elementary': 'Bagley Elementary',
  'Bagley': 'Bagley Elementary',
  
  'Cascadia Elementary': 'Cascadia Elementary',
  'Cascadia': 'Cascadia Elementary',
  
  'Greenwood Elementary': 'Greenwood Elementary',
  'Greenwood ES': 'Greenwood Elementary',
  
  'John Stanford Int\'l Elementary': 'John Stanford Elementary',
  'John Stanford International Elementary': 'John Stanford Elementary',
  'JSIS': 'John Stanford Elementary',
  
  'McDonald Int\'l Elementary': 'McDonald Elementary',
  'McDonald International Elementary': 'McDonald Elementary',
  
  'West Woodland Elementary': 'West Woodland Elementary',
  'West Woodland ES': 'West Woodland Elementary',
  
  // Middle Schools
  'Hamilton International Middle School': 'Hamilton International Middle School',
  'Robert Eagle Staff Middle School': 'Robert Eagle Staff Middle School',
  'Robert eagle staff': 'Robert Eagle Staff Middle School',
  
  // K-8 Schools
  'St. John School': 'St John School',
  'St John\'s School': 'St John School',
  'St. John\'s': 'St John School',
  
  'TOPS K-8': 'TOPS K-8',
  
  'Salmon Bay': 'Salmon Bay K-8',
  'Salmon bay': 'Salmon Bay K-8',
  'Salmon Bay K-8': 'Salmon Bay K-8',
  
  // Private/Other Schools
  'The Meridian School': 'The Meridian School',
  
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
