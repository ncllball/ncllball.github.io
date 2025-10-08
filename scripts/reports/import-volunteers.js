// Import Sports Connect Volunteer_Details.csv into our volunteers.csv schema
// Usage:
//   node scripts/reports/import-volunteers.js --source "C:\\Users\\<you>\\Downloads\\Volunteer_Details.csv" [--target ".github/projects/reports/volunteers.csv"] [--write]

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const DEFAULT_TARGET = path.join('.github', 'projects', 'reports', 'volunteers.csv');

function readCsv(fp) {
  const csv = fs.readFileSync(fp, 'utf8');
  return parse(csv, { columns: true, relax_quotes: true, relax_column_count: true, trim: true, skip_empty_lines: true });
}

function normalizeDivisionName(raw) {
  const s0 = String(raw || '').trim();
  if (!s0) return s0;
  // strip parentheticals and sport labels
  let s = s0.replace(/\([^)]*\)/g, ' ')
            .replace(/\b(Baseball|Softball)\b/ig, ' ')
            .replace(/\b(Division)\b/ig, ' ')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();
  const MAP = {
    'T': 'T-ball', 'TEE BALL': 'T-ball', 'TEE-BALL': 'T-ball', 'TBALL': 'T-ball', 'T BALL': 'T-ball',
    'KINDY': 'Kindy', 'KINDER': 'Kindy', 'KINDERBALL': 'Kindy', 'PRE TEE': 'Kindy', 'PRETEE': 'Kindy',
    'A': 'A', 'SINGLE A': 'A',
    'AA': 'AA', 'DOUBLE A': 'AA',
    'AAA': 'AAA', 'TRIPLE A': 'AAA',
    'MAJOR': 'Majors', 'MAJORS': 'Majors',
    'MINOR': 'Minors', 'MINORS': 'Minors',
    'JUNIOR': 'Juniors', 'JUNIORS': 'Juniors', 'JR': 'Juniors',
    'SENIOR': 'Seniors', 'SENIORS': 'Seniors',
    'TEEN': 'TEEN',
  };
  if (MAP[s]) return MAP[s];
  if (/^T ?BALL$/.test(s)) return 'T-ball';
  if (/^A{1,3}$/.test(s)) return s; // A, AA, AAA
  if (/^MAJ(OR|ORS)$/.test(s)) return 'Majors';
  if (/^JUN(IOR|IORS|R|RS)$/.test(s)) return 'Juniors';
  if (/^SEN(IOR|IORS)$/.test(s)) return 'Seniors';
  if (/^MIN(OR|ORS)$/.test(s)) return 'Minors';
  return s0; // fallback preserve
}

const TARGET_HEADER = [
  'Program Name','Division Name','Team Name','Volunteer Role','Volunteer First Name','Volunteer Last Name',
  'Volunteer Email','Volunteer Telephone','Volunteer Cellphone','Volunteer Street Address','Volunteer City','Volunteer State','Volunteer Postal Code',
  'Background Check Status','Background Check Submitted Date','Background Check Cleared Date','SafeSport Status','SafeSport Completed Date','Abuse Awareness Date','Concussion Training Date',
  'Little League Volunteer ID','Sports Connect Account Email','Linked Player First Name','Linked Player Last Name','Notes'
];

function mapRow(src) {
  const street = String(src['Volunteer Street Address'] || '').trim();
  const unit = String(src['Volunteer Address Unit'] || '').trim();
  const streetFull = unit ? `${street} ${unit}`.trim() : street;
  const otherPhone = String(src['Volunteer Other Phone'] || '').trim();
  const scEmail = String(src['Volunteer Email Address'] || '').trim();
  return {
    'Program Name': String(src['Program Name'] || '').trim(),
    'Division Name': normalizeDivisionName(src['Division Name']),
    'Team Name': String(src['Team Name'] || '').trim(),
    'Volunteer Role': String(src['Volunteer Role'] || '').trim(),
    'Volunteer First Name': String(src['Volunteer First Name'] || '').trim(),
    'Volunteer Last Name': String(src['Volunteer Last Name'] || '').trim(),
    'Volunteer Email': scEmail,
    'Volunteer Telephone': String(src['Volunteer Telephone'] || '').trim(),
    'Volunteer Cellphone': String(src['Volunteer Cellphone'] || '').trim(),
    'Volunteer Street Address': streetFull,
    'Volunteer City': String(src['Volunteer City'] || '').trim(),
    'Volunteer State': String(src['Volunteer State'] || '').trim(),
    'Volunteer Postal Code': String(src['Volunteer Postal Code'] || '').trim(),
    'Background Check Status': '',
    'Background Check Submitted Date': '',
    'Background Check Cleared Date': '',
    'SafeSport Status': '',
    'SafeSport Completed Date': '',
    'Abuse Awareness Date': '',
    'Concussion Training Date': '',
    'Little League Volunteer ID': '',
    'Sports Connect Account Email': scEmail,
    'Linked Player First Name': '',
    'Linked Player Last Name': '',
    'Notes': otherPhone ? `Other Phone: ${otherPhone}` : '',
  };
}

function buildKey(r) {
  const email = (r['Volunteer Email'] || '').toLowerCase();
  const team = (r['Team Name'] || '').toLowerCase();
  const role = (r['Volunteer Role'] || '').toLowerCase();
  const name = `${(r['Volunteer First Name']||'').toLowerCase()}|${(r['Volunteer Last Name']||'').toLowerCase()}`;
  return email ? `e:${email}|t:${team}|r:${role}` : `n:${name}|t:${team}|r:${role}`;
}

function ensureHeader(filePath) {
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8').trim() === '') {
    const headerCsv = TARGET_HEADER.join(',') + '\n';
    fs.writeFileSync(filePath, headerCsv, 'utf8');
  }
}

function main() {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i+1] : undefined; };
  const has = (flag) => args.includes(flag);
  const source = get('--source');
  const target = get('--target') || DEFAULT_TARGET;
  const write = has('--write');
  if (!source) {
    console.error('Usage: node scripts/reports/import-volunteers.js --source <Volunteer_Details.csv> [--target <volunteers.csv>] [--write]');
    process.exit(1);
  }
  const srcAbs = path.isAbsolute(source) ? source : path.join(process.cwd(), source);
  const targAbs = path.isAbsolute(target) ? target : path.join(process.cwd(), target);
  if (!fs.existsSync(srcAbs)) {
    console.error('Source not found:', srcAbs);
    process.exit(1);
  }
  ensureHeader(targAbs);
  const targetRows = readCsv(targAbs);
  const sourceRows = readCsv(srcAbs);

  const mapped = sourceRows.map(mapRow);
  const seen = new Set(targetRows.slice(1).map(buildKey)); // slice? targetRows are objects incl header parsed; no header row present with columns:true
  // Correction: no need to slice; targetRows are data rows already
  const seen2 = new Set(targetRows.map(buildKey));
  const newRows = [];
  for (const r of mapped) {
    const k = buildKey(r);
    if (!seen2.has(k)) {
      seen2.add(k);
      newRows.push(r);
    }
  }
  const combined = targetRows.concat(newRows);
  const outCsv = stringify(combined, { header: true, columns: TARGET_HEADER });
  if (write) {
    fs.writeFileSync(targAbs, outCsv, 'utf8');
    console.log(`Imported ${newRows.length} volunteer(s) into ${path.relative(process.cwd(), targAbs)} (now ${combined.length})`);
  } else {
    console.log(`[dry-run] Would import ${newRows.length} volunteers into ${path.relative(process.cwd(), targAbs)} (from ${targetRows.length} to ${combined.length})`);
  }
}

main();
