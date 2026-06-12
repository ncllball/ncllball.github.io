const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const z = require("zod/v4");

const DEFAULT_CWD = process.env.CODEX_HANDOFF_DEFAULT_CWD || "C:\\NCLL\\ncllball.github.io";
const DEFAULT_TIMEOUT_MS = Number(process.env.CODEX_HANDOFF_TIMEOUT_MS || 20 * 60 * 1000);
const MAX_LOG_CHARS = Number(process.env.CODEX_HANDOFF_MAX_LOG_CHARS || 120000);

function truncateMiddle(text, maxChars = MAX_LOG_CHARS) {
  if (!text || text.length <= maxChars) return text || "";
  const keep = Math.floor((maxChars - 80) / 2);
  return `${text.slice(0, keep)}\n\n[... truncated ${text.length - maxChars} chars ...]\n\n${text.slice(-keep)}`;
}

function resolveCwd(cwd) {
  const resolved = path.resolve(cwd || DEFAULT_CWD);
  if (!fs.existsSync(resolved)) {
    throw new Error(`cwd does not exist: ${resolved}`);
  }
  if (!fs.statSync(resolved).isDirectory()) {
    throw new Error(`cwd is not a directory: ${resolved}`);
  }
  return resolved;
}

function codexCommand(args) {
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", "codex", ...args],
    };
  }
  return { command: "codex", args };
}

function runCodexExec({ prompt, cwd, sandbox, model, timeoutMs, ephemeral, addDirs }) {
  return new Promise((resolve) => {
    const workingDir = resolveCwd(cwd);
    const finalPath = path.join(
      os.tmpdir(),
      `codex-handoff-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`,
    );

    const args = [
      "exec",
      "--color",
      "never",
      "--sandbox",
      sandbox || "workspace-write",
      "--cd",
      workingDir,
      "--output-last-message",
      finalPath,
    ];

    if (ephemeral !== false) args.push("--ephemeral");
    if (model) args.push("--model", model);
    for (const addDir of addDirs || []) {
      if (addDir) args.push("--add-dir", path.resolve(addDir));
    }
    args.push("-");

    const startedAt = new Date();
    const cmd = codexCommand(args);
    const child = spawn(cmd.command, cmd.args, {
      cwd: workingDir,
      env: process.env,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5000).unref();
    }, timeoutMs || DEFAULT_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout = truncateMiddle(stdout + chunk.toString());
    });
    child.stderr.on("data", (chunk) => {
      stderr = truncateMiddle(stderr + chunk.toString());
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        exitCode: null,
        timedOut,
        cwd: workingDir,
        error: String(error),
        stdout,
        stderr,
      });
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      let finalMessage = "";
      try {
        finalMessage = fs.existsSync(finalPath) ? fs.readFileSync(finalPath, "utf8") : "";
      } catch (error) {
        stderr = truncateMiddle(`${stderr}\nUnable to read final message file: ${error}`);
      }
      try {
        fs.rmSync(finalPath, { force: true });
      } catch {}

      resolve({
        ok: exitCode === 0 && !timedOut,
        exitCode,
        timedOut,
        cwd: workingDir,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        finalMessage: finalMessage.trim(),
        stdout,
        stderr,
      });
    });

    child.stdin.end(prompt);
  });
}

function runCodexVersion(cwd) {
  return new Promise((resolve) => {
    const cmd = codexCommand(["--version"]);
    const child = spawn(cmd.command, cmd.args, {
      cwd: cwd || DEFAULT_CWD,
      env: process.env,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => resolve({ ok: false, error: String(error), stdout, stderr }));
    child.on("close", (exitCode) => resolve({ ok: exitCode === 0, exitCode, stdout, stderr }));
  });
}

const server = new McpServer({
  name: "codex-handoff",
  version: "0.1.0",
});

server.registerTool(
  "codex_handoff",
  {
    description:
      "Hand a coding/repo task to OpenAI Codex CLI using `codex exec` and return Codex's final response. Use for implementation, review, investigation, or second-opinion tasks.",
    inputSchema: {
      prompt: z.string().min(1).describe("Task instructions to give Codex."),
      cwd: z
        .string()
        .optional()
        .describe(`Working directory for Codex. Defaults to ${DEFAULT_CWD}.`),
      sandbox: z
        .enum(["read-only", "workspace-write", "danger-full-access"])
        .optional()
        .default("workspace-write")
        .describe("Codex sandbox mode. Prefer read-only for investigation and workspace-write for edits."),
      model: z.string().optional().describe("Optional Codex model override, passed as --model."),
      timeoutMs: z
        .number()
        .int()
        .min(10000)
        .max(7200000)
        .optional()
        .describe("Timeout in milliseconds. Default is 20 minutes."),
      ephemeral: z
        .boolean()
        .optional()
        .default(true)
        .describe("Run Codex with --ephemeral so session files are not persisted."),
      addDirs: z
        .array(z.string())
        .optional()
        .describe("Optional extra writable/readable directories, passed as repeated --add-dir."),
      includeLogs: z
        .boolean()
        .optional()
        .default(false)
        .describe("Include Codex stdout/stderr logs in the returned text even when the run succeeds."),
    },
  },
  async (input) => {
    const result = await runCodexExec(input);
    const response = {
      ok: result.ok,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      cwd: result.cwd,
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      finalMessage: result.finalMessage,
    };

    if (!result.ok || input.includeLogs) {
      response.stdout = result.stdout;
      response.stderr = result.stderr;
      if (result.error) response.error = result.error;
    }

    return {
      isError: !result.ok,
      content: [
        {
          type: "text",
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "codex_status",
  {
    description: "Check that the Codex CLI is installed and visible to the MCP server.",
    inputSchema: {},
  },
  async () => {
    const result = await runCodexVersion(DEFAULT_CWD);
    return {
      isError: !result.ok,
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ok: result.ok,
              exitCode: result.exitCode,
              version: result.stdout.trim(),
              stderr: result.stderr.trim(),
              defaultCwd: DEFAULT_CWD,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("codex-handoff MCP server running");
}

main().catch((error) => {
  console.error("codex-handoff MCP server failed:", error);
  process.exit(1);
});
