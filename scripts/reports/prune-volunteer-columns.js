// Remove sensitive/compliance columns from volunteers.csv
// Usage: node scripts/reports/prune-volunteer-columns.js [--file .github/projects/reports/volunteers.csv] [--write]

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const DEFAULT_FILE = path.join('.github', 'projects', 'reports', 'volunteers.csv');
const DROP = new Set([
  'Background Check Status',
  'Background Check Submitted Date',
  'Background Check Cleared Date',
  'SafeSport Status',
  'SafeSport Completed Date',
  'Abuse Awareness Date',
  'Concussion Training Date',
]);

function prune(fp) {
  const csv = fs.readFileSync(fp, 'utf8');
  const rows = parse(csv, { columns: true, relax_quotes: true, relax_column_count: true, trim: true, skip_empty_lines: true });
  if (!rows.length) return { columns: [], rows: [] };
  const columns = Object.keys(rows[0]).filter(c => !DROP.has(c));
  const out = rows.map(r => {
    const o = {};
    for (const c of columns) o[c] = r[c] ?? '';
    return o;
  });
  const outCsv = stringify(out, { header: true, columns });
  return { columns, outCsv, count: out.length };
}

function main() {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i+1] : undefined; };
  const has = (flag) => args.includes(flag);
  const file = get('--file') || DEFAULT_FILE;
  const write = has('--write');
  const fp = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(fp)) {
    console.error('File not found:', fp);
    process.exit(1);
  }
  const { columns, outCsv, count } = prune(fp);
  if (write) {
    fs.writeFileSync(fp, outCsv, 'utf8');
    console.log(`Pruned ${fp}: now ${columns.length} columns, ${count} rows`);
  } else {
    console.log(`[dry-run] Would prune columns from ${fp}: -> ${columns.join(', ')}`);
  }
}

main();
