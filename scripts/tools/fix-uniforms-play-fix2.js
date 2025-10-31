const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'Parents', 'index.html');
const bak = file + '.bak2';
let s = fs.readFileSync(file, 'utf8');
fs.writeFileSync(bak, s, 'utf8');

// Fix the accidental replacement that turned <thead> into '<th scope="col" ead>'
s = s.replace(/<th scope=\"col\"\s+ead>/g, '<thead>');

// Make duplicate ids unique: find all id="..." occurrences and rename duplicates
const idRegex = /id=\"([^\"]+)\"/g;
let ids = [];
let m;
while ((m = idRegex.exec(s)) !== null) ids.push(m[1]);

const counts = {};
for (const id of ids) counts[id] = (counts[id] || 0) + 1;

for (const id in counts) {
  if (counts[id] > 1) {
    // find occurrences and rename second+ instances
    let idx = 0;
    s = s.replace(new RegExp(`id=\"${id}\"`, 'g'), (match) => {
      idx += 1;
      if (idx === 1) return match; // keep first
      const newId = `${id}-${idx}`;
      console.log(`Renaming duplicate id ${id} -> ${newId}`);
      return `id="${newId}"`;
    });
    // update aria-describedby occurrences (replace all but the first remain pointing to first?)
    // We'll replace aria-describedby="id" occurrences corresponding to the renamed ids.
    // To be safe, replace all aria-describedby="id" with aria-describedby="id-1" for now won't work.
    // Instead, we'll map by counting occurrences of aria-describedby too.
    // Simple strategy: if aria-describedby="id" appears N times and id had N occurrences, leave first, for subsequent occurrences we will point to the respective renamed id if a caption exists near the table.
  }
}

// After id renames, attempt to sync aria-describedby: find tables with aria-describedby pointing to duplicate ids and if the referenced id no longer exists near the table, leave as-is.
// Simpler approach: collect all captions and ensure aria-describedby values match a caption id in the file.

// Collect caption ids
const capRegex = /<caption[^>]*id=\"([^\"]+)\"/g;
let caps = new Set();
while ((m = capRegex.exec(s)) !== null) caps.add(m[1]);

// Replace aria-describedby values that reference non-existent ids by mapping to nearest preceding caption id in the file.
const ariaRegex = /<table([\s\S]*?)aria-describedby=\"([^\"]+)\"([\s\S]*?)>/g;
let newS = '';
let lastIndex = 0;
while ((m = ariaRegex.exec(s)) !== null) {
  newS += s.slice(lastIndex, m.index);
  const fullMatch = m[0];
  const before = m[1];
  const ariaId = m[2];
  const after = m[3];

  if (caps.has(ariaId)) {
    newS += fullMatch; // leave unchanged
  } else {
    // try to find a caption id that starts with same base (strip -n suffixes)
    const base = ariaId.replace(/-\d+$/, '');
    const candidate = Array.from(caps).find(c => c.startsWith(base));
    if (candidate) {
      const fixed = fullMatch.replace(`aria-describedby=\"${ariaId}\"`, `aria-describedby=\"${candidate}\"`);
      console.log(`Fixed aria-describedby ${ariaId} -> ${candidate}`);
      newS += fixed;
    } else {
      newS += fullMatch; // no change
    }
  }
  lastIndex = ariaRegex.lastIndex;
}
newS += s.slice(lastIndex);

s = newS;

fs.writeFileSync(file, s, 'utf8');
console.log('Patched', file, '(backup at', bak, ')');
