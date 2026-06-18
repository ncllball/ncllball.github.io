#!/usr/bin/env node
// Reads the current HTML from a DNN RadEditor module and writes it to a local file.
// Usage: node --env-file=.env scripts/dnn-radeditor-pull.js <local-html-file> [options]

const fs = require("fs");
const path = require("path");

function loadPlaywright() {
  const candidates = [
    "playwright",
    "C:\\temp\\codex-pw\\node_modules\\playwright",
  ];
  for (const candidate of candidates) {
    try { return require(candidate); } catch {}
  }
  throw new Error("Playwright not installed. Run `npm install playwright` or keep C:\\temp\\codex-pw available.");
}

function usage(exitCode = 0) {
  console.log(`Usage:
  node scripts/dnn-radeditor-pull.js <local-html-file> [options]

Options:
  --tabid <id>           Override tabid discovered from the file header.
  --mid <id>             Override module ID discovered from the file header.
  --profile <dir>        Browser profile dir. Default: _temp/dnn-cms-profile
  --keep-profile         Reuse existing session (skip profile clear + login).
  --headless             Run headless.
  --wait-login-ms <ms>   Login timeout in ms. Default: 180000
  --help                 Show this help.

Discovers tabid/mid from the file's CMS: header comment, then fetches the live module HTML
from DNN RadEditor and overwrites the local file with the pulled content.
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    headless: false,
    profile: path.join(process.cwd(), "_temp", "dnn-cms-profile"),
    keepProfile: false,
    tabid: null,
    mid: null,
    waitLoginMs: 180000,
  };
  const positionals = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") usage(0);
    else if (arg === "--headless") args.headless = true;
    else if (arg === "--profile") args.profile = argv[++i];
    else if (arg === "--keep-profile") args.keepProfile = true;
    else if (arg === "--tabid") args.tabid = argv[++i];
    else if (arg === "--mid") args.mid = argv[++i];
    else if (arg === "--wait-login-ms") args.waitLoginMs = Number(argv[++i]);
    else if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    else positionals.push(arg);
  }

  if (positionals.length !== 1) usage(1);
  args.file = positionals[0];
  return args;
}

function discoverCmsTarget(html) {
  const cmsLine = html.match(/CMS:\s*[^\n]*tabid\s*=\s*(\d+)[^\n]*mid\s*=\s*(\d+)/i);
  if (cmsLine) return { tabid: cmsLine[1], mid: cmsLine[2] };
  const editUrl = html.match(/Default\.aspx\?tabid=(\d+)&ctl=Edit&mid=(\d+)/i);
  if (editUrl) return { tabid: editUrl[1], mid: editUrl[2] };
  const canonical = html.match(/Default\.aspx\?tabid=(\d+)/i);
  return { tabid: canonical?.[1] || null, mid: null };
}

async function waitForManualLogin(page, editUrl, waitLoginMs, email, password) {
  const deadline = Date.now() + waitLoginMs;
  console.log("Waiting for authenticated DNN edit page. Complete login in the browser if prompted.");

  let lastUrl = "";
  let emailSubmitted = false;
  let passwordSubmitted = false;

  while (Date.now() < deadline) {
    const currentUrl = page.url();
    if (currentUrl !== lastUrl) {
      console.log(`[waitForLogin] url: ${currentUrl}`);
      lastUrl = currentUrl;
    }

    if (/www\.ncllball\.com\/Default\.aspx/i.test(currentUrl) && /ctl=Edit/i.test(currentUrl)) return;

    const hasEditor = await page
      .evaluate(() => Boolean(window.Sys?.Application?.getComponents?.().some((c) => /RadEditorDNN/i.test(c.get_id?.() || ""))))
      .catch(() => false);
    if (hasEditor) return;

    if (email && password && !passwordSubmitted && /login\.stacksports\.com/i.test(currentUrl)) {
      if (!emailSubmitted) {
        const emailInput = await page.waitForSelector(
          'input[name="email"], input[type="email"], input[placeholder*="Email" i]',
          { timeout: 5000, state: "visible" },
        ).catch(() => null);
        if (emailInput) {
          console.log("Email form detected; entering email.");
          await emailInput.fill(email);
          await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
          emailSubmitted = true;
          await page.waitForTimeout(2000);
        } else {
          const continueBtn = await page.waitForSelector('button, [role="button"]', { timeout: 3000, state: "visible" }).catch(() => null);
          if (continueBtn) {
            const btnText = await continueBtn.textContent().catch(() => "");
            if (/continue|sign in|log in/i.test(btnText)) {
              await continueBtn.click();
              emailSubmitted = true;
              await page.waitForTimeout(2000);
            }
          }
        }
      }
      if (emailSubmitted && !passwordSubmitted) {
        const passwordInput = await page.waitForSelector(
          'input[type="password"], input[name="password"]',
          { timeout: 8000, state: "visible" },
        ).catch(() => null);
        if (passwordInput) {
          console.log("Password form detected; entering password.");
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

  throw new Error(`Timed out waiting for login after ${waitLoginMs}ms`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const absFile = path.resolve(process.cwd(), args.file);

  let existingHtml = "";
  if (fs.existsSync(absFile)) {
    existingHtml = fs.readFileSync(absFile, "utf8");
  }

  const discovered = discoverCmsTarget(existingHtml);
  const tabid = String(args.tabid || discovered.tabid || "");
  const mid = String(args.mid || discovered.mid || "");

  if (!tabid || !mid) {
    throw new Error("Could not discover tabid and mid. Add a CMS: header to the file or pass --tabid and --mid.");
  }

  const editUrl = `https://www.ncllball.com/Default.aspx?tabid=${tabid}&ctl=Edit&mid=${mid}`;
  const editorId = `dnn_ctr${mid}_EditHtml_txtContent_RadEditorDNN`;

  console.log(`File:   ${absFile}`);
  console.log(`Target: tabid=${tabid}, mid=${mid}`);
  console.log(`Edit:   ${editUrl}`);

  if (!args.keepProfile && fs.existsSync(args.profile)) {
    fs.rmSync(args.profile, { recursive: true, force: true });
    console.log("Profile cleared (use --keep-profile to reuse session).");
  }
  fs.mkdirSync(args.profile, { recursive: true });

  const { chromium } = loadPlaywright();
  const context = await chromium.launchPersistentContext(args.profile, {
    headless: args.headless,
    viewport: { width: 1440, height: 1000 },
    args: ["--disable-dev-shm-usage"],
  });

  const page = context.pages()[0] || (await context.newPage());

  try {
    await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForManualLogin(page, editUrl, args.waitLoginMs, process.env.SC_EMAIL, process.env.SC_PASSWORD);

    if (!/ctl=Edit/i.test(page.url())) {
      await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    }

    await page.waitForFunction(
      ({ editorId }) => {
        const direct = typeof window.$find === "function" ? window.$find(editorId) : null;
        if (direct) return true;
        return Boolean(window.Sys?.Application?.getComponents?.().some((c) => /RadEditorDNN/i.test(c.get_id?.() || "")));
      },
      { editorId },
      { timeout: 60000 },
    );

    const result = await page.evaluate(({ editorId }) => {
      const findEditor = () => {
        const direct = typeof window.$find === "function" ? window.$find(editorId) : null;
        if (direct) return direct;
        return window.Sys?.Application?.getComponents?.().find((c) => /RadEditorDNN/i.test(c.get_id?.() || "")) || null;
      };
      const editor = findEditor();
      if (!editor) return { ok: false, reason: "RadEditor not found" };
      return {
        ok: true,
        editorId: editor.get_id?.() || editorId,
        html: editor.get_html(true),
      };
    }, { editorId });

    if (!result.ok) throw new Error(result.reason || "Failed to read RadEditor content");

    fs.writeFileSync(absFile, result.html, "utf8");
    console.log(`Written ${result.html.length} bytes to ${absFile}`);
    console.log(`Editor ID: ${result.editorId}`);
  } finally {
    await context.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
