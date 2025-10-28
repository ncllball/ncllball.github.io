const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();

  const targets = [
    { name: 'desktop', options: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', options: { ...devices['iPhone 12'] } },
  ];

  const pages = [
    { file: 'Volunteer/friendslist.html', slug: 'volunteer' },
    { file: 'Baseball/index.html', slug: 'baseball' },
    { file: 'Softball/index.html', slug: 'softball' },
    { file: 'Player Development/index.html', slug: 'pd' },
  ];

  const outDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const p of pages) {
    const abs = path.join(process.cwd(), p.file);
    const fileUrl = 'file:///' + abs.split(path.sep).join('/');
    for (const t of targets) {
      console.log(`Opening ${fileUrl} as ${t.name}...`);
      const context = t.options.device ? await browser.newContext(t.options) : await browser.newContext({ viewport: t.options.viewport });
      const page = await context.newPage();
      try {
        await page.goto(fileUrl, { waitUntil: 'networkidle' });
      } catch (err) {
        console.warn(`Warning: could not fully load ${fileUrl}:`, err.message);
      }
      const out = path.join(outDir, `${p.slug}-${t.name}.png`);
      await page.screenshot({ path: out, fullPage: true });
      console.log('Saved', out);
      await context.close();
    }
  }

  await browser.close();
  console.log('Screenshots complete.');
})();
