#!/usr/bin/env node
/**
 * Orchestrator: Rebuild Player Development manifest, At a Glance table, and status badges.
 *
 * Default: dry run (no writes). Use --write to apply. Optional --report for a summary-only dry run.
 *
 * Usage:
 *   node scripts/pd/update-all.js              (dry run)
 *   node scripts/pd/update-all.js --write      (apply changes)
 *   node scripts/pd/update-all.js --report     (dry summary, suppress non-essential chatter)
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const isWrite = args.includes('--write');
const isReport = args.includes('--report');
if (isWrite && isReport){
  console.warn('[warn] --report ignored because --write requested.');
}

// __dirname is scripts/pd. We only need to go up TWO levels to reach repo root.
// (Previous version went up three levels, escaping the repo and causing ENOENT.)
const ROOT = path.resolve(__dirname, '..', '..');
const PD_SCRIPTS = path.join(ROOT, 'scripts', 'pd');

// Legacy stub check removed (stub fully deleted). If it reappears, structure guard will fail.

function runStep(label, rel, mode){
  const full = path.join(PD_SCRIPTS, rel);
  const step = { label, script: rel, status: 'OK' };
  const argsForScript = [];
  // Per-script mode handling
  if (rel.endsWith('build-pd-ataglance.js')){
    // This script writes only when --write passed; no flag means dry.
    if (mode === 'write') argsForScript.push('--write');
  } else if (rel.endsWith('update-card-status.js')){
    if (mode === 'dry') argsForScript.push('--dry');
    // write mode: no flag so it writes
  }
  try {
    execFileSync(process.execPath, [full, ...argsForScript], { stdio: isReport ? 'pipe':'inherit' });
    if (isReport){
      step.output = 'captured';
    }
  } catch (e){
    step.status = 'FAIL';
    step.error = e.message;
    if (isReport){
      // Provide minimal inline diagnostic in report mode
      console.error(`[report-error] ${label}: ${e.message}`);
    }
    process.exitCode = 1;
    if (!isReport) console.error(`[FAIL] ${label}:`, e.message);
  }
  return step;
}

console.log(`PD Update Orchestrator (${isWrite ? 'WRITE' : (isReport ? 'REPORT' : 'DRY')})`);

const summary = [];

// 1. Manifest (auto idempotent; no explicit dry flag)
summary.push(runStep('Manifest', path.join('manifest','build-pd-manifest.js'), isWrite ? 'write':'dry'));

// 2. At a Glance table
summary.push(runStep('At a Glance', path.join('landing','build-pd-ataglance.js'), isWrite ? 'write':'dry'));

// 3. Status badges / costs normalization
summary.push(runStep('Status Badges', path.join('landing','update-card-status.js'), isWrite ? 'write':'dry'));

// Report summary
console.log('\nSummary:');
for (const s of summary){
  console.log(` - ${s.label}: ${s.status}`);
}
if (process.exitCode && process.exitCode !== 0){
  console.log('Completed with failures.');
} else {
  console.log(isWrite ? 'All steps applied.' : 'Dry run complete.');
}
