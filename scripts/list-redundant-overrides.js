const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const auditPath = path.join(cwd, 'reports', 'ncll-card-audit.json');
const cssPath = path.join(cwd, 'css.css');
if (!fs.existsSync(auditPath)) { console.error('Audit not found:', auditPath); process.exit(1); }
if (!fs.existsSync(cssPath)) { console.error('css.css not found'); process.exit(1); }
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const css = fs.readFileSync(cssPath, 'utf8');

function normBody(b) { return b.trim().replace(/\s+/g, ' ').replace(/;\s/g,'; '); }
// Build canonical bodies from audit (same logic as before)
const canonical = {};
Object.keys(audit).forEach(comp => {
  const entries = audit[comp];
  if (!entries || !entries.length) return;
  let chosen = entries.find(e => /baseball-landing/.test(e.selector) && /softball-landing/.test(e.selector) && /pd-landing/.test(e.selector));
  if (!chosen) chosen = entries[0];
  canonical[comp] = normBody(chosen.body);
});

// parse blocks
const blockRe = /([^{]+)\{([^}]+)\}/g;
let m;
const redundant = [];
while ((m = blockRe.exec(css)) !== null) {
  const selectors = m[1].trim();
  const body = m[2].trim();
  const bodyNorm = normBody(body);
  const sels = selectors.split(',').map(s => s.trim());
  for (const sel of sels) {
    const pm = sel.match(/\.(baseball|softball|pd)-landing\s+\.(ncll-card__[A-Za-z0-9_-]+)(.*)/);
    if (!pm) continue;
    const comp = '.' + pm[2];
    if (canonical[comp] && canonical[comp] === bodyNorm) {
      redundant.push({ selector: sel, body: body, comp });
    }
  }
}

const outDir = path.join(cwd, 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
const outPath = path.join(outDir, 'redundant-ncll-card-overrides.json');
fs.writeFileSync(outPath, JSON.stringify(redundant, null, 2), 'utf8');
console.log('Wrote', outPath);
console.log('\nFound', redundant.length, 'redundant page-prefixed overrides:');
redundant.forEach((r,i)=> {
  console.log(`${i+1}. ${r.selector}`);
});

process.exit(0);
