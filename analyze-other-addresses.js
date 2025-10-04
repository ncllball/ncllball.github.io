const fs = require('fs');

// Read the master CSV directly and look for address patterns
const masterCSV = fs.readFileSync('.github/projects/Reports/summerball22-25.master.csv', 'utf-8');
const lines = masterCSV.split('\n');

// Parse header to find column indices
const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
const schoolIdx = header.indexOf('school_name');
const firstNameIdx = header.indexOf('player_first_name');
const lastNameIdx = header.indexOf('player_last_name');
const cityIdx = header.indexOf('address_city');
const zipIdx = header.indexOf('address_zip');
const yearIdx = header.indexOf('registration_year');

console.log('\n=== Students with "Other" school - Address Analysis ===\n');
console.log('Name                      | Year | City          | Zip   | Pattern');
console.log('--------------------------|------|---------------|-------|------------------');

lines.slice(1).forEach(line => {
  if (!line.trim()) return;
  
  const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
  const school = parts[schoolIdx];
  
  if (school === 'Other') {
    const firstName = parts[firstNameIdx];
    const lastName = parts[lastNameIdx];
    const city = parts[cityIdx];
    const zip = parts[zipIdx];
    const year = parts[yearIdx];
    
    // Determine pattern
    let pattern = '';
    if (!city || city === '') pattern = 'No address';
    else if (city !== 'Seattle') pattern = `Outside Seattle (${city})`;
    else if (zip && !['98103', '98107', '98117', '98105', '98115', '98112', '98199'].includes(zip)) {
      pattern = `Different area (${zip})`;
    } else {
      pattern = 'In area';
    }
    
    const name = `${firstName} ${lastName}`.padEnd(25);
    const cityDisplay = (city || '').padEnd(13);
    const zipDisplay = (zip || '').padEnd(5);
    
    console.log(`${name} | ${year} | ${cityDisplay} | ${zipDisplay} | ${pattern}`);
  }
});
