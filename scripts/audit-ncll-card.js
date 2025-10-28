const fs = require('fs');
const path = require('path');
const cssPath = path.join(process.cwd(), 'css.css');
const outDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(cssPath)) { console.error('css.css not found'); process.exit(1); }
const s = fs.readFileSync(cssPath, 'utf8');
// naive CSS block splitter (works for this file's formatting)
const blockRe = /([^{]+)\{([^}]+)\}/g;
const pagePrefixRe = /\.(baseball|softball|pd)-landing\s+\.(ncll-card__[A-Za-z0-9_-]+)/;
const results = {};
let m;
while ((m = blockRe.exec(s)) !== null) {
  const selectorText = m[1].trim();
  const body = m[2].trim();
  // split selectors by comma
  const sels = selectorText.split(',').map(x => x.trim());
  sels.forEach(sel => {
    const pm = sel.match(pagePrefixRe);
    if (pm) {
      const comp = '.' + pm[2];
      if (!results[comp]) results[comp] = [];
      results[comp].push({ selector: sel, body });
    }
  });
}
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
const outPath = path.join(outDir, 'ncll-card-audit.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
console.log('Wrote', outPath);
// Print compact summary
Object.keys(results).forEach(comp => {
  console.log('\n' + comp + ': ' + results[comp].length + ' occurrence(s)');
  const bodies = {};
  results[comp].forEach(r => {
    bodies[r.body] = bodies[r.body] || [];
    bodies[r.body].push(r.selector);
  });
  Object.keys(bodies).forEach((b,i) => {
    console.log('  Variant ' + (i+1) + ': selectors ->');
    bodies[b].forEach(sel => console.log('    ' + sel));
  });
});
