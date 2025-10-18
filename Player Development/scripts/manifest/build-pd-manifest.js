#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// This script lives under Player Development/scripts/manifest
const PD_SCRIPTS = __dirname;
const PD_DIR = path.resolve(PD_SCRIPTS, '..', '..');
const MANIFEST_DIR = path.join(PD_DIR, 'manifest');
if (!fs.existsSync(MANIFEST_DIR)) fs.mkdirSync(MANIFEST_DIR, { recursive: true });
const OUT_FILE = path.join(MANIFEST_DIR, 'pd-programs.json');

function parseTagStrip(html) {
  const ulMatch = html.match(/<ul class="tag[\s\S]*?<\/ul>/i);
  if (!ulMatch) return null;
  const block = ulMatch[0];
  const ulAttrs = {};
  const ulAttrPattern = /(data-[a-z0-9_-]+)="([^"]*)"/g;
  let m;
  while ((m = ulAttrPattern.exec(block)) !== null) {
    ulAttrs[m[1]] = m[2];
  }
  const itemPattern = /<li class="tag-item"([\s\S]*?)<\/li>/g;
  const items = {};
  while ((m = itemPattern.exec(block)) !== null) {
    const li = m[0];
    const tagTypeMatch = li.match(/data-tag="([a-z0-9-]+)"/i);
    if (!tagTypeMatch) continue;
    const tag = tagTypeMatch[1];
    const attrs = {};
    let a;
    while ((a = ulAttrPattern.exec(li)) !== null) {
      attrs[a[1]] = a[2];
    }
    ulAttrPattern.lastIndex = 0;
    const text = li.replace(/<strong>.*?<\/strong>\s*/i, '')
                   .replace(/<[^>]+>/g, '')
                   .replace(/\s+/g, ' ')
                   .trim();
    const record = { text };
    Object.keys(attrs).forEach(k => { record[k] = attrs[k]; });
    items[tag] = record;
  }
  return { ul: ulAttrs, items };
}

function summarizeProgram(filename, parsed, html) {
  const name = filename.replace(/\.html$/, '');
  const item = (t) => parsed.items[t] || {};
  const dates = item('dates').text || '';
  const location = item('location').text || '';
  const day = item('day').text || null;
  const time = item('time').text || '';
  const cost = item('cost').text || '';
  const divisions = item('divisions').text || '';
  const ledBy = item('led-by').text || '';
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s*\u2014\s*NCLL\s*$/i,'').trim() : filename.replace(/\.html$/,'');
  const sessions = item('sessions');
  const sessionsPerDate = sessions ? (sessions['data-sessions-per-date'] || null) : null;
  const sessionDurationMin = sessions ? (sessions['data-duration-min'] || null) : null;
  const sessionCount = (item('dates')['data-session-count'] || null);
  return {
    id: name,
    file: filename,
    programName: (parsed.ul['data-program-name'] || null),
    dates, location, day, time, cost, divisions, ledBy,
    focus: parsed.ul['data-focus'] || null,
    title,
    meta: {
      dateList: parsed.ul['data-dates'] || item('dates')['data-dates'] || null,
      rangeStart: parsed.ul['data-range-start'] || null,
      rangeEnd: parsed.ul['data-range-end'] || null,
      costAmount: item('cost')['data-cost-amount'] || null,
      costUnit: item('cost')['data-cost-unit'] || null,
      costStatus: item('cost')['data-cost-status'] || item('cost')['data-cost-type'] || null,
      divisionLevels: item('divisions')['data-division-levels'] || null,
      sport: item('divisions')['data-sport'] || null,
      programName: parsed.ul['data-program-name'] || null,
      focus: parsed.ul['data-focus'] || null,
      sessionsPerDate,
      sessionDurationMin,
      sessionCount
    }
  };
}

// Include any program HTML containing a tag strip, skipping landing stubs
const ALL_HTML = fs.readdirSync(PD_DIR)
  .filter(f => f.endsWith('.html') && !/^index\.html$/i.test(f) && !/^playerdev\.landing\.html$/i.test(f));

const manifest = ALL_HTML.map(f => {
  const html = fs.readFileSync(path.join(PD_DIR, f), 'utf8');
  const parsed = parseTagStrip(html);
  if (!parsed) return null;
  return summarizeProgram(f, parsed, html);
}).filter(Boolean);

fs.writeFileSync(OUT_FILE, JSON.stringify({ generated: new Date().toISOString(), programs: manifest }, null, 2));
console.log(`Wrote ${OUT_FILE} with ${manifest.length} programs.`);
