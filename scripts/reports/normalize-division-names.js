// Normalize Division Name values to a canonical set used in reports
// Usage:
//   node scripts/reports/normalize-division-names.js --path ".github/projects/reports/volunteers.csv" [--write]

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Canonical names we use across reports
const CANONICAL = new Set([
  'T-ball', 'Kindy', 'A', 'AA', 'AAA', 'Majors', 'Juniors', 'Seniors', 'TEEN',
  'Minors', // in case softball uses Minors
]);

function cleanToken(s) {
  return String(s || '')
    .replace(/\b(Baseball|Softball)\b/ig, '')
    .replace(/\b(Division)\b/ig, '')
    .replace(/[^a-z0-9+/\-\s]/ig, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDivisionName(raw) {
  const s0 = String(raw || '').trim();
  if (!s0) return s0;
  const s = cleanToken(s0).toUpperCase();

  // Direct maps
  const MAP = {
    'T': 'T-ball',
    'TEE BALL': 'T-ball',
    'TEE-BALL': 'T-ball',
    'TBALL': 'T-ball',
    'T-BALL': 'T-ball',
    'KINDER': 'Kindy',
    'KINDERBALL': 'Kindy',
    'PRE TEE': 'Kindy',
    'PRE-TEE': 'Kindy',
    'KINDY': 'Kindy',
    'A': 'A',
    'A DIVISION': 'A',
    'SINGLE A': 'A',
    'AA': 'AA',
    'AA DIVISION': 'AA',
    'DOUBLE A': 'AA',
    'AAA': 'AAA',
    'AAA DIVISION': 'AAA',
    'TRIPLE A': 'AAA',
    'MAJOR': 'Majors',
    'MAJORS': 'Majors',
    'MINOR': 'Minors',
    'MINORS': 'Minors',
    'JUNIOR': 'Juniors',
    'JUNIORS': 'Juniors',
    'JR': 'Juniors',
    'SENIOR': 'Seniors',
    'SENIORS': 'Seniors',
    'TEEN': 'TEEN',
  };

  if (MAP[s]) return MAP[s];

  // If already canonical word with different case/hyphenation
  if (/^T[- ]?BALL$/.test(s)) return 'T-ball';
  if (/^KINDY$/.test(s)) return 'Kindy';
  if (/^A{1,3}$/.test(s)) return s; // A, AA, AAA
  if (/^MAJ(OR|ORS)$/.test(s)) return 'Majors';
  if (/^JUN(IOR|IORS|R|RS)$/.test(s)) return 'Juniors';
  if (/^SEN(IOR|IORS)$/.test(s)) return 'Seniors';
  if (/^MIN(OR|ORS)$/.test(s)) return 'Minors';

  // Fallback: return original as-is (preserve input if we don't know it)
  return s0;
}

function processFile(fp, write) {
  const csv = fs.readFileSync(fp, 'utf8');
  const rows = parse(csv, { columns: true, relax_quotes: true, relax_column_count: true, trim: true, skip_empty_lines: false });
  if (!rows.length) {
    console.log('No rows to process in', path.relative(process.cwd(), fp));
    return;
  }

  let changes = 0;
  for (const r of rows) {
    if (!('Division Name' in r)) continue;
    const before = r['Division Name'];
    const after = normalizeDivisionName(before);
    if (after !== before) {
      r['Division Name'] = after;
      changes++;
    }
  }

  if (write && changes) {
    const out = stringify(rows, { header: true, columns: Object.keys(rows[0] || {}) });
    fs.writeFileSync(fp, out, 'utf8');
  }
  console.log(`${path.relative(process.cwd(), fp)}: ${changes} division name(s) normalized${write ? ' (written)' : ''}`);
}

function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--path');
  const write = args.includes('--write');
  if (i === -1 || !args[i + 1]) {
    console.error('Usage: node scripts/reports/normalize-division-names.js --path <file.csv> [--write]');
    process.exit(1);
  }
  const file = args[i + 1];
  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(abs)) {
    console.error('File not found:', abs);
    process.exit(1);
  }
  processFile(abs, write);
}

main();
