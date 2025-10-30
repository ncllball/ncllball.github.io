const fs = require('fs');
const path = require('path');

// Usage: node expand-snippets.js [rootDir]
// Scans .html and .md files under rootDir (default: repository root) for markers like:
// <!-- SNIPPET: Snippets/yst350-default-table.html id=yst350-tball-caption -->
// and replaces the marker with the snippet file contents. If id= is provided,
// the script rewrites the first <caption id="..."> in the snippet to use the provided id.

const root = process.argv[2] || process.cwd();

function findFiles(dir, exts) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and .git
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      results.push(...findFiles(full, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

const files = findFiles(root, ['.html', '.md']);

const markerRe = /<!--\s*SNIPPET:\s*([^\s>]+)(?:\s+id=([^\s>]+))?\s*-->/g;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let didReplace = false;
  const original = content;
  content = content.replace(markerRe, (m, snippetPath, overrideId) => {
    // Try resolving snippet path relative to the file first, then repo root
    let snippetFull = path.resolve(path.dirname(file), snippetPath);
    if (!fs.existsSync(snippetFull)) {
      const alt = path.resolve(root, snippetPath);
      if (fs.existsSync(alt)) snippetFull = alt;
    }
    let snippetContent;
    try {
      snippetContent = fs.readFileSync(snippetFull, 'utf8');
    } catch (err) {
      console.error(`Missing snippet file: ${snippetFull} referenced from ${file}`);
      return m; // leave marker in place
    }
    // If an override id is provided, replace the first caption id in the snippet
    if (overrideId) {
      snippetContent = snippetContent.replace(/(<caption[^>]*id=")([^"]+)("[^>]*>)/i, `$1${overrideId}$3`);
    }
    didReplace = true;
    return snippetContent;
  });

  if (didReplace && content !== original) {
    // backup
    try {
      fs.copyFileSync(file, file + '.bak-snippets');
    } catch (e) {
      console.error('Failed to write backup for', file, e.message);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Expanded snippets in', file);
  }
}

console.log('Done.');
