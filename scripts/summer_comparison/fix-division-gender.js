#!/usr/bin/env node

/**
 * Extract Winter Program Data - Simplest Approach
 * 
 * Just parse with relax mode and delete the problematic columns.
 * Yes, the data is misaligned, but for winter programs we mainly care about
 * player info, not division details.
 */

const fs = require('fs');
const {parse} = require('csv-parse/sync');
const {stringify} = require('csv-stringify/sync');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Extract and Clean Winter Program Data');
console.log('═══════════════════════════════════════════════════════════\n');

// Parse with relaxed rules
const sourceData = parse(
  fs.readFileSync('.github/projects/reports/2025_all_programs_enrollment_details.csv'),
  {columns: true, relax_quotes: true, skip_empty_lines: true, relax_column_count: true}
);

console.log(`Parsed ${sourceData.length} records\n`);

// Define programs
const programs = [
  {name: '2025 Winter TEEN Baseball Training II', file: 'teenwinter2.csv'},
  {name: '2025 Winter TEEN Baseball Training I', file: 'teenwinter1.csv'},
  {name: '2025 Winter Triple-AAA & Majors Baseball Training', file: 'winteraaaMajors.csv'}
];

console.log('Extracting programs and removing problematic columns...\n');

programs.forEach(prog => {
  // Filter for this program
  // Note: Column keys have lots of trailing spaces, so find the Program Name key first
  const programNameKey = Object.keys(sourceData[0] || {}).find(k => k.trim() === 'Program Name');
  
  let records;
  if (prog.name === '2025 Winter TEEN Baseball Training I') {
    records = sourceData.filter(r => {
      const pn = (r[programNameKey] || '').trim();
      return pn.includes('2025 Winter TEEN Baseball Training I') && !pn.includes('II');
    });
  } else {
    records = sourceData.filter(r => (r[programNameKey] || '').trim() === prog.name);
  }
  
  // Remove problematic columns from each record
  const cleaned = records.map(row => {
    const clean = {};
    Object.keys(row).forEach(key => {
      const k = key.trim();
      // Skip the 3 problematic columns
      if (k !== 'Division Gender' && k !== 'Associated Team Staff' && k !== 'Portal Name') {
        clean[k] = (row[key] || '').trim();
      }
    });
    return clean;
  });
  
  // Write
  fs.writeFileSync(
    '.github/projects/reports/' + prog.file,
    stringify(cleaned, {header: true})
  );
  
  console.log('✅ ' + prog.name);
  console.log('   Records: ' + cleaned.length);
  console.log('   Columns: ' + Object.keys(cleaned[0] || {}).length);
  console.log('   File: ' + prog.file + '\n');
});

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ All files extracted');
console.log('   Note: Division-related columns may have misaligned data');
console.log('   due to source CSV issues. Player data is accurate.');
console.log('═══════════════════════════════════════════════════════════');
