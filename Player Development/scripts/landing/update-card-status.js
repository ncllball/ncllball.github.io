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

// Optional: explicit external URL mapping by program id. If present, this URL will replace the card's
// "Program page" link instead of the local file path from the manifest.
const externalUrlById = {
  // Known from email and listings
  'winterball26-aaa-majors-baseball-training': 'https://www.ncllball.com/Default.aspx?tabid=2112053',
  'winterball25-aa-baseball-training': 'https://www.ncllball.com/Default.aspx?tabid=2117255',
  '2025 LHS Winter Training': 'https://www.ncllball.com/Default.aspx?tabid=2184695',
  'winterball25-aa-baseball-pitching-training': 'https://www.ncllball.com/Default.aspx?tabid=2117406',
  'winterball26-teen-baseball-training': 'https://www.ncllball.com/Default.aspx?tabid=2117407',
  '2025 RHS Fastpitch Winter Batting Clinic': 'https://www.ncllball.com/Default.aspx?tabid=2117626',
  '2025 Free February': 'https://www.ncllball.com/Default.aspx?tabid=2117698',
  '2025 In-Season Double-AA (and up) SB Pitching': 'https://www.ncllball.com/Default.aspx?tabid=2161277',
  'winterball25-aaa-majors-softball-training': 'https://www.ncllball.com/Default.aspx?tabid=2112053',
  // TODO: Fill these as confirmed
  // 'winterball25-aa-baseball-pitching-training': 'https://www.ncllball.com/Default.aspx?tabid=XXXXX',
  // 'winterball25-aaa-majors-softball-training': 'https://www.ncllball.com/Default.aspx?tabid=XXXXX',
  // '2025 RHS Fastpitch Winter Batting Clinic': 'https://www.ncllball.com/Default.aspx?tabid=XXXXX',
  // '2025 In-Season Double-AA (and up) SB Pitching': 'https://www.ncllball.com/Default.aspx?tabid=XXXXX',
  // '2025 LHS Winter Training': 'https://www.ncllball.com/Default.aspx?tabid=XXXXX',
  // 'winterball26-teen-baseball-training': 'https://www.ncllball.com/Default.aspx?tabid=XXXXX',
};

// Optional: SignUpGenius (or similar) registration links by program id. If present, a
// "Register" link will be added to the card after the Program page link (if not already present).
const registerUrlById = {
  '2025 Free February': 'https://www.signupgenius.com/go/70A054FAAAF22A3F85-54499131-2025#'
};

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
  if (start && end && start <= today && end >= today) return 'Open';
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

// Manual status overrides by program id
const forcedStatus = {
  'winterball26-teen-baseball-training': 'Coming Soon'
};

// Legacy headings seen on cards that should map to the following program IDs
const headingAliasesById = {
  'winterball25-aa-baseball-pitching-training': [
    'AA Pitching (3-Week)',
    'AA Winter Pitching Series'
  ],
  'winterball26-aaa-majors-baseball-training': [
    'AAA + Majors Winter Training'
  ],
  'winterball25-aaa-majors-softball-training': [
    'AAA + Majors Softball Training'
  ],
  'winterball25-aa-baseball-training': [
    'Single-A Winter Training',
    'Single-A Winter'
  ],
  'winterball26-teen-baseball-training': [
    'Teen Baseball Training (Sessions I & II)',
    'Teen Baseball Training'
  ]
};

function badgeHtml(status){
  // Map Free/Active to Open label; keep Coming Soon distinct
  if (status === 'Free' || status === 'Active') status = 'Open';
  const cls = status === 'Open' ? ' status-open'
            : status === 'Coming Soon' ? ' status-soon'
            : status === 'Closed' ? ' status-closed'
            : '';
  return `<span class="status-badge${cls}">${status}</span>`;
}

function renameHeadingByAlias(html, aliasText, newText){
  const aliasSafe = aliasText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<h3[^>]*?>\\s*)${aliasSafe}(\\s*<span class=\\"status-badge)`, 'g');
  return html.replace(re, `$1${newText}$2`);
}

function updateBadgeForDisplay(html, display, status){
  const safeDisplay = display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<h3[^>]*?>\\s*${safeDisplay}\\s*)<span class=\\"status-badge[^<]*<\\/span>(\\s*<\\/h3>)`, 'g');
  return html.replace(re, `$1${badgeHtml(status)}$2`);
}

function setHeadingForFile(html, file, display){
  // Find the Program page link for this file, then adjust the nearest preceding h3 text
  const esc = (s)=> s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkRe = new RegExp(`<a class=\"ncll\"[^>]*href=\"${esc(file)}\"[^>]*>\\s*Program page\\s*<\\/a>`);
  const m = linkRe.exec(html);
  if (!m) return html;
  const linkIdx = m.index;
  const h3OpenIdx = html.lastIndexOf('<h3', linkIdx);
  if (h3OpenIdx === -1) return html;
  const startTextIdx = html.indexOf('>', h3OpenIdx);
  if (startTextIdx === -1) return html;
  const textStart = startTextIdx + 1;
  const badgeIdx = html.indexOf('<span class="status-badge', textStart);
  const h3CloseIdx = html.indexOf('</h3>', textStart);
  if (badgeIdx === -1 || h3CloseIdx === -1 || badgeIdx > h3CloseIdx) return html;
  return html.slice(0, textStart) + display + html.slice(badgeIdx);
}

function ensureRegisterLink(html, display, registerUrl){
  if (!registerUrl) return html;
  const safeDisplay = display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Locate the section starting at this display's <h3> and ending at the next </article>
  const h3Re = new RegExp(`(<h3[^>]*>\s*)${safeDisplay}(\s*<span class=\"status-badge)`, 'i');
  const m = h3Re.exec(html);
  if (!m) return html;
  const h3Idx = m.index;
  const sectionEnd = html.indexOf('</article>', h3Idx);
  if (sectionEnd === -1) return html;
  const section = html.slice(h3Idx, sectionEnd);
  // If a Register link already exists in this section, skip
  if (/\>\s*Register\s*<\/a>/.test(section)) return html;
  // Find the Program page anchor closing </p> to insert after
  const progLinkMatch = /<p><a class=\"ncll\"[^>]*>\s*Program page\s*<\/a><\/p>/i.exec(section);
  if (!progLinkMatch) return html;
  const insertOffset = h3Idx + progLinkMatch.index + progLinkMatch[0].length;
  const insertHtml = `\n<p><a class=\"ncll\" href=\"${registerUrl}\" target=\"_blank\" rel=\"noopener noreferrer\">Register</a></p>`;
  return html.slice(0, insertOffset) + insertHtml + html.slice(insertOffset);
}

// Ensure Program page and Register anchors open in a new tab with safe rel
function ensureNewTabAnchors(html){
  function addAttrsIfMissing(anchorHtml){
    if (/target\s*=/.test(anchorHtml)) return anchorHtml; // already has target
    return anchorHtml.replace(/<a\b([^>]*?)>/i, (m, attrs) => `<a${attrs} target=\"_blank\" rel=\"noopener noreferrer\">`);
  }
  // Only touch PD card anchors labeled Program page or Register
  html = html.replace(/<a class=\"ncll\"[^>]*>\s*Program page\s*<\/a>/gi, addAttrsIfMissing);
  html = html.replace(/<a class=\"ncll\"[^>]*>\s*Register\s*<\/a>/gi, addAttrsIfMissing);
  return html;
}

function main(){
  const DRY = process.argv.includes('--dry');
  ensureManifest();
  const data = JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  const linkChanges = [];
  const byDisplay = new Map();
  for (const p of data.programs){
    // Prefer curated name for display so it matches card headings (e.g., "Lincoln HS Skills Camp")
    const display = curatedName[p.id] || p.programName || p.meta.programName || p.title || p.id;
    if (!display) continue;
    const computed = statusFromProgram(p);
    const finalStatus = forcedStatus[p.id] || computed;
    const externalUrl = externalUrlById[p.id] || null;
    byDisplay.set(display, { status: finalStatus, file: p.file, id: p.id, externalUrl });
  }

  const targetPath = fs.existsSync(LANDING_PRIMARY) ? LANDING_PRIMARY : LANDING_LEGACY;
  let html = fs.readFileSync(targetPath,'utf8');
  const originalHtml = html;
  for (const [display, info] of byDisplay.entries()){
    const status = info.status;
    const safeDisplay = display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // First, if this program has legacy heading aliases, rename them to the desired display
    const aliases = headingAliasesById[info.id] || [];
    for (const alias of aliases){
      const before = html;
      html = renameHeadingByAlias(html, alias, display);
      if (html !== before){
        // After renaming the heading to the desired display, update the badge for this display
        html = updateBadgeForDisplay(html, display, status);
        break;
      }
    }
    // Ensure badge for the canonical display heading as well
    html = updateBadgeForDisplay(html, display, status);
  if (info.file){
      // First try with the desired display
      let replaced = false;
      const targetHref = info.externalUrl || info.file;
      let sectionRe = new RegExp(`(<h3[^>]*?>\\s*${safeDisplay}[\\s\\S]*?<a class=\\"ncll\\"[^>]*href=\\")(.[^"]*)(\\"[^>]*>\\s*Program page\\s*<\\/a>)`, 'g');
      const newHtml = html.replace(sectionRe, (m, pre, oldHref, post) => {
        if (DRY) linkChanges.push({ id: info.id, display, from: oldHref, to: targetHref });
        return `${pre}${targetHref}${post}`;
      });
      if (newHtml !== html){
        html = newHtml;
        replaced = true;
      }
      // If not found, try legacy aliases mapped for this program id
      if (!replaced){
        for (const alias of aliases){
          const aliasSafe = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          sectionRe = new RegExp(`(<h3[^>]*?>\\s*${aliasSafe}[\\s\\S]*?<a class=\\"ncll\\"[^>]*href=\\")(.[^"]*)(\\"[^>]*>\\s*Program page\\s*<\\/a>)`, 'g');
          const newHtml2 = html.replace(sectionRe, (m, pre, oldHref, post) => {
            if (DRY) linkChanges.push({ id: info.id, display: alias, from: oldHref, to: targetHref });
            return `${pre}${targetHref}${post}`;
          });
          if (newHtml2 !== html){
            html = newHtml2;
            replaced = true;
            break;
          }
        }
      }
      // After link is set (either path), also ensure heading text matches desired display
      if (replaced){
        html = setHeadingForFile(html, info.file, display);
      } else {
        // If link wasn't replaced, still try to set heading for any existing link to this card via alias heading
        for (const alias of aliases){
          const before2 = html;
          html = renameHeadingByAlias(html, alias, display);
          if (html !== before2){
            // Now try display-scoped link replacement again
            const safeDisplay2 = display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const sectionRe2 = new RegExp(`(<h3[^>]*?>\\s*${safeDisplay2}[\\s\\S]*?<a class=\\"ncll\\"[^>]*href=\\")(.[^"]*)(\\"[^>]*>\\s*Program page\\s*<\\/a>)`, 'g');
            const newHtml3 = html.replace(sectionRe2, (m, pre, oldHref, post) => {
              if (DRY) linkChanges.push({ id: info.id, display, from: oldHref, to: info.file });
              return `${pre}${info.file}${post}`;
            });
            if (newHtml3 !== html){
              html = newHtml3;
              // And update badge post-rename to ensure status label/class
              html = updateBadgeForDisplay(html, display, status);
            }
            break;
          }
        }
      }
      // If there is a known register URL for this program, ensure a Register link exists in the card
      const regUrl = registerUrlById[info.id];
      if (regUrl){
        html = ensureRegisterLink(html, display, regUrl);
      }
    }
  }

  // Normalize FREE costs
  html = html.replace(/(<li><strong>Cost:<\/strong>\s*)(?:<[^>]+>\s*)*FREE\b/gi, (m, prefix) => prefix + '$0 / player (FREE)');
  html = html.replace(/(<li><strong>Cost:<\/strong>\s*)\$0(?:\s*\/\s*\w+)?(?:\s*\(\s*free\s*\))?/gi, (m, prefix) => prefix + '$0 / player (FREE)');

  // Ensure new-tab behavior on Program page and Register links
  html = ensureNewTabAnchors(html);

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
      if (linkChanges.length){
        console.log('  * Link updates:');
        for (const c of linkChanges){
          console.log(`    - [${c.id}] ${c.display}: ${c.from} -> ${c.to}`);
        }
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
