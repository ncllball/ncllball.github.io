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
  // Deprecated PD aliases / duplicates
  'build-pd-ataglance.js',           // root-level duplicate (should live in pd/landing)
  'update-at-a-glance.js'            // removed alias wrapper
]);

const present = [];
for (const name of LEGACY) {
  if (fs.existsSync(path.join(SCRIPTS_DIR, name))) present.push(name);
}

if (present.length) {
  console.error('FAIL: Deprecated script filename(s) reintroduced at root:\n  - ' + present.join('\n  - '));
  console.error('Move your script into the appropriate subfolder (content, costs, footnotes, layout, pd, tools). Use canonical PD paths (pd/landing/build-pd-ataglance.js) only.');
  process.exit(2);
}

// Additional PD landing duplication guard: ensure only canonical script exists in landing.
const pdLanding = path.join(SCRIPTS_DIR, 'pd', 'landing');
if (fs.existsSync(pdLanding)) {
  const landingFiles = fs.readdirSync(pdLanding).filter(f => f.includes('at-a-glance'));
  const alias = landingFiles.filter(f => f !== 'build-pd-ataglance.js');
  if (alias.length) {
    console.error('FAIL: Non-canonical At a Glance PD script(s) present in pd/landing:\n  - ' + alias.join('\n  - '));
    console.error('Keep only build-pd-ataglance.js. Remove wrapper/alias scripts.');
    process.exit(2);
  }
}

console.log('Script structure guard passed (no legacy root scripts present).');