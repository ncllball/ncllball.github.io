const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CSS_IN = path.join(ROOT, 'css.css');
const BACKUP = path.join(ROOT, `css.css.pre-legacy-removed.bak`);
const OUT_EXTRACT = path.join(ROOT, 'css.legacy.extracted.css');

const LEGACY_KEYS = ['division-card', 'program-card', 'division-meta', 'division-blurb', 'division-hero__title', 'division-card__graphic', 'division__detail-content'];

if (!fs.existsSync(CSS_IN)) {
  console.error('css.css not found in repo root');
  process.exit(1);
}

const text = fs.readFileSync(CSS_IN, 'utf8');
const parts = text.split('}');

const kept = [];
const removed = [];

parts.forEach(part => {
  const selectorLine = (part.split('{')[0] || '').trim();
  if (!selectorLine) return; // skip empty
  let isLegacy = false;
  for (const key of LEGACY_KEYS) {
    if (selectorLine.includes(key)) {
      isLegacy = true;
      break;
    }
  }
  if (isLegacy) {
    removed.push(part.trim() + '\n}');
  } else {
    kept.push(part.trim() + '\n}');
  }
});

if (removed.length === 0) {
  console.log('No legacy CSS blocks found in css.css — nothing to remove.');
  process.exit(0);
}

// Backup original css
fs.writeFileSync(BACKUP, text, 'utf8');
console.log('Backed up original css to', BACKUP);

// Write new css with kept blocks
const newCss = kept.join('\n\n');
fs.writeFileSync(CSS_IN, newCss, 'utf8');
console.log('Wrote cleaned css to', CSS_IN, '(legacy blocks removed)');

// Write/overwrite extracted file with removed blocks for review
const header = '/* Extracted legacy selector blocks - removed from css.css. Review and consolidate in css.legacy.extracted.css */\n\n';
fs.writeFileSync(OUT_EXTRACT, header + removed.join('\n\n'), 'utf8');
console.log('Wrote', OUT_EXTRACT, 'with', removed.length, 'removed blocks.');

console.log('Done. Run scripts/check-legacy.js to see remaining occurrences outside css.css.');
