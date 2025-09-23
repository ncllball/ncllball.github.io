#!/usr/bin/env node
/**
 * Guard: verify legacy root script filenames are stubs only.
 * Each must contain the marker DEPRECATED_MOVED_SCRIPT and be short.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');

const LEGACY = [
  'convert-single-li-to-p.js',
  'enforce-punctuation.js',
  'normalize-cost-format.js',
  'normalize-free-cost.js',
  'normalize-scholarship-footies.js',
  'dedup-scholarship-footies.js',
  'normalize-info-icon-spacing.js'
];

let failures = 0;
for (const name of LEGACY) {
  const full = path.join(SCRIPTS_DIR, name);
  if (!fs.existsSync(full)) continue; // absence is fine (fully removed)
  const txt = fs.readFileSync(full, 'utf8');
  if (!/DEPRECATED_MOVED_SCRIPT/.test(txt)) {
    console.error(`FAIL: ${name} missing stub marker.`);
    failures++;
  }
  if (txt.length > 400) {
    console.error(`FAIL: ${name} too large (${txt.length} bytes) – expected lightweight stub.`);
    failures++;
  }
}

if (failures) {
  console.error(`\nScript structure guard failed (${failures} issue(s)).`);
  process.exit(2);
}
console.log('Script structure guard passed.');