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

// Improved handling: for selector lists with multiple comma-separated selectors,
// remove only the selectors that contain legacy keys and keep the rest. If none
// remain, treat the whole block as removed.
parts.forEach(part => {
  const split = part.split('{');
  const selectorLine = (split[0] || '').trim();
  const body = split.slice(1).join('{');
  if (!selectorLine) return; // skip empty or closing fragments

  // Split selectors by comma, preserve original formatting around commas where possible.
  const selectors = selectorLine.split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (selectors.length === 0) return;

  // Determine which selectors are legacy
  const remaining = selectors.filter(sel => {
    for (const key of LEGACY_KEYS) {
      if (sel.includes(key)) return false; // drop this selector
    }
    return true; // keep
  });

  if (remaining.length === 0) {
    // whole block removed
    removed.push((selectorLine + ' {' + (body || '')).trim() + '\n}');
  } else {
    // keep block with remaining selectors joined by comma + space
    const keptSelectorLine = remaining.join(', ');
    kept.push((keptSelectorLine + ' {' + (body || '')).trim() + '\n}');
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
