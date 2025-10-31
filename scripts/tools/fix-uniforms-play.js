const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'Parents', 'index.html');
const backup = file + '.bak';
let s = fs.readFileSync(file, 'utf8');
fs.writeFileSync(backup, s, 'utf8');

// Add scope="col" to any <th> inside a <thead> that doesn't already have a scope
s = s.replace(/<thead>[\s\S]*?<\/thead>/g, block => {
  return block.replace(/<th(?![^>]*\bscope=)([^>]*)>/g, '<th scope="col"$1>');
});

// Add scope="row" to the first <th> in each <tr> inside a <tbody> if missing
s = s.replace(/<tbody>[\s\S]*?<\/tbody>/g, block => {
  return block.replace(/<tr([\s\S]*?)>\s*<th(?![^>]*\bscope=)([^>]*)>/g, '<tr$1>\n    <th scope="row"$2>');
});

// Find id attributes that start with a digit and prefix them with 'h'
const idRegex = /id="([0-9][^\"]*)"/g;
let ids = new Set();
let m;
while ((m = idRegex.exec(s)) !== null) {
  ids.add(m[1]);
}
ids = Array.from(ids);
ids.forEach(oldId => {
  const newId = 'h' + oldId;
  const idRe = new RegExp(`id=\"${oldId}\"`, 'g');
  const ariaRe = new RegExp(`aria-describedby=\"${oldId}\"`, 'g');
  s = s.replace(idRe, `id="${newId}"`);
  s = s.replace(ariaRe, `aria-describedby="${newId}"`);
  console.log(`Replaced id ${oldId} -> ${newId}`);
});

fs.writeFileSync(file, s, 'utf8');
console.log('Updated', file, ' (backup at', backup, ')');
