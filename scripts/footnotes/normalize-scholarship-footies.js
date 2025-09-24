#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const VERBOSE = args.includes("--verbose");
const PATH_ARG = (() => {
  const a = args.find((x) => x.startsWith("--path"));
  if (!a) return null;
  const [, v] = a.split("=");
  return v || null;
})();
const ROOT = process.cwd();
const START_DIR = PATH_ARG ? path.resolve(ROOT, PATH_ARG) : ROOT;
const IGNORE = new Set([
  "node_modules",
  ".git",
  "images",
  "images_unused",
  "fonts",
  "docs",
  "ics",
]);
const SNIPPET = fs
  .readFileSync(
    path.join(ROOT, "Snippets", "footies.scholarships.html"),
    "utf8"
  )
  .replace(/\r\n/g, "\n")
  .trim();
function walk(d) {
  const out = [];
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    let st;
    try {
      st = fs.statSync(f);
    } catch (e) {
      continue;
    }
    if (st.isDirectory()) {
      if (IGNORE.has(n)) continue;
      out.push(...walk(f));
    } else if (st.isFile() && f.toLowerCase().endsWith(".html")) out.push(f);
  }
  return out;
}
function ensureScholarshipFooties(html) {
  let h = html.replace(/\r\n/g, "\n");
  let changed = false;
  const costRe =
    /(<h2\b[^>]*id=\"cost[^\"]*\"[^>]*>\s*Cost[^<]*<\/h2>)([\s\S]*?)(?=(<h2\b|<section\b[^>]*class=\"footies\"|<\/main>|<\/body>|$))/i;
  const m = h.match(costRe);
  if (!m) return { html: h, changed: false };
  const full = m[0];
  const heading = m[1];
  const after = m[2];
  const footiesRe =
    /(^\s*)(<section\b[^>]*class=\"footies\"[\s\S]*?<\/section>)/i;
  if (footiesRe.test(after)) {
    const replaced = after.replace(
      footiesRe,
      (_mm, ws) => `\n${ws}${SNIPPET}\n`
    );
    if (replaced !== after) {
      h = h.replace(after, replaced);
      changed = true;
    }
  } else {
    const firstParaRe = /(\s*<p\b[\s\S]*?<\/p>)/i;
    if (firstParaRe.test(after)) {
      const inserted = after.replace(
        firstParaRe,
        (pp) => `${pp}\n${SNIPPET}\n`
      );
      if (inserted !== after) {
        h = h.replace(after, inserted);
        changed = true;
      }
    } else {
      h = h.replace(full, `${heading}\n${SNIPPET}\n`);
      changed = true;
    }
  }
  return { html: h, changed };
}
function processFile(f) {
  const src = fs.readFileSync(f, "utf8");
  const { html, changed } = ensureScholarshipFooties(src);
  if (changed && WRITE) fs.writeFileSync(f, html, "utf8");
  if (changed && VERBOSE)
    console.log("* " + path.relative(ROOT, f) + " updated");
  return changed;
}
function main() {
  if (!WRITE) console.log("Dry run: no files will be modified");
  const files = walk(START_DIR);
  let c = 0;
  for (const f of files) {
    if (processFile(f)) c++;
  }
  console.log(
    `${
      WRITE ? "Applied" : "Would apply"
    } scholarship footies normalization in ${c} file(s)`
  );
  if (!WRITE) console.log("Run with --write to apply changes.");
}
main();
