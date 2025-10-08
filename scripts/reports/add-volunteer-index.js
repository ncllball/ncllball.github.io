// Add an Index column formatted as VolunteersYY based on year found in Program Name
// Usage: node scripts/reports/add-volunteer-index.js [--file .github/projects/reports/volunteers.csv] [--write]

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const DEFAULT_FILE = path.join('.github', 'projects', 'reports', 'volunteers.csv');

function computeIndex(program) {
  const m = String(program || '').match(/\b(20\d{2})\b/);
  const year = m ? m[1] : '';
  const yy = year ? year.slice(-2) : '';
  return yy ? `Volunteers${yy}` : 'Volunteers';
}

function addIndex(fp) {
  const csv = fs.readFileSync(fp, 'utf8');
  const rows = parse(csv, { columns: true, relax_quotes: true, relax_column_count: true, trim: true, skip_empty_lines: true });
  const out = rows.map(r => ({ Index: computeIndex(r['Program Name']), ...r }));
  const columns = ['Index', ...Object.keys(rows[0] || {})];
  const outCsv = stringify(out, { header: true, columns });
  return { outCsv, columns, count: out.length };
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
  const { outCsv, columns, count } = addIndex(fp);
  if (write) {
    fs.writeFileSync(fp, outCsv, 'utf8');
    console.log(`Updated ${fp} with Index column: ${columns.length} columns, ${count} rows`);
  } else {
    console.log(`[dry-run] Would add Index column to ${fp} with columns: ${columns.join(', ')}`);
  }
}

main();
