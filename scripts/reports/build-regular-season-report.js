// Build Regular Season report from the 2025 all-programs enrollment CSV
// Usage: node scripts/reports/build-regular-season-report.js [--source .github/projects/reports/2025_all_programs_enrollment_details.csv] [--out .github/projects/reports/regularseason.csv] [--write]

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const DEFAULT_SOURCE = path.join('.github', 'projects', 'reports', '2025_all_programs_enrollment_details.csv');
const DEFAULT_OUT = path.join('.github', 'projects', 'reports', 'regularseason.csv');

// Approved keep columns schema (same as winter reports)
const KEEP = [
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

function readCsv(fp) {
  const csv = fs.readFileSync(fp, 'utf8');
  return parse(csv, {
    columns: (header) => header.map((h) => String(h).trim()),
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    skip_empty_lines: true,
  });
}

function isRegularSeason(row) {
  const p = String(row['Program Name'] || '').toLowerCase();
  return p.includes('regular season');
}

function filterAndKeep(rows) {
  const reg = rows.filter(isRegularSeason);
  return reg.map((r) => {
    const o = {};
    for (const k of KEEP) o[k] = r[k] ?? '';
    return o;
  });
}

function main() {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i+1] : undefined; };
  const has = (flag) => args.includes(flag);
  const source = get('--source') || DEFAULT_SOURCE;
  const out = get('--out') || DEFAULT_OUT;
  const write = has('--write');
  const srcAbs = path.isAbsolute(source) ? source : path.join(process.cwd(), source);
  const outAbs = path.isAbsolute(out) ? out : path.join(process.cwd(), out);
  if (!fs.existsSync(srcAbs)) {
    console.error('Source not found:', srcAbs);
    process.exit(1);
  }
  const rows = readCsv(srcAbs);
  const kept = filterAndKeep(rows);
  const csvOut = stringify(kept, { header: true, columns: KEEP });
  if (write) {
    fs.writeFileSync(outAbs, csvOut, 'utf8');
    console.log(`Wrote Regular Season report to ${path.relative(process.cwd(), outAbs)}: ${kept.length} rows, ${KEEP.length} columns`);
  } else {
    console.log(`[dry-run] Would write ${kept.length} rows to ${path.relative(process.cwd(), outAbs)}`);
  }
}

main();
