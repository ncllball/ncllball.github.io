// Extract CMS blocks from HTML files marked with <!-- CMS:START name --> and <!-- CMS:END name -->
// Usage: node scripts/export-cms-snippets.js
// Outputs snippets to /Snippets/<name>.html

const fs = require('fs');
const path = require('path');

const ROOT = __dirname.replace(/\\scripts$/, '');
const SRC_FILES = [
  path.join(ROOT, '2025 Season', 'summerball25.html'),
];
const OUT_DIR = path.join(ROOT, 'Snippets');

function ensureDirSync(dir) {
  if (fs.existsSync(dir)) return;
  try {
    fs.mkdirSync(dir);
  } catch (e) {
    // Likely parent dirs missing; create recursively (Node <10 fallback)
    ensureDirSync(path.dirname(dir));
    fs.mkdirSync(dir);
  }
}

ensureDirSync(OUT_DIR);

function extractBlocks(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const blocks = {};
  // Capture the inner HTML content for each named block
  const regex = /<!--\s*CMS:START\s*([a-z0-9_-]+)\s*-->\s*([\s\S]*?)\s*<!--\s*CMS:END\s*\1\s*-->/gi;
  var match;
  while ((match = regex.exec(html))) {
    var name = match[1];
    var inner = (match[2] || '').trim();
    blocks[name] = inner + '\n';
  }
  return blocks;
}

function writeBlocks(blocks) {
  for (var name in blocks) {
    if (!Object.prototype.hasOwnProperty.call(blocks, name)) continue;
    var html = blocks[name];
    var outFile = path.join(OUT_DIR, name + '.html');
    ensureDirSync(path.dirname(outFile));
    fs.writeFileSync(outFile, html, 'utf8');
    console.log('Wrote: ' + path.relative(ROOT, outFile) + ' (' + html.length + ' bytes)');
  }
}

(function main(){
  let total = 0;
  for (const file of SRC_FILES) {
    if (!fs.existsSync(file)) continue;
    const blocks = extractBlocks(file);
    writeBlocks(blocks);
    total += Object.keys(blocks).length;
  }
  console.log(`Done. Exported ${total} snippet(s).`);
})();
