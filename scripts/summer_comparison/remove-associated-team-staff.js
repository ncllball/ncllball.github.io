#!/usr/bin/env node

/**
 * Remove the "Associated Team Staff" column from CSV files
 * 
 * This column causes parsing issues due to complex quoted values with semicolons.
 * Removing it simplifies the CSV structure.
 * 
 * Usage:
 *   node remove-associated-team-staff.js <input-file> [output-file]
 * 
 * If output-file is not specified, overwrites the input file.
 */

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile;

if (!inputFile) {
  console.error('Usage: node remove-associated-team-staff.js <input-file> [output-file]');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

console.log(`Reading ${inputFile}...`);

// Read the CSV with relaxed parsing options
const csvContent = fs.readFileSync(inputFile, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true
});

console.log(`Found ${records.length} records`);

// Check if the column exists
const firstRecord = records[0];
const hasColumn = 'Associated Team Staff' in firstRecord;

if (!hasColumn) {
  console.log('✓ "Associated Team Staff" column not found - nothing to remove');
  process.exit(0);
}

console.log('Removing "Associated Team Staff" column...');

// Remove the column from all records
const cleanedRecords = records.map(record => {
  const { 'Associated Team Staff': removed, ...rest } = record;
  return rest;
});

console.log(`Removed column from ${cleanedRecords.length} records`);

// Write back to CSV
const output = stringify(cleanedRecords, {
  header: true
});

fs.writeFileSync(outputFile, output);

console.log(`✓ Wrote cleaned data to ${outputFile}`);
console.log(`✓ "Associated Team Staff" column has been removed`);
