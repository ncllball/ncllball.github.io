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
const LANDING = path.join(PD_DIR, 'playerdev.landing.html');

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
  let html = fs.readFileSync(LANDING,'utf8');
  // Replace tbody content
  html = html.replace(/<tbody id="pd-ataglance-body">[\s\S]*?<\/tbody>/,
    '<tbody id="pd-ataglance-body">\n' + rows + '\n</tbody>');
  // Remove inline script after </main> (no scripts allowed)
  html = html.replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, '</body>');
  fs.writeFileSync(LANDING, html);
  console.log('Updated At a Glance table with', programs.length, 'programs.');
}

main();
