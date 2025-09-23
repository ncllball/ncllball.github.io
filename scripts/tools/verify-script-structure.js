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
  'normalize-info-icon-spacing.js'
]);

const present = [];
for (const name of LEGACY) {
  if (fs.existsSync(path.join(SCRIPTS_DIR, name))) present.push(name);
}

if (present.length) {
  console.error('FAIL: Deprecated script filename(s) reintroduced at root:\n  - ' + present.join('\n  - '));
  console.error('Move your script into the appropriate subfolder (content, costs, footnotes, layout, pd, tools).');
  process.exit(2);
}

console.log('Script structure guard passed (no legacy root scripts present).');