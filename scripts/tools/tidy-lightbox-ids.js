const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'Parents', 'index.html');
const bak = file + '.bak-tidy';
let s = fs.readFileSync(file, 'utf8');
fs.writeFileSync(bak, s, 'utf8');

// find all data-id occurrences
const dataIdRegex = /data-id=\"([^\"]+)\"/g;
let matches = [];
let m;
while ((m = dataIdRegex.exec(s)) !== null) matches.push({id: m[1], index: m.index});

// helper to get substring around index
function around(idx, radius=400){
  const start = Math.max(0, idx - radius);
  const end = Math.min(s.length, idx + radius);
  return s.slice(start, end);
}

function inferDivision(ctx){
  // look for #uniforms-<division>-toggle in context
  const re = /#uniforms-([a-z0-9-]+)-toggle/g;
  let mm;
  while ((mm = re.exec(ctx)) !== null) return mm[1];
  // look for label for="lightbox-<division>"
  const re2 = /for=\"lightbox-([a-z0-9-]+)\"/g;
  while ((mm = re2.exec(ctx)) !== null) return mm[1];
  // look for nearby headings like "Kindy" or "T‑Ball" within context
  if (/Kindy/i.test(ctx)) return 'kindy';
  if (/T[\u2011-]Ball|T-?Ball/i.test(ctx)) return 'tball';
  if (/AAA/i.test(ctx)) return 'aaa';
  if (/AA/i.test(ctx)) return 'aa';
  if (/Majors/i.test(ctx)) return 'majors';
  if (/A[\s-]Division|A division|A division/i.test(ctx)) return 'a';
  return 'site';
}

function inferAsset(ctx){
  // check for known spec codes in src or text
  if (/ST350|YST350/i.test(ctx)) return 'shirt';
  if (/4301|hat|cap/i.test(ctx)) return 'hat';
  if (/PC90H|hoodie|hooded/i.test(ctx)) return 'hoodie';
  if (/PTS30|pant|pants|short/i.test(ctx)) return 'pants';
  if (/logo|badge|patch/i.test(ctx)) return 'badge';
  // fallback: look for alt text
  const alt = (ctx.match(/alt=\"([^\"]+)\"/)||[])[1] || '';
  if (/shirt|tee/i.test(alt)) return 'shirt';
  if (/hat|cap/i.test(alt)) return 'hat';
  return 'img';
}

// build mapping
const counters = {};
const mapping = {};
for (const it of matches){
  const old = it.id;
  if (mapping[old]) continue;
  const ctx = around(it.index);
  const division = inferDivision(ctx);
  const asset = inferAsset(ctx);
  const key = `${division}-${asset}`;
  counters[key] = (counters[key]||0) + 1;
  const num = counters[key];
  const neat = `play-${division}-${asset}-${num}`;
  mapping[old] = neat;
}

// apply replacements carefully: replace data-id and CSS selectors using exact matches
let out = s;
for (const old in mapping){
  const neu = mapping[old];
  const escOld = old.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&');
  // replace data-id="old"
  out = out.replace(new RegExp(`data-id=\"${escOld}\"`, 'g'), `data-id=\"${neu}\"`);
  // replace .lightbox[data-id="old"] in CSS
  out = out.replace(new RegExp(`\\.lightbox\\[data-id=\"${escOld}\"\\]`, 'g'), `.lightbox[data-id="${neu}"]`);
  // replace [data-id="old"] generally
  out = out.replace(new RegExp(`\\[data-id=\"${escOld}\"\\]`, 'g'), `[data-id="${neu}"]`);
  // replace any remaining standalone old token occurrences that are likely CSS selectors (safe-ish)
  out = out.replace(new RegExp(`\b${escOld}\b`, 'g'), neu);
}

fs.writeFileSync(file, out, 'utf8');
fs.writeFileSync(file + '.mapping.json', JSON.stringify(mapping, null, 2), 'utf8');
console.log('Applied', Object.keys(mapping).length, 'tidy renames. Mapping written to', file + '.mapping.json');
