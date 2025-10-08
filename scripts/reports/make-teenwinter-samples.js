// Generate sample CSVs showing "kept" vs "deleted" columns for teenwinter.csv
// Outputs:
// - .github/projects/reports/samples/teenwinter.sample.keep.csv (10 rows)
// - .github/projects/reports/samples/teenwinter.sample.delete.csv (10 rows)
// - .github/projects/reports/samples/teenwinter.keep.columns.txt
// - .github/projects/reports/samples/teenwinter.delete.columns.txt

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const input = path.join(__dirname, '..', '..', '.github', 'projects', 'reports', 'teenwinter.csv');
const outDir = path.join(__dirname, '..', '..', '.github', 'projects', 'reports', 'samples');

function main() {
  if (!fs.existsSync(input)) {
    console.error('Input not found:', input);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const csv = fs.readFileSync(input, 'utf8');
  const rows = parse(csv, {
    columns: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    skip_empty_lines: true,
  });
  if (!rows.length) {
    console.error('No data rows in', input);
    process.exit(1);
  }

  const header = Object.keys(rows[0]);

  // Proposed KEEP columns for TEEN winter reporting (roster/contact/payment summary only)
  const keep = [
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

  const keepExisting = keep.filter((k) => header.includes(k));
  const missing = keep.filter((k) => !header.includes(k));
  const deleteCols = header.filter((h) => !keepExisting.includes(h));

  const first10 = rows.slice(0, 10);

  const keepRows = first10.map((r) => {
    const o = {};
    for (const k of keepExisting) o[k] = r[k];
    return o;
  });

  // Mask sensitive values in the delete sample
  const sensitiveRe = /(credit|card|auth|transaction|cvv|expiry|cc)/i;
  function maskVal(k, v) {
    if (v == null) return v;
    const s = String(v);
    if (!sensitiveRe.test(k)) return s;
    const digits = s.replace(/\D+/g, '');
    if (digits.length >= 4) {
      const last4 = digits.slice(-4);
      return `[redacted:${last4}]`;
    }
    return '[redacted]';
  }

  const deleteRows = first10.map((r) => {
    const o = {};
    for (const k of deleteCols) o[k] = maskVal(k, r[k]);
    return o;
  });

  const keepCsv = stringify(keepRows, { header: true, columns: keepExisting });
  const deleteCsv = stringify(deleteRows, { header: true, columns: deleteCols });

  const keepCsvPath = path.join(outDir, 'teenwinter.sample.keep.csv');
  const deleteCsvPath = path.join(outDir, 'teenwinter.sample.delete.csv');
  fs.writeFileSync(keepCsvPath, keepCsv, 'utf8');
  fs.writeFileSync(deleteCsvPath, deleteCsv, 'utf8');

  // Column lists
  fs.writeFileSync(path.join(outDir, 'teenwinter.keep.columns.txt'), keepExisting.join('\n') + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, 'teenwinter.delete.columns.txt'), deleteCols.join('\n') + '\n', 'utf8');

  console.log('Keep columns:', keepExisting.length);
  console.log('Missing (from desired keep):', missing);
  console.log('Delete columns:', deleteCols.length);
  console.log('Wrote files:\n -', keepCsvPath, '\n -', deleteCsvPath);
}

main();
