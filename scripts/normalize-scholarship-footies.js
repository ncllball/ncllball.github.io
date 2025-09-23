#!/usr/bin/env node
/**
 * Ensure a standard scholarship footnote appears directly after the Cost section.
 *
 * Standard content (see Snippets/footies.scholarships.html):
 * <section class="footies"><p><span class="info-icon">i</span> NCLL believes ... Scholarship Request ... registrar</p></section>
 *
 * Behavior
 * - Find Cost heading (<h2 id="cost" ...> or id starting with "cost").
 * - Ensure the first paragraph under Cost remains untouched (that's the price line).
 * - Insert or replace the immediate following footies section with the standard snippet.
 * - If another footies follows Cost, replace it; if none, insert one.
 * - Use entity-encoded mailto links (spam protection), matching the snippet.
 *
 * Usage
 *   Dry run: node scripts/normalize-scholarship-footies.js
 *   Apply:   node scripts/normalize-scholarship-footies.js --write
 *   Path:    node scripts/normalize-scholarship-footies.js --path="Player Development"
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

const SNIPPET = fs.readFileSync(path.join(ROOT, 'Snippets', 'footies.scholarships.html'), 'utf8')
  .replace(/\r\n/g, '\n')
  .trim();

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    let st;
    try { st = fs.statSync(full); } catch (e) { continue; }
    if (st.isDirectory()) {
      if (IGNORE_DIRS.has(name)) continue;
      out.push(...walk(full));
    } else if (st.isFile() && full.toLowerCase().endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function ensureScholarshipFooties(html) {
  let h = html.replace(/\r\n/g, '\n');
  let changed = false;

  // Match the Cost section heading and its following content up to the next heading or end.
  // Accept id="cost" or id starting with cost.
  const costRe = /(<h2\b[^>]*id=\"cost[^\"]*\"[^>]*>\s*Cost[^<]*<\/h2>)([\s\S]*?)(?=(<h2\b|<section\b[^>]*class=\"footies\"|<\/main>|<\/body>|$))/i;
  const m = h.match(costRe);
  if (!m) return { html, changed: false };

  const [full, heading, after] = m;

  // Is there a footies section immediately following Cost? If so, replace it.
  const footiesRe = /^(\s*)(<section\b[^>]*class=\"footies\"[\s\S]*?<\/section>)/i;
  if (footiesRe.test(after)) {
    const replaced = after.replace(footiesRe, (_mm, ws) => `\n${ws}${SNIPPET}\n`);
    if (replaced !== after) {
      h = h.replace(after, replaced);
      changed = true;
    }
  } else {
    // Otherwise insert the snippet right after the first paragraph under the Cost heading (the price line)
    const firstParaRe = /(\s*<p\b[\s\S]*?<\/p>)/i;
    if (firstParaRe.test(after)) {
      const inserted = after.replace(firstParaRe, (pp) => `${pp}\n${SNIPPET}\n`);
      if (inserted !== after) {
        h = h.replace(after, inserted);
        changed = true;
      }
    } else {
      // No paragraph found — append the snippet after the heading block
      h = h.replace(full, `${heading}\n${SNIPPET}\n`);
      changed = true;
    }
  }

  return { html: h, changed };
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const { html, changed } = ensureScholarshipFooties(src);
  if (changed && WRITE) fs.writeFileSync(file, html, 'utf8');
  if (changed && VERBOSE) console.log(`* ${path.relative(ROOT, file)} updated`);
  return changed;
}

function main() {
  if (!WRITE) console.log('Dry run: no files will be modified');
  const files = walk(START_DIR);
  let changedCount = 0;
  for (const f of files) {
    if (processFile(f)) changedCount++;
  }
  console.log(`${WRITE ? 'Applied' : 'Would apply'} scholarship footies normalization in ${changedCount} file(s)`);
  if (!WRITE) console.log('Run with --write to apply changes.');
}

main();
