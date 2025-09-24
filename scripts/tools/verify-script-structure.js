#!/usr/bin/env node
/**
 * Guard: ensure deprecated root-level script filenames are not reintroduced.
 * If any legacy filenames reappear, fail fast so additions happen in functional subfolders.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');

const LEGACY = new Set([
  'convert-single-li-to-p.js',
  'enforce-punctuation.js',
  'normalize-cost-format.js',
  'normalize-free-cost.js',
  'normalize-scholarship-footies.js',
  'dedup-scholarship-footies.js',
  'normalize-info-icon-spacing.js',
  // Newly forbidden aliases / resurrected names:
  'update-at-a-glance.js', // replaced by pd/update-all or landing/build-pd-ataglance.js
  'build-pd-ataglance.js'  // must live only at landing/build-pd-ataglance.js, not root
]);

const present = [];
for (const name of LEGACY) {
  if (fs.existsSync(path.join(SCRIPTS_DIR, name))) present.push(name);
}

// Also check disallowed direct children under scripts/pd (legacy duplicates)
const pdDir = path.join(SCRIPTS_DIR, 'pd');
if (fs.existsSync(pdDir)) {
  const pdChildren = fs.readdirSync(pdDir);
  for (const child of pdChildren) {
    if (child === 'build-pd-ataglance.js') {
      present.push('pd/' + child);
    }
  }
}

if (present.length) {
  console.error('FAIL: Deprecated script filename(s) reintroduced at root:\n  - ' + present.join('\n  - '));
  console.error('Move your script into the appropriate subfolder (content, costs, footnotes, layout, pd, tools).');
  process.exit(2);
}

console.log('Script structure guard passed (no legacy root scripts present).');