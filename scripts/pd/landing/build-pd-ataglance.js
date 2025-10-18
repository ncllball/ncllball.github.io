#!/usr/bin/env node
/**
 * Player Development utility: Build static "At a Glance" table rows in the PD landing page.
 * (Consolidated clean implementation with --dry / --write.)
 */
const fs = require('fs');
const path = require('path');
const argv = process.argv.slice(2);
const isWrite = argv.includes('--write');
const isDry = !isWrite;
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const PD_DIR = path.join(REPO_ROOT, 'Player Development');
const MANIFEST_NEW = path.join(PD_DIR, 'manifest', 'pd-programs.json');
const MANIFEST_OLD = path.join(PD_DIR, 'pd-programs.json');
const MANIFEST = fs.existsSync(MANIFEST_NEW) ? MANIFEST_NEW : MANIFEST_OLD;
const LANDING_PRIMARY = path.join(PD_DIR, 'index.html');
const LANDING_LEGACY = path.join(PD_DIR, 'playerdev.landing.html');
function ensureManifest(){
  if (fs.existsSync(MANIFEST_NEW)) return;
  if (fs.existsSync(MANIFEST_OLD)) return;
  const { execFileSync } = require('child_process');
  execFileSync(process.execPath, [path.join(__dirname,'..','manifest','build-pd-manifest.js')], { stdio: 'inherit' });
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
  return id.replace(/^2025 /,'').replace('Winter ','').replace('BB ','').replace('SB ','').replace('Fastpitch ','').replace(' (Sessions I & II)','');
}
function trimYear(d){ return d.replace(/,?\s*2025$/,'').replace(/Nov 9 - Feb 22/,'Nov 2024 - Feb 2025'); }
const curatedName = {
  '2025 Winter Single-A BB Training': 'Single-A Winter Training',
  '2025 Winter Double-AA BB Pitching': 'AA Pitching (3-Week)',
  'winterball26-aaa-majors-baseball-training': 'Winterball26 AAA/Majors Baseball Training',
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
    if (pillText === 'Free') pillText = '';
    const pillClass = pillText === 'Open' ? ' pill-open'
                    : pillText === 'Closed' ? ' pill-closed'
                    : pillText === 'Coming Soon' ? ' pill-soon'
                    : pillText === 'Active' ? ' pill-active'
                    : '';
    return '<tr>'
      + '<td>' + display + '</td>'
      + '<td>' + div + '</td>'
      + '<td>' + dates + '</td>'
      + '<td>' + focus + '</td>'
      + '<td>' + (pillText ? '<span class="pill-inline'+pillClass+'">'+pillText+'</span>' : '') + '</td>'
      + '</tr>';
  }).join('\n');
}
function main(){
  ensureManifest();
  const data = JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  const programs = data.programs.slice().sort((a,b)=>{
    function first(p){return p.meta.rangeStart || (p.meta.dateList ? p.meta.dateList.split(';')[0] : '9999-12-31');}
    return first(a).localeCompare(first(b));
  });
  const rows = buildRows(programs);
  const targetPath = fs.existsSync(LANDING_PRIMARY) ? LANDING_PRIMARY : LANDING_LEGACY;
  let html = fs.readFileSync(targetPath,'utf8');
  const newTbody = '<tbody id="pd-ataglance-body">\n' + rows + '\n</tbody>';
  const currentMatch = html.match(/<tbody id="pd-ataglance-body">[\s\S]*?<\/tbody>/);
  const currentTbody = currentMatch ? currentMatch[0] : '';
  const willChange = currentTbody.trim() !== newTbody.trim();
  if (isDry){
    if (willChange){
      console.log(`[DRY] Would update At a Glance table in ${path.basename(targetPath)} with ${programs.length} programs (changes detected).`);
    } else {
      console.log('[DRY] At a Glance table already up to date (no changes).');
    }
    return;
  }
  html = html.replace(/<tbody id="pd-ataglance-body">[\s\S]*?<\/tbody>/, newTbody);
  html = html.replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, '</body>');
  fs.writeFileSync(targetPath, html);
  if (targetPath === LANDING_PRIMARY && fs.existsSync(LANDING_LEGACY)){
    const legacy = fs.readFileSync(LANDING_LEGACY,'utf8');
    if (!/http-equiv="refresh"/i.test(legacy)){
      const redirectHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<meta http-equiv="refresh" content="0; url=./" />\n<title>Player Development Moved</title>\n<meta name="robots" content="noindex" />\n<link rel="canonical" href="https://ncllball.github.io/Player%20Development/" />\n<link rel="stylesheet" type="text/css" href="https://ncllball.github.io/css.css" />\n<link rel="stylesheet" href="https://use.typekit.net/ldx2icb.css" />\n<style>body{font:16px/1.4 proxima-nova,Helvetica,Arial,sans-serif;padding:2rem;}a{color:#cc0000}</style>\n</head>\n<body>\n<h1>Page Moved</h1>\n<p>This page is now <a href="./">Player Development Programs</a>.</p>\n<p>If you are not redirected automatically, please use the link above.</p>\n</body>\n</html>`;
      fs.writeFileSync(LANDING_LEGACY, redirectHtml);
      console.log('Converted legacy playerdev.landing.html into redirect stub.');
    }
  }
  console.log('Updated At a Glance table in', path.basename(targetPath), 'with', programs.length, 'programs.');
}
main();
