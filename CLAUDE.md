# NCLL Project Instructions

## Repo Layout: CMS/ vs everything else

**Inside `CMS/` = the HTML of a page on ncllball.com; outside it = not.** Set up 2026-10-28.

- `CMS/` mirrors the ncllball.com menu (Website Manager › Pages). A page's file sits in its menu parent's folder; a page with sub-pages gets a subfolder named after it. Top-level menu folders: `Season/2026` (the "2026" menu), `Programs`, `Registration`, `Resources`, `Get-Involved`, `About`. Example: Programs › player development › Winterball26 Softball → `CMS/Programs/player-development/winterball26-softball-training.html`.
- Every file in `CMS/` carries its `CMS: tabid=… | mid=…` header and a `[rN · date · tabid]` marker. Families never load these files from GitHub; the content is pasted into the CMS module, and the tabid in the file (not the folder) ties it to its page.
- Division rules: each division's rules page is a hidden ncllball.com page under Programs › baseball / softball (files `CMS/Programs/baseball/*-rules.html`, `CMS/Programs/softball/*-rules.html`, tabids 2252520–2252534), linked from the hub cards' rules icons. The working source is Outline › Programs › Division Rules — edit there first, then rebuild the page. The division name is the module title (Module Settings › Title, shown in the red bar, sticky), not an h1 in the content; the sources line at the top is a Little League / District 8 / NCLL / Note list like the rules below. Their styling (sticky red bar, layer labels) lives in css.css `.division-rules`; never put a `<style>` block in a rules module (it trips the CMS WAF). `_Rules/*.html` are forwarders only — keep them, don't edit rules there.
- Outside `CMS/`: `_Rules/` (forwarders, see above) and `QR/` (served from ncllball.github.io — public links and printed QR codes, so don't move them without fixing every link), `docs/allstars-application-source.html` (source for the yearly All-Stars application PDF; print it to PDF, upload as a new `docs/YYYY.all-stars.application.BB.SB.pdf`), `_drafts/`, `_outline/` (staging for content headed to the Outline wiki; empty it once moved), `docs/`, `scripts/`, `images/` (Home Run Derby photos in `images/hrd/<year>/`), `css.css`.
- Past seasons are git tags, not folders: at season rollover tag the repo `season-YYYY` before reworking that year's pages (`season-2025` exists). Browse old pages via the tag on GitHub.
- The repo is public and GitHub Pages serves every file. Kids' rosters and other working notes don't belong here; the Home Run Derby year-by-year history lives in Outline (Events › Home Run Derby › Home Run Derby — History).
- When a page moves in the CMS menu, move its file to match. The NCLL Ops Board site map (`ncll-board/sitemap.py`) flags files whose folder doesn't match their menu spot, and tabid'd files outside `CMS/`.

## Google Analytics

ncllball.com reports to GA4 `G-RWR33H14KS` through Sports Connect — never add a GA tag to files in `CMS/`. Standalone pages served from ncllball.github.io (`QR/`, any new page families browse — not print sources) carry the tag right after `<meta charset>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-RWR33H14KS"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-RWR33H14KS");</script>
```

Links shared outside the site (emails, newsletters, social, QR codes, flyers) get UTM tags per `docs/utm-links.md`; never tag links between site pages.

## Hub Page URL Mapping

When linking to hub pages, use these canonical live URLs (not the GitHub Pages URLs):

| Local file | Live URL |
| --- | --- |
| `CMS/Resources/coaches-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111982` |
| `CMS/Resources/events-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2244434` |
| `CMS/Get-Involved/helping-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2246341` |
| `CMS/Resources/parents-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111981` |
| `CMS/Resources/safety-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2245729` |
| `CMS/Resources/umpires-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111983` |
| `CMS/Resources/uniforms-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2113971` |
| `CMS/Get-Involved/volunteer-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2117276` |
| `CMS/Programs/baseball-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111979` |
| `CMS/Programs/softball-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111980` |

## Canonical & og:url

For hub pages, both `rel="canonical"` and `og:url` should point to the canonical ncllball.com URL (not the GitHub Pages URL). Example for coaches-hub:

```html
<link href="https://www.ncllball.com/Default.aspx?tabid=2111982" rel="canonical" />
<meta property="og:url" content="https://www.ncllball.com/Default.aspx?tabid=2111982" />
```

## Images & Documents Root

All images, PDFs, and other static assets are served from:

`https://ncllball.github.io/images`

Example: a file at `images/2026-safety.pdf` → `https://ncllball.github.io/images/2026-safety.pdf`

## Standard Stylesheet Links

Every page uses these two stylesheet links in `<head>`:

```html
<link href="https://ncllball.github.io/css.css" rel="stylesheet" type="text/css" />
<link href="https://use.typekit.net/ldx2icb.css" rel="stylesheet" />
```

## HTML Attribute Conventions

`class` should be the first attribute on any element:

```html
<main class="coaches-landing" id="content" role="main">
<article class="ncll-card" aria-labelledby="...">
```

## Codex Handoff MCP

This repo has a project-local MCP bridge that lets Claude Code hand work to OpenAI Codex CLI.

- MCP server name: `codex-handoff`
- Server file: `.claude/tools/codex-handoff-mcp/index.js`
- Claude tools:
  - `mcp__codex-handoff__codex_status`
  - `mcp__codex-handoff__codex_handoff`
- Default Codex cwd: `C:\NCLL\ncllball.github.io`
- Default Codex sandbox: `workspace-write`

If Claude shows `codex-handoff` as pending, run `claude` interactively in this repo and approve the project MCP server. Use `codex_status` first to verify the bridge, then use `codex_handoff` to delegate tasks.

Example prompt:

```text
Use mcp__codex-handoff__codex_status first. Then use mcp__codex-handoff__codex_handoff to ask Codex to review this repo for the requested issue. Use read-only sandbox unless edits are required.
```
