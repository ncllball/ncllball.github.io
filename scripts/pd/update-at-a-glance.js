#!/usr/bin/env node
/**
 * Player Development landing page updater
 * - Rebuilds the "At a Glance" table
 * - Syncs program card status badges
 *
 * Usage (from repo root):
 *   node scripts/pd/update-at-a-glance.js
 */
const path = require('path');
const { execFileSync } = require('child_process');

function run(label, script){
  console.log(`[PD] ${label}...`);
  execFileSync(process.execPath, [path.join(__dirname, script)], { stdio: 'inherit' });
}

try {
  run('Building At a Glance', 'build-pd-ataglance.js');
  run('Updating card badges', 'update-card-status.js');
  console.log('[PD] Done. Landing page is up to date.');
} catch (err) {
  console.error('[PD] Failed:', (err && err.message) ? err.message : err);
  process.exit(1);
}
