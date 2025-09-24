#!/usr/bin/env node
/**
 * Orchestrator: runs common site-wide content normalization scripts in a safe sequence.
 *
 * Default: dry run (no writes). Use --write to apply.
 * Limit scope: --path="Player Development" (or any subfolder)
 * Verbose per-script: add --verbose
 * Select subset: --tasks=punctuation,costs,scholarship,layout,super  (default: all)
 *
 * Sequence (recommended order):
 *  1. punctuation  -> scripts/content/enforce-punctuation.js
 *  2. single-li    -> scripts/content/convert-single-li-to-p.js
 *  3. costs        -> scripts/costs/normalize-cost-format.js
 *  4. free-cost    -> scripts/costs/normalize-free-cost.js
 *  5. scholarship  -> scripts/footnotes/normalize-scholarship-footies.js
 *  6. scholarship-dedup -> scripts/footnotes/dedup-scholarship-footies.js
 *  7. layout       -> scripts/layout/normalize-info-icon-spacing.js
 *  8. super        -> scripts/content/find-legacy-super.js
 *
 * Exits 0 even if scripts would modify files (dry mode); exits non-zero only on fatal error.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const VERBOSE = args.includes('--verbose');

function getArgVal(prefix){
  const a = args.find(a=>a.startsWith(prefix+'='));
  if(!a) return null; const [,v] = a.split('='); return v||null;
}

const PATH_ARG = getArgVal('--path');
const TASKS_ARG = getArgVal('--tasks');
let requestedTasks = null;
if (TASKS_ARG) {
  requestedTasks = TASKS_ARG.split(',').map(s=>s.trim()).filter(Boolean);
}

// Canonical ordered steps
const STEPS = [
  { key:'punctuation', label:'Punctuation cleanup', script:'scripts/content/enforce-punctuation.js'},
  { key:'single-li', label:'Single-item list collapse', script:'scripts/content/convert-single-li-to-p.js'},
  { key:'costs', label:'Cost format normalization', script:'scripts/costs/normalize-cost-format.js'},
  { key:'free-cost', label:'FREE cost normalization', script:'scripts/costs/normalize-free-cost.js'},
  { key:'scholarship', label:'Scholarship footnote normalize', script:'scripts/footnotes/normalize-scholarship-footies.js'},
  { key:'scholarship-dedup', label:'Scholarship footnote de-dup', script:'scripts/footnotes/dedup-scholarship-footies.js'},
  { key:'layout', label:'Info icon spacing', script:'scripts/layout/normalize-info-icon-spacing.js'},
  { key:'super', label:'Legacy <super> tag replacement', script:'scripts/content/find-legacy-super.js'}
];

if (requestedTasks) {
  // Filter to those keys present; allow comma-limited subset.
  const wanted = new Set(requestedTasks);
  STEPS.forEach(s=> s.enabled = wanted.has(s.key));
} else {
  STEPS.forEach(s=> s.enabled = true);
}

function runStep(step){
  if (!step.enabled) return { skipped:true };
  const cmd = process.platform === 'win32' ? 'node.exe' : 'node';
  const stepArgs = [ step.script ];
  if (PATH_ARG) { stepArgs.push('--path='+PATH_ARG); }
  if (VERBOSE) { stepArgs.push('--verbose'); }
  if (WRITE) { stepArgs.push('--write'); }
  const display = `node ${stepArgs.join(' ')}`;
  console.log(`\n→ ${step.label}: ${display}`);
  const res = spawnSync(cmd, stepArgs, { stdio:'inherit' });
  if (res.error) {
  console.error(`✖ ${step.key} failed:`, res.error.message);
  return { failed:true, code: (typeof res.status === 'number' ? res.status : 1) };
  }
  if (res.status && res.status !== 0) {
    console.error(`✖ ${step.key} exited with code ${res.status}`);
    return { failed:true, code:res.status };
  }
  return { ok:true };
}

(function main(){
  console.log(`Site content orchestrator starting in ${WRITE ? 'WRITE' : 'DRY'} mode`);
  if (PATH_ARG) console.log('Scope path:', PATH_ARG);
  if (requestedTasks) console.log('Filtered tasks:', requestedTasks.join(', '));

  let failures = 0;
  for (const step of STEPS) {
    const result = runStep(step);
    if (result.failed) failures++;
  }

  if (failures) {
    console.error(`\nCompleted with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log('\nAll enabled steps completed successfully.');
})();
