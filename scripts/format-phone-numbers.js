const fs = require('fs');
const path = require('path');

/**
 * Format a phone number by removing parentheses but keeping dashes
 * @param {string} phone - The phone number to format
 * @returns {string} - The formatted phone number
 */
function formatPhoneNumber(phone) {
    if (!phone || phone.trim() === '') return phone;
    
    // Remove parentheses and extra spaces
    let formatted = phone.replace(/[()]/g, '').trim();
    
    // Handle numbers that had area code in parentheses like (206) 555-1234
    // Convert to 206-555-1234
    formatted = formatted.replace(/\s+(\d{3})-(\d{4})/, '-$1-$2');
    
    // Replace any remaining spaces between number groups with dashes
    formatted = formatted.replace(/(\d{3})\s+(\d{3})\s+(\d{4})/, '$1-$2-$3');
    formatted = formatted.replace(/(\d{3})\s+(\d{3})-(\d{4})/, '$1-$2-$3');
    
    // Clean up any multiple spaces
    formatted = formatted.replace(/\s+/g, ' ');
    
    return formatted;
}

/**
 * Process the CSV file and format phone numbers
 */
function processCSV(inputFile, outputFile) {
    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');
    const processedLines = [];
    
    // Phone number column indices (based on the header)
    // These are the columns that contain phone numbers
    const phoneColumns = [
        'Guardian_1_Primary_Phone',
        'Guardian_1_Secondary_Phone', 
        'guardian_2_phone_3',
        'guardian_2_phone_1',
        'emergency_1_phone_1',
        'emergency_1_phone_2',
        'emergency_2_phone_1',
        'emergency_2_phone_2',
        'physician_1_phone_1'
    ];
    
    // Process header to find column indices
    const header = lines[0];
    const headerCols = header.split(',').map(col => col.trim());
    const phoneColumnIndices = [];
    
    headerCols.forEach((col, index) => {
        if (phoneColumns.includes(col)) {
            phoneColumnIndices.push(index);
        }
    });
    
    // Process each line
    lines.forEach((line, lineIndex) => {
        if (lineIndex === 0) {
            // Keep header as is
            processedLines.push(line);
            return;
        }
        
        if (line.trim() === '') {
            processedLines.push(line);
            return;
        }
        
        // Split by comma but respect quoted values
        const cols = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                inQuotes = !inQuotes;
            }
            
            if (char === ',' && !inQuotes) {
                cols.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        cols.push(current); // Add the last column
        
        // Format phone numbers in the identified columns
        phoneColumnIndices.forEach(colIndex => {
            if (colIndex < cols.length) {
                cols[colIndex] = formatPhoneNumber(cols[colIndex]);
            }
        });
        
        processedLines.push(cols.join(','));
    });
    
    // Write the processed content
    fs.writeFileSync(outputFile, processedLines.join('\n'), 'utf8');
    console.log(`Processed file saved to: ${outputFile}`);
}

// Main execution
const inputFile = process.argv[2] || 'c:\\Users\\johns\\OneDrive\\Downloads\\compare\\2023 Summer Ball.csv';
const outputFile = process.argv[3] || inputFile.replace('.csv', '_formatted.csv');

if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
}

console.log(`Processing: ${inputFile}`);
processCSV(inputFile, outputFile);
