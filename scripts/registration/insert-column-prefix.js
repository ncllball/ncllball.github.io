#!/usr/bin/env node
/**
 * Insert a new column at the beginning of a CSV.
 * - Adds the provided column name to the header
 * - Adds the provided value to each data row
 * - Uses AsNeeded quoting when writing
 * - Does NOT trim or alter existing cell values
 *
 * Usage:
 *   node scripts/registration/insert-column-prefix.js <file.csv> --name programName --value Summerball22 [--inplace] [--out out.csv]
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
  console.error('Usage: node scripts/registration/insert-column-prefix.js <file.csv> --name <columnName> --value <value> [--inplace] [--out out.csv]');
  process.exit(1);
}

const argv = process.argv.slice(2);
if (argv.length < 1) usageAndExit();

let inPath = undefined;
let colName = undefined;
let colValue = '';
let outPath = undefined;
let inplace = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--name') { colName = argv[++i]; continue; }
  if (a === '--value') { colValue = argv[++i] || ''; continue; }
  if (a === '--out') { outPath = argv[++i]; continue; }
  if (a === '--inplace') { inplace = true; continue; }
  if (!a.startsWith('--') && !inPath) { inPath = a; continue; }
}

if (!inPath) usageAndExit('Missing input file');
if (!colName) usageAndExit('Missing --name <columnName>');
if (!fs.existsSync(inPath)) usageAndExit(`File not found: ${inPath}`);

const raw = fs.readFileSync(inPath, 'utf8');
const rows = parseCsv(raw);
if (!rows.length) usageAndExit('Empty CSV');

// Insert new column at beginning
const outRows = [];
for (let r = 0; r < rows.length; r++) {
  const row = rows[r].slice(); // preserve as-is
  if (r === 0) row.unshift(colName);
  else row.unshift(colValue);
  outRows.push(row);
}

const csv = stringifyCsv(outRows);
const target = inplace ? inPath : (outPath || inPath.replace(/\.csv$/i, `.with_${colName}.csv`));
fs.writeFileSync(target, csv, 'utf8');
console.log(`[insert-column-prefix] Wrote -> ${path.resolve(target)}`);
