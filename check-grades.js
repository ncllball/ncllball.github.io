const fs = require('fs');
const {parse} = require('csv-parse/sync');

const data = parse(fs.readFileSync('.github/projects/Reports/summerball22-25.master.csv'), {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true
});

console.log('\n=== Grade Values Distribution ===\n');

const grades = {};
data.forEach(row => {
  const grade = row.grade || '(empty)';
  grades[grade] = (grades[grade] || 0) + 1;
});

// Sort by value
const sortedGrades = Object.entries(grades).sort((a, b) => {
  // Custom sort: K first, then numbers, then others
  const aVal = a[0];
  const bVal = b[0];
  
  if (aVal.includes('K') || aVal.includes('k')) return -1;
  if (bVal.includes('K') || bVal.includes('k')) return 1;
  
  const aNum = parseInt(aVal);
  const bNum = parseInt(bVal);
  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
  
  return aVal.localeCompare(bVal);
});

sortedGrades.forEach(([grade, count]) => {
  console.log(`${count.toString().padStart(4)}: "${grade}"`);
});

console.log(`\nTotal records: ${data.length}`);
