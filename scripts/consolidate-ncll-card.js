const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const auditPath = path.join(cwd, 'reports', 'ncll-card-audit.json');
const cssPath = path.join(cwd, 'css.css');
if (!fs.existsSync(auditPath)) { console.error('Audit not found:', auditPath); process.exit(1); }
if (!fs.existsSync(cssPath)) { console.error('css.css not found'); process.exit(1); }
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const css = fs.readFileSync(cssPath, 'utf8');
// Build global rules for components with grouped identical selectors
const globals = [];
Object.keys(audit).forEach(comp => {
  // pick the first entry's body as canonical
  const entries = audit[comp];
  if (!entries || !entries.length) return;
  // find the first entry whose selector contains all three landing prefixes (best candidate)
  let chosen = entries.find(e => /baseball-landing/.test(e.selector) && /softball-landing/.test(e.selector) && /pd-landing/.test(e.selector));
  if (!chosen) chosen = entries[0];
  // body may contain leading/trailing whitespace/newlines; normalize
  const body = '\n' + chosen.body.trim().split('\n').map(l => '    ' + l.trim()).join('\n') + '\n';
  globals.push({ comp, body });
});
if (!globals.length) { console.log('No globals to add'); process.exit(0); }
// Create CSS block
let block = '\n/* Consolidated global ncll-card rules (generated) */\n';
globals.forEach(g => {
  block += `${g.comp} {${g.body}}\n\n`;
});
// Find insertion point: before the first occurrence of ".baseball-landing .ncll-card__" or ".pd-landing .ncll-card__" in css
let insertAt = css.search(/\.baseball-landing\s+\.ncll-card__|\.pd-landing\s+\.ncll-card__/);
if (insertAt === -1) insertAt = css.indexOf('\n/* ====== BEGIN Registration/table Page-Specific Styles ====== */');
if (insertAt === -1) insertAt = css.length;
// backup
const bakPath = cssPath + '.pre-consolidate.bak';
fs.writeFileSync(bakPath, css, 'utf8');
// insert block before insertAt (find nearest line break boundary)
let before = css.slice(0, insertAt);
let after = css.slice(insertAt);
const newCss = before + block + after;
fs.writeFileSync(cssPath, newCss, 'utf8');
console.log('Inserted', globals.length, 'global rules into css.css');
console.log('Backup written to', bakPath);
process.exit(0);
