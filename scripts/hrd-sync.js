#!/usr/bin/env node
/**
 * hrd-sync.js — CMS sync for the NCLL Home Run Derby multi-module page (tabid=2185065).
 *
 * Usage:
 *   node scripts/hrd-sync.js <phase> [options]
 *
 * Phases:
 *   pre        hrd-pre-event.html + hrd-pre-event-right.html  (mid 2345718, 2270767)
 *   post       hrd-post-event.html + hrd-post-event-right.html (mid 2345718, 2270767)
 *   champions  hrd-past-champions.html                         (mid 2345998)
 *
 * Options:
 *   --save          Click DNN Save. Without this, dry run only — no files written.
 *   --champions     Also sync hrd-past-champions.html when running pre or post phase.
 *   --headless      Run browser headless.
 *   --keep-profile  Reuse existing browser profile (default: cleared before first login).
 *   --profile <dir> Browser profile dir. Default: _temp/dnn-cms-profile
 *   --help
 *
 * Login:
 *   Set SC_EMAIL and SC_PASSWORD env vars for auto-login.
 *   One browser session is shared across all modules in the phase.
 *   Revision markers are bumped in memory; disk is written only after a successful save.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TABID = "2185065";

const PHASE_MAP = {
  pre: [
    { file: "_Events/hrd-pre-event.html", mid: "2345718" },
    { file: "_Events/hrd-pre-event-right.html", mid: "2270767" },
  ],
  post: [
    { file: "_Events/hrd-post-event.html", mid: "2345718" },
    { file: "_Events/hrd-post-event-right.html", mid: "2270767" },
  ],
  champions: [{ file: "_Events/hrd-past-champions.html", mid: "2345998" }],
};

function loadPlaywright() {
  for (const candidate of ["playwright", "C:\\temp\\codex-pw\\node_modules\\playwright"]) {
    try {
      return require(candidate);
    } catch {}
  }
  throw new Error(
    "Playwright not found. Run `npm install playwright` or keep the C:\\temp\\codex-pw install.",
  );
}

function usage(code = 0) {
  console.log(`
Usage: node scripts/hrd-sync.js <phase> [options]

Phases:
  pre        Publish pre-event content  (hrd-pre-event.html + hrd-pre-event-right.html)
  post       Publish post-event content (hrd-post-event.html + hrd-post-event-right.html)
  champions  Sync past champions only   (hrd-past-champions.html)

Options:
  --save          Click DNN Save (without this, dry run — no files written to disk)
  --champions     Also sync hrd-past-champions.html when running pre or post phase
  --headless      Run browser headless
  --keep-profile  Reuse existing browser profile (default: clear before first login)
  --profile <dir> Browser profile dir (default: _temp/dnn-cms-profile)
  --help

Module map:
  mid=2345718  left/main column  (pre-event or post-event recap)
  mid=2270767  right column      (volunteer ask or champions photo)
  mid=2345998  right persistent  (past champions — year-round, update once per year)

Login: set SC_EMAIL and SC_PASSWORD env vars for auto-login.
`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = {
    phase: null,
    save: false,
    champions: false,
    headless: false,
    keepProfile: false,
    profile: path.join(process.cwd(), "_temp", "dnn-cms-profile"),
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") usage(0);
    else if (arg === "--save") args.save = true;
    else if (arg === "--champions") args.champions = true;
    else if (arg === "--headless") args.headless = true;
    else if (arg === "--keep-profile") args.keepProfile = true;
    else if (arg === "--profile") args.profile = argv[++i];
    else if (arg.startsWith("--")) {
      console.error(`Unknown option: ${arg}`);
      usage(1);
    } else if (!args.phase) {
      if (!PHASE_MAP[arg]) {
        console.error(`Unknown phase: "${arg}". Valid phases: pre, post, champions`);
        usage(1);
      }
      args.phase = arg;
    } else {
      console.error(`Unexpected argument: ${arg}`);
      usage(1);
    }
  }

  if (!args.phase) {
    console.error("Phase required: pre, post, or champions");
    usage(1);
  }
  return args;
}

function bumpMarker(html, date) {
  return html.replace(
    /\[r(\d+)\s*·\s*\d{4}-\d{2}-\d{2}\s*·\s*(\d+)\]/,
    (_, n, mid) => `[r${Number(n) + 1} · ${date} · ${mid}]`,
  );
}

function revisionMarker(html) {
  return html.match(/\[r\d+\s*·\s*\d{4}-\d{2}-\d{2}\s*·\s*\d+\]/)?.[0] || null;
}

async function waitForLogin(page, editUrl, email, password) {
  const deadline = Date.now() + 180000;
  console.log("Waiting for authenticated DNN edit page...");

  let lastUrl = "";
  let emailSubmitted = false;
  let passwordSubmitted = false;

  while (Date.now() < deadline) {
    const url = page.url();
    if (url !== lastUrl) {
      console.log(`  [login] ${url}`);
      lastUrl = url;
    }

    if (/www\.ncllball\.com\/Default\.aspx/i.test(url) && /ctl=Edit/i.test(url)) return;

    const hasEditor = await page
      .evaluate(() =>
        Boolean(
          window.Sys?.Application?.getComponents?.().some((c) =>
            /RadEditorDNN/i.test(c.get_id?.() || ""),
          ),
        ),
      )
      .catch(() => false);
    if (hasEditor) return;

    if (email && password && !passwordSubmitted && /login\.stacksports\.com/i.test(url)) {
      if (!emailSubmitted) {
        const emailInput = await page
          .waitForSelector(
            'input[name="email"], input[type="email"], input[placeholder*="Email" i]',
            { timeout: 5000, state: "visible" },
          )
          .catch(() => null);

        if (emailInput) {
          console.log("  Email form detected — entering credentials.");
          await emailInput.fill(email);
          await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
          emailSubmitted = true;
          await page.waitForTimeout(2000);
        } else {
          const btn = await page
            .waitForSelector("button, [role=\"button\"]", { timeout: 3000, state: "visible" })
            .catch(() => null);
          if (btn) {
            const text = await btn.textContent().catch(() => "");
            if (/continue|sign in|log in/i.test(text)) {
              console.log(`  "${text.trim()}" button — clicking cached identity.`);
              await btn.click();
              emailSubmitted = true;
              await page.waitForTimeout(2000);
            }
          }
        }
      }

      if (emailSubmitted && !passwordSubmitted) {
        const pwInput = await page
          .waitForSelector('input[type="password"], input[name="password"]', {
            timeout: 8000,
            state: "visible",
          })
          .catch(() => null);
        if (pwInput) {
          console.log("  Password form — entering password.");
          await pwInput.fill(password);
          await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
          passwordSubmitted = true;
          await page.waitForTimeout(3000);
        }
      }
    }

    if (/www\.ncllball\.com/i.test(url) && !/ctl=Edit/i.test(url)) {
      await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    } else if (
      !/login\.stacksports\.com|core-api\.bluesombrero\.com|www\.ncllball\.com/i.test(url)
    ) {
      await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    }

    await page.waitForTimeout(1000);
  }

  throw new Error("Timed out waiting for login after 180s");
}

async function syncModule(page, { file, mid }, html, args, isFirst) {
  const editUrl = `https://www.ncllball.com/Default.aspx?tabid=${TABID}&ctl=Edit&mid=${mid}`;
  const editorId = `dnn_ctr${mid}_EditHtml_txtContent_RadEditorDNN`;
  const marker = revisionMarker(html);
  const sha256 = crypto.createHash("sha256").update(html, "utf8").digest("hex");

  console.log(`\n── ${file}  (mid=${mid}) ──`);
  console.log(`   SHA256: ${sha256}`);
  console.log(`   Marker: ${marker || "(none)"}`);

  await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

  if (isFirst) {
    await waitForLogin(page, editUrl, process.env.SC_EMAIL, process.env.SC_PASSWORD);
    if (!/ctl=Edit/i.test(page.url())) {
      await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    }
  }

  await page.waitForFunction(
    ({ editorId }) => {
      const direct = typeof window.$find === "function" ? window.$find(editorId) : null;
      if (direct) return true;
      return Boolean(
        window.Sys?.Application?.getComponents?.().some((c) =>
          /RadEditorDNN/i.test(c.get_id?.() || ""),
        ),
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
          window.Sys?.Application?.getComponents?.().find((c) =>
            /RadEditorDNN/i.test(c.get_id?.() || ""),
          ) || null
        );
      };

      const editor = findEditor();
      if (!editor) return { ok: false, reason: "RadEditor not found" };

      const before = editor.get_html ? editor.get_html(true) : "";
      editor.get_html = () => html;
      editor.set_html(html);

      return {
        ok: true,
        beforeLength: before.length,
        afterLength: html.length,
        hasMarker: marker ? html.includes(marker) : null,
        hasStylesheet: /ncllball\.github\.io\/css\.css/.test(html),
        hasTypekit: /use\.typekit\.net\/ldx2icb\.css/.test(html),
        saveButtonFound: Boolean(document.querySelector('a[id*="cmdSave"]')),
      };
    },
    { editorId, html, marker },
  );

  console.log("   Injection:", JSON.stringify(injected));

  if (!injected.ok) throw new Error(`${file}: ${injected.reason}`);
  if (!injected.saveButtonFound) throw new Error(`${file}: Save button not found`);
  if (marker && !injected.hasMarker)
    throw new Error(`${file}: Revision marker missing after injection`);
  if (!injected.hasStylesheet)
    throw new Error(`${file}: css.css stylesheet not found — check <head>`);

  if (!args.save) {
    console.log("   Dry run — no save.");
    return false;
  }

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 90000 }).catch(() => null),
    page.click('a[id*="cmdSave"]'),
  ]);

  await page.waitForTimeout(2000);
  console.log(`   Saved. URL: ${page.url()}`);
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let modules = [...PHASE_MAP[args.phase]];
  if (args.champions && args.phase !== "champions") {
    modules = modules.concat(PHASE_MAP.champions);
  }

  const today = new Date().toISOString().slice(0, 10);

  // Bump markers in memory; disk write deferred until after successful save.
  const work = modules.map(({ file, mid }) => {
    const absFile = path.resolve(process.cwd(), file);
    const original = fs.readFileSync(absFile, "utf8");
    const bumped = bumpMarker(original, today);
    const before = revisionMarker(original);
    const after = revisionMarker(bumped);
    return { file, mid, absFile, original, bumped, before, after };
  });

  console.log(`\nPhase: ${args.phase}${args.champions && args.phase !== "champions" ? " + champions" : ""}`);
  console.log(`Mode:  ${args.save ? "SAVE" : "DRY RUN"}`);
  console.log("Marker bumps:");
  for (const w of work) {
    console.log(`  ${w.file}: ${w.before || "(none)"} → ${w.after || "(none)"}`);
  }

  if (!args.keepProfile && fs.existsSync(args.profile)) {
    fs.rmSync(args.profile, { recursive: true, force: true });
    console.log("\nProfile cleared.");
  }
  fs.mkdirSync(args.profile, { recursive: true });

  const { chromium } = loadPlaywright();
  const context = await chromium.launchPersistentContext(args.profile, {
    headless: args.headless,
    viewport: { width: 1440, height: 1000 },
    args: ["--disable-dev-shm-usage"],
  });
  const page = context.pages()[0] || (await context.newPage());

  let saved = 0;
  try {
    for (let i = 0; i < work.length; i++) {
      const w = work[i];
      const didSave = await syncModule(page, { file: w.file, mid: w.mid }, w.bumped, args, i === 0);
      if (didSave) {
        fs.writeFileSync(w.absFile, w.bumped, "utf8");
        console.log(`   Written: ${w.absFile}`);
        saved++;
      }
    }

    console.log(
      args.save
        ? `\n✓ Done — ${saved}/${work.length} modules saved.`
        : `\nDry run complete. Re-run with --save to save.`,
    );
  } finally {
    await context.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
