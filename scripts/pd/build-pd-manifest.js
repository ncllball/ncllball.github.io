#!/usr/bin/env node
/**
 * Player Development Manifest Builder
 *
 * What it does
 * - Scans Player Development/*.html (prefixed with "2025 ", excluding landing) for the standardized tag strip
 * - Emits Player Development/pd-programs.json with a summary of each program
 *
 * Inputs
 * - Player Development/*.html program pages with a <ul class="tag"> block
 *
 * Outputs
 * - Player Development/pd-programs.json
 *
 * Usage (from repo root)
 *   node scripts/pd/build-pd-manifest.js
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PD_DIR = path.join(REPO_ROOT, 'Player Development');
const OUT_FILE = path.join(PD_DIR, 'pd-programs.json');

// Heuristic: include HTML files that start with 2025 and are not the landing page
const files = fs.readdirSync(PD_DIR)
  .filter(f => f.endsWith('.html') && /^2025 /.test(f) && !/landing/i.test(f));

function parseTagStrip(html) {
  // Grab first <ul class="tag...
  const ulMatch = html.match(/<ul class="tag[\s\S]*?<\/ul>/i);
  if (!ulMatch) return null;
  const block = ulMatch[0];

  // Common attributes on the UL for date range or date list
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
    // reset lastIndex of ulAttrPattern because reused
    ulAttrPattern.lastIndex = 0;
    var text = li.replace(/<strong>.*?<\/strong>\s*/i, '')
                 .replace(/<[^>]+>/g, '')
                 .replace(/\s+/g, ' ') // collapse whitespace
                 .trim();
    var record = { text: text };
    Object.keys(attrs).forEach(function(k){ record[k] = attrs[k]; });
    items[tag] = record;
  }

  return { ul: ulAttrs, items };
}

function summarizeProgram(filename, parsed, html) {
  const name = filename.replace(/\.html$/,'');
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
  const sessionsPerDate = sessions['data-sessions-per-date'] || parsed.ul['data-sessions-per-date'] || null;
  const sessionDurationMin = sessions['data-duration-min'] || parsed.ul['data-session-duration-min'] || null;
  const sessionCount = (item('dates')['data-session-count'] || parsed.ul['data-session-count'] || null);
  return {
    id: name,
    file: filename,
    programName: parsed.ul['data-program-name'] || null,
    dates: dates,
    location: location,
    day: day,
    time: time,
    cost: cost,
    divisions: divisions,
    ledBy: ledBy,
    focus: parsed.ul['data-focus'] || null,
    title: title,
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
      sessionsPerDate: sessionsPerDate,
      sessionDurationMin: sessionDurationMin,
      sessionCount: sessionCount
    }
  };
}

const manifest = files.map(f => {
  const html = fs.readFileSync(path.join(PD_DIR, f), 'utf8');
  const parsed = parseTagStrip(html);
  if (!parsed) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s*\u2014\s*NCLL\s*$/i,'').trim() : f.replace(/\.html$/,'');
    return { id: f.replace(/\.html$/,''), file: f, title: title, error: 'No tag strip found' };
  }
  return summarizeProgram(f, parsed, html);
});

fs.writeFileSync(OUT_FILE, JSON.stringify({ generated: new Date().toISOString(), programs: manifest }, null, 2));
console.log(`Wrote ${OUT_FILE} with ${manifest.length} programs.`);
