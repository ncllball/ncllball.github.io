const fs = require('fs');
const {parse} = require('csv-parse/sync');

const data = parse(fs.readFileSync('.github/projects/Reports/summerball22-25.master.csv'), {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true
});

console.log('\n=== Date Formats in registration_date ===\n');

// Get unique date formats
const dateFormats = {};
data.forEach(row => {
  const date = row.registration_date;
  if (!dateFormats[date]) {
    dateFormats[date] = {
      count: 0,
      year: row.registration_year,
      example: date
    };
  }
  dateFormats[date].count++;
});

// Group by pattern
const patterns = {};
Object.entries(dateFormats).forEach(([date, info]) => {
  let pattern = 'Unknown';
  
  if (/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}(am|pm) [A-Z]{3}$/.test(date)) {
    pattern = 'MM/DD/YYYY, HH:MMam/pm TZ (SportsEngine)';
  } else if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} (AM|PM)$/.test(date)) {
    pattern = 'MM/DD/YYYY HH:MM:SS AM/PM (Sports Connect)';
  }
  
  if (!patterns[pattern]) {
    patterns[pattern] = [];
  }
  patterns[pattern].push({ date, ...info });
});

Object.entries(patterns).forEach(([pattern, dates]) => {
  console.log(`\n${pattern}:`);
  console.log(`  Count: ${dates.reduce((sum, d) => sum + d.count, 0)} records`);
  console.log(`  Examples:`);
  dates.slice(0, 5).forEach(d => {
    console.log(`    ${d.example} (year ${d.year}, ${d.count} times)`);
  });
});

console.log('\n=== Sample dates by year ===\n');
['2022', '2023', '2024', '2025'].forEach(year => {
  const sample = data.find(row => row.registration_year === year);
  if (sample) {
    console.log(`${year}: ${sample.registration_date}`);
  }
});
