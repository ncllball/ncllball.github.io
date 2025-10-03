const fs = require('fs');

function splitCsvRows(text) {
  const rows = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\"') {
      if (inQuotes && text[i + 1] === '\"') {
        cur += '\"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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
    if (ch === '\"') {
      if (inQuotes && line[i + 1] === '\"') {
        cur += '\"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur.trim()); // TRIM HERE
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim()); // TRIM HERE
  return out;
}

function needsQuoting(s) {
  return /[\"",\n\r]/.test(s) || /^\s|\s$/.test(s);
}

function csvEscape(s) {
  return '\"' + s.replace(/\"/g, '\"\"') + '\"';
}

function stringifyCsv(rows) {
  return rows.map(function(cols) {
    return cols.map(function(col) {
      const s = String(col == null ? '' : col);
      return needsQuoting(s) ? csvEscape(s) : s;
    }).join(',');
  }).join('\n');
}

const inputFile = process.argv[2];
const content = fs.readFileSync(inputFile, 'utf8');
const lines = splitCsvRows(content);
const rows = lines.map(parseCsvLine);
const output = stringifyCsv(rows);
fs.writeFileSync(inputFile, output, 'utf8');
console.log('[trim-and-quote] Processed', rows.length, 'rows. Trimmed all values. Applied AsNeeded quoting.');
