#!/usr/bin/env node
/**
 * Convert single-item lists (<ul>/<ol> with exactly one <li>) into a standalone <p>.
 *
 * Safety rules:
 * - Only convert lists with NO attributes (e.g., <ul> or <ol> only; skip if class/id/role/data/aria/style present on the list)
 * - Only convert when there is exactly one <li> in the list
 * - Skip if the <li> content contains nested lists (<ul> or <ol>) or additional <li>
 * - Preserve class and id from the <li> by transferring them to the <p>
 *
 * Usage:
 *   Dry run: node scripts/convert-single-li-to-p.js
 *   Apply:   node scripts/convert-single-li-to-p.js --write
 *   Path:    node scripts/convert-single-li-to-p.js --path="2025 Season"
 *   Verbose: add --verbose
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const VERBOSE = args.includes('--verbose');
const PATH_ARG = (() => {
  const a = args.find(x => x.startsWith('--path'));
  if (!a) return null;
  const [, v] = a.split('=');
  return v || null;
})();

const ROOT = process.cwd();
const START_DIR = PATH_ARG ? path.resolve(ROOT, PATH_ARG) : ROOT;

const IGNORE_DIRS = new Set(['node_modules', '.git', 'images', 'images_unused', 'fonts', 'docs', 'ics']);

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
      if (IGNORE_DIRS.has(name)) continue;
      out.push(...walk(full));
    } else if (st.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function convertSingleItemLists(html, filePath) {
  let changed = false;
  // Regex matches <ul> or <ol> with no attributes and exactly one <li> (naively)
  // We'll validate the inner content further before converting.
  const listRegex = /<(ul|ol)\s*>(\s*<li\b([^>]*)>([\s\S]*?)<\/li>\s*)<\/\1>/gi;

  function replacer(match, tag, liBlock, liAttrs, liContent) {
    // Guard: if liContent contains nested lists or another <li>, skip
    const innerLower = liContent.toLowerCase();
    if (innerLower.includes('<ul') || innerLower.includes('<ol') || innerLower.includes('<li')) {
      return match; // skip
    }
    // Transfer class and id only
    let pAttrs = '';
    if (liAttrs && liAttrs.length) {
      const cls = liAttrs.match(/\bclass=("|')(.*?)(\1)/i);
      const id = liAttrs.match(/\bid=("|')(.*?)(\1)/i);
      if (cls) pAttrs += ` class=${cls[1]}${cls[2]}${cls[1]}`;
      if (id) pAttrs += ` id=${id[1]}${id[2]}${id[1]}`;
    }
    if (VERBOSE) console.log(`  - [${tag}] -> <p> in ${path.relative(ROOT, filePath)}`);
    changed = true;
    return `<p${pAttrs}>${liContent}</p>`;
  }

  // Apply repeatedly until no change to catch adjacent patterns
  let prev;
  let out = html;
  do {
    prev = out;
    out = out.replace(listRegex, replacer);
  } while (out !== prev);

  return { html: out, changed };
}

function main() {
  if (!WRITE) console.log('Dry run: no files will be modified');
  const files = walk(START_DIR).filter(f => f.toLowerCase().endsWith('.html'));
  console.log(`Scanning ${files.length} HTML files under ${path.relative(ROOT, START_DIR) || '.'} ...`);
  let changedCount = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const { html, changed } = convertSingleItemLists(src, file);
    if (changed) {
      changedCount++;
      if (WRITE) fs.writeFileSync(file, html, 'utf8');
    }
  }
  console.log(`${WRITE ? 'Applied' : 'Would apply'} single-item list conversions in ${changedCount} file(s)`);
  if (!WRITE) console.log('Run with --write to apply changes.');
}

main();
