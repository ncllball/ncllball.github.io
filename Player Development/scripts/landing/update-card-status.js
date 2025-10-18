#!/usr/bin/env node
/**
 * PD-local: Sync program card status badges in the PD landing page with pd-programs.json
 */
const fs = require('fs');
const path = require('path');

const PD_SCRIPTS = __dirname; // Player Development/scripts/landing
const PD_DIR = path.resolve(PD_SCRIPTS, '..', '..');
const MANIFEST_NEW = path.join(PD_DIR, 'manifest', 'pd-programs.json');
const MANIFEST_OLD = path.join(PD_DIR, 'pd-programs.json');
const MANIFEST = fs.existsSync(MANIFEST_NEW) ? MANIFEST_NEW : MANIFEST_OLD;
const LANDING_PRIMARY = path.join(PD_DIR, 'index.html');
const LANDING_LEGACY = path.join(PD_DIR, 'playerdev.landing.html');

function ensureManifest(){
  if (fs.existsSync(MANIFEST_NEW)) return;
  if (fs.existsSync(MANIFEST_OLD)) return;
  const { execFileSync } = require('child_process');
  execFileSync(process.execPath, [path.join(PD_DIR,'scripts','manifest','build-pd-manifest.js')], { stdio: 'inherit' });
}

function statusFromProgram(p){
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

function badgeHtml(status){
  if (status === 'Free') status = 'Open';
  const cls = status === 'Closed' ? ' status-closed'
            : status === 'Coming Soon' || status === 'Soon' ? ' status-soon'
            : status === 'Active' ? ''
            : '';
  return `<span class="status-badge${cls}">${status === 'Coming Soon' ? 'Soon' : status}</span>`;
}

function main(){
  const DRY = process.argv.includes('--dry');
  ensureManifest();
  const data = JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  const byDisplay = new Map();
  for (const p of data.programs){
    const display = curatedName[p.id] || p.programName || p.meta.programName || p.title || p.id;
    if (!display) continue;
    byDisplay.set(display, { status: statusFromProgram(p), file: p.file });
  }

  const targetPath = fs.existsSync(LANDING_PRIMARY) ? LANDING_PRIMARY : LANDING_LEGACY;
  let html = fs.readFileSync(targetPath,'utf8');
  const originalHtml = html;
  for (const [display, info] of byDisplay.entries()){
    const status = info.status;
    const safeDisplay = display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(<h3[^>]*?>\\s*${safeDisplay}\\s*<span class=\\"status-badge[^<]*<\\/span>\\s*<\\/h3>)`).test(html)){
      html = html.replace(new RegExp(`(<h3[^>]*?>\\s*${safeDisplay}\\s*)<span class=\\"status-badge[^<]*<\\/span>(\\s*<\\/h3>)`),
        `$1${badgeHtml(status)}$2`);
    }
    if (info.file){
      const sectionRe = new RegExp(`(<h3[^>]*?>\\s*${safeDisplay}[\\s\\S]*?<a class=\\"ncll\\"[^>]*href=\\")[^"]+(\\"[^>]*>\\s*Program page\\s*<\\/a>)`);
      html = html.replace(sectionRe, `$1${info.file}$2`);
    }
  }

  // Normalize FREE costs
  html = html.replace(/(<li><strong>Cost:<\/strong>\s*)(?:<[^>]+>\s*)*FREE\b/gi, (m, prefix) => prefix + '$0 / player (FREE)');
  html = html.replace(/(<li><strong>Cost:<\/strong>\s*)\$0(?:\s*\/\s*\w+)?(?:\s*\(\s*free\s*\))?/gi, (m, prefix) => prefix + '$0 / player (FREE)');

  if (DRY){
    if (html === originalHtml){
      console.log('[dry-run] No changes needed in', path.basename(targetPath));
    } else {
      const addedBadges = (html.match(/status-badge/g) || []).length - (originalHtml.match(/status-badge/g) || []).length;
      const costStandardizationsBefore = (originalHtml.match(/\$0 \/ player \(FREE\)/g) || []).length;
      const costStandardizationsAfter = (html.match(/\$0 \/ player \(FREE\)/g) || []).length;
      console.log('[dry-run] Would update', path.basename(targetPath));
      if (addedBadges !== 0) console.log(`  * Badge span count delta: ${addedBadges}`);
      if (costStandardizationsAfter !== costStandardizationsBefore){
        console.log(`  * Standardized cost lines: ${costStandardizationsAfter - costStandardizationsBefore} newly normalized`);
      }
      const deltaChars = Math.abs(html.length - originalHtml.length);
      console.log(`  * Approx char delta: ${deltaChars}`);
    }
  } else {
    fs.writeFileSync(targetPath, html);
    console.log('Updated program card badges in', path.basename(targetPath), 'to reflect manifest status.');
  }

  if (fs.existsSync(LANDING_PRIMARY) && fs.existsSync(LANDING_LEGACY)){
    const legacy = fs.readFileSync(LANDING_LEGACY,'utf8');
    if (!/http-equiv="refresh"/i.test(legacy)){
      const redirectHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset=\"utf-8\" />\n<meta http-equiv=\"refresh\" content=\"0; url=./\" />\n<title>Player Development Moved</title>\n<meta name=\"robots\" content=\"noindex\" />\n<link rel=\"canonical\" href=\"https://ncllball.github.io/Player%20Development/\" />\n<link rel=\"stylesheet\" type=\"text/css\" href=\"https://ncllball.github.io/css.css\" />\n<link rel=\"stylesheet\" href=\"https://use.typekit.net/ldx2icb.css\" />\n<style>body{font:16px/1.4 proxima-nova,Helvetica,Arial,sans-serif;padding:2rem;}a{color:#cc0000}</style>\n</head>\n<body>\n<h1>Page Moved</h1>\n<p>This page is now <a href=\"./\">Player Development Programs</a>.</p>\n<p>If you are not redirected automatically, please use the link above.</p>\n</body>\n</html>`;
      fs.writeFileSync(LANDING_LEGACY, redirectHtml);
      console.log('Converted legacy playerdev.landing.html into redirect stub.');
    }
  }
}

main();
