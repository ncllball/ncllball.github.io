const fs = require('fs');
const path = require('path');

function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

function jsonToCSV(jsonData) {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('JSON data must be a non-empty array');
  }
  
  // Get all unique keys from all objects
  const allKeys = new Set();
  jsonData.forEach(obj => {
    Object.keys(obj).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys);
  
  // Build CSV
  const rows = [];
  
  // Add header row
  rows.push(headers.map(escapeCSV).join(','));
  
  // Add data rows
  jsonData.forEach(obj => {
    const row = headers.map(header => escapeCSV(obj[header]));
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// Main execution
const inputFile = path.join(__dirname, '..', 'output.jsonnode');
const outputFile = path.join(__dirname, '..', 'output.csv');

try {
  console.log('Reading JSON file...');
  const jsonContent = fs.readFileSync(inputFile, 'utf8');
  const jsonData = JSON.parse(jsonContent);
  
  console.log(`Found ${jsonData.length} records`);
  
  console.log('Converting to CSV...');
  const csvContent = jsonToCSV(jsonData);
  
  console.log('Writing CSV file...');
  fs.writeFileSync(outputFile, csvContent, 'utf8');
  
  console.log(`✓ Successfully converted to ${outputFile}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
