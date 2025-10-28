const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const repoRoot = process.cwd();
const screenshots = [
  'screenshots/volunteer-desktop.png',
  'screenshots/volunteer-mobile.png',
  'screenshots/baseball-desktop.png',
  'screenshots/baseball-mobile.png',
  'screenshots/softball-desktop.png',
  'screenshots/softball-mobile.png',
  'screenshots/pd-desktop.png',
  'screenshots/pd-mobile.png'
];

const outDir = path.join(repoRoot, 'reports', 'diffs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const tmpOld = path.join(repoRoot, 'tmp', 'old-screenshots');
if (!fs.existsSync(tmpOld)) fs.mkdirSync(tmpOld, { recursive: true });

const results = [];

screenshots.forEach(file => {
  const name = path.basename(file);
  // try to get file from HEAD~1
  let oldBuf = null;
  try {
    oldBuf = execSync(`git show HEAD~1:${file}`, { stdio: ['pipe','pipe','ignore'] });
  } catch (err) {
    // file may not exist in HEAD~1
  }
  if (!oldBuf || oldBuf.length === 0) {
    console.log(`${name}: no baseline (not present in HEAD~1) — skipping`);
    results.push({ name, status: 'no-baseline' });
    return;
  }
  const oldPath = path.join(tmpOld, name);
  fs.writeFileSync(oldPath, oldBuf);
  const newPath = path.join(repoRoot, file);
  if (!fs.existsSync(newPath)) {
    console.log(`${name}: current screenshot missing — skipping`);
    results.push({ name, status: 'no-current' });
    return;
  }
  const oldPng = PNG.sync.read(fs.readFileSync(oldPath));
  const newPng = PNG.sync.read(fs.readFileSync(newPath));
  if (oldPng.width !== newPng.width || oldPng.height !== newPng.height) {
    console.log(`${name}: dimension mismatch (old ${oldPng.width}x${oldPng.height} vs new ${newPng.width}x${newPng.height}) — skipping`);
    results.push({ name, status: 'dimension-mismatch' });
    return;
  }
  const { width, height } = oldPng;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(oldPng.data, newPng.data, diff.data, width, height, { threshold: 0.08 });
  const outPath = path.join(outDir, name.replace('.png', '.diff.png'));
  fs.writeFileSync(outPath, PNG.sync.write(diff));
  const totalPixels = width * height;
  const pct = ((diffPixels / totalPixels) * 100).toFixed(4);
  console.log(`${name}: ${diffPixels} px different (${pct}%); diff saved to ${outPath}`);
  results.push({ name, status: 'ok', diffPixels, totalPixels, pct, diffPath: outPath });
});

// summary
const ok = results.filter(r => r.status === 'ok');
console.log('\nSummary:');
ok.forEach(r => console.log(`  ${r.name}: ${r.diffPixels} px (${r.pct}%)`));
const totalDiff = ok.reduce((s, r) => s + r.diffPixels, 0);
console.log(`Total diff pixels across compared images: ${totalDiff}`);

process.exit(0);
