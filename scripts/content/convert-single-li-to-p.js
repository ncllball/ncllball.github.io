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
function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    let st;
    try {
      st = fs.statSync(full);
    } catch (e) {
      continue;
    }
    if (st.isDirectory()) {
      if (IGNORE.has(name)) continue;
      out.push(...walk(full));
    } else if (st.isFile()) out.push(full);
  }
  return out;
}
function convert(html, file) {
  let changed = false;
  const listRegex =
    /(<(ul|ol)\s*>)(\s*<li\b([^>]*)>([\s\S]*?)<\/li>\s*)<\/\2>/gi;
  function replacer(match, open, tag, liBlock, liAttrs, liContent) {
    const innerLower = liContent.toLowerCase();
    if (
      innerLower.includes("<ul") ||
      innerLower.includes("<ol") ||
      innerLower.includes("<li")
    )
      return match;
    let pAttrs = "";
    if (liAttrs && liAttrs.length) {
      const cls = liAttrs.match(/\bclass=("|')(.*?)(\1)/i);
      const id = liAttrs.match(/\bid=("|')(.*?)(\1)/i);
      if (cls) pAttrs += ` class=${cls[1]}${cls[2]}${cls[1]}`;
      if (id) pAttrs += ` id=${id[1]}${id[2]}${id[1]}`;
    }
    if (VERBOSE)
      console.log("  - [" + tag + "] -> <p> " + path.relative(ROOT, file));
    changed = true;
    return `<p${pAttrs}>${liContent}</p>`;
  }
  let prev;
  let out = html;
  do {
    prev = out;
    out = out.replace(listRegex, replacer);
  } while (out !== prev);
  return { html: out, changed };
}
function main() {
  if (!WRITE) console.log("Dry run: no files will be modified");
  const files = walk(START_DIR).filter((f) =>
    f.toLowerCase().endsWith(".html")
  );
  console.log(
    `Scanning ${files.length} HTML files under ${
      path.relative(ROOT, START_DIR) || "."
    } ...`
  );
  let changedCount = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const { html, changed } = convert(src, f);
    if (changed) {
      changedCount++;
      if (WRITE) fs.writeFileSync(f, html, "utf8");
    }
  }
  console.log(
    `${
      WRITE ? "Applied" : "Would apply"
    } single-item list conversions in ${changedCount} file(s)`
  );
  if (!WRITE) console.log("Run with --write to apply changes.");
}
main();
