const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const auditPath = path.join(cwd, 'reports', 'ncll-card-audit.json');
const cssPath = path.join(cwd, 'css.css');
if (!fs.existsSync(auditPath)) { console.error('Audit not found:', auditPath); process.exit(1); }
if (!fs.existsSync(cssPath)) { console.error('css.css not found'); process.exit(1); }
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
let css = fs.readFileSync(cssPath, 'utf8');
// parse CSS into blocks
const blockRe = /([^{]+)\{([^}]+)\}/g;
let m;
const blocks = [];
while ((m = blockRe.exec(css)) !== null) {
  blocks.push({ selectors: m[1].trim(), body: m[2].trim(), start: m.index, end: blockRe.lastIndex });
}
// Build canonical bodies for components from audit (pick the most common body)
const canonical = {};
Object.keys(audit).forEach(comp => {
  const entries = audit[comp];
  if (!entries || !entries.length) return;
  // try to find grouped entry that contains all three landing prefixes
  let chosen = entries.find(e => /baseball-landing/.test(e.selector) && /softball-landing/.test(e.selector) && /pd-landing/.test(e.selector));
  if (!chosen) chosen = entries[0];
  canonical[comp] = chosen.body.trim().replace(/\s+/g,' ');
});

// Helper: normalize a block body
function normBody(b) { return b.trim().replace(/\s+/g,' '); }

let changes = 0;
let newCss = css;
// Walk blocks in reverse order so removing doesn't mess up indices
for (let i = blocks.length - 1; i >= 0; i--) {
  const block = blocks[i];
  const selText = block.selectors;
  const bodyNorm = normBody(block.body);
  // split selectors
  const sels = selText.split(',').map(s => s.trim());
  // detect page-prefixed selectors that match a canonical body for a component
  let toRemove = new Set();
  for (const sel of sels) {
    const m = sel.match(/\.(baseball|softball|pd)-landing\s+\.(ncll-card__[A-Za-z0-9_-]+)(.*)/);
    if (!m) continue;
    const comp = '.' + m[2];
    if (canonical[comp] && canonical[comp] === bodyNorm) {
      toRemove.add(sel);
    }
  }
  if (toRemove.size === 0) continue;
  // Compute new selector list
  const remaining = sels.filter(s => !toRemove.has(s));
  if (remaining.length === 0) {
    // remove entire block from newCss
    newCss = newCss.slice(0, block.start) + newCss.slice(block.end);
    changes++;
  } else {
    // replace old selector list with remaining joined by comma
    const newSelText = remaining.join(', ') + ' {';
    // find selector+brace location
    const before = newCss.slice(0, block.start);
    const after = newCss.slice(block.start);
    // replace first occurrence of original selectors plus '{' with newSelText
    const replaced = after.replace(new RegExp(escapeRegExp(block.selectors + '\\{')), newSelText);
    newCss = before + replaced;
    changes++;
  }
}

if (changes === 0) {
  console.log('No redundant page-prefixed selectors found to remove.');
  process.exit(0);
}
// backup
const bakPath = cssPath + '.pre-redundant-remove.bak';
fs.writeFileSync(bakPath, css, 'utf8');
fs.writeFileSync(cssPath, newCss, 'utf8');
console.log('Removed/updated', changes, 'page-prefixed selector blocks/selectors.');
console.log('Backup written to', bakPath);
process.exit(0);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
