/**
 * Check for players who registered for multiple divisions in the same year
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const REPORTS_DIR = path.join(__dirname, '../../.github/projects/reports');

const sources = [
  { file: 'summerball22.csv', year: 2022 },
  { file: 'summerball23.csv', year: 2023 },
  { file: 'summerball24.csv', year: 2024 },
  { file: 'summerball25.csv', year: 2025 }
];

console.log('\n🔍 Checking for players with multiple division registrations in same year...\n');

let totalDuplicates = 0;

sources.forEach(({ file, year }) => {
  const filePath = path.join(REPORTS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { 
    columns: true, 
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true 
  });
  
  const playerMap = new Map();
  
  records.forEach((row, idx) => {
    const firstName = (row.athlete_1_first_name || '').trim();
    const lastName = (row.athlete_1_last_name || '').trim();
    const dob = (row.athlete_1_dob || '').trim();
    const orderStatus = (row['Order Status'] || '').trim();
    
    // Skip failed/cancelled
    if (orderStatus === 'Failed' || orderStatus === 'Cancelled') return;
    if (!firstName || !lastName || !dob) return;
    
    const key = `${firstName}|${lastName}|${dob}`;
    
    // Get division
    let division = '';
    if (year === 2022) {
      division = row['Baseball Divisions for league age'] || row['Softball Division'] || '';
    } else if (year <= 2024) {
      division = row['Baseball Division'] || row['Softball Division'] || '';
    } else {
      division = row['Division Name'] || '';
    }
    division = division.trim();
    
    if (!playerMap.has(key)) {
      playerMap.set(key, []);
    }
    playerMap.get(key).push({ 
      firstName, 
      lastName, 
      dob, 
      division, 
      orderStatus, 
      orderNumber: row['Order Number'] || '',
      rowNum: idx + 2  // +2 because CSV is 1-indexed and has header row
    });
  });
  
  // Find duplicates
  const duplicates = Array.from(playerMap.entries())
    .filter(([key, registrations]) => registrations.length > 1)
    .map(([key, registrations]) => ({ key, registrations }));
  
  if (duplicates.length > 0) {
    console.log(`\n📅 ${year} Summerball - Found ${duplicates.length} player(s) with multiple registrations:`);
    console.log('─'.repeat(80));
    duplicates.forEach(({ registrations }) => {
      const player = registrations[0];
      console.log(`\n  👤 ${player.firstName} ${player.lastName} (DOB: ${player.dob})`);
      registrations.forEach((reg, i) => {
        const orderInfo = reg.orderNumber ? `Order ${reg.orderNumber}` : 'No order #';
        console.log(`     ${i + 1}. Row ${reg.rowNum}: ${reg.division || '(no division)'} - ${reg.orderStatus || '(no status)'} - ${orderInfo}`);
      });
    });
    totalDuplicates += duplicates.length;
  } else {
    console.log(`\n✅ ${year} Summerball - No duplicate registrations found`);
  }
});

console.log('\n' + '═'.repeat(80));
if (totalDuplicates > 0) {
  console.log(`⚠️  Total: ${totalDuplicates} player(s) with multiple registrations across all years`);
} else {
  console.log('✅ No players found with multiple division registrations in the same year');
}
console.log('═'.repeat(80) + '\n');
