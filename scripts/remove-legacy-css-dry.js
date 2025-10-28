const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CSS_IN = path.join(ROOT, 'css.css');

// Keep this list aligned with scripts/remove-legacy-css.js
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

const removed = [];

let i = 0;
while (i < lines.length) {
  const selLines = [];
  while (i < lines.length && lines[i].indexOf('{') === -1) {
    selLines.push(lines[i]);
    i++;
  }
  if (i >= lines.length) break;
  const lineWithBrace = lines[i];
  const bracePos = lineWithBrace.indexOf('{');
  const lastSelPart = lineWithBrace.slice(0, bracePos).trim();
  const afterBrace = lineWithBrace.slice(bracePos + 1);
  if (lastSelPart.length > 0) selLines.push(lastSelPart);

  const selectorText = selLines.join(' ').trim();
  const selectors = selectorText.split(',').map(s => s.trim()).filter(Boolean);

  const remaining = selectors.filter(sel => {
    for (const key of LEGACY_KEYS) {
      if (sel.includes(key)) return false;
    }
    return true;
  });

  if (remaining.length === 0) {
    // collect full block text until closing brace
    i++; // move past brace line
    const bodyLines = [];
    while (i < lines.length && lines[i].indexOf('}') === -1) {
      bodyLines.push(lines[i]);
      i++;
    }
    if (i < lines.length && lines[i].indexOf('}') !== -1) {
      const block = (selectorText + ' {' + '\n' + bodyLines.join('\n') + '\n}').trim();
      removed.push(block);
      i++; // past closing brace
    }
  } else {
    // skip body
    i++;
    while (i < lines.length && lines[i].indexOf('}') === -1) i++;
    if (i < lines.length && lines[i].indexOf('}') !== -1) i++;
  }
}

console.log('Found', removed.length, 'legacy selector blocks that WOULD be removed if you run scripts/remove-legacy-css.js');
if (removed.length > 0) {
  console.log('\n--- Preview of selector blocks (first 500 chars each) ---\n');
  removed.forEach((b, idx) => {
    const preview = b.replace(/\s+/g,' ').slice(0,500);
    console.log('Block', idx + 1 + ':', preview);
    console.log('');
  });
} else {
  console.log('No matching legacy selector blocks found.');
}

// Exit with code 0 (no writes performed)
process.exit(0);
