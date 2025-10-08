// Apply the approved keep-columns schema to one or more report CSVs.
// Usage: node scripts/reports/apply-keep-columns.js <file1.csv> [file2.csv ...]

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Approved keep columns for TEEN winter reporting (also fine for other winter extracts)
const KEEP_COLUMNS = [
  'Program Name',
  'Division Name',
  'Player First Name',
  'Player Last Name',
  'Player Gender',
  'Player Birth Date',
  'Account First Name',
  'Account Last Name',
  'User Email',
  'Telephone',
  'Cellphone',
  'Street Address',
  'City',
  'State',
  'Postal Code',
  'Team Name',
  'Order Date',
  'Order Payment Status',
  'Order Payment Amount',
  'Order Amount',
  'Order Payment Method',
  'New Or Returning',
  'School Name',
  'Current Grade',
  'Division Start Date',
  'Division End Date',
  'Division Price',
  'Order Detail Program Name',
  'Order Detail Division Name',
  'Order Detail Player Id',
  'Player Id',
  'Registration Number',
];

function rewriteFile(filePath) {
  const csv = fs.readFileSync(filePath, 'utf8');
  const rows = parse(csv, {
    columns: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    skip_empty_lines: true,
  });
  if (!rows.length) {
    console.error('No data in', filePath);
    return;
  }

  const header = Object.keys(rows[0]);
  const missing = KEEP_COLUMNS.filter((k) => !header.includes(k));

  const filtered = rows.map((r) => {
    const o = {};
    for (const k of KEEP_COLUMNS) o[k] = r[k] ?? '';
    return o;
  });

  const out = stringify(filtered, { header: true, columns: KEEP_COLUMNS });
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Rewrote ${path.relative(process.cwd(), filePath)} -> columns: ${KEEP_COLUMNS.length} (missing from source: ${missing.length ? missing.join(', ') : 'none'})`);
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Usage: node scripts/reports/apply-keep-columns.js <file1.csv> [file2.csv ...]');
    process.exit(1);
  }
  for (const fp of args) {
    const abs = path.isAbsolute(fp) ? fp : path.join(process.cwd(), fp);
    if (!fs.existsSync(abs)) {
      console.error('File not found:', abs);
      continue;
    }
    rewriteFile(abs);
  }
}

main();
