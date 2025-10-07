#!/usr/bin/env node

/**
 * Extract Winter Program Data - Robust Alignment Fix
 *
 * Strategy:
 * - Parse entire CSV as arrays (not objects) with relax options
 * - Identify indices for 3 problematic columns by trimmed header name
 * - Remove those columns (descending indices) from EVERY row, including header
 * - Trim header names and convert rows to objects for writing
 * - Filter rows for the 3 winter programs using the Program Name column index
 */

const fs = require('fs');
const {parse} = require('csv-parse/sync');
const {stringify} = require('csv-stringify/sync');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Extract and Clean Winter Program Data');
console.log('═══════════════════════════════════════════════════════════\n');

// 1) Parse entire file as arrays (handles multi-line quotes safely)
const rows = parse(
  fs.readFileSync('.github/projects/reports/2025_all_programs_enrollment_details.csv'),
  {
    columns: false,
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true
  }
);

if (!rows.length) {
  console.error('No rows found in source CSV');
  process.exit(1);
}

const header = rows[0];
const headerTrimmed = header.map(h => (h || '').toString().trim());

// 2) Locate indices for columns to drop by trimmed header match
const nameToIndex = new Map();
headerTrimmed.forEach((name, idx) => nameToIndex.set(name, idx));

const dropNames = ['Division Gender', 'Associated Team Staff', 'Portal Name'];
const dropIndices = dropNames
  .map(n => nameToIndex.get(n))
  .filter(i => typeof i === 'number' && i >= 0)
  .sort((a, b) => b - a); // remove in descending order

console.log(`Found ${dropIndices.length} columns to remove: ${dropNames.join(', ')}`);
if (dropIndices.length !== dropNames.length) {
  console.warn('Warning: Not all drop columns were found in header');
}

// 3) First, fix known split tokens in Division Gender that create an extra column
//    Pattern: header has one column "Division Gender", but some rows are parsed as two cells: '"F' and 'M"'
//    We'll merge row[genderIdx] and row[genderIdx+1] when they look like a broken quoted pair.
const genderIdx = nameToIndex.get('Division Gender');
const mergedRows = rows.map(r => {
  if (typeof genderIdx === 'number' && genderIdx >= 0 && r.length > genderIdx + 1) {
    const left = (r[genderIdx] ?? '').toString();
    const right = (r[genderIdx + 1] ?? '').toString();
    const l = left.trim();
    const rr = right.trim();
    // Detect a broken quoted pair like '"F' + 'M"' or '"F' + '"' or similar FMX variants
    const startsQuoteNoEnd = l.startsWith('"') && !l.endsWith('"');
    const rightEndsQuote = rr.endsWith('"');
    if (startsQuoteNoEnd && rightEndsQuote) {
      // Merge tokens, remove quotes and whitespace inside
      const merged = (l + ',' + rr).replace(/^[\s\"]+|[\s\"]+$/g, ''); // e.g., F,M
      // Place merged back at genderIdx and remove the extra cell
      const copy = r.slice();
      copy[genderIdx] = merged;
      copy.splice(genderIdx + 1, 1);
      return copy;
    }
  }
  return r;
});

// 4) Remove the problematic columns from all rows (after merge to keep alignment with header)
const trimmedRows = mergedRows.map(r => {
  const copy = r.slice();
  dropIndices.forEach(idx => {
    if (idx < copy.length) copy.splice(idx, 1);
  });
  return copy;
});

// 5) Prepare final header and determine Program Name index for filtering
const finalHeader = trimmedRows[0].map(h => (h || '').toString().trim());
const programNameIdx = finalHeader.findIndex(h => h === 'Program Name');
if (programNameIdx === -1) {
  console.error('Program Name column not found after trimming');
  process.exit(1);
}

// 6) Convert a row array into an object with trimmed values
const rowToObject = (arr) => {
  const obj = {};
  for (let i = 0; i < finalHeader.length; i++) {
    obj[finalHeader[i]] = (arr[i] ?? '').toString().trim();
  }
  return obj;
};

// 7) Define programs
const programs = [
  {name: '2025 Winter TEEN Baseball Training II', file: 'teenwinter2.csv'},
  {name: '2025 Winter TEEN Baseball Training I', file: 'teenwinter1.csv'},
  {name: '2025 Winter Triple-AAA & Majors Baseball Training', file: 'winteraaaMajors.csv'}
];

console.log('Filtering programs and writing outputs...\n');

// Data rows exclude header
const dataRows = trimmedRows.slice(1);

programs.forEach(prog => {
  let filteredRows = [];
  if (prog.name === '2025 Winter TEEN Baseball Training I') {
    // Contains I but not II
    filteredRows = dataRows.filter(r => {
      const pn = (r[programNameIdx] || '').toString().trim();
      return pn.includes('2025 Winter TEEN Baseball Training I') && !pn.includes('II');
    });
  } else {
    filteredRows = dataRows.filter(r => ((r[programNameIdx] || '').toString().trim()) === prog.name);
  }

  let objects = filteredRows.map(rowToObject);

  // Targeted cleanup: some exports can leave a stray 'M"' artifact previously at Division Open Registration
  // After the merge above, alignment should be correct, but keep a safety fix just in case.
  const looksLikeDate = (s) => /\d{2}\/\d{2}\/\d{4}/.test(s || '');
  objects = objects.map(o => {
    const dor = o['Division Open Registration'] || '';
    const dcr = o['Division Close Registration'] || '';
    if (/^"?M"?/.test(dor.trim()) && looksLikeDate(dcr)) {
      o['Division Open Registration'] = dcr;
    }
    return o;
  });

  // Write CSV with clean headers
  const csv = stringify(objects, { header: true, columns: finalHeader });
  fs.writeFileSync('.github/projects/reports/' + prog.file, csv);

  console.log(`✅ ${prog.name}`);
  console.log(`   Records: ${objects.length}`);
  console.log(`   Columns: ${finalHeader.length}`);
  console.log(`   File: ${prog.file}\n`);
});

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ All files extracted with aligned columns');
console.log('═══════════════════════════════════════════════════════════');
