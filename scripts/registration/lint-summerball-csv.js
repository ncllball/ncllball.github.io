#!/usr/bin/env node
/**
 * Lints and normalizes Summer Ball CSV exports from SportsEngine.
 * - Trims leading/trailing whitespace for unquoted fields
 * - Collapses internal multiple spaces to single for name-like fields
 * - Normalizes certain boolean-ish values (Yes/No/Not right now)
 * - Validates consistent column counts
 * - Reports anomalies to stdout and writes an optional cleaned CSV
 *
 * Usage:
 *   node scripts/registration/lint-summerball-csv.js "path/to/file.csv" [--write] [--out cleaned.csv]
 */

const fs = require('fs');
const path = require('path');

// Minimal CSV utilities (handles quotes, commas, CRLF; no embedded newlines inside fields assumed but supported)
function splitCsvRows(text) {
  const rows = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      // Double-quote inside quoted field
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // End of row (handle CRLF and LF)
      if (ch === '\r' && text[i + 1] === '\n') i++;
      rows.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.length > 0) rows.push(cur);
  // Remove possible trailing empty line
  return rows;
}

function parseCsv(text) {
  const lines = splitCsvRows(text);
  return lines.map(parseCsvLine);
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

function needsQuoting(s) {
  return /[\",\n\r]/.test(s) || /^\s|\s$/.test(s);
}

function csvEscape(s) {
  let v = s.replace(/"/g, '""');
  return `"${v}"`;
}

function stringifyCsv(rows) {
  return rows.map(function(cols) {
    return cols.map(function(col) {
      const s = String(col == null ? '' : col);
      return needsQuoting(s) ? csvEscape(s) : s;
    }).join(',');
  }).join('\n');
}

function usageAndExit(msg) {
  if (msg) console.error(msg);
  console.error('Usage: node scripts/registration/lint-summerball-csv.js <file.csv> [--write] [--out <clean.csv>]');
  process.exit(1);
}

const argv = process.argv.slice(2);
if (argv.length < 1) usageAndExit();

const inPath = argv[0];
const write = argv.indexOf('--write') !== -1;
const outIndex = argv.indexOf('--out');
const outPath = outIndex !== -1 ? argv[outIndex + 1] : undefined;
const issuesJsonIndex = argv.indexOf('--issues-out');
const issuesJsonPathArg = issuesJsonIndex !== -1 ? argv[issuesJsonIndex + 1] : undefined;
const issuesCsvIndex = argv.indexOf('--issues-csv');
const issuesCsvPathArg = issuesCsvIndex !== -1 ? argv[issuesCsvIndex + 1] : undefined;
const repair = argv.indexOf('--repair') !== -1;
const repairOutIndex = argv.indexOf('--repair-out');
const repairOutPath = repairOutIndex !== -1 ? argv[repairOutIndex + 1] : undefined;

if (!fs.existsSync(inPath)) usageAndExit(`File not found: ${inPath}`);

const raw = fs.readFileSync(inPath, 'utf8');
const rawLines = splitCsvRows(raw);

// Parse with headers row preserved
let records;
let header;
try {
  records = parseCsv(raw);
  if (!records || records.length === 0) throw new Error('Empty CSV');
  header = records[0];
} catch (e) {
  console.error('CSV parse failed:', e.message);
  process.exit(2);
}

const report = {
  input: path.resolve(inPath),
  rows: records.length - 1,
  headerColumns: header.length,
  inconsistentColumnRows: [],
  trimmedFields: 0,
  collapsedSpaces: 0,
  yesNoNormalized: 0,
  phonesNormalized: 0,
  statesUppercased: 0,
  zipsNormalized: 0,
  programsFilled: 0,
  emptyRequired: [],
};

// Determine columns by name (avoid Object.fromEntries for older Node)
const idxByName = {};
for (var iName = 0; iName < header.length; iName++) {
  idxByName[String(header[iName]).trim()] = iName;
}

// Candidate fields for human names and addresses to collapse spaces
const collapseFields = [
  'athlete_1_first_name','athlete_1_middle_name','athlete_1_last_name',
  'guardian_1_first_name','guardian_1_last_name','guardian_2_first_name','guardian_2_last_name',
  'athlete_1_address_1','athlete_1_address_1_cont','athlete_1_city_1'
].filter(function(n){ return n in idxByName; });

// Yes/No normalization targets
const yesNoFields = [
  'willing-volunteer','Photo Waiver','Agreement','Sport Parent Code of Conduct Agreement','Athlete Agreement','Parent/Guardian Agreement'
].filter(function(n){ return n in idxByName; });

// Required columns to exist and not be empty on data rows
const requiredFields = [
  'athlete_1_first_name','athlete_1_last_name','athlete_1_dob','Program','Entry Status'
].filter(function(n){ return n in idxByName; });

const normalized = [header.slice()];
let repairedRows = 0;

function normalizeYesNo(val) {
  const s = String(val).trim().toLowerCase();
  if (!s) return val;
  if (['yes','y','true','1'].includes(s)) return 'Yes';
  if (['no','n','false','0'].includes(s)) return 'No';
  if (s.startsWith('not right')) return 'Not right now';
  return val; // preserve unknown
}

function collapseSpaces(s) {
  const before = s;
  // Collapse runs of 2+ spaces inside the string (but keep single spaces)
  s = s.replace(/\s{2,}/g, ' ');
  if (s !== before) report.collapsedSpaces++;
  return s;
}

// Phone/state/ZIP helpers
const phoneFields = [
  'Guardian_1_Primary_Phone','Guardian_1_Secondary_Phone',
  'guardian_2_phone_1','guardian_2_phone_3',
  'emergency_1_phone_1','emergency_1_phone_2','emergency_2_phone_1','emergency_2_phone_2',
  'physician_1_phone_1'
].filter(function(n){ return n in idxByName; });

function formatPhone(val) {
  const digits = String(val).replace(/\D+/g, '');
  if (!digits) return val;
  let d = digits;
  if (d.length === 11 && d[0] === '1') d = d.slice(1);
  if (d.length === 10) return d.slice(0,3) + '-' + d.slice(3,6) + '-' + d.slice(6);
  return val; // leave non-10-digit as-is
}

function normalizeZip(val) {
  const digits = String(val).replace(/\D+/g, '');
  if (digits.length === 5) return digits;
  if (digits.length === 9) return digits.slice(0,5) + '-' + digits.slice(5);
  return val;
}

for (let r = 1; r < records.length; r++) {
  const row = records[r].map(function(v){ return (v === null || v === undefined) ? '' : String(v); });

  // Column count check
  if (row.length !== header.length) {
    report.inconsistentColumnRows.push({ row: r + 1, columns: row.length });
  }

  // Trim all fields' outer whitespace
  for (let c = 0; c < row.length; c++) {
    const before = row[c];
    const after = before.trim();
    if (after !== before) report.trimmedFields++;
    row[c] = after;
  }

  // Collapse spaces on selected fields
  for (const name of collapseFields) {
    const i = idxByName[name];
    if (i !== undefined && i < row.length) row[i] = collapseSpaces(row[i]);
  }

  // Normalize Yes/No style fields
  for (const name of yesNoFields) {
    const i = idxByName[name];
    if (i !== undefined && i < row.length) {
      const before = row[i];
      const after = normalizeYesNo(before);
      if (after !== before) report.yesNoNormalized++;
      row[i] = after;
    }
  }

  // Normalize phones
  for (const name of phoneFields) {
    const i = idxByName[name];
    if (i !== undefined && i < row.length) {
      const before = row[i];
      const after = formatPhone(before);
      if (after !== before) report.phonesNormalized++;
      row[i] = after;
    }
  }

  // Normalize state/zip
  if ('athlete_1_state_1' in idxByName) {
    const i = idxByName['athlete_1_state_1'];
    if (i < row.length) {
      const before = row[i];
      const after = String(before).trim().toUpperCase();
      if (after !== before) report.statesUppercased++;
      row[i] = after;
    }
  }
  if ('athlete_1_zip_1' in idxByName) {
    const i = idxByName['athlete_1_zip_1'];
    if (i < row.length) {
      const before = row[i];
      const after = normalizeZip(before);
      if (after !== before) report.zipsNormalized++;
      row[i] = after;
    }
  }

  // Fill Program if empty based on division/role
  if ('Program' in idxByName) {
    const iProg = idxByName['Program'];
    const prog = (iProg < row.length) ? String(row[iProg]).trim() : '';
    if (!prog) {
      const softDiv = ('Softball Division' in idxByName && idxByName['Softball Division'] < row.length) ? String(row[idxByName['Softball Division']]).trim() : '';
      const baseDiv = ('Baseball Division' in idxByName && idxByName['Baseball Division'] < row.length) ? String(row[idxByName['Baseball Division']]).trim() : '';
      const roleG = ('Role (Girl)' in idxByName && idxByName['Role (Girl)'] < row.length) ? String(row[idxByName['Role (Girl)']]).trim().toUpperCase() : '';
      const roleB = ('Role (Boy)' in idxByName && idxByName['Role (Boy)'] < row.length) ? String(row[idxByName['Role (Boy)']]).trim().toUpperCase() : '';
      let fill = '';
      if (softDiv || roleG === 'G') fill = 'Softball';
      else if (baseDiv || roleB === 'B') fill = 'Baseball';
      if (fill) {
        row[iProg] = fill;
        report.programsFilled++;
      }
    }
  }

  // Required not empty
  for (const name of requiredFields) {
    const i = idxByName[name];
    if (i !== undefined && i < row.length) {
      if (!String(row[i]).trim()) report.emptyRequired.push({ row: r + 1, field: name });
    }
  }

  normalized.push(row);
}

// Output report
console.log('[registration:lint] Summary');
console.log(JSON.stringify(report, null, 2));

if (write) {
  const outputPath = outPath || inPath.replace(/\.csv$/i, '.clean.csv');
  const csv = stringifyCsv(normalized);
  fs.writeFileSync(outputPath, csv, 'utf8');
  console.log(`[registration:lint] Wrote cleaned CSV -> ${path.resolve(outputPath)}`);
}

// Create detailed issues report for inconsistent rows
if (report.inconsistentColumnRows.length > 0) {
  const selectedFields = [
    'athlete_1_first_name','athlete_1_last_name','Guardian_1_Email','guardian_1_first_name','guardian_1_last_name',
    'athlete_1_address_1','Team Request','hospital_of_choice_1','Baseball Division','Softball Division','Program','Entry Status'
  ].filter(function(n){ return n in idxByName; });

  const issues = report.inconsistentColumnRows.map(function(item) {
    const rowIdx = item.row - 1; // zero-based in rawLines/records
    const parsed = (rowIdx >= 0 && rowIdx < records.length) ? records[rowIdx] : [];
    const snapshot = {};
    for (var k = 0; k < selectedFields.length; k++) {
      var name = selectedFields[k];
      var i = idxByName[name];
      if (typeof i === 'number' && i < parsed.length) snapshot[name] = parsed[i];
    }
    const rawLine = (rowIdx >= 0 && rowIdx < rawLines.length) ? rawLines[rowIdx] : '';
    return {
      row: item.row,
      expectedColumns: header.length,
      foundColumns: item.columns,
      rawPreview: rawLine.length > 300 ? rawLine.slice(0, 300) + '…' : rawLine,
      boundaryPreview: parsed.slice(Math.max(0, header.length - 3), Math.min(parsed.length, header.length + 3)),
      keyFields: snapshot
    };
  });

  const issuesJsonPath = issuesJsonPathArg || inPath.replace(/\.csv$/i, '.issues.json');
  fs.writeFileSync(issuesJsonPath, JSON.stringify({ input: path.resolve(inPath), issues: issues }, null, 2), 'utf8');
  console.log(`[registration:lint] Wrote issues JSON -> ${path.resolve(issuesJsonPath)}`);

  // Also write a CSV summary
  const issuesCsvPath = issuesCsvPathArg || inPath.replace(/\.csv$/i, '.issues.csv');
  const issuesCsvRows = [];
  const issuesCsvHeader = ['row','expectedColumns','foundColumns','keyFields','boundaryPreview','rawPreview'];
  issuesCsvRows.push(issuesCsvHeader);
  for (var j = 0; j < issues.length; j++) {
    var it = issues[j];
    var keyFieldsStr = JSON.stringify(it.keyFields);
    var boundaryStr = JSON.stringify(it.boundaryPreview);
    issuesCsvRows.push([
      String(it.row),
      String(it.expectedColumns),
      String(it.foundColumns),
      keyFieldsStr,
      boundaryStr,
      it.rawPreview
    ]);
  }
  fs.writeFileSync(issuesCsvPath, stringifyCsv(issuesCsvRows), 'utf8');
  console.log(`[registration:lint] Wrote issues CSV -> ${path.resolve(issuesCsvPath)}`);
}

// Auto-repair: try to merge extra comma fragments in known free-text columns to reach header length
if (repair) {
  const freeTextHeaders = [
    'Team Request',
    'Agreement',
    'Sport Parent Code of Conduct Agreement',
    'Athlete Agreement',
    'Parent/Guardian Agreement',
    'Does the player have any other medical conditions that we need to be aware of?',
    'athlete_1_address_1_cont',
    'athlete_1_address_1',
    'hospital_of_choice_1'
  ];
  const freeIdx = {};
  for (var fi = 0; fi < freeTextHeaders.length; fi++) {
    var name = freeTextHeaders[fi];
    if (name in idxByName) freeIdx[idxByName[name]] = true;
  }

  const repaired = [header.slice()];
  for (let r = 1; r < records.length; r++) {
    let row = records[r].map(function(v){ return (v === null || v === undefined) ? '' : String(v); });

    if (row.length > header.length) {
      let i = 0;
      while (i < header.length && row.length > header.length) {
        if (freeIdx[i]) {
          // Merge current with next
          row[i] = row[i] + ',' + row[i + 1];
          row.splice(i + 1, 1);
          repairedRows++;
          continue; // re-evaluate same index if still long
        }
        i++;
      }
      // If still too long, last-resort: merge into the last column before trailing block
      while (row.length > header.length) {
        const lastMergable = Math.max(0, header.length - 2);
        row[lastMergable] = row[lastMergable] + ',' + row[lastMergable + 1];
        row.splice(lastMergable + 1, 1);
        repairedRows++;
      }
    }
    if (row.length < header.length) {
      // Pad with empties
      while (row.length < header.length) row.push('');
      repairedRows++;
    }
    // After structure repair, apply same normalizations as above (trim, collapse, yes/no, phones, state/zip, program fill)
    for (let c = 0; c < row.length; c++) {
      const before = row[c];
      const after = String(before).trim();
      if (after !== before) report.trimmedFields++;
      row[c] = after;
    }
    for (const name2 of collapseFields) {
      const i2 = idxByName[name2];
      if (i2 !== undefined && i2 < row.length) row[i2] = collapseSpaces(row[i2]);
    }
    for (const name3 of yesNoFields) {
      const i3 = idxByName[name3];
      if (i3 !== undefined && i3 < row.length) {
        const b3 = row[i3];
        const a3 = normalizeYesNo(b3);
        if (a3 !== b3) report.yesNoNormalized++;
        row[i3] = a3;
      }
    }
    for (const name4 of phoneFields) {
      const i4 = idxByName[name4];
      if (i4 !== undefined && i4 < row.length) {
        const b4 = row[i4];
        const a4 = formatPhone(b4);
        if (a4 !== b4) report.phonesNormalized++;
        row[i4] = a4;
      }
    }
    if ('athlete_1_state_1' in idxByName) {
      const is = idxByName['athlete_1_state_1'];
      if (is < row.length) {
        const bs = row[is];
        const as = String(bs).trim().toUpperCase();
        if (as !== bs) report.statesUppercased++;
        row[is] = as;
      }
    }
    if ('athlete_1_zip_1' in idxByName) {
      const iz = idxByName['athlete_1_zip_1'];
      if (iz < row.length) {
        const bz = row[iz];
        const az = normalizeZip(bz);
        if (az !== bz) report.zipsNormalized++;
        row[iz] = az;
      }
    }
    if ('Program' in idxByName) {
      const ip = idxByName['Program'];
      const pv = (ip < row.length) ? String(row[ip]).trim() : '';
      if (!pv) {
        const softDiv = ('Softball Division' in idxByName && idxByName['Softball Division'] < row.length) ? String(row[idxByName['Softball Division']]).trim() : '';
        const baseDiv = ('Baseball Division' in idxByName && idxByName['Baseball Division'] < row.length) ? String(row[idxByName['Baseball Division']]).trim() : '';
        const roleG = ('Role (Girl)' in idxByName && idxByName['Role (Girl)'] < row.length) ? String(row[idxByName['Role (Girl)']]).trim().toUpperCase() : '';
        const roleB = ('Role (Boy)' in idxByName && idxByName['Role (Boy)'] < row.length) ? String(row[idxByName['Role (Boy)']]).trim().toUpperCase() : '';
        let fill = '';
        if (softDiv || roleG === 'G') fill = 'Softball';
        else if (baseDiv || roleB === 'B') fill = 'Baseball';
        if (fill) {
          row[ip] = fill;
          report.programsFilled++;
        }
      }
    }

    repaired.push(row);
  }

  const repairedPath = repairOutPath || inPath.replace(/\.csv$/i, '.repaired.csv');
  fs.writeFileSync(repairedPath, stringifyCsv(repaired), 'utf8');
  console.log(`[registration:lint] Auto-repair complete. Repaired rows: ${repairedRows}. Wrote -> ${path.resolve(repairedPath)}`);
}
