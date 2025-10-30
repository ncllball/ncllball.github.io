const fs = require('fs');
const path = require('path');
function walk(dir, files = []) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    try {
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p, files);
      else files.push(p);
    } catch (e) {}
  });
  return files;
}
const repo = process.cwd();
const files = walk(repo).filter(f => f.endsWith('.html') || f.endsWith('.md'));
const ad = new Set();
const ids = new Set();
const reAd = /aria-describedby=\"([^\"]+)\"/g;
const reId = /id=\"([^\"]+)\"/g;
files.forEach(file => {
  const s = fs.readFileSync(file, 'utf8');
  let m;
  while (m = reAd.exec(s)) ad.add(m[1]);
  while (m = reId.exec(s)) ids.add(m[1]);
});
const missing = [...ad].filter(x => !ids.has(x));
if (missing.length === 0) console.log('No missing aria-describedby targets');
else console.log('Missing aria-describedby targets:\n' + missing.join('\n'));
