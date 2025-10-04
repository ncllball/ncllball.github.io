const fs = require('fs');

// Just read the first line to see column names
const content = fs.readFileSync('.github/projects/reports/2025_all_programs_enrollment_details.csv', 'utf-8');
const firstLine = content.split('\n')[0];
const columns = firstLine.split(',');

console.log('\nColumn names in 2025 all programs file:\n');
columns.forEach((col, idx) => {
  const cleaned = col.replace(/"/g, '').trim();
  console.log(`[${idx}] "${col}" → cleaned: "${cleaned}"`);
  if (cleaned.toLowerCase().includes('program')) {
    console.log(`     ^^^ PROGRAM COLUMN ^^^`);
  }
});
