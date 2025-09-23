#!/usr/bin/env node
/**
 * Normalize free cost lines site-wide to: "$0 / player (FREE)"
 *
 * What it does
 * - Updates tag-strip Cost list items (e.g., <li><strong>Cost:</strong> ...)</n+ * - Updates standalone Cost sections (e.g., <h2 id="cost">Cost</h2> <p>...</p>)
 * - Standardizes data attributes where present: data-cost-amount="0", data-cost-type="free", data-cost-unit="player"
 *
 * Usage
 *   Dry run: node scripts/normalize-free-cost.js
 *   Apply:   node scripts/normalize-free-cost.js --write
 *   Path:    node scripts/normalize-free-cost.js --path="Player Development"
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

function normalizeTagStripCost(html) {
  let changed = false;
  let out = html;
  // Ensure data-cost attributes on <li class="tag-item" data-tag="cost" ...>
  out = out.replace(/(<li\b[^>]*\bdata-tag=\"cost\"[^>]*)(>)/gi, (m, start, end) => {
    let s = start;
    if (!/data-cost-amount=\"0\"/i.test(s)) { s += ' data-cost-amount="0"'; changed = true; }
    if (!/data-cost-type=\"free\"/i.test(s)) { s += ' data-cost-type="free"'; changed = true; }
    // Force unit to player
    if (/data-cost-unit=\"[^\"]+\"/i.test(s)) {
      s = s.replace(/data-cost-unit=\"[^\"]+\"/i, 'data-cost-unit="player"');
      changed = true;
    } else {
      s += ' data-cost-unit="player"'; changed = true;
    }
    return s + end;
  });

  // Normalize inner text of cost li: <strong>Cost:</strong> $0 / player (FREE)
  out = out.replace(/(<li\b[^>]*\bdata-tag=\"cost\"[^>]*>\s*<strong>\s*Cost:\s*<\/strong>)([\s\S]*?)(<\/li>)/gi,
    (full, open, inner, close) => {
      const normalized = ' $0 / player (FREE)';
      if (inner.replace(/\s+/g,' ') !== normalized) changed = true;
      return open + normalized + close;
    });

  return { html: out, changed };
}

function normalizeCostSection(html) {
  let changed = false;
  let out = html;
  // Match Cost sections: <h2 ... id="cost">Cost</h2> ... first <p> after it
  const re = /(<h2\b[^>]*id=\"cost\"[^>]*>\s*Cost\s*<\/h2>)([\s\S]*?)(<p\b[^>]*>)([\s\S]*?)(<\/p>)/gi;
  out = out.replace(re, (match, h2, between, pOpen, pInner, pClose) => {
    // Replace contents of first paragraph to standard
    const desired = '$0 / player (FREE)';
    if (pInner.trim() !== desired) { changed = true; }
    return h2 + between + pOpen + desired + pClose;
  });
  return { html: out, changed };
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  let changed = false;
  let out = src;
  const a = normalizeTagStripCost(out); out = a.html; changed = changed || a.changed;
  const b = normalizeCostSection(out); out = b.html; changed = changed || b.changed;
  if (changed) {
    if (WRITE) fs.writeFileSync(file, out, 'utf8');
    if (VERBOSE) console.log(`* ${path.relative(ROOT, file)} updated`);
  }
  return changed;
}

function main() {
  if (!WRITE) console.log('Dry run: no files will be modified');
  const files = walk(START_DIR);
  let changedCount = 0;
  for (const f of files) {
    if (processFile(f)) changedCount++;
  }
  console.log(`${WRITE ? 'Applied' : 'Would apply'} free cost normalization in ${changedCount} file(s)`);
  if (!WRITE) console.log('Run with --write to apply changes.');
}

main();
