const fs = require('fs');
const path = require('path');

/**
 * Format a phone number by removing parentheses but keeping dashes
 * @param {string} phone - The phone number to format
 * @returns {string} - The formatted phone number
 */
function formatPhoneNumber(phone) {
    if (!phone || phone.trim() === '') return phone;
    
    // Remove parentheses
    let formatted = phone.replace(/[()]/g, '');
    
    // Clean up any extra spaces
    formatted = formatted.trim();
    
    // Handle numbers that had area code in parentheses like (206) 555-1234
    // They become "206 555-1234" after removing parens, convert to 206-555-1234
    formatted = formatted.replace(/^(\d{3})\s+(\d{3}-\d{4})$/, '$1-$2');
    
    // Handle any other space patterns between number groups
    formatted = formatted.replace(/(\d{3})\s+(\d{3})\s+(\d{4})/, '$1-$2-$3');
    formatted = formatted.replace(/(\d{3})\s+(\d{4})/, '$1-$2');
    
    return formatted;
}

/**
 * Process the CSV file in-place and format phone numbers
 */
function processCSVInPlace(filePath) {
    console.log(`Processing: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Phone number column names to look for
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
            console.log(`Found phone column: ${col} at index ${index}`);
        }
    });
    
    let changedCount = 0;
    const processedLines = [];
    
    // Process each line
    lines.forEach((line, lineIndex) => {
        if (lineIndex === 0 || line.trim() === '') {
            // Keep header and empty lines as-is
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
        let lineChanged = false;
        phoneColumnIndices.forEach(colIndex => {
            if (colIndex < cols.length && cols[colIndex].trim()) {
                const original = cols[colIndex];
                const formatted = formatPhoneNumber(original);
                if (original !== formatted) {
                    cols[colIndex] = formatted;
                    lineChanged = true;
                }
            }
        });
        
        if (lineChanged) changedCount++;
        processedLines.push(cols.join(','));
    });
    
    // Write back to the same file
    fs.writeFileSync(filePath, processedLines.join('\n'), 'utf8');
    console.log(`\nProcessing complete!`);
    console.log(`- Total lines: ${lines.length}`);
    console.log(`- Lines with phone changes: ${changedCount}`);
    console.log(`- File updated: ${filePath}`);
}

// Main execution
const filePath = process.argv[2] || 'c:\\Users\\johns\\OneDrive\\Downloads\\compare\\2023 Summer Ball.csv';

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

processCSVInPlace(filePath);
