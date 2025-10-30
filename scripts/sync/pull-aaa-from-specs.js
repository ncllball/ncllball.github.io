const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const specsPath = path.join(repoRoot, 'Parents', 'sizing', 'specs.md');
const targetHtml = path.join(repoRoot, 'Parents', 'uniforms-play.html');

function readSpecs() {
  return fs.readFileSync(specsPath, 'utf8');
}

function extractCsvBlock(md, heading) {
  const idx = md.indexOf(heading);
  if (idx === -1) return null;
  const after = md.slice(idx + heading.length);
  // find first line that looks like CSV header (contains comma)
  const lines = after.split(/\r?\n/);
  let start = 0;
  while (start < lines.length && !lines[start].includes(',')) start++;
  if (start >= lines.length) return null;
  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) break; // blank line ends block
    // stop at a markdown heading
    if (line.startsWith('#')) break;
    // ignore image lines
    if (line.startsWith('![')) continue;
    rows.push(line);
  }
  return rows;
}

function extractMdTable(md, heading) {
  const idx = md.indexOf(heading);
  if (idx === -1) return null;
  const after = md.slice(idx + heading.length);
  const lines = after.split(/\r?\n/);
  const rows = [];
  let inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      inTable = true;
      rows.push(line);
      continue;
    }
    if (inTable) break;
  }
  if (!inTable) return null;
  // parse rows, ignoring separator row (---)
  const parsed = rows.filter(r => !/^\|[-\s:|]+$/.test(r)).map(r => {
    return r.split('|').slice(1, -1).map(c => c.trim());
  });
  return parsed; // array of arrays
}

function build4003Table(rows) {
  // rows: header then data rows like 'YS,12-13'
  const header = rows[0].split(',').map(s => s.trim());
  const data = rows.slice(1).map(r => r.split(',').map(s => s.trim()));
  // We expect data as [ [size, value], ... ]
  const sizes = data.map(r => r[0]);
  const values = data.map(r => r[1]);
  const ths = sizes.map(s => `<th>${s}</th>`).join('\n                                                ');
  const tds = values.map(v => `<td>${v}</td>`).join('\n                                                ');
  return `<table class="ncll-micro__table" aria-describedby="4003-aaa-caption">
                                        <caption id="4003-aaa-caption" class="sr-only">Shirt 4003 pit-to-pit measurements in inches for sizes ${sizes.join(', ')}.</caption>
                                        <thead>
                                            <tr>
                                                ${ths}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                ${tds}
                                            </tr>
                                        </tbody>
                                    </table>`;
}

function buildPc90hTable(rows, captionId) {
  // rows include header then data rows like 'AS,20,28'
  const header = rows[0].split(',').map(s => s.trim());
  const data = rows.slice(1).map(r => r.split(',').map(s => s.trim()));
  const ths = header.map(h => `<th>${h}</th>`).join('\n                                                ');
  const trs = data.map(r => `                                            <tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('\n');
  return `<table class="ncll-micro__table" aria-describedby="${captionId}">
                                        <caption id="${captionId}" class="sr-only">PC90H hoodie pit-to-pit and body length measurements in inches.</caption>
                                        <thead><tr>${ths}</tr></thead>
                                        <tbody>
${trs}
                                        </tbody>
                                    </table>`;
}

function buildSt350Transposed(rows, captionId) {
  // rows: header then data rows like 'AXS,18.5,27'
  const header = rows[0].split(',').map(s => s.trim());
  const data = rows.slice(1).map(r => r.split(',').map(s => s.trim()));
  const sizes = data.map(r => r[0]);
  const pitValues = data.map(r => r[1]);
  const backValues = data.map(r => r[2]);
  const ths = sizes.map(s => `<th>${s}</th>`).join('\n                                                ');
  const pitTds = pitValues.map(v => `<td>${v}</td>`).join('\n                                                ');
  const backTds = backValues.map(v => `<td>${v}</td>`).join('\n                                                ');
  return `<table class="ncll-micro__table" aria-describedby="${captionId}">
                                        <caption id="${captionId}" class="sr-only">ST350 coaches shirt pit-to-pit and body length measurements in inches by size.</caption>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                ${ths}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th>pit</th>
                                                ${pitTds}
                                            </tr>
                                            <tr>
                                                <th>back</th>
                                                ${backTds}
                                            </tr>
                                        </tbody>
                                    </table>`;
}

function buildHatTransposed(parsedMdTable, captionId, captionText) {
  // parsedMdTable: array of [label, range]
  const sizes = parsedMdTable.map(r => r[0]);
  const ranges = parsedMdTable.map(r => r[1]);
  const ths = sizes.map(s => `<th>${s}</th>`).join('\n                                                ');
  const tds = ranges.map(r => `<td>${r}</td>`).join('\n                                                ');
  return `<table class="ncll-micro__table" aria-describedby="${captionId}">
                                        <caption id="${captionId}" class="sr-only">${captionText}</caption>
                                        <thead>
                                            <tr>
                                                ${ths}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                ${tds}
                                            </tr>
                                        </tbody>
                                    </table>`;
}

function replaceBlock(html, ariaDesc, newTableHtml) {
  const re = new RegExp(`<table[\s\S]*?aria-describedby=\"${ariaDesc}\"[\s\S]*?<\/table>`,'m');
  if (!re.test(html)) {
    console.warn('Target table aria-describedby="' + ariaDesc + '" not found.');
    return html;
  }
  return html.replace(re, newTableHtml);
}

function main() {
  const md = readSpecs();
  const html = fs.readFileSync(targetHtml, 'utf8');
  let out = html;

  // 4003
  const block4003 = extractCsvBlock(md, '### 4003 — Normalized (Pit-to-pit)');
  if (block4003) {
    const new4003 = build4003Table(block4003);
    out = replaceBlock(out, '4003-aaa-caption', new4003);
    out = replaceBlock(out, '4003-caption', new4003); // also update A division table if present
  }

  // PC90H
  const blockPc90h = extractCsvBlock(md, '### PC90H — Normalized (Pit-to-pit)');
  if (blockPc90h) {
    const newPc90h = buildPc90hTable(blockPc90h, 'pc90h-aaa-caption');
    out = replaceBlock(out, 'pc90h-aaa-caption', newPc90h);
    out = replaceBlock(out, 'pc90h-aaa-coach-caption', newPc90h);
    out = replaceBlock(out, 'pc90h-aaa-caption', newPc90h);
  }

  // ST350 (transposed for coaches)
  const blockSt350 = extractCsvBlock(md, '### ST350 — Normalized (Pit-to-pit)');
  if (blockSt350) {
    const newSt350Trans = buildSt350Transposed(blockSt350, 'st350-aaa-caption');
    out = replaceBlock(out, 'st350-aaa-caption', newSt350Trans);
    out = replaceBlock(out, 'st350-caption', newSt350Trans);
    out = replaceBlock(out, 'st350-aa-caption', newSt350Trans);
  }

  // PTS30 hat chart
  const parsedPts30 = extractMdTable(md, 'HAT SIZE CHART PTS30 — Normalized (Head circumference, in)');
  if (parsedPts30) {
    const newPts30 = buildHatTransposed(parsedPts30, 'pts30-aaa-caption', 'PTS30 hat head circumference ranges in inches.');
    out = replaceBlock(out, 'pts30-aaa-caption', newPts30);
    out = replaceBlock(out, 'pts30-aaa-coach-caption', newPts30);
    out = replaceBlock(out, 'pts30-caption', newPts30);
  }

  fs.writeFileSync(targetHtml, out, 'utf8');
  console.log('Updated AAA tables from specs.md');
}

main();
