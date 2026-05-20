# VS Code Extension Groups

Enable/disable groups as needed. Status key: `active` = currently enabled | `tried` = tested, disabled | `untried` = never enabled | `removed` = uninstalled

---

## Always On

These should never be disabled.

| Extension | ID | Status |
|---|---|---|
| Live Server | `ritwickdey.liveserver` | active |
| PowerShell | `ms-vscode.powershell` | active |
| vscode-pdf | `tomoki1207.pdf` | active |
| Night Owl | `sdras.night-owl` | active |
| Claude Code | `anthropic.claude-code` | active |

---

## Claude Group

Core Claude workflow extensions. Keep enabled during Claude sessions.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Claude Tower | `shaharsha.claude-tower` | active | Session status in status bar; Windows dedup bug patched May 2026 |
| Claude VSCode Bridge | `daniel-manea.claude-vscode-bridge` | active | File context injection into Claude |

**Enable:**
```
code --enable-extension shaharsha.claude-tower
code --enable-extension daniel-manea.claude-vscode-bridge
```

**Disable:**
```
code --disable-extension shaharsha.claude-tower
code --disable-extension daniel-manea.claude-vscode-bridge
```

---

## Codex Group

Active alongside Claude and Copilot.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Codex Link | `changwenluo.codex-link` | active | |
| Codex Build | `codexbuild.codex-build` | active | |
| Codex Account Switch | `techfetch-dev.codex-account-switch-vscode` | active | |
| Codex Switch | `woozy-masta.codex-switch` | active | |
| Codex Accounts Manager | `wannanbigpig.codex-accounts-manager` | active | |
| MSL Codex Switch | `mohulscom.msl-codex-switch` | active | |

**Enable:**
```
code --enable-extension changwenluo.codex-link
code --enable-extension codexbuild.codex-build
code --enable-extension techfetch-dev.codex-account-switch-vscode
code --enable-extension woozy-masta.codex-switch
code --enable-extension wannanbigpig.codex-accounts-manager
code --enable-extension mohulscom.msl-codex-switch
```

**Disable:**
```
code --disable-extension changwenluo.codex-link
code --disable-extension codexbuild.codex-build
code --disable-extension techfetch-dev.codex-account-switch-vscode
code --disable-extension woozy-masta.codex-switch
code --disable-extension wannanbigpig.codex-accounts-manager
code --disable-extension mohulscom.msl-codex-switch
```

---

## Copilot Group

Active alongside Claude and Codex.

| Extension | ID | Status | Notes |
|---|---|---|---|
| GitHub Copilot Chat | `github.copilot-chat` | active | |
| Copilot MCP | `automatalabs.copilot-mcp` | active | |
| Google Workspace MCP | `mercurial.google-workspace-mcp` | active | |

**Enable:**
```
code --enable-extension github.copilot-chat
code --enable-extension automatalabs.copilot-mcp
code --enable-extension mercurial.google-workspace-mcp
```

**Disable:**
```
code --disable-extension github.copilot-chat
code --disable-extension automatalabs.copilot-mcp
code --disable-extension mercurial.google-workspace-mcp
```

---

## Silo: Usage & Status Monitoring

Track Claude token usage, rate limits, quota bars.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Clusage | `ajax1029.clusage` | untried | Claude usage tracker |
| Usage Dock | `anshuman55a.usage-dock` | untried | Usage sidebar dock |
| Claude Usage Bar | `harshagarwal1012.claude-usage-bar` | untried | Status bar usage |
| Claudemeter | `hypersec.claudemeter` | untried | Usage meter; debug log at AppData\Roaming\claudemeter\ |
| Claude Code Usage Status | `mhelbich.claude-code-usage-status` | untried | |
| Claude Rate Monitor | `michelyaneslopez.claude-rate-monitor` | untried | |
| CC Exp | `safeekow.ccexp-vscode` | untried | Claude Code experiment tracker |
| Claude Code CLI Usage | `zollicoff.claude-code-cli-usage` | untried | |

**Enable all:**
```
code --enable-extension ajax1029.clusage
code --enable-extension anshuman55a.usage-dock
code --enable-extension harshagarwal1012.claude-usage-bar
code --enable-extension hypersec.claudemeter
code --enable-extension mhelbich.claude-code-usage-status
code --enable-extension michelyaneslopez.claude-rate-monitor
code --enable-extension safeekow.ccexp-vscode
code --enable-extension zollicoff.claude-code-cli-usage
```

**Disable all:**
```
code --disable-extension ajax1029.clusage
code --disable-extension anshuman55a.usage-dock
code --disable-extension harshagarwal1012.claude-usage-bar
code --disable-extension hypersec.claudemeter
code --disable-extension mhelbich.claude-code-usage-status
code --disable-extension michelyaneslopez.claude-rate-monitor
code --disable-extension safeekow.ccexp-vscode
code --disable-extension zollicoff.claude-code-cli-usage
```

---

## Silo: Commit & Git Helpers

AI-assisted commit messages and git workflow tools.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Claude Commit | `juanlb.claude-commit` | untried | |
| Clawd Commit | `shiftinbits.clawdcommit` | untried | |
| Claude Code AI Commit Button | `taltukh.claude-code-ai-commit-message-button` | untried | |
| Claude Git Commit | `zakhariimelnyk.claude-git-commit` | untried | |
| Codex Commit | `itsukaorg.codex-commit` | untried | |
| Codex Commit Widget | `vladnoskov.codex-commit-widget` | untried | Codex commit with analytics summary |

**Enable all:**
```
code --enable-extension juanlb.claude-commit
code --enable-extension shiftinbits.clawdcommit
code --enable-extension taltukh.claude-code-ai-commit-message-button
code --enable-extension zakhariimelnyk.claude-git-commit
code --enable-extension itsukaorg.codex-commit
code --enable-extension vladnoskov.codex-commit-widget
```

**Disable all:**
```
code --disable-extension juanlb.claude-commit
code --disable-extension shiftinbits.clawdcommit
code --disable-extension taltukh.claude-code-ai-commit-message-button
code --disable-extension zakhariimelnyk.claude-git-commit
code --disable-extension itsukaorg.codex-commit
code --disable-extension vladnoskov.codex-commit-widget
```

---

## Silo: Session & Workflow Management

Multi-session managers, launchers, mirrors, queues.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Claude Deck | `ajax1029.claude-deck` | untried | Multi-session dashboard |
| Claude Queue | `danielrafaelramos.claudequeue` | untried | Task queue for Claude |
| Claude Code Mirror | `jhonbar.claude-code-mirror` | untried | |
| Box Claude | `rockieyang.boxclaude` | untried | |
| Hey Claude | `simonescigliuzzi.hey-claude` | untried | |
| Claude Launcher | `squaresoftwareshpk.claude-launcher` | untried | |
| CC Snapshot Viewer | `subhashkhileri.cc-snapshot-viewer` | untried | |
| Claude Manager | `vishalguptax.claude-manager` | untried | |
| Claude Code Lens | `byungho.claude-code-lens` | untried | Code lens annotations |
| Claude Mode | `thewebdev.claude-mode` | untried | |
| Claude API Switcher | `xiaomila.claude-api-switcher` | untried | Switch between API keys/models |

**Enable all:**
```
code --enable-extension ajax1029.claude-deck
code --enable-extension danielrafaelramos.claudequeue
code --enable-extension jhonbar.claude-code-mirror
code --enable-extension rockieyang.boxclaude
code --enable-extension simonescigliuzzi.hey-claude
code --enable-extension squaresoftwareshpk.claude-launcher
code --enable-extension subhashkhileri.cc-snapshot-viewer
code --enable-extension vishalguptax.claude-manager
code --enable-extension byungho.claude-code-lens
code --enable-extension thewebdev.claude-mode
code --enable-extension xiaomila.claude-api-switcher
```

**Disable all:**
```
code --disable-extension ajax1029.claude-deck
code --disable-extension danielrafaelramos.claudequeue
code --disable-extension jhonbar.claude-code-mirror
code --disable-extension rockieyang.boxclaude
code --disable-extension simonescigliuzzi.hey-claude
code --disable-extension squaresoftwareshpk.claude-launcher
code --disable-extension subhashkhileri.cc-snapshot-viewer
code --disable-extension vishalguptax.claude-manager
code --disable-extension byungho.claude-code-lens
code --disable-extension thewebdev.claude-mode
code --disable-extension xiaomila.claude-api-switcher
```

---

## Silo: Terminal & UI Tweaks

Terminal panel enhancements, tab management, cursor/chat UI changes.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Claude Terminal Panel | `0ly.claude-terminal-panel` | removed | Uninstalled May 2026 — conpty.node locks on Windows; directMode:true fails with .cmd files |
| Claude Code Terminal Tabs | `foxyboa.claude-code-terminal-tabs` | untried | |
| Claude Terminal Shortcuts | `luiscarlosricoalmada.claude-terminal-shortcuts` | untried | |
| Claude Code Chat Cursor Design | `waveflow.claude-code-chat-cursor-design` | removed | Uninstalled May 2026 |

**Enable all:**
```
code --enable-extension 0ly.claude-terminal-panel
code --enable-extension foxyboa.claude-code-terminal-tabs
code --enable-extension luiscarlosricoalmada.claude-terminal-shortcuts
code --enable-extension waveflow.claude-code-chat-cursor-design
```

**Disable all:**
```
code --disable-extension 0ly.claude-terminal-panel
code --disable-extension foxyboa.claude-code-terminal-tabs
code --disable-extension luiscarlosricoalmada.claude-terminal-shortcuts
code --disable-extension waveflow.claude-code-chat-cursor-design
```

---

## Silo: Config, Skills & Context

Config managers, skills systems, MCP marketplace, context injection.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Claude Code Config Manager | `agnislav.claude-code-config-manager` | untried | |
| Claude Code Toolkit | `asifkibria.claude-code-toolkit` | untried | |
| Claude Code Sync | `claudetools.claude-code-sync` | untried | |
| Claude Code Config | `drewipson.claude-code-config` | untried | |
| Skillset VS Code | `patricio0312rev.skillset-vscode` | untried | Skills/snippets manager |
| AI Context Provider | `ragokan.vscode-ai-context-provider` | untried | |
| Claude Skills Manager | `ricardo-de-los-santos.claude-skills-manager` | untried | |
| Claude Code Dev Tools | `yedewww.claude-code-dev-tools` | untried | |
| MCP Marketplace | `amitpatole.mcp-marketplace` | untried | Browse/install MCP servers |

**Enable all:**
```
code --enable-extension agnislav.claude-code-config-manager
code --enable-extension asifkibria.claude-code-toolkit
code --enable-extension claudetools.claude-code-sync
code --enable-extension drewipson.claude-code-config
code --enable-extension patricio0312rev.skillset-vscode
code --enable-extension ragokan.vscode-ai-context-provider
code --enable-extension ricardo-de-los-santos.claude-skills-manager
code --enable-extension yedewww.claude-code-dev-tools
code --enable-extension amitpatole.mcp-marketplace
```

**Disable all:**
```
code --disable-extension agnislav.claude-code-config-manager
code --disable-extension asifkibria.claude-code-toolkit
code --disable-extension claudetools.claude-code-sync
code --disable-extension drewipson.claude-code-config
code --disable-extension patricio0312rev.skillset-vscode
code --disable-extension ragokan.vscode-ai-context-provider
code --disable-extension ricardo-de-los-santos.claude-skills-manager
code --disable-extension yedewww.claude-code-dev-tools
code --disable-extension amitpatole.mcp-marketplace
```

---

## Silo: Other AI Tools

Non-Claude-Code AI tools — ChatGPT, voice, other assistants.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Claude Forever | `aamiramin.claudeforever` | untried | Keeps Claude session alive |
| AI Markdown Feedback | `alfrednaayem.ai-markdown-feedback` | untried | |
| Ask Claude | `duoc95.ask-claude` | untried | Quick ask without full session |
| Claude Voice | `jsaluja.claude-voice` | untried | Voice input to Claude |
| ChatGPT (OpenAI) | `openai.chatgpt` | untried | Official OpenAI extension |
| GPT Agent | `sandeepshah.gpt-agent` | untried | |
| Claude Copilot | `weixiao-space.claude-copilot` | active | Patched May 2026: Windows CLI detection used `/bin/zsh -ilc which claude` (fails on Windows) — fixed to use `where.exe` + `shell:true` for .cmd execution |
| CopyAI | `copyai.copyai` | untried | |

**Enable all:**
```
code --enable-extension aamiramin.claudeforever
code --enable-extension alfrednaayem.ai-markdown-feedback
code --enable-extension duoc95.ask-claude
code --enable-extension jsaluja.claude-voice
code --enable-extension openai.chatgpt
code --enable-extension sandeepshah.gpt-agent
code --enable-extension weixiao-space.claude-copilot
code --enable-extension copyai.copyai
```

**Disable all:**
```
code --disable-extension aamiramin.claudeforever
code --disable-extension alfrednaayem.ai-markdown-feedback
code --disable-extension duoc95.ask-claude
code --disable-extension jsaluja.claude-voice
code --disable-extension openai.chatgpt
code --disable-extension sandeepshah.gpt-agent
code --disable-extension weixiao-space.claude-copilot
code --disable-extension copyai.copyai
```

---

## Silo: Extra Codex Tools

Codex stats, quota tracking, notifier, terminal recorder — beyond the main Codex group.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Codex Quota Stats | `eddiegivens.codex-quota-stats` | untried | |
| Codex Stats | `martinortiz.codex-stats` | untried | |
| Codex Terminal Recorder | `screph.codex-terminal-recorder` | untried | |
| Codex Notifier | `zis3c.codex-notifier` | untried | |

**Enable all:**
```
code --enable-extension eddiegivens.codex-quota-stats
code --enable-extension martinortiz.codex-stats
code --enable-extension screph.codex-terminal-recorder
code --enable-extension zis3c.codex-notifier
```

**Disable all:**
```
code --disable-extension eddiegivens.codex-quota-stats
code --disable-extension martinortiz.codex-stats
code --disable-extension screph.codex-terminal-recorder
code --disable-extension zis3c.codex-notifier
```

---

## Silo: Themes

Color themes — swap freely, no functional impact.

| Extension | ID | Status | Notes |
|---|---|---|---|
| Claude VS Code Theme | `alvinunreal.claude-vscode-theme` | untried | |
| Claw Beige | `benoitraphael.clawbeige-theme` | untried | |
| GitHub VS Code Theme | `github.github-vscode-theme` | untried | |
| Claude Theme | `jnahian.jnahian-claude-theme` | untried | |
| Claudio Code Theme | `matheus-teles.claudio-code-theme` | untried | |
| Theme GitHub | `thomaspink.theme-github` | untried | |
| Code X Theme | `worriedarrow.code-x-theme` | untried | |

**Enable all:**
```
code --enable-extension alvinunreal.claude-vscode-theme
code --enable-extension benoitraphael.clawbeige-theme
code --enable-extension github.github-vscode-theme
code --enable-extension jnahian.jnahian-claude-theme
code --enable-extension matheus-teles.claudio-code-theme
code --enable-extension thomaspink.theme-github
code --enable-extension worriedarrow.code-x-theme
```

**Disable all:**
```
code --disable-extension alvinunreal.claude-vscode-theme
code --disable-extension benoitraphael.clawbeige-theme
code --disable-extension github.github-vscode-theme
code --disable-extension jnahian.jnahian-claude-theme
code --disable-extension matheus-teles.claudio-code-theme
code --disable-extension thomaspink.theme-github
code --disable-extension worriedarrow.code-x-theme
```

---

## Current Status

| Group | Status | Last Changed |
|---|---|---|
| Always On | active | — |
| Claude Group | active | May 2026 |
| Codex Group | active | May 2026 |
| Copilot Group | active | May 2026 |
| Usage/Status | disabled | May 2026 |
| Commit/Git | disabled | May 2026 |
| Session/Workflow | disabled | May 2026 |
| Terminal/UI | disabled | May 2026 |
| Config/Skills/Context | disabled | May 2026 |
| Other AI | disabled | May 2026 |
| Extra Codex Tools | disabled | May 2026 |
| Themes | disabled | May 2026 |
