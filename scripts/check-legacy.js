const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORES = ['node_modules', '.git', 'screenshots', '.playwright', 'playwright-report', 'dist'];

const patterns = [
  'division__detail-content',
  'division-card',
  'division-card__',
  'division-meta',
  'division-blurb',
  'division-hero__title',
  'division-card__graphic',
  'program-card'
];

function isIgnored(filePath) {
  return IGNORES.some(i => filePath.split(path.sep).includes(i));
}

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (isIgnored(filePath)) return;
    if (stat && stat.isDirectory()) {
      results.push(...walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function searchFile(file, patterns) {
  const ext = path.extname(file).toLowerCase();
  if (!['.html', '.css', '.js', '.md'].includes(ext)) return [];
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const hits = [];

  lines.forEach((line, idx) => {
    patterns.forEach(pat => {
      if (line.includes(pat)) hits.push({ line: idx + 1, match: pat, text: line.trim() });
    });
  });

  return hits;
}

function main() {
  const files = walk(ROOT);
  const report = {};
  files.forEach(file => {
    const hits = searchFile(file, patterns);
    if (hits.length) report[file] = hits;
  });

  const totalFiles = Object.keys(report).length;
  console.log('Legacy selector check complete. Files with matches:', totalFiles);
  if (totalFiles === 0) {
    console.log('No legacy selectors found — safe to remove legacy CSS.');
    process.exit(0);
  }

  for (const f of Object.keys(report)) {
    console.log('\n---', path.relative(ROOT, f));
    report[f].forEach(h => console.log(`  ${h.line}: [${h.match}] ${h.text}`));
  }

  console.log('\nRecommendation: migrate or remove occurrences above before deleting legacy CSS selectors.');
  process.exit(1);
}

main();
