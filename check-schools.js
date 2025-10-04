const fs = require('fs');
const {parse} = require('csv-parse/sync');

const data = parse(fs.readFileSync('.github/projects/Reports/summerball22-25.master.csv'), {
  columns: true,
  skip_empty_lines: true
});

const schools = {};
data.forEach(row => {
  const schoolValue = row.school_name || '(empty)';
  schools[schoolValue] = (schools[schoolValue] || 0) + 1;
});

console.log('\nSchool name distribution:');
Object.entries(schools)
  .sort((a, b) => b[1] - a[1])
  .forEach(([name, count]) => {
    console.log(`${count.toString().padStart(4)}: "${name}"`);
  });

console.log(`\nTotal records: ${data.length}`);
