#!/usr/bin/env node
// Pulls HTML from multiple DNN RadEditor modules in a single browser session.
// Usage: node --env-file=.env scripts/dnn-radeditor-pull-batch.js <file1> <file2> ...

const fs = require("fs");
const path = require("path");

function loadPlaywright() {
  const candidates = ["playwright", "C:\\temp\\codex-pw\\node_modules\\playwright"];
  for (const candidate of candidates) {
    try { return require(candidate); } catch {}
  }
  throw new Error("Playwright not installed.");
}

function discoverCmsTarget(html) {
  const cmsLine = html.match(/CMS:\s*[^\n]*tabid\s*=\s*(\d+)[^\n]*mid\s*=\s*(\d+)/i);
  if (cmsLine) return { tabid: cmsLine[1], mid: cmsLine[2] };
  const editUrl = html.match(/Default\.aspx\?tabid=(\d+)&ctl=Edit&mid=(\d+)/i);
  if (editUrl) return { tabid: editUrl[1], mid: editUrl[2] };
  return { tabid: null, mid: null };
}

async function waitForEditor(page, editUrl, waitLoginMs) {
  const deadline = Date.now() + waitLoginMs;
  const email = process.env.SC_EMAIL;
  const password = process.env.SC_PASSWORD;
  let emailSubmitted = false;
  let passwordSubmitted = false;
  let lastUrl = "";

  while (Date.now() < deadline) {
    const currentUrl = page.url();
    if (currentUrl !== lastUrl) {
      console.log(`  [nav] ${currentUrl}`);
      lastUrl = currentUrl;
    }

    if (/ctl=Edit/i.test(currentUrl)) {
      const hasEditor = await page.evaluate(() =>
        Boolean(window.Sys?.Application?.getComponents?.().some((c) => /RadEditorDNN/i.test(c.get_id?.() || "")))
      ).catch(() => false);
      if (hasEditor) return;
    }

    if (email && password && !passwordSubmitted && /login\.stacksports\.com/i.test(currentUrl)) {
      if (!emailSubmitted) {
        const emailInput = await page.waitForSelector(
          'input[name="email"], input[type="email"], input[placeholder*="Email" i]',
          { timeout: 5000, state: "visible" }
        ).catch(() => null);
        if (emailInput) {
          await emailInput.fill(email);
          await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
          emailSubmitted = true;
          await page.waitForTimeout(2000);
        }
      }
      if (emailSubmitted && !passwordSubmitted) {
        const passwordInput = await page.waitForSelector(
          'input[type="password"], input[name="password"]',
          { timeout: 8000, state: "visible" }
        ).catch(() => null);
        if (passwordInput) {
          await passwordInput.fill(password);
          await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
          passwordSubmitted = true;
          await page.waitForTimeout(3000);
        }
      }
    }

    if (/www\.ncllball\.com/i.test(currentUrl) && !/ctl=Edit/i.test(currentUrl)) {
      await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    } else if (!/login\.stacksports\.com|core-api\.bluesombrero\.com|www\.ncllball\.com/i.test(currentUrl)) {
      await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    }

    await page.waitForTimeout(1000);
  }
  throw new Error(`Timed out waiting for editor at ${editUrl}`);
}

async function pullOne(page, absFile, tabid, mid) {
  const editUrl = `https://www.ncllball.com/Default.aspx?tabid=${tabid}&ctl=Edit&mid=${mid}`;
  const editorId = `dnn_ctr${mid}_EditHtml_txtContent_RadEditorDNN`;

  console.log(`\n→ tabid=${tabid} mid=${mid}`);
  console.log(`  ${absFile}`);

  await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForEditor(page, editUrl, 180000);

  await page.waitForFunction(
    ({ editorId }) => {
      const direct = typeof window.$find === "function" ? window.$find(editorId) : null;
      if (direct) return true;
      return Boolean(window.Sys?.Application?.getComponents?.().some((c) => /RadEditorDNN/i.test(c.get_id?.() || "")));
    },
    { editorId },
    { timeout: 60000 }
  );

  const result = await page.evaluate(({ editorId }) => {
    const findEditor = () => {
      const direct = typeof window.$find === "function" ? window.$find(editorId) : null;
      if (direct) return direct;
      return window.Sys?.Application?.getComponents?.().find((c) => /RadEditorDNN/i.test(c.get_id?.() || "")) || null;
    };
    const editor = findEditor();
    if (!editor) return { ok: false, reason: "RadEditor not found" };
    return { ok: true, html: editor.get_html(true) };
  }, { editorId });

  if (!result.ok) throw new Error(`${mid}: ${result.reason}`);

  fs.writeFileSync(absFile, result.html, "utf8");
  console.log(`  ✓ ${result.html.length} bytes written`);
}

async function main() {
  const files = process.argv.slice(2).filter(a => !a.startsWith("--"));
  if (!files.length) {
    console.log("Usage: node scripts/dnn-radeditor-pull-batch.js <file1> [file2 ...]");
    process.exit(1);
  }

  const targets = files.map(f => {
    const absFile = path.resolve(process.cwd(), f);
    const html = fs.existsSync(absFile) ? fs.readFileSync(absFile, "utf8") : "";
    const { tabid, mid } = discoverCmsTarget(html);
    if (!tabid || !mid) throw new Error(`Cannot discover tabid/mid from: ${f}`);
    return { absFile, tabid, mid };
  });

  const profile = path.join(process.cwd(), "_temp", "dnn-cms-profile");
  if (fs.existsSync(profile)) fs.rmSync(profile, { recursive: true, force: true });
  fs.mkdirSync(profile, { recursive: true });

  const { chromium } = loadPlaywright();
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 1000 },
    args: ["--disable-dev-shm-usage"],
  });

  const page = context.pages()[0] || (await context.newPage());

  try {
    for (const { absFile, tabid, mid } of targets) {
      await pullOne(page, absFile, tabid, mid);
    }
    console.log("\nAll done.");
  } finally {
    await context.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
