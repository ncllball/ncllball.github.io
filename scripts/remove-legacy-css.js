const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CSS_IN = path.join(ROOT, 'css.css');
const BACKUP = path.join(ROOT, `css.css.pre-legacy-removed.bak`);
const OUT_EXTRACT = path.join(ROOT, 'css.legacy.extracted.css');

// Legacy keys to remove from selector lists. This script was originally conservative
// and skipped modifier-level classes (for example `division-card--overlay`) while
// HTML migration was in progress. The site HTML has since been migrated to `ncll-`
// classes; you can safely include modifier keys below to remove legacy modifier
// selectors from `css.css`. Edit this list to control which legacy selectors are
// extracted.
const LEGACY_KEYS = [
  'division__detail-content',
  'division-hero__title',
  'division-blurb',
  'division-meta',
  'division-card__graphic',
  'division-card__top-layer',
  'division-card__bottom-layer',
  'division-card__toggle',
  'card-actions',
  // Modifier-level legacy keys (optional): uncomment to remove these selectors too
  'division-card--overlay',
  'division-card',
  'program-card'
];

if (!fs.existsSync(CSS_IN)) {
  console.error('css.css not found in repo root');
  process.exit(1);
}

const text = fs.readFileSync(CSS_IN, 'utf8');
const lines = text.split(/\r?\n/);
const kept = [];
const removed = [];

let i = 0;
while (i < lines.length) {
  // Accumulate selector lines until we hit a line that contains '{'
  const selLines = [];
  while (i < lines.length && lines[i].indexOf('{') === -1) {
    selLines.push(lines[i]);
    i++;
  }

  if (i >= lines.length) break;

  // Now lines[i] contains the '{' and possibly the last selector before it
  const lineWithBrace = lines[i];
  const bracePos = lineWithBrace.indexOf('{');
  const lastSelPart = lineWithBrace.slice(0, bracePos).trim();
  const afterBrace = lineWithBrace.slice(bracePos + 1);

  if (lastSelPart.length > 0) {
    selLines.push(lastSelPart);
  }

  // Build full selector list string and split by commas
  const selectorText = selLines.join(' ').trim();
  const selectors = selectorText.split(',').map(s => s.trim()).filter(Boolean);

  // Filter out selectors that include any legacy key
  const remaining = selectors.filter(sel => {
    for (const key of LEGACY_KEYS) {
      if (sel.includes(key)) return false;
    }
    return true;
  });

  if (remaining.length === 0) {
    // Skip the rule body until the matching closing '}'
    // Move i forward until we find a line with '}'
    i++; // move past the brace line
    const bodyLines = [];
    while (i < lines.length && lines[i].indexOf('}') === -1) {
      bodyLines.push(lines[i]);
      i++;
    }
    if (i < lines.length && lines[i].indexOf('}') !== -1) {
      // include the closing brace line
      // (we'll omit the entire block and write it to removed)
      removed.push((selectorText + ' {' + '\n' + bodyLines.join('\n') + '\n}').trim());
      i++; // move past closing brace
    }
  } else {
    // Keep block with remaining selectors
    const keptSelectorBlock = remaining.join(', ');
    // Write the kept selector line with brace
    kept.push(keptSelectorBlock + ' {' + afterBrace);
    i++; // move to next line (start of body or next content)

    // Now append body lines until closing brace
    while (i < lines.length && lines[i].indexOf('}') === -1) {
      kept.push(lines[i]);
      i++;
    }
    if (i < lines.length && lines[i].indexOf('}') !== -1) {
      kept.push(lines[i]);
      i++;
    }
  }
}

// Build the new CSS from kept blocks
const newCss = kept.join('\n\n');

if (newCss.trim() === text.trim()) {
  console.log('No legacy selector changes detected in css.css — nothing to write.');
  process.exit(0);
}

// Backup original css
fs.writeFileSync(BACKUP, text, 'utf8');
console.log('Backed up original css to', BACKUP);

// Write new css with kept blocks
fs.writeFileSync(CSS_IN, newCss, 'utf8');
console.log('Wrote cleaned css to', CSS_IN, '(legacy selectors removed from selector lists where present)');

// Write/overwrite extracted file with removed blocks for review (may be empty)
const header = '/* Extracted legacy selector blocks - removed from css.css. Review and consolidate in css.legacy.extracted.css */\n\n';
fs.writeFileSync(OUT_EXTRACT, header + removed.join('\n\n'), 'utf8');
console.log('Wrote', OUT_EXTRACT, 'with', removed.length, 'removed blocks.');

console.log('Done. Run scripts/check-legacy.js to see remaining occurrences outside css.css.');
