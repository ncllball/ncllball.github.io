const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// School name mapping - add more as needed
const schoolMappings = {
    // Elementary Schools
    'B.F. Day Elementary': 'BF Day Elementary',
    'B. F. Day Elementary': 'BF Day Elementary',
    'BF Day': 'BF Day Elementary',
    
    'Daniel Bagley Elementary': 'Bagley Elementary',
    'Bagley': 'Bagley Elementary',
    
    'Greenwood Elementary': 'Greenwood Elementary',
    'Greenwood ES': 'Greenwood Elementary',
    
    'John Stanford Int\'l Elementary': 'John Stanford Elementary',
    'John Stanford International Elementary': 'John Stanford Elementary',
    'JSIS': 'John Stanford Elementary',
    
    'McDonald Int\'l Elementary': 'McDonald Elementary',
    'McDonald International Elementary': 'McDonald Elementary',
    
    'St. John School': 'St John School',
    'St John\'s School': 'St John School',
    'St. John\'s': 'St John School',
    
    'West Woodland Elementary': 'West Woodland Elementary',
    'West Woodland ES': 'West Woodland Elementary',
    
    // Middle Schools
    'Hamilton Int\'l Middle': 'Hamilton Middle School',
    'Hamilton International Middle': 'Hamilton Middle School',
    'Hamilton MS': 'Hamilton Middle School',
    
    'Robert Eagle Staff Middle': 'Eagle Staff Middle School',
    'Eagle Staff Middle School': 'Eagle Staff Middle School',
    'Eagle Staff': 'Eagle Staff Middle School',
    'Eckstein Middle School': 'Eckstein Middle School',
    
    // High Schools
    'Lincoln High': 'Lincoln High School',
    'Lincoln HS': 'Lincoln High School',
    
    // Special Cases
    'Other': 'Other',
    'UCDS': 'UCDS',
    'Meridian School': 'Meridian School',
    'Pacific Crest School': 'Pacific Crest School'
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

function processCSV(filePath, options = {}) {
    const { write = false, verbose = false } = options;
    
    console.log(`Processing: ${filePath}`);
    
    // Read the CSV file
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Parse CSV
    const records = csv.parse(content, {
        columns: false,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true
    });
    
    let changes = 0;
    const schoolColumnIndex = 4; // Based on your CSV structure, school is in column 5 (index 4)
    
    // Process each record
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        if (record.length > schoolColumnIndex) {
            const originalSchool = record[schoolColumnIndex];
            const normalizedSchool = normalizeSchoolName(originalSchool);
            
            if (originalSchool !== normalizedSchool) {
                if (verbose) {
                    console.log(`  Row ${i + 1}: "${originalSchool}" → "${normalizedSchool}"`);
                }
                record[schoolColumnIndex] = normalizedSchool;
                changes++;
            }
        }
    }
    
    console.log(`Found ${changes} school names to normalize`);
    
    if (write && changes > 0) {
        // Convert back to CSV
        const output = stringify(records, {
            quoted: false,
            record_delimiter: 'windows'
        });
        
        // Write back to file
        fs.writeFileSync(filePath, output);
        console.log(`✓ Updated ${filePath}`);
    } else if (!write && changes > 0) {
        console.log('Run with --write to apply changes');
    }
    
    return changes;
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const write = args.includes('--write');
    const verbose = args.includes('--verbose');
    
    // Get file path from arguments or use default
    let filePath = args.find(arg => !arg.startsWith('--'));
    
    if (!filePath) {
        // Default to the 2023 Summer Ball file
        filePath = path.join(__dirname, '..', '..', '..', 'OneDrive', 'Downloads', 'compare', '2023 Summer Ball.csv');
    }
    
    if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(filePath);
    }
    
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        console.log('\nUsage: node normalize-schools.js [file.csv] [--write] [--verbose]');
        process.exit(1);
    }
    
    processCSV(filePath, { write, verbose });
}

module.exports = { normalizeSchoolName, processCSV };
