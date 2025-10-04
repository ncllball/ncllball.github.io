const fs = require('fs');
const {parse} = require('csv-parse/sync');

// Check 2025 source for additional school info
console.log('\n=== Checking 2025 Source Data ===\n');
const data2025 = parse(fs.readFileSync('.github/projects/reports/summerball25.csv'), {
  columns: true,
  skip_empty_lines: true
});

// Get all column names
const columns2025 = Object.keys(data2025[0]);
const schoolRelatedCols = columns2025.filter(col => 
  col.toLowerCase().includes('school') || 
  col.toLowerCase().includes('grade') ||
  col.toLowerCase().includes('education')
);

console.log('School-related columns in 2025:', schoolRelatedCols);
console.log('\n');

// Find "Other" school entries in 2025
const others2025 = data2025.filter(row => row['School Name'] === 'Other');
console.log(`Found ${others2025.length} "Other" entries in 2025 source\n`);

others2025.slice(0, 10).forEach(row => {
  console.log(`${row['Player First Name']} ${row['Player Last Name']}:`);
  schoolRelatedCols.forEach(col => {
    if (row[col]) {
      console.log(`  ${col}: ${row[col]}`);
    }
  });
  console.log('');
});

// Check 2024 source
console.log('\n=== Checking 2024 Source Data ===\n');
const data2024 = parse(fs.readFileSync('.github/projects/reports/summerball24.csv'), {
  columns: true,
  skip_empty_lines: true
});

const columns2024 = Object.keys(data2024[0]);
const schoolRelatedCols2024 = columns2024.filter(col => 
  col.toLowerCase().includes('school') || 
  col.toLowerCase().includes('grade') ||
  col.toLowerCase().includes('education')
);

console.log('School-related columns in 2024:', schoolRelatedCols2024);
console.log('\n');

const others2024 = data2024.filter(row => row['School'] === 'Other');
console.log(`Found ${others2024.length} "Other" entries in 2024 source\n`);

others2024.slice(0, 10).forEach(row => {
  console.log(`${row['athlete_1_first_name']} ${row['athlete_1_last_name']}:`);
  schoolRelatedCols2024.forEach(col => {
    if (row[col]) {
      console.log(`  ${col}: ${row[col]}`);
    }
  });
  console.log('');
});
