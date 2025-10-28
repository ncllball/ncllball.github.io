const fs = require('fs');
const path = require('path');
const cssPath = path.join(process.cwd(), 'css.css');
if (!fs.existsSync(cssPath)) {
  console.error('css.css not found');
  process.exit(1);
}
let s = fs.readFileSync(cssPath, 'utf8');
// Normalize newlines
s = s.replace(/\r\n/g, '\n');
// Trim trailing whitespace on each line
s = s.split('\n').map(l => l.replace(/[ \t]+$/g, '')).join('\n');
// Collapse sequences of 2+ blank lines to a single blank line
s = s.replace(/\n{3,}/g, '\n\n');
// Remove leading/trailing blank lines
s = s.replace(/^\s+/,'');
s = s.replace(/\s+$/,'');
// Ensure single trailing newline
s = s + '\n';
fs.writeFileSync(cssPath, s, 'utf8');
// Report basic stats
const lines = s.split('\n').length;
console.log('Formatted css.css — lines:', lines);
console.log('Wrote', cssPath);
process.exit(0);
