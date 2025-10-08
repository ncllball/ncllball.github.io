// Prepend an Index column computed as <prefix><YY> where YY is derived from a 4-digit year in a specified field (default: Program Name)
// Usage: node scripts/reports/add-index-column.js --file <path.csv> --prefix "WinterAAA/Majors" [--field "Program Name"] [--write]

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

function computeIndex(val, prefix) {
  const m = String(val || '').match(/\b(20\d{2})\b/);
  const year = m ? m[1] : '';
  const yy = year ? year.slice(-2) : '';
  return yy ? `${prefix}${yy}` : prefix;
}

function addIndex(fp, prefix, field) {
  const csv = fs.readFileSync(fp, 'utf8');
  const rows = parse(csv, { columns: true, relax_quotes: true, relax_column_count: true, trim: true, skip_empty_lines: true });
  if (!rows.length) return { outCsv: csv, columns: [], count: 0 };
  const outRows = rows.map(r => ({ Index: computeIndex(r[field], prefix), ...r }));
  const columns = ['Index', ...Object.keys(rows[0])];
  const outCsv = stringify(outRows, { header: true, columns });
  return { outCsv, columns, count: outRows.length };
}

function main() {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i+1] : undefined; };
  const has = (flag) => args.includes(flag);
  const file = get('--file');
  const prefix = get('--prefix') || 'Index';
  const field = get('--field') || 'Program Name';
  const write = has('--write');
  if (!file) {
    console.error('Usage: node scripts/reports/add-index-column.js --file <path.csv> --prefix <Prefix> [--field "Program Name"] [--write]');
    process.exit(1);
  }
  const fp = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(fp)) {
    console.error('File not found:', fp);
    process.exit(1);
  }
  const { outCsv, columns, count } = addIndex(fp, prefix, field);
  if (write) {
    fs.writeFileSync(fp, outCsv, 'utf8');
    console.log(`Updated ${fp}: added Index with prefix "${prefix}" using field "${field}" -> ${columns.length} columns, ${count} rows`);
  } else {
    console.log(`[dry-run] Would update ${fp} with Index prefix "${prefix}" using field "${field}"`);
  }
}

main();
