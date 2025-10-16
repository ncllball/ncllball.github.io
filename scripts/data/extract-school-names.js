/**
 * Extract every school name encountered across repo datasets
 *
 * Outputs:
 *  - scripts/data/school-names.variants.csv: canonical, raw, sources, columns
 *  - scripts/data/school-names.all.csv: canonical, example_raw, variant_count, sources
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const { schoolNormalization, normalizeSchoolName } = require('../summer_comparison/school-mappings.js');

function safeRead(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    return buf;
  } catch (e) {
    return null;
  }
}

function listReportCsvs() {
  const base = path.resolve('.github/projects/reports');
  const out = [];
  if (!fs.existsSync(base)) return out;
  for (const name of fs.readdirSync(base)) {
    if (name.toLowerCase().endsWith('.csv')) {
      out.push(path.join(base, name));
    }
  }
  return out;
}

function splitMulti(value) {
  if (!value || typeof value !== 'string') return [];
  // Split on common multi-value separators
  const parts = value
    .split(/\s*[;|\/]\s+|\s*,\s*\|\s*|\s*\+\s*/g) // conservative
    .flatMap(v => v.split(/\s{2,}\/?\s*/g));
  // If we didn't actually split above, just return the value
  if (parts.length === 1) return [value];
  return parts.filter(Boolean);
}

function isLikelySchoolHeader(h) {
  if (!h) return false;
  const s = String(h).toLowerCase();
  if (!s.includes('school')) return false;
  // exclude clearly unrelated columns
  if (s.includes('school year')) return false;
  if (s.includes('homeschool')) return true; // still a kind of school field
  return true;
}

function collectFromCsv(filePath, acc) {
  const buf = safeRead(filePath);
  if (!buf) return;
  let rows;
  try {
    rows = parse(buf, { columns: true, skip_empty_lines: true });
  } catch {
    return;
  }
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0] || {});
  const schoolCols = headers.filter(isLikelySchoolHeader);
  if (schoolCols.length === 0) return;

  for (const row of rows) {
    for (const col of schoolCols) {
      let raw = row[col];
      if (!raw) continue;
      if (typeof raw !== 'string') raw = String(raw);
      raw = raw.trim();
      if (!raw) continue;

      // Some fields contain addresses after commas; keep raw as-is, normalization will handle known cases
      const candidates = splitMulti(raw);
      for (const candidateRaw of candidates) {
        const rawVal = (candidateRaw || '').trim();
        if (!rawVal) continue;
        const canonical = normalizeSchoolName(rawVal);
        const key = `${canonical}\u0001${rawVal}`; // key per canonical+raw
        if (!acc.has(key)) {
          acc.set(key, { canonical, raw: rawVal, sources: new Set(), columns: new Set() });
        }
        const entry = acc.get(key);
        entry.sources.add(filePath);
        entry.columns.add(col);
      }
    }
  }
}

function collectFromMappings(acc) {
  for (const [raw, canonical] of Object.entries(schoolNormalization)) {
    const rawVal = raw.trim();
    const canon = canonical.trim();
    const key = `${canon}\u0001${rawVal}`;
    if (!acc.has(key)) {
      acc.set(key, { canonical: canon, raw: rawVal, sources: new Set(), columns: new Set() });
    }
    const entry = acc.get(key);
    entry.sources.add('scripts/summer_comparison/school-mappings.js');
    entry.columns.add('mapping');
  }
}

function writeCsv(filePath, records, columns) {
  const csv = stringify(records, { header: true, columns });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);
}

function main() {
  const acc = new Map();

  // Known primary sources
  const sources = [
    path.resolve('master.summerball.csv'),
    path.resolve('temp_other_schools.csv'),
    ...listReportCsvs(),
    path.resolve('scripts/data/school-addresses.csv')
  ];

  for (const src of sources) {
    collectFromCsv(src, acc);
  }
  collectFromMappings(acc);

  // Build variants output
  const variants = Array.from(acc.values())
    .map(v => ({
      canonical: v.canonical,
      raw: v.raw,
      sources: Array.from(v.sources).sort().join('; '),
      columns: Array.from(v.columns).sort().join('; ')
    }))
    .sort((a, b) => a.canonical.localeCompare(b.canonical) || a.raw.localeCompare(b.raw));

  // Build canonical summary
  const byCanonical = new Map();
  for (const v of variants) {
    if (!byCanonical.has(v.canonical)) {
      byCanonical.set(v.canonical, { canonical: v.canonical, example_raw: v.raw, variant_count: 0, sources: new Set() });
    }
    const e = byCanonical.get(v.canonical);
    e.variant_count += 1;
    for (const src of v.sources.split('; ')) if (src) e.sources.add(src);
  }
  const summary = Array.from(byCanonical.values())
    .map(e => ({
      canonical: e.canonical,
      example_raw: e.example_raw,
      variant_count: e.variant_count,
      sources: Array.from(e.sources).sort().join('; ')
    }))
    .sort((a, b) => a.canonical.localeCompare(b.canonical));

  const outDir = path.resolve('scripts/data');
  writeCsv(path.join(outDir, 'school-names.variants.csv'), variants, ['canonical', 'raw', 'sources', 'columns']);
  writeCsv(path.join(outDir, 'school-names.all.csv'), summary, ['canonical', 'example_raw', 'variant_count', 'sources']);

  console.log(`Collected ${variants.length} raw school variants across ${summary.length} canonical schools.`);
  console.log(`Wrote:\n - ${path.join(outDir, 'school-names.variants.csv')}\n - ${path.join(outDir, 'school-names.all.csv')}`);
}

if (require.main === module) {
  main();
}
