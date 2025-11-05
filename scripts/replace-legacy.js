const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const ROOT = process.cwd();
const DRY = !argv.apply;
const files = argv._.length ? argv._ : ['Programs/baseball.html','Programs/softball.html','Player Development/index.html','Volunteer/friendslist.html'];

const MAP = [
  ['division__detail-content','ncll-card__details'],
  ['division-card__top-layer','ncll-card__top-layer'],
  ['division-card__bottom-layer','ncll-card__body'],
  ['division-card__graphic','ncll-card__graphic'],
  ['division-hero__title','ncll-card__title'],
  ['division-blurb','ncll-card__blurb'],
  ['division-meta','ncll-card__meta'],
  ['card-actions','ncll-card__sticky-footer'],
  ['division-card--overlay','ncll-card--overlay'],
  [' division-card',' '], // remove standalone division-card in class lists
  ['division-card',''],
  ['program-card',''],
];

function processFile(rel) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) return { file: rel, error: 'missing' };
  let txt = fs.readFileSync(fp,'utf8');
  let out = txt;
  for (const [from,to] of MAP) {
    const re = new RegExp(from.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&'),'g');
    out = out.replace(re,to);
  }
  if (out === txt) return { file: rel, changed: false };
  if (DRY) return { file: rel, changed: true, diff: getDiff(txt,out) };
  fs.writeFileSync(fp,out,'utf8');
  return { file: rel, changed: true };
}

function getDiff(a,b) {
  const aLines = a.split(/\r?\n/);
  const bLines = b.split(/\r?\n/);
  const diffs = [];
  const n = Math.max(aLines.length,bLines.length);
  for (let i=0;i<n;i++) {
    const al=aLines[i]||''; const bl=bLines[i]||'';
    if (al!==bl) diffs.push({line:i+1, before:al, after:bl});
  }
  return diffs.slice(0,200);
}

const results = files.map(processFile);
console.log(JSON.stringify(results,null,2));
if (!DRY) console.log('Applied replacements to files above.');
else console.log('Dry-run mode (use --apply to write changes).');

