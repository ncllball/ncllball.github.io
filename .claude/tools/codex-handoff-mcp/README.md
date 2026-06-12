# Codex Handoff MCP

This project-local MCP server lets Claude Code hand a task to OpenAI Codex CLI.

It exposes two tools:

- `codex_status` - verifies that `codex` is visible to the MCP server.
- `codex_handoff` - runs `codex exec` and returns Codex's final response.

Default behavior:

- working directory: `C:\NCLL\ncllball.github.io`
- sandbox: `workspace-write`
- timeout: 20 minutes
- `--ephemeral` enabled, so Codex session files are not persisted

Example Claude prompt:

```text
Use the codex_handoff MCP tool. Ask Codex to review the Summerball registration scripts for bugs. Use read-only sandbox and return its findings.
```

Useful `codex_handoff` arguments:

```json
{
  "prompt": "Review this repo for the likely cause of the failing import script.",
  "cwd": "C:\\NCLL\\ncllball.github.io",
  "sandbox": "read-only",
  "timeoutMs": 1200000,
  "includeLogs": false
}
```

Use `sandbox: "workspace-write"` when you want Codex to edit files. Use `danger-full-access` only when the workspace or task is already externally controlled.
