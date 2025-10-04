const fs = require('fs');
const {parse} = require('csv-parse/sync');

const data = parse(fs.readFileSync('.github/projects/Reports/summerball22-25.master.csv'), {
  columns: true,
  skip_empty_lines: true
});

const otherSchools = data.filter(row => row.school_name === 'Other');

console.log(`\n48 students with "Other" school:\n`);
console.log('Year | Name                          | Grade | Sport');
console.log('-----|-------------------------------|-------|----------');

otherSchools.forEach(row => {
  const name = `${row.player_first_name} ${row.player_last_name}`.padEnd(29);
  const year = row.registration_year;
  const grade = (row.grade || '').padEnd(5);
  const sport = row.sport;
  
  console.log(`${year} | ${name} | ${grade} | ${sport}`);
});

console.log(`\nTotal: ${otherSchools.length} students`);
