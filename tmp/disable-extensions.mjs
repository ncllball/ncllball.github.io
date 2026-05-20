import { DatabaseSync } from 'node:sqlite';

const DISABLED = [
  // Usage/Status
  "ajax1029.clusage", "anshuman55a.usage-dock", "harshagarwal1012.claude-usage-bar",
  "hypersec.claudemeter", "mhelbich.claude-code-usage-status", "michelyaneslopez.claude-rate-monitor",
  "safeekow.ccexp-vscode", "zollicoff.claude-code-cli-usage",
  // Commit/Git
  "juanlb.claude-commit", "shiftinbits.clawdcommit", "taltukh.claude-code-ai-commit-message-button",
  "zakhariimelnyk.claude-git-commit", "itsukaorg.codex-commit", "vladnoskov.codex-commit-widget",
  // Session/Workflow
  "ajax1029.claude-deck", "danielrafaelramos.claudequeue", "jhonbar.claude-code-mirror",
  "rockieyang.boxclaude", "simonescigliuzzi.hey-claude", "squaresoftwareshpk.claude-launcher",
  "subhashkhileri.cc-snapshot-viewer", "vishalguptax.claude-manager", "byungho.claude-code-lens",
  "thewebdev.claude-mode", "xiaomila.claude-api-switcher",
  // Terminal/UI (claude-terminal-panel removed/uninstalled)
  "foxyboa.claude-code-terminal-tabs", "luiscarlosricoalmada.claude-terminal-shortcuts",
  // Config/Skills/Context
  "agnislav.claude-code-config-manager", "asifkibria.claude-code-toolkit", "claudetools.claude-code-sync",
  "drewipson.claude-code-config", "patricio0312rev.skillset-vscode", "ragokan.vscode-ai-context-provider",
  "ricardo-de-los-santos.claude-skills-manager", "yedewww.claude-code-dev-tools", "amitpatole.mcp-marketplace",
  // Other AI (weixiao-space.claude-copilot kept active — patched and working)
  "aamiramin.claudeforever", "alfrednaayem.ai-markdown-feedback", "duoc95.ask-claude",
  "jsaluja.claude-voice", "openai.chatgpt", "sandeepshah.gpt-agent", "copyai.copyai",
  // Extra Codex Tools
  "eddiegivens.codex-quota-stats", "martinortiz.codex-stats",
  "screph.codex-terminal-recorder", "zis3c.codex-notifier",
  // Themes
  "alvinunreal.claude-vscode-theme", "benoitraphael.clawbeige-theme", "github.github-vscode-theme",
  "jnahian.jnahian-claude-theme", "matheus-teles.claudio-code-theme",
  "thomaspink.theme-github", "worriedarrow.code-x-theme"
];

const value = JSON.stringify(DISABLED.map(id => ({ id })));
const dbPath = 'C:\\Users\\regis\\AppData\\Roaming\\Code\\User\\globalStorage\\state.vscdb';

const db = new DatabaseSync(dbPath);
const existing = db.prepare("SELECT value FROM ItemTable WHERE key = 'extensionsIdentifiers/disabled'").get();
if (existing) {
  db.prepare("UPDATE ItemTable SET value = ? WHERE key = 'extensionsIdentifiers/disabled'").run(value);
  console.log('Updated existing disabled list.');
} else {
  db.prepare("INSERT INTO ItemTable (key, value) VALUES ('extensionsIdentifiers/disabled', ?)").run(value);
  console.log('Created disabled list.');
}
db.close();
console.log(`Disabled ${DISABLED.length} extensions.`);
