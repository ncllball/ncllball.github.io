const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'Parents', 'uniforms-play.html');
let s = fs.readFileSync(file, 'utf8');
const lines = s.split(/\r?\n/);

// Find all data-id occurrences and their line numbers
const dataIdRegex = /data-id=\"([^\"]+)\"/g;
let occurrences = [];
for (let i=0;i<lines.length;i++){
  const line = lines[i];
  let m;
  while ((m = dataIdRegex.exec(line)) !== null){
    occurrences.push({id:m[1], line:i});
  }
}

function findDivisionAround(lineIndex){
  // search upwards up to 60 lines for #play-ephemeral-<name>-toggle
  for (let i=lineIndex; i>=Math.max(0,lineIndex-60); i--) {
    const l = lines[i];
    const m = l.match(/#play-ephemeral-([a-z0-9-]+)-toggle/);
    if (m) return m[1];
  }
  // search nearby for label for="lightbox-<name>"
  for (let i=lineIndex; i>=Math.max(0,lineIndex-20); i--) {
    const l = lines[i];
    const m = l.match(/for=\"lightbox-([a-z0-9-]+)\"/);
    if (m) return m[1];
  }
  // search downwards too
  for (let i=lineIndex; i<=Math.min(lines.length-1,lineIndex+60); i++) {
    const l = lines[i];
    const m = l.match(/#play-ephemeral-([a-z0-9-]+)-toggle/);
    if (m) return m[1];
  }
  return 'site';
}

const mapping = {};
const used = {};

for (const occ of occurrences){
  const old = occ.id;
  if (mapping[old]) continue;
  const division = findDivisionAround(occ.line) || 'site';
  // compute suffix: last numeric token in id
  const parts = old.split('-');
  let suffix = parts[parts.length-1].replace(/[^0-9]/g,'');
  if (!suffix) suffix = String(Object.keys(used).length + 1);
  let base = `play-${division}-h${suffix}`;
  let candidate = base;
  let i = 1;
  while (used[candidate]) { candidate = `${base}-${i++}`; }
  used[candidate] = true;
  mapping[old] = candidate;
}

// Apply replacements: data-id and CSS selectors and any attributes containing the exact token
let out = s;
for (const old in mapping){
  const neu = mapping[old];
  const escOld = old.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');
  // replace data-id="old"
  out = out.replace(new RegExp(`data-id=\"${escOld}\"`, 'g'), `data-id="${neu}"`);
  // replace .lightbox[data-id="old"] occurrences in CSS selectors
  out = out.replace(new RegExp(`data-id=\\"${escOld}\\"`, 'g'), `data-id=\\"${neu}\\"`);
  out = out.replace(new RegExp(`\\.lightbox\\[data-id=\"${escOld}\"\]`, 'g'), `.lightbox[data-id="${neu}"]`);
  // replace any occurrences of data-id in CSS selectors without escaping (simple)
  out = out.replace(new RegExp(`${escOld}`, 'g'), neu);
}

fs.writeFileSync(file + '.bak-ids', s, 'utf8');
fs.writeFileSync(file, out, 'utf8');
console.log('Wrote', file, 'with', Object.keys(mapping).length, 'renames');
console.log(mapping);
