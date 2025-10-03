#!/usr/bin/env node
/**
 * Merge date and time columns that were split (e.g., Registration Date split into date + time).
 * - Concatenates values from specified columns
 * - Removes the second column
 * - Preserves all headers unchanged
 * - Uses AsNeeded quoting
 *
 * Usage:
 *   node scripts/registration/merge-datetime-columns.js <file.csv> --col1 7 --col2 8 [--separator ", "] [--inplace] [--out out.csv]
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
  console.error('Usage: node scripts/registration/merge-datetime-columns.js <file.csv> --col1 <idx1> --col2 <idx2> [--separator ", "] [--inplace] [--out out.csv]');
  process.exit(1);
}

const argv = process.argv.slice(2);
if (argv.length < 1) usageAndExit();

let inPath = undefined;
let col1 = undefined;
let col2 = undefined;
let separator = ', ';
let outPath = undefined;
let inplace = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--col1') { col1 = parseInt(argv[++i], 10); continue; }
  if (a === '--col2') { col2 = parseInt(argv[++i], 10); continue; }
  if (a === '--separator') { separator = argv[++i]; continue; }
  if (a === '--out') { outPath = argv[++i]; continue; }
  if (a === '--inplace') { inplace = true; continue; }
  if (!a.startsWith('--') && !inPath) { inPath = a; continue; }
}

if (!inPath) usageAndExit('Missing input file');
if (col1 == null || col2 == null) usageAndExit('Missing --col1 and --col2');
if (!fs.existsSync(inPath)) usageAndExit(`File not found: ${inPath}`);

// Convert to zero-based
const idx1 = col1 - 1;
const idx2 = col2 - 1;
if (idx2 !== idx1 + 1) {
  console.warn('Warning: col2 is not immediately after col1; result may be unexpected');
}

const raw = fs.readFileSync(inPath, 'utf8');
const rows = parseCsv(raw);
if (!rows.length) usageAndExit('Empty CSV');

const outRows = [];
for (let r = 0; r < rows.length; r++) {
  const row = rows[r].slice();
  if (r === 0) {
    // Header: keep both headers as-is but remove the second one
    if (idx2 < row.length) row.splice(idx2, 1);
  } else {
    // Data: merge values and remove the second column
    if (idx1 < row.length && idx2 < row.length) {
      const val1 = String(row[idx1] || '').trim();
      const val2 = String(row[idx2] || '').trim();
      row[idx1] = val1 && val2 ? val1 + separator + val2 : val1 || val2;
      row.splice(idx2, 1);
    }
  }
  outRows.push(row);
}

const csv = stringifyCsv(outRows);
const target = inplace ? inPath : (outPath || inPath.replace(/\.csv$/i, '.merged.csv'));
fs.writeFileSync(target, csv, 'utf8');
console.log(`[merge-datetime-columns] Merged col${col1} + col${col2}, removed col${col2}. Wrote -> ${path.resolve(target)}`);
