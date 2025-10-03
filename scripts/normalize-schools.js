const fs = require('fs');
const path = require('path');

// School name normalization mapping
const schoolMappings = {
  // Elementary Schools
  'John Stanford International Elementary': 'John Stanford International Elementary',
  'McDonald International Elementary': 'McDonald International Elementary',
  'B.F. Day Elementary': 'B.F. Day Elementary',
  'BF Day Elementary': 'B.F. Day Elementary',
  'Greenwood Elementary': 'Greenwood Elementary',
  'West Woodland Elementary': 'West Woodland Elementary',
  'Daniel Bagley Elementary': 'Daniel Bagley Elementary',
  'Cascadia Elementary': 'Cascadia Elementary',
  
  // Middle Schools
  'Hamilton International Middle School': 'Hamilton International Middle School',
  'Robert Eagle Staff Middle School': 'Robert Eagle Staff Middle School',
  
  // K-8 Schools
  'St. John School': 'St. John School',
  'TOPS K-8': 'TOPS K-8',
  'Salmon Bay': 'Salmon Bay K-8',
  'Salmon bay': 'Salmon Bay K-8',
  
  // Other Schools
  'The Meridian School': 'The Meridian School',
  'UCDS': 'UCDS',
  'UCDS- University Child Development School': 'UCDS',
  'University Child Development School': 'UCDS',
  'Paragon Prep in Austin TX': 'Paragon Prep',
  
  // Generic
  'Other': 'Other',
  'Cascadia': 'Cascadia Elementary',
  'Robert eagle staff': 'Robert Eagle Staff Middle School'
};

function normalizeSchoolName(schoolName) {
  if (!schoolName) return '';
  
  const trimmed = schoolName.trim();
  
  // Check for exact match first
  if (schoolMappings[trimmed]) {
    return schoolMappings[trimmed];
  }
  
  // Check for case-insensitive match
  for (const [key, value] of Object.entries(schoolMappings)) {
    if (key.toLowerCase() === trimmed.toLowerCase()) {
      return value;
    }
  }
  
  // Return original if no mapping found
  return trimmed;
}

function normalizeCSV(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');
  
  const normalizedLines = lines.map(line => {
    if (!line.trim()) return line;
    
    // Parse CSV line (simple split - adjust if needed for quoted fields)
    const fields = line.split(',').map(f => f.trim());
    
    // Normalize column 9 (index 8)
    if (fields.length > 8) {
      fields[8] = normalizeSchoolName(fields[8]);
    }
    
    // Reconstruct the line with proper spacing
    return fields.map((field, index) => {
      // Add padding for readability (matching original format)
      if (index === 0) return field; // First field no padding
      return field.padStart(field.length > 0 ? field.length + 1 : 1);
    }).join(',');
  });
  
  fs.writeFileSync(outputPath, normalizedLines.join('\n'), 'utf-8');
  console.log(`Normalized CSV written to: ${outputPath}`);
}

// Run the script
const inputFile = path.join(__dirname, '..', '..', 'OneDrive', 'Downloads', 'compare', '2023 Summer Ball.csv');
const outputFile = path.join(__dirname, '..', '..', 'OneDrive', 'Downloads', 'compare', '2023 Summer Ball - normalized.csv');

if (fs.existsSync(inputFile)) {
  normalizeCSV(inputFile, outputFile);
} else {
  console.error(`Input file not found: ${inputFile}`);
  console.log('Please provide the correct path to your CSV file.');
}
