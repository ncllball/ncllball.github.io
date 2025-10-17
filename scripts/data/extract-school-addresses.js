const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Try to import the richer normalization/mapping if available
let normalizeSchoolName = (s) => (s || '').trim();
let schoolNormalization = {};
try {
  const maps = require(path.join(__dirname, '..', 'summer_comparison', 'school-mappings.js'));
  normalizeSchoolName = maps.normalizeSchoolName || normalizeSchoolName;
  schoolNormalization = maps.schoolNormalization || {};
} catch (_) {
  try {
    const maps = require('./normalize-schools.js');
    normalizeSchoolName = maps.normalizeSchoolName || normalizeSchoolName;
  } catch (_) {}
}

const INPUT_FILES = [
  path.join(__dirname, '..', '..', '..', 'master.summerball.csv'),
  path.join(__dirname, '..', '..', '..', '.github', 'projects', 'reports', 'regularseason.csv'),
];

const OUTPUT_FILE = path.join(__dirname, 'school-addresses.csv');
const MANUAL_FILE = path.join(__dirname, 'school-addresses.manual.csv');

// Heuristic to detect a field that looks like "<School>, <street>, <City>, WA <zip>"
const looksLikeSchoolWithAddress = (val) => {
  if (typeof val !== 'string') return false;
  const s = val.trim();
  if (!s) return false;
  // Must look like an educational institution and have a WA ZIP pattern with commas separating parts
  // Expanded keywords to catch independent schools like "Seattle Academy"
  if (!/(Elementary|School|Middle|High|K-?8|Academy|Cooperative|Prep)/i.test(s)) return false;
  if (!/,\s*[^,]+,\s*WA\s*\d{5}/i.test(s)) return false;
  return true;
};

function parseSchoolAddressField(field) {
  // Split on commas, trim, drop empties
  const parts = field
    .split(',')
    .map((p) => p.replace(/\"/g, '').trim())
    .filter((p) => p.length > 0);

  if (parts.length < 4) {
    // Fallback: cannot reliably parse
    return null;
  }

  const schoolRaw = parts[0];
  const school = normalizeSchoolName(schoolRaw);
  // Street could contain commas (apt/unit), so join the middle
  const city = parts[parts.length - 2];
  const stateZip = parts[parts.length - 1].split(/\s+/);
  const state = stateZip[0] || '';
  const zip = stateZip[1] || '';
  const street = parts.slice(1, parts.length - 2).join(', ');

  return { school, street, city, state, zip };
}

function collectFromCSV(filePath, acc) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  // Parse as generic CSV without headers
  const records = csv.parse(content, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
  });

  for (const rec of records) {
    for (const field of rec) {
      if (looksLikeSchoolWithAddress(field)) {
        const parsed = parseSchoolAddressField(field);
        if (parsed && parsed.school) {
          upsertSchool(acc, { ...parsed, source: 'csv' });
        }
      }
    }
  }
}

function collectFromMappings(acc) {
  // Keys in schoolNormalization that include an address pattern
  const entries = Object.keys(schoolNormalization || {});
  for (const key of entries) {
    if (looksLikeSchoolWithAddress(key)) {
      const parsed = parseSchoolAddressField(key);
      if (parsed && parsed.school) {
        upsertSchool(acc, { ...parsed, source: 'mappings' });
      }
    }
  }
}

function chooseBetter(existing, incoming) {
  // Prefer Seattle addresses if conflict, else keep existing
  const isSeattle = (x) => (x.city || '').toLowerCase().includes('seattle');
  if (!existing) return incoming;
  // If existing is manual/authoritative, keep it unless it's missing basic fields and incoming fills them
  const existingManual = /manual|authoritative/i.test(existing.source || '');
  const incomingManual = /manual|authoritative/i.test(incoming.source || '');
  if (existingManual && !incomingManual) {
    // Only upgrade if existing is missing street/city/state/zip and incoming has them
    const missing = !existing.street || !existing.city || !existing.state || !existing.zip;
    if (!missing) return existing;
  }
  if (!existing.street && incoming.street) return incoming;
  if (!isSeattle(existing) && isSeattle(incoming)) return incoming;
  // If zips differ and one exists, prefer the one with a zip
  if ((!existing.zip && incoming.zip) || (incoming.zip && incoming.zip !== existing.zip && /^98\d{3}$/.test(incoming.zip))) {
    return incoming;
  }
  return existing;
}

function upsertSchool(acc, entry) {
  const key = entry.school;
  const current = acc.get(key);
  acc.set(key, chooseBetter(current, entry));
}

function main() {
  const acc = new Map();
  // First: seed with manual authoritative addresses if present
  if (fs.existsSync(MANUAL_FILE)) {
    const manualCsv = fs.readFileSync(MANUAL_FILE, 'utf-8');
    const rows = csv.parse(manualCsv, { columns: true, skip_empty_lines: true });
    for (const r of rows) {
      const school = normalizeSchoolName(r.school);
      if (!school) continue;
      const entry = {
        school,
        street: (r.street || '').trim(),
        city: (r.city || '').trim(),
        state: (r.state || '').trim(),
        zip: (r.zip || '').trim(),
        source: (r.source || 'manual').trim() || 'manual',
      };
      acc.set(school, entry);
    }
  }
  // Collect from mappings first (good canonical set)
  collectFromMappings(acc);
  // Then from CSVs
  for (const f of INPUT_FILES) {
    collectFromCSV(f, acc);
  }

  // Serialize
  const rows = Array.from(acc.values())
    .sort((a, b) => a.school.localeCompare(b.school));

  const csvOut = stringify([
    ['school', 'street', 'city', 'state', 'zip', 'source'],
    ...rows.map((r) => [r.school, r.street || '', r.city || '', r.state || '', r.zip || '', r.source || 'auto']),
  ], {
    header: false,
  });

  fs.writeFileSync(OUTPUT_FILE, csvOut, 'utf-8');
  console.log(`\nWrote ${rows.length} schools to ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main();
}
