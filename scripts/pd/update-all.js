#!/usr/bin/env node
/**
 * Orchestrator: Rebuild Player Development manifest, At a Glance table, and status badges.
 *
 * Default mode is --dry (no file writes) unless --write is specified.
 *
 * Usage:
 *   node scripts/pd/update-all.js            (dry run)
 *   node scripts/pd/update-all.js --dry      (explicit dry run)
 *   node scripts/pd/update-all.js --write    (apply changes)
 */
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const isWrite = args.includes('--write');
const modeArgs = isWrite ? ['--write'] : ['--dry'];

const ROOT = path.resolve(__dirname, '..', '..', '..');
const PD_SCRIPTS = path.join(ROOT, 'scripts', 'pd');

function run(label, rel, extraArgs = []){
  const full = path.join(PD_SCRIPTS, rel);
  const finalArgs = [...extraArgs];
  try {
    execFileSync(process.execPath, [full, ...finalArgs], { stdio: 'inherit' });
  } catch (e){
    console.error(`[FAIL] ${label}:`, e.message);
    process.exitCode = 1;
  }
}

console.log(`PD Update Orchestrator (${isWrite ? 'WRITE' : 'DRY'})`);

// 1. Manifest (always writes if needed; builder itself has internal idempotence)
run('Manifest', path.join('manifest','build-pd-manifest.js'));

// 2. At a Glance table
run('At a Glance', path.join('landing','build-pd-ataglance.js'), modeArgs);

// 3. Status badges / costs normalization
run('Status Badges', path.join('landing','update-card-status.js'), modeArgs);

console.log('Done.');
