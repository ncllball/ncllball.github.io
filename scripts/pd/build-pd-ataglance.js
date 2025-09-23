#!/usr/bin/env node
/**
 * Player Development utility: Build static "At a Glance" table rows in the PD landing page
 *
 * What it does
 * - Ensures a PD manifest exists (pd-programs.json)
 * - Generates <tr> rows for each program and replaces the tbody#pd-ataglance-body in playerdev.landing.html
 * - Removes any inline <script> at the end of the landing page (no inline scripts allowed)
 *
 * Inputs
 * - Reads Player Development/pd-programs.json (builds it if missing)
 * - Reads Player Development/playerdev.landing.html
 *
 * Outputs
 * - Writes updated Player Development/playerdev.landing.html with fresh rows
 *
 * Usage (from repo root)
 *   node scripts/pd/build-pd-ataglance.js
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PD_DIR = path.join(REPO_ROOT, 'Player Development');
const MANIFEST = path.join(PD_DIR, 'pd-programs.json');
// Primary landing file (renamed to index.html for clean directory URL)
const LANDING_PRIMARY = path.join(PD_DIR, 'index.html');
// Legacy filename kept temporarily for backward compatibility / external bookmarks
const LANDING_LEGACY = path.join(PD_DIR, 'playerdev.landing.html');

function ensureManifest(){
  if (fs.existsSync(MANIFEST)) return;
  // Try to build manifest if missing
  const { execFileSync } = require('child_process');
  execFileSync(process.execPath, [path.join(__dirname,'build-pd-manifest.js')], { stdio: 'inherit' });
}

function statusPill(p){
  const today = new Date();
  function parseDate(s){ if(!s) return null; const d=new Date(s); return isNaN(d)?null:d; }
  const start = parseDate(p.meta.rangeStart || (p.meta.dateList ? p.meta.dateList.split(';')[0] : null));
  const end = parseDate(p.meta.rangeEnd || (p.meta.dateList ? p.meta.dateList.split(';').slice(-1)[0] : null));
  if (end && end < today) return 'Closed';
  if (start && end && start <= today && end >= today) return 'Active';
  const cost = p.cost || '';
  if (/TBD/i.test(cost)) return 'Coming Soon';
  if (/\$0/.test(cost)) return 'Free';
  return 'Open';
}

function shortName(id){
  return id.replace(/^2025 /,'')
           .replace('Winter ','')
           .replace('BB ','')
           .replace('SB ','')
           .replace('Fastpitch ','')
           .replace(' (Sessions I & II)','');
}

function trimYear(d){
  return d.replace(/,?\s*2025$/,'').replace(/Nov 9 - Feb 22/,'Nov 2024 - Feb 2025');
}

// Curated display names (preferred over programName/title)
const curatedName = {
  '2025 Winter Single-A BB Training': 'Single-A Winter Training',
  '2025 Winter Double-AA BB Pitching': 'AA Pitching (3-Week)',
  '2025 Winter AAA+MAJ BB Training': 'AAA + Majors Winter Training',
  '2025 Winter Teen BB Training': 'Teen Baseball Training (Sessions I & II)',
  '2025 Winter AAA+MAJ SB Training': 'AAA + Majors Softball Training',
  '2025 RHS Fastpitch Winter Batting Clinic': 'RHS Fastpitch Batting Clinic',
  '2025 Free February': 'Free February (Outdoor)',
  '2025 In-Season Double-AA (and up) SB Pitching': 'In-Season Softball Pitching',
  '2025 LHS Winter Training': 'Lincoln HS Skills Camp'
};

function buildRows(programs){
  return programs.map(p => {
    const div = (p.divisions || '').replace(/&amp;/g,'&');
    const dates = trimYear(p.dates || '');
    const focus = (p.focus || p.meta.focus || '') || '';
    const display = (curatedName[p.id] || p.programName || p.meta.programName || p.title || shortName(p.id));
    let pillText = statusPill(p);
    if (pillText === 'Free') pillText = ''; // hide Free status as requested
    return '<tr>'
      + '<td>' + display + '</td>'
      + '<td>' + div + '</td>'
      + '<td>' + dates + '</td>'
      + '<td>' + focus + '</td>'
      + '<td>' + (pillText ? '<span class="pill-inline">'+pillText+'</span>' : '') + '</td>'
      + '</tr>';
  }).join('\n');
}

function main(){
  ensureManifest();
  const data = JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  const programs = data.programs.slice().sort((a,b)=>{
    function first(p){return p.meta.rangeStart || (p.meta.dateList?p.meta.dateList.split(';')[0]:'9999-12-31');}
    return first(a).localeCompare(first(b));
  });
  const rows = buildRows(programs);
  const targetPath = fs.existsSync(LANDING_PRIMARY) ? LANDING_PRIMARY : LANDING_LEGACY;
  let html = fs.readFileSync(targetPath,'utf8');
  // Replace tbody content
  html = html.replace(/<tbody id="pd-ataglance-body">[\s\S]*?<\/tbody>/,
    '<tbody id="pd-ataglance-body">\n' + rows + '\n</tbody>');
  // Remove inline script after </main> (no scripts allowed)
  html = html.replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, '</body>');
  fs.writeFileSync(targetPath, html);
  // If both exist, keep legacy file as redirect stub (only replace if it still contains full content and not a redirect yet)
  if (targetPath === LANDING_PRIMARY && fs.existsSync(LANDING_LEGACY)){
    const legacy = fs.readFileSync(LANDING_LEGACY,'utf8');
    if (!/http-equiv="refresh"/i.test(legacy)){
      const redirectHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<meta http-equiv="refresh" content="0; url=./" />\n<title>Player Development Moved</title>\n<meta name="robots" content="noindex" />\n<link rel="canonical" href="https://ncllball.github.io/Player%20Development/" />\n<link rel=\"stylesheet\" type=\"text/css\" href=\"https://ncllball.github.io/css.css\" />\n<link rel=\"stylesheet\" href=\"https://use.typekit.net/ldx2icb.css\" />\n<style>body{font:16px/1.4 proxima-nova,Helvetica,Arial,sans-serif;padding:2rem;}a{color:#cc0000}</style>\n</head>\n<body>\n<h1>Page Moved</h1>\n<p>This page is now <a href=\"./\">Player Development Programs</a>.</p>\n<p>If you are not redirected automatically, please use the link above.</p>\n</body>\n</html>`;
      fs.writeFileSync(LANDING_LEGACY, redirectHtml);
      console.log('Converted legacy playerdev.landing.html into redirect stub.');
    }
  }
  console.log('Updated At a Glance table in', path.basename(targetPath), 'with', programs.length, 'programs.');
}

main();
