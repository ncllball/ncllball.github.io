# NCLL Project Instructions

## Hub Page URL Mapping

When linking to hub pages, use these canonical live URLs (not the GitHub Pages URLs):

| Local file | Live URL |
| --- | --- |
| `Resources/coaches-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111982` |
| `Resources/events-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2244434` |
| `Resources/helping-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2246341` |
| `Resources/parents-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111981` |
| `Resources/safety-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2245729` |
| `Resources/umpires-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111983` |
| `Resources/uniforms-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2113971` |
| `Resources/volunteer-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2117276` |

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


---

# MANDATORY: Post-Task Documentation (SR-PTD)

**CRITICAL: After completing ANY task that modifies files, you MUST invoke this skill:**

```
Skill tool -> skill: "sr-ptd-skill"
```

**This is NOT optional. Skipping this skill means the task is INCOMPLETE.**

When planning ANY development task, add as the FINAL item in your task list:
```
[ ] Create SR-PTD documentation
```

### Before Starting Any Task:
1. Create your task plan as usual
2. Add SR-PTD documentation as the last task item
3. This step is MANDATORY for: features, bug fixes, refactors, maintenance, research

### When Completing the SR-PTD Task:
1. Read `~/.claude/skills/sr-ptd-skill/SKILL.md` for full instructions
2. Choose template: Full (complex tasks) or Quick (simple tasks)
3. Create file: `SR-PTD_YYYY-MM-DD_[task-id]_[description].md`
4. Save to: `C:/projects/Skills/Dev_doc_for_skills`
5. Fill all applicable sections thoroughly

### Task Completion Criteria:
A task is NOT complete until SR-PTD documentation exists.

### If Conversation Continues After Task:
Update the existing SR-PTD document instead of creating a new one.

---
