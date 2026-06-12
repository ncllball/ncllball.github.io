#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const CONFIG = {
  tabid: "1932693",
  mid: "2026832",
  portalId: "83437",
  newskeyid: "HN1",
  tw: "80",
  th: "80",
  w: "200",
  h: "120",
};

const IDS = {
  datePicker: "dnn_ctr2026832_AddEditNews_newsDate",
  dateInput: "dnn_ctr2026832_AddEditNews_newsDate_dateInput",
  title: "dnn_ctr2026832_AddEditNews_newsTitleTextBox",
  summaryEditor: "dnn_ctr2026832_AddEditNews_newsDescriptionTextArea_miniRichEditor",
  detailsEditor: "dnn_ctr2026832_AddEditNews_newsDetailsTextEditor",
  photoName: "dnn_ctr2026832_AddEditNews_MyPhoto_hddienimageName",
  copyToTeamPages: "dnn_ctr2026832_AddEditNews_chkNewsCopyToTeamPages",
  archive: "dnn_ctr2026832_AddEditNews_chkArchive",
  visibleOnTeamPage: "dnn_ctr2026832_AddEditNews_hdn_IsVisibileOnTeamPage",
  save: "dnn_ctr2026832_AddEditNews_SaveNewsLinkButton",
};

function loadPlaywright() {
  for (const candidate of ["playwright", "C:\\temp\\codex-pw\\node_modules\\playwright"]) {
    try {
      return require(candidate);
    } catch {
      // Try the next known install location.
    }
  }
  throw new Error("Playwright is not installed. Install it in this repo or keep C:\\temp\\codex-pw available.");
}

function usage(exitCode = 0) {
  console.log(`Usage:
  node scripts/ncll-news-admin.js list [options]
  node scripts/ncll-news-admin.js inspect <newsid> [options]
  node scripts/ncll-news-admin.js draft --json <file> [--publish] [options]
  node scripts/ncll-news-admin.js edit <newsid> --json <file> [--publish] [options]
  node scripts/ncll-news-admin.js archive <newsid> [options]
  node scripts/ncll-news-admin.js unarchive <newsid> [options]
  node scripts/ncll-news-admin.js delete <newsid> [options]

Commands:
  list               List all current news items.
  inspect <newsid>   Read a specific item's field values.
  draft              Fill the add-news form (dry run). Use --publish to click Save.
  edit <newsid>      Update an existing item. Fills form from JSON. Use --publish to save.
  archive <newsid>   Check the Archive box on an existing item and save.
  unarchive <newsid> Uncheck the Archive box on an existing item and save.
  delete <newsid>    Click the Delete button on an existing item (permanent).

Options:
  --json <file>          News item JSON for draft/edit.
  --publish              Click Save. Without this, draft/edit is a dry run only.
  --headless             Run browser headless. Default is headed.
  --profile <dir>        Browser profile. Default: _temp/dnn-news-admin-profile
  --keep-profile         Reuse profile instead of clearing before launch.
  --wait-login-ms <ms>   Login wait. Default: 180000.
  --help                 Show this help.

JSON shape (draft / edit):
  {
    "date": "2026-06-12",
    "title": "News title (max 99 chars)",
    "summaryHtml": "<p>Short listing copy shown in the Comings and Goings list</p>",
    "detailsHtml": "<p>Full news body shown on the detail page</p>",
    "copyToTeamPages": false,
    "archive": false,
    "photoName": ""
  }

Login:
  Set SC_EMAIL and SC_PASSWORD for automatic Stack Sports login.
`);
  process.exit(exitCode);
}

const NEWSID_COMMANDS = ["inspect", "edit", "archive", "unarchive", "delete"];
const ALL_COMMANDS = ["list", "draft", ...NEWSID_COMMANDS];

function parseArgs(argv) {
  const args = {
    command: argv[0],
    newsid: null,
    jsonFile: null,
    publish: false,
    headless: false,
    profile: path.join(process.cwd(), "_temp", "dnn-news-admin-profile"),
    keepProfile: false,
    waitLoginMs: 180000,
  };

  if (!args.command || args.command === "--help" || args.command === "-h") usage(0);
  let i = 1;

  if (NEWSID_COMMANDS.includes(args.command) && argv[i] && !argv[i].startsWith("--")) {
    args.newsid = argv[i];
    i += 1;
  }

  for (; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") usage(0);
    else if (arg === "--json") args.jsonFile = argv[++i];
    else if (arg === "--publish") args.publish = true;
    else if (arg === "--headless") args.headless = true;
    else if (arg === "--profile") args.profile = argv[++i];
    else if (arg === "--keep-profile") args.keepProfile = true;
    else if (arg === "--wait-login-ms") args.waitLoginMs = Number(argv[++i]);
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (!ALL_COMMANDS.includes(args.command)) { console.error(`Unknown command: ${args.command}`); usage(1); }
  if (NEWSID_COMMANDS.includes(args.command) && !args.newsid) throw new Error(`${args.command} requires a newsid`);
  if (args.command === "draft" && !args.jsonFile) throw new Error("draft requires --json <file>");
  if (args.command === "edit" && !args.jsonFile) throw new Error("edit requires --json <file>");
  return args;
}

function baseQuery(ctl) {
  const params = new URLSearchParams({
    tabid: CONFIG.tabid,
    tw: CONFIG.tw,
    th: CONFIG.th,
    w: CONFIG.w,
    newskeyid: CONFIG.newskeyid,
    h: CONFIG.h,
    mid: CONFIG.mid,
    ctl,
  });
  return `https://www.ncllball.com/Default.aspx?${params.toString()}`;
}

function manageUrl() {
  return baseQuery("managenews");
}

function editUrl(newsid = "") {
  const url = new URL(baseQuery("editnews"));
  if (newsid) url.searchParams.set("newsid", newsid);
  return url.toString();
}

async function waitForTarget(page, targetPattern, targetUrl, waitMs) {
  const deadline = Date.now() + waitMs;
  const email = process.env.SC_EMAIL;
  const password = process.env.SC_PASSWORD;
  let lastUrl = "";
  let emailSubmitted = false;
  let passwordSubmitted = false;

  while (Date.now() < deadline) {
    const currentUrl = page.url();
    if (currentUrl !== lastUrl) {
      console.log(`[login] ${currentUrl}`);
      lastUrl = currentUrl;
    }

    if (/www\.ncllball\.com\/+Default\.aspx/i.test(currentUrl) && targetPattern.test(currentUrl)) return;

    if (email && password && /login\.stacksports\.com/i.test(currentUrl)) {
      if (!emailSubmitted) {
        const emailInput = await page
          .waitForSelector('input[name="email"], input[type="email"], input[placeholder*="Email" i]', {
            timeout: 4000,
            state: "visible",
          })
          .catch(() => null);
        if (emailInput) {
          console.log("Email form detected; entering SC_EMAIL.");
          await emailInput.fill(email);
          await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
          emailSubmitted = true;
          await page.waitForTimeout(1500);
        } else {
          const buttons = await page.locator('button, [role="button"]').all();
          for (const button of buttons) {
            const text = (await button.textContent().catch(() => "")).trim();
            if (/continue|sign in|log in|registrar/i.test(text)) {
              console.log(`Cached identity button detected: ${text}`);
              await button.click();
              emailSubmitted = true;
              await page.waitForTimeout(1500);
              break;
            }
          }
        }
      }

      if (emailSubmitted && !passwordSubmitted) {
        const passwordInput = await page
          .waitForSelector('input[type="password"], input[name="password"]', {
            timeout: 8000,
            state: "visible",
          })
          .catch(() => null);
        if (passwordInput) {
          console.log("Password form detected; entering SC_PASSWORD.");
          await passwordInput.fill(password);
          await page.getByRole("button", { name: /continue|next|sign in|log in/i }).first().click();
          passwordSubmitted = true;
          await page.waitForTimeout(3000);
        }
      }
    }

    if (/www\.ncllball\.com/i.test(currentUrl) && !targetPattern.test(currentUrl)) {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    }

    await page.waitForTimeout(1000);
  }

  throw new Error(`Timed out waiting for target page after ${waitMs}ms`);
}

async function openContext(args) {
  if (!args.keepProfile && fs.existsSync(args.profile)) {
    fs.rmSync(args.profile, { recursive: true, force: true });
    console.log("Profile cleared (use --keep-profile to reuse).");
  }
  fs.mkdirSync(args.profile, { recursive: true });

  const { chromium } = loadPlaywright();
  const context = await chromium.launchPersistentContext(args.profile, {
    headless: args.headless,
    viewport: { width: 1440, height: 1400 },
    args: ["--disable-dev-shm-usage"],
  });
  return { context, page: context.pages()[0] || (await context.newPage()) };
}

async function gotoNewsPage(page, args, url, ctl) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForTarget(page, new RegExp(`ctl=${ctl}`, "i"), url, args.waitLoginMs);
  if (!new RegExp(`ctl=${ctl}`, "i").test(page.url())) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  }
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

async function listNews(page) {
  return page.evaluate(() => {
    const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const detailLinks = [...document.querySelectorAll('a[href*="ctl=newsdetail"][href*="newsid="]')];
    return detailLinks.map((link) => {
      const url = new URL(link.href, location.href);
      const newsid = url.searchParams.get("newsid");
      url.searchParams.set("ctl", "editnews");
      return {
        newsid,
        title: clean(link.innerText),
        detailUrl: link.href,
        editUrl: url.toString(),
      };
    });
  });
}

async function inspectNews(page) {
  return page.evaluate((IDS) => {
    const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const component = (id) => (typeof window.$find === "function" ? window.$find(id) : null);
    const editor = (id) => {
      const c = component(id);
      return c
        ? {
            id: c.get_id?.(),
            html: typeof c.get_html === "function" ? c.get_html(true) : "",
          }
        : null;
    };
    const datePicker = component(IDS.datePicker);
    return {
      url: location.href,
      fields: {
        date: document.getElementById(IDS.datePicker)?.value || "",
        dateText: document.getElementById(IDS.dateInput)?.value || "",
        selectedDate:
          datePicker && typeof datePicker.get_selectedDate === "function" && datePicker.get_selectedDate()
            ? datePicker.get_selectedDate().toISOString()
            : null,
        title: document.getElementById(IDS.title)?.value || "",
        photoName: document.getElementById(IDS.photoName)?.value || "",
        copyToTeamPages: document.getElementById(IDS.copyToTeamPages)?.checked || false,
        archive: document.getElementById(IDS.archive)?.checked || false,
        visibleOnTeamPage: document.getElementById(IDS.visibleOnTeamPage)?.value || "",
      },
      editors: {
        summary: editor(IDS.summaryEditor),
        details: editor(IDS.detailsEditor),
      },
      photoUploadOnclick: document.getElementById("dnn_ctr2026832_AddEditNews_MyPhoto_lnkPhotoUpload")?.getAttribute("onclick") || "",
      saveHref: document.getElementById(IDS.save)?.getAttribute("href") || "",
      visibleText: clean(document.body.innerText).slice(0, 2000),
    };
  }, IDS);
}

function assertNewsItem(item) {
  for (const key of ["date", "title", "summaryHtml", "detailsHtml"]) {
    if (!item[key]) throw new Error(`JSON is missing required key: ${key}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error("date must be YYYY-MM-DD");
  if (item.title.length > 99) throw new Error("title must be 99 characters or fewer");
}

async function fillDraft(page, item) {
  assertNewsItem(item);
  await page.waitForFunction(
    (IDS) =>
      typeof window.$find === "function" &&
      window.$find(IDS.datePicker) &&
      window.$find(IDS.summaryEditor) &&
      window.$find(IDS.detailsEditor),
    IDS,
    { timeout: 60000 },
  );

  return page.evaluate(
    ({ IDS, item }) => {
      const [year, month, day] = item.date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      const datePicker = window.$find(IDS.datePicker);
      const summary = window.$find(IDS.summaryEditor);
      const details = window.$find(IDS.detailsEditor);

      datePicker.set_selectedDate(date);
      document.getElementById(IDS.datePicker).value = item.date;
      document.getElementById(IDS.dateInput).value = `${month}/${day}/${year}`;
      document.getElementById(IDS.title).value = item.title;
      summary.set_html(item.summaryHtml);
      details.set_html(item.detailsHtml);
      document.getElementById(IDS.copyToTeamPages).checked = Boolean(item.copyToTeamPages);
      document.getElementById(IDS.archive).checked = Boolean(item.archive);
      document.getElementById(IDS.visibleOnTeamPage).value = item.copyToTeamPages ? "1" : "0";
      if (Object.prototype.hasOwnProperty.call(item, "photoName")) {
        document.getElementById(IDS.photoName).value = item.photoName || "";
      }

      for (const id of [IDS.datePicker, IDS.dateInput, IDS.title, IDS.copyToTeamPages, IDS.archive, IDS.visibleOnTeamPage, IDS.photoName]) {
        const el = document.getElementById(id);
        if (el) el.dispatchEvent(new Event("change", { bubbles: true }));
      }

      return {
        date: document.getElementById(IDS.datePicker).value,
        dateText: document.getElementById(IDS.dateInput).value,
        title: document.getElementById(IDS.title).value,
        summaryLength: summary.get_html(true).length,
        detailsLength: details.get_html(true).length,
        copyToTeamPages: document.getElementById(IDS.copyToTeamPages).checked,
        archive: document.getElementById(IDS.archive).checked,
        visibleOnTeamPage: document.getElementById(IDS.visibleOnTeamPage).value,
        photoName: document.getElementById(IDS.photoName).value,
        saveButtonFound: Boolean(document.getElementById(IDS.save)),
      };
    },
    { IDS, item },
  );
}

async function dismissConsentBanner(page) {
  await page.evaluate(() => {
    document.getElementById("onetrust-consent-sdk")?.remove();
    document.querySelector(".onetrust-pc-dark-filter")?.remove();
  }).catch(() => {});
}

async function setArchiveStatus(page, archiveValue) {
  await page.waitForFunction(
    (IDS) =>
      typeof window.$find === "function" &&
      window.$find(IDS.summaryEditor) !== null,
    IDS,
    { timeout: 60000 },
  );

  const result = await page.evaluate(
    ({ IDS, archiveValue }) => {
      const checkbox = document.getElementById(IDS.archive);
      if (!checkbox) return { ok: false, reason: "Archive checkbox not found" };
      checkbox.checked = archiveValue;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      return { ok: true, archive: checkbox.checked, saveButtonFound: Boolean(document.getElementById(IDS.save)) };
    },
    { IDS, archiveValue },
  );

  if (!result.ok) throw new Error(result.reason);
  if (!result.saveButtonFound) throw new Error("Save button not found");

  await dismissConsentBanner(page);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 90000 }).catch(() => null),
    page.click(`#${IDS.save}`),
  ]);
  await page.waitForTimeout(2000);
  console.log(`${archiveValue ? "Archived" : "Unarchived"}. URL: ${page.url()}`);
}

async function deleteNews(page) {
  await page.waitForFunction(() => typeof window.$find === "function", { timeout: 60000 });
  await page.waitForTimeout(2000);

  const deleteBtn = await page.$('a[id*="Delete"], input[value="Delete"], button[id*="Delete"]');
  if (!deleteBtn) throw new Error("Delete button not found — only present when editing an existing item");

  const label = (await deleteBtn.textContent().catch(() => "")).trim();
  console.log(`Delete button found: "${label}"`);

  await dismissConsentBanner(page);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 90000 }).catch(() => null),
    deleteBtn.click(),
  ]);
  await page.waitForTimeout(2000);
  console.log(`Deleted. URL: ${page.url()}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { context, page } = await openContext(args);

  try {
    if (args.command === "list") {
      await gotoNewsPage(page, args, editUrl(), "editnews");
      await gotoNewsPage(page, args, manageUrl(), "managenews");
      console.log(JSON.stringify(await listNews(page), null, 2));
      return;
    }

    if (args.command === "inspect") {
      await gotoNewsPage(page, args, editUrl(args.newsid), "editnews");
      console.log(JSON.stringify(await inspectNews(page), null, 2));
      return;
    }

    if (args.command === "archive" || args.command === "unarchive") {
      await gotoNewsPage(page, args, editUrl(args.newsid), "editnews");
      await setArchiveStatus(page, args.command === "archive");
      return;
    }

    if (args.command === "delete") {
      await gotoNewsPage(page, args, editUrl(args.newsid), "editnews");
      await deleteNews(page);
      return;
    }

    // draft (new item) or edit (existing item)
    const item = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), args.jsonFile), "utf8"));
    const targetUrl = args.command === "edit" ? editUrl(args.newsid) : editUrl();
    await gotoNewsPage(page, args, targetUrl, "editnews");
    const filled = await fillDraft(page, item);
    console.log("Fill result:");
    console.log(JSON.stringify(filled, null, 2));

    if (!args.publish) {
      console.log("Dry run complete. Re-run with --publish to click Save.");
      return;
    }

    await dismissConsentBanner(page);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 90000 }).catch(() => null),
      page.click(`#${IDS.save}`),
    ]);
    await page.waitForTimeout(3000);
    console.log(`Saved. Current URL: ${page.url()}`);
  } finally {
    await context.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
