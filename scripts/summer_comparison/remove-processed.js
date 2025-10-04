/**
 * Remove already-processed registrations from master source file
 * 
 * This script removes registrations from programs that have already been processed,
 * based on Program Name matching.
 * 
 * Usage:
 *   node remove-processed.js --source=<source-file> --program="Program Name" --write
 * 
 * Example:
 *   node remove-processed.js --source=2025_all_programs.csv --program="Summerball" --write
 */

const fs = require('fs');
const path = require('path');

let parse, stringify;
try {
  parse = require('csv-parse/sync').parse;
  stringify = require('csv-stringify/sync').stringify;
} catch (error) {
  console.error('Error: csv-parse and csv-stringify packages are required.');
  console.error('Install with: npm install csv-parse csv-stringify');
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
const WRITE_MODE = args.includes('--write');
const sourceArg = args.find(a => a.startsWith('--source='));
const programArg = args.find(a => a.startsWith('--program='));

if (!sourceArg || !programArg) {
  console.error('\nUsage: node remove-processed.js --source=<file> --program="Program Name" [--write]\n');
  console.error('Example:');
  console.error('  node remove-processed.js --source=2025_all_programs.csv --program="Summerball" --write\n');
  process.exit(1);
}

const SOURCE_FILE = sourceArg.split('=')[1];
const PROGRAM_NAME = programArg.split('=')[1].replace(/^["']|["']$/g, ''); // Remove quotes if present
const OUTPUT_FILE = SOURCE_FILE.replace('.csv', '.remaining.csv');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Remove Already-Processed Program');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Mode: ${WRITE_MODE ? '✍️  WRITE' : '👁️  DRY RUN'}`);
console.log(`Source file: ${SOURCE_FILE}`);
console.log(`Program to remove: "${PROGRAM_NAME}"`);
console.log(`Output file: ${OUTPUT_FILE}`);
console.log('═══════════════════════════════════════════════════════════\n');

// Read source file and normalize column names (remove padding)
const rawSourceData = parse(fs.readFileSync(SOURCE_FILE), {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true
});

// Trim all column names to remove padding
const sourceData = rawSourceData.map(row => {
  const cleanRow = {};
  Object.keys(row).forEach(key => {
    cleanRow[key.trim()] = row[key];
  });
  return cleanRow;
});

console.log(`📄 Source file contains: ${sourceData.length} registrations\n`);

// Get all unique programs before filtering
const allPrograms = {};
sourceData.forEach(row => {
  const program = row['Program Name'] || row['program_name'] || 'Unknown';
  allPrograms[program] = (allPrograms[program] || 0) + 1;
});

console.log('Programs in source file:');
Object.entries(allPrograms)
  .sort((a, b) => b[1] - a[1])
  .forEach(([program, count]) => {
    console.log(`  ${program}: ${count}`);
  });
console.log('');

// Filter out registrations from the specified program
const remaining = [];
const removed = [];
const stats = {
  total: sourceData.length,
  removed: 0,
  remaining: 0
};

sourceData.forEach(row => {
  const program = row['Program Name'] || row['program_name'] || '';
  const firstName = row['Player First Name'] || row['player_first_name'] || row['athlete_1_first_name'] || '';
  const lastName = row['Player Last Name'] || row['player_last_name'] || row['athlete_1_last_name'] || '';
  
  // Check if program name contains the target program (case-insensitive)
  if (program.toLowerCase().includes(PROGRAM_NAME.toLowerCase())) {
    removed.push({ firstName, lastName, program });
    stats.removed++;
  } else {
    remaining.push(row);
    stats.remaining++;
  }
});

console.log('═══════════════════════════════════════════════════════════');
console.log('  Results');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Total source registrations: ${stats.total}`);
console.log(`Removed (${PROGRAM_NAME}): ${stats.removed} (${(stats.removed/stats.total*100).toFixed(1)}%)`);
console.log(`Remaining to process: ${stats.remaining} (${(stats.remaining/stats.total*100).toFixed(1)}%)`);

console.log('\nSample removed registrations (first 10):');
removed.slice(0, 10).forEach(p => {
  console.log(`  ${p.firstName} ${p.lastName} - ${p.program}`);
});

if (WRITE_MODE) {
  console.log('\n📝 Writing remaining registrations...');
  
  const csv = stringify(remaining, {
    header: true,
    columns: Object.keys(remaining[0])
  });
  
  fs.writeFileSync(OUTPUT_FILE, csv, 'utf-8');
  console.log(`✅ Written: ${OUTPUT_FILE}`);
  console.log(`   ${stats.remaining} remaining registrations to process`);
} else {
  console.log('\n👁️  DRY RUN - No files modified');
  console.log('   Run with --write to create output file');
}

console.log('═══════════════════════════════════════════════════════════');
