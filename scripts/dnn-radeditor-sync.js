#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

function loadPlaywright() {
  const candidates = [
    "playwright",
    "C:\\temp\\codex-pw\\node_modules\\playwright",
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // Try the next known install location.
    }
  }

  throw new Error(
    "Playwright is not installed. Run `npm install playwright` in this repo, or keep the C:\\temp\\codex-pw install available.",
  );
}

function usage(exitCode = 0) {
  console.log(`Usage:
  node scripts/dnn-radeditor-sync.js <local-html-file> [options]

Options:
  --save                 Click DNN Save after injecting. Without this, this is a dry run.
  --headless             Run browser headless. Default is headed so you can log in/inspect.
  --profile <dir>        Persistent browser profile. Default: _temp/dnn-cms-profile
  --keep-profile         Do NOT clear the browser profile before launching (default clears it).
  --tabid <id>           Override tabid discovered from the file header/canonical URL.
  --mid <id>             Override module ID discovered from the file header.
  --wait-login-ms <ms>   Time to wait for manual login. Default: 180000
  --help                 Show this help.

Login:
  The profile is cleared before each run by default so the Stack Sports login form always appears.
  Use --keep-profile to reuse a cached session. Pass SC_EMAIL and SC_PASSWORD for auto-login.

Examples:
  node scripts/dnn-radeditor-sync.js _Programs/summerball-faq.html
  node scripts/dnn-radeditor-sync.js _Programs/summerball-faq.html --save
  node scripts/dnn-radeditor-sync.js _Programs/summerball-main.html --save
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    save: false,
    headless: false,
    profile: path.join(process.cwd(), "_temp", "dnn-cms-profile"),
    keepProfile: false,
    tabid: null,
    mid: null,
    waitLoginMs: 180000,
  };
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") usage(0);
    else if (arg === "--save") args.save = true;
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

function revisionMarker(html) {
  return html.match(/\[r\d+\s*·\s*\d{4}-\d{2}-\d{2}\s*·\s*\d+\]/)?.[0] || null;
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

    if (/www\.ncllball\.com\/Default\.aspx/i.test(currentUrl) && /ctl=Edit/i.test(currentUrl)) {
      return;
    }

    const hasEditor = await page
      .evaluate(() => Boolean(window.Sys?.Application?.getComponents?.().some((c) => /RadEditorDNN/i.test(c.get_id?.() || ""))))
      .catch(() => false);
    if (hasEditor) return;

    if (email && password && !passwordSubmitted && /login\.stacksports\.com/i.test(currentUrl)) {
      if (!emailSubmitted) {
        // Account selector: "Welcome Back! Select an account" — shown when --keep-profile reuses a session
        const accountTile = page.locator(`text="${email}"`).first();
        const tileVisible = await accountTile.isVisible().catch(() => false);
        if (tileVisible) {
          console.log("Account selector detected; clicking saved account.");
          await accountTile.click();
          emailSubmitted = true;
          await page.waitForTimeout(2000);
        } else {
          const emailInput = await page.waitForSelector(
            'input[name="email"], input[type="email"], input[placeholder*="Email" i]',
            { timeout: 5000, state: "visible" },
          ).catch(() => null);
          if (emailInput) {
            console.log("Email form detected; entering email.");
            await emailInput.fill(email);
            await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
            emailSubmitted = true;
            console.log("Email submitted.");
            await page.waitForTimeout(2000);
          } else {
            // Stack Sports may show "Continue as <email>" when identity is cached in profile cookies.
            const continueBtn = await page.waitForSelector(
              'button, [role="button"]',
              { timeout: 3000, state: "visible" },
            ).catch(() => null);
            if (continueBtn) {
              const btnText = await continueBtn.textContent().catch(() => "");
              if (/continue|sign in|log in/i.test(btnText)) {
                console.log(`"${btnText.trim()}" button detected; clicking to proceed with cached identity.`);
                await continueBtn.click();
                emailSubmitted = true;
                await page.waitForTimeout(2000);
              }
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
          console.log("Password submitted; waiting for OAuth redirect.");
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

async function maybeAutoLogin(page) {
  const email = process.env.SC_EMAIL;
  const password = process.env.SC_PASSWORD;
  if (!email || !password) return false;

  const emailInput = page.locator('input[name="email"], input[type="email"], input[placeholder*="Email" i]').first();
  if (!(await emailInput.count().catch(() => 0))) return false;

  console.log("Login form detected; using SC_EMAIL/SC_PASSWORD from environment.");
  await emailInput.fill(email);
  await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();

  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.waitFor({ timeout: 30000 });
  await passwordInput.fill(password);
  await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const absFile = path.resolve(process.cwd(), args.file);
  const html = fs.readFileSync(absFile, "utf8");
  const discovered = discoverCmsTarget(html);
  const tabid = String(args.tabid || discovered.tabid || "");
  const mid = String(args.mid || discovered.mid || "");

  if (!tabid || !mid) {
    throw new Error("Could not discover tabid and mid. Add a CMS header or pass --tabid and --mid.");
  }

  const sha256 = crypto.createHash("sha256").update(html, "utf8").digest("hex");
  const marker = revisionMarker(html);
  const editUrl = `https://www.ncllball.com/Default.aspx?tabid=${tabid}&ctl=Edit&mid=${mid}`;
  const liveUrl = `https://www.ncllball.com/Default.aspx?tabid=${tabid}`;
  const editorId = `dnn_ctr${mid}_EditHtml_txtContent_RadEditorDNN`;

  if (!args.keepProfile && fs.existsSync(args.profile)) {
    fs.rmSync(args.profile, { recursive: true, force: true });
    console.log("Profile cleared (use --keep-profile to reuse).");
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
    console.log(`File: ${absFile}`);
    console.log(`Target: tabid=${tabid}, mid=${mid}`);
    console.log(`SHA256: ${sha256}`);
    console.log(`Mode: ${args.save ? "SAVE" : "DRY RUN - no save button click"}`);

    await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForManualLogin(page, editUrl, args.waitLoginMs, process.env.SC_EMAIL, process.env.SC_PASSWORD);

    if (!/ctl=Edit/i.test(page.url())) {
      await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    }

    await page.waitForFunction(
      ({ editorId }) => {
        const direct = typeof window.$find === "function" ? window.$find(editorId) : null;
        if (direct) return true;
        return Boolean(
          window.Sys?.Application
            ?.getComponents?.()
            .some((component) => /RadEditorDNN/i.test(component.get_id?.() || "")),
        );
      },
      { editorId },
      { timeout: 60000 },
    );

    const injected = await page.evaluate(
      ({ editorId, html, marker }) => {
        const findEditor = () => {
          const direct = typeof window.$find === "function" ? window.$find(editorId) : null;
          if (direct) return direct;
          return (
            window.Sys?.Application
              ?.getComponents?.()
              .find((component) => /RadEditorDNN/i.test(component.get_id?.() || "")) || null
          );
        };

        const editor = findEditor();
        if (!editor) {
          return {
            ok: false,
            reason: "RadEditor not found",
            components: window.Sys?.Application?.getComponents?.().map((c) => c.get_id?.()).filter(Boolean) || [],
          };
        }

        const before = editor.get_html ? editor.get_html(true) : "";

        // Override get_html so DNN's pre-submit hook saves our full HTML document
        // (including <head>/<link> tags). set_html() alone strips the head — DNN reads
        // get_html() right before form submit, so this is the correct intercept point.
        editor.get_html = () => html;
        editor.set_html(html);

        return {
          ok: true,
          editorId: editor.get_id?.() || editorId,
          beforeLength: before.length,
          afterLength: html.length,
          sourceLength: html.length,
          hasMarker: marker ? html.includes(marker) : null,
          hasStylesheet: /ncllball\.github\.io\/css\.css/.test(html),
          hasTypekit: /use\.typekit\.net\/ldx2icb\.css/.test(html),
          saveButtonFound: Boolean(document.querySelector('a[id*="cmdSave"]')),
        };
      },
      { editorId, html, marker },
    );

    console.log("Injection result:");
    console.log(JSON.stringify(injected, null, 2));

    if (!injected.ok) throw new Error(injected.reason || "Injection failed");
    if (!injected.saveButtonFound) throw new Error("Save button not found after injection");
    if (marker && !injected.hasMarker) throw new Error(`Revision marker not found after injection: ${marker}`);
    if (!injected.hasStylesheet) throw new Error("css.css link not found in source HTML — check the file has the standard stylesheet link in <head>.");

    if (!args.save) {
      console.log("Dry run complete. Re-run with --save to click DNN Save.");
      return;
    }

    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 90000 }).catch(() => null),
      page.click('a[id*="cmdSave"]'),
    ]);

    await page.waitForTimeout(3000);
    console.log(`Saved. Current URL: ${page.url()}`);

    await page.goto(`${liveUrl}&_cmscheck=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const liveCheck = await page.evaluate((marker) => {
      const text = document.body?.innerText || "";
      return {
        title: document.title,
        hasMarker: marker ? text.includes(marker) : null,
        hasSummerballFaq: /Summerball/i.test(text) && /FAQs/i.test(text),
      };
    }, marker);
    console.log("Live/admin-session check:");
    console.log(JSON.stringify(liveCheck, null, 2));
  } finally {
    await context.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
