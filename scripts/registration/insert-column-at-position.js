#!/usr/bin/env node
/**
 * Insert an empty column at a specific position in a CSV.
 * - Adds the provided column name to the header at the specified position
 * - Adds empty values to each data row at that position
 * - Shifts all columns after the insert position to the right
 * - Uses AsNeeded quoting
 *
 * Usage:
 *   node scripts/registration/insert-column-at-position.js <file.csv> --position 8 --name "School if Other" [--value ""] [--inplace] [--out out.csv]
 */

const fs = require('fs');
const path = require('path');

function splitCsvRows(text) {
  const rows = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      rows.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.length > 0) rows.push(cur);
  return rows;
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  return splitCsvRows(text).map(parseCsvLine);
}

function needsQuoting(s) {
  return /[",\n\r]/.test(s) || /^\s|\s$/.test(s);
}
function csvEscape(s) { return '"' + s.replace(/"/g, '""') + '"'; }
function stringifyCsv(rows) {
  return rows.map(cols => cols.map(col => {
    const s = String(col == null ? '' : col);
    return needsQuoting(s) ? csvEscape(s) : s;
  }).join(',')).join('\n');
}

function usageAndExit(msg) {
  if (msg) console.error(msg);
  console.error('Usage: node scripts/registration/insert-column-at-position.js <file.csv> --position <col#> --name <columnName> [--value ""] [--inplace] [--out out.csv]');
  process.exit(1);
}

const argv = process.argv.slice(2);
if (argv.length < 1) usageAndExit();

let inPath = undefined;
let position = undefined;
let colName = undefined;
let colValue = '';
let outPath = undefined;
let inplace = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--position') { position = parseInt(argv[++i], 10); continue; }
  if (a === '--name') { colName = argv[++i]; continue; }
  if (a === '--value') { colValue = argv[++i] || ''; continue; }
  if (a === '--out') { outPath = argv[++i]; continue; }
  if (a === '--inplace') { inplace = true; continue; }
  if (!a.startsWith('--') && !inPath) { inPath = a; continue; }
}

if (!inPath) usageAndExit('Missing input file');
if (position == null) usageAndExit('Missing --position <col#>');
if (!colName) usageAndExit('Missing --name <columnName>');
if (!fs.existsSync(inPath)) usageAndExit(`File not found: ${inPath}`);

// Convert to zero-based
const idx = position - 1;

const raw = fs.readFileSync(inPath, 'utf8');
const rows = parseCsv(raw);
if (!rows.length) usageAndExit('Empty CSV');

const outRows = [];
for (let r = 0; r < rows.length; r++) {
  const row = rows[r].slice();
  if (r === 0) {
    // Header: insert column name at position
    row.splice(idx, 0, colName);
  } else {
    // Data: insert value at position
    row.splice(idx, 0, colValue);
  }
  outRows.push(row);
}

const csv = stringifyCsv(outRows);
const target = inplace ? inPath : (outPath || inPath.replace(/\.csv$/i, `.with_col${position}.csv`));
fs.writeFileSync(target, csv, 'utf8');
console.log(`[insert-column-at-position] Inserted "${colName}" at position ${position}. Wrote -> ${path.resolve(target)}`);
