const fs = require('fs');
const {parse} = require('csv-parse/sync');

const data = parse(fs.readFileSync('.github/projects/Reports/summerball22-25.master.csv'), {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true
});

const otherSchools = data.filter(row => row.school_name === 'Other');

console.log('\n=== Students with "Other" school - Address Analysis ===\n');
console.log('Name                      | Year | City          | Zip   | Analysis');
console.log('--------------------------|------|---------------|-------|------------------');

const analysis = {
  inArea: 0,
  outsideSeattle: 0,
  differentZip: 0,
  noAddress: 0
};

otherSchools.forEach(row => {
  const name = `${row.player_first_name} ${row.player_last_name}`.padEnd(25);
  const city = row.address_city || '';
  const zip = row.address_zip || '';
  const year = row.registration_year;
  
  let pattern = '';
  if (!city) {
    pattern = 'No address';
    analysis.noAddress++;
  } else if (city !== 'Seattle') {
    pattern = `Outside Seattle (${city})`;
    analysis.outsideSeattle++;
  } else if (!['98103', '98107', '98117', '98105', '98115', '98112', '98199'].includes(zip)) {
    pattern = `Different area (${zip})`;
    analysis.differentZip++;
  } else {
    pattern = 'In NCLL area';
    analysis.inArea++;
  }
  
  const cityDisplay = city.padEnd(13);
  const zipDisplay = zip.padEnd(5);
  
  console.log(`${name} | ${year} | ${cityDisplay} | ${zipDisplay} | ${pattern}`);
});

console.log('\n=== Summary ===');
console.log(`In NCLL area (98103/05/07/12/15/17/99): ${analysis.inArea}`);
console.log(`Different Seattle zip: ${analysis.differentZip}`);
console.log(`Outside Seattle: ${analysis.outsideSeattle}`);
console.log(`No address data: ${analysis.noAddress}`);
console.log(`Total: ${otherSchools.length}`);
