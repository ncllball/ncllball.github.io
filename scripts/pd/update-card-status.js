#!/usr/bin/env node
/**
 * Sync program card status badges in the PD landing page with pd-programs.json
 *
 * Usage (from repo root):
 *   node scripts/pd/update-card-status.js
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PD_DIR = path.join(REPO_ROOT, 'Player Development');
const MANIFEST = path.join(PD_DIR, 'pd-programs.json');
const LANDING = path.join(PD_DIR, 'playerdev.landing.html');

function ensureManifest(){
  if (fs.existsSync(MANIFEST)) return;
  const { execFileSync } = require('child_process');
  execFileSync(process.execPath, [path.join(__dirname,'build-pd-manifest.js')], { stdio: 'inherit' });
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

// Curated names map to find the H3 labels in the landing page
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
  if (status === 'Free') status = 'Open'; // Normalize: cards show Open/Closed/Active/Soon
  const cls = status === 'Closed' ? ' status-closed'
            : status === 'Coming Soon' || status === 'Soon' ? ' status-soon'
            : status === 'Active' ? ''
            : '';
  return `<span class="status-badge${cls}">${status === 'Coming Soon' ? 'Soon' : status}</span>`;
}

function main(){
  ensureManifest();
  const data = JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  const byDisplay = new Map();
  for (const p of data.programs){
    const display = curatedName[p.id] || p.programName || p.meta.programName || p.title;
    if (!display) continue;
    byDisplay.set(display, statusFromProgram(p));
  }

  let html = fs.readFileSync(LANDING,'utf8');
  // Replace badges inside h3s per known displays
  for (const [display, status] of byDisplay.entries()){
    const safeDisplay = display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(<h3[^>]*?>\\s*${safeDisplay}\\s*<span class=\\"status-badge[^<]*<\\/span>\\s*<\\/h3>)`);
    if (re.test(html)){
      html = html.replace(new RegExp(`(<h3[^>]*?>\\s*${safeDisplay}\\s*)<span class=\\"status-badge[^<]*<\\/span>(\\s*<\\/h3>)`),
        `$1${badgeHtml(status)}$2`);
    }
  }

  // Enforce cost line standard for free programs: "$0 / player (FREE)"
  // Case 1: Cost shows as FREE only
  html = html.replace(/(<li><strong>Cost:<\/strong>\s*)(?:<[^>]+>\s*)*FREE\b/gi, '$1$$0 / player (FREE)');
  // Case 2: Any $0 variant (e.g., $0, $0 / session, $0 (free)) -> normalize to $0 / player (FREE)
  html = html.replace(/(<li><strong>Cost:<\/strong>\s*)\$0(?:\s*\/\s*\w+)?(?:\s*\(\s*free\s*\))?/gi, '$1$$0 / player (FREE)');

  fs.writeFileSync(LANDING, html);
  console.log('Updated program card badges to reflect manifest status.');
}

main();
