#!/usr/bin/env node
/**
 * Enforce punctuation convention site-wide:
 * - Remove trailing periods from single-line list items (<li>)
 * - Remove trailing periods from short footnote paragraphs inside <section class="footies">
 *
 * Safety heuristics (conservative):
 * - Only remove a single trailing '.' when the inner text:
 *   - ends with a single '.' (not '...' or '…')
 *   - contains no other '.' earlier in the string
 *   - contains no '?' or '!'
 *   - does not include 'http' or 'www.' (skip links/sentences)
 * - Keeps punctuation for multi-sentence paragraphs and ellipses
 *
 * Usage:
 *   Dry run (default): node scripts/enforce-punctuation.js
 *   Apply changes:      node scripts/enforce-punctuation.js --write
 *   Limit path:         node scripts/enforce-punctuation.js --path "2025 Season"
 *   Verbose output:     node scripts/enforce-punctuation.js --verbose
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const VERBOSE = args.includes('--verbose');
const PATH_ARG = (() => {
  const p = args.find(a => a.startsWith('--path'));
  if (!p) return null;
  const [_, v] = p.split('=');
  return v || null;
})();

const ROOT = process.cwd();
const START_DIR = PATH_ARG ? path.resolve(ROOT, PATH_ARG) : ROOT;

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.github',
  'images',
  'images_unused',
  'fonts',
  'docs',
  'ics' // don't touch generated calendar files
]);

function walk(dir) {
  /** @type {string[]} */
  const files = [];
  const entries = fs.readdirSync(dir);
  for (const name of entries) {
    const full = path.join(dir, name);
    let stat;
    try {
      stat = fs.statSync(full);
    } catch (e) {
      continue;
    }
    if (stat.isDirectory()) {
      if (IGNORE_DIRS.has(name)) continue;
      files.push(...walk(full));
    } else if (stat.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldTrimTrailingPeriod(text) {
  if (!text) return false;
  const t = text.trim();
  if (!t.endsWith('.')) return false;
  if (t.endsWith('...') || t.endsWith('….') || t.endsWith('…')) return false;
  const core = t.slice(0, -1);
  if (core.includes('.') || core.includes('?') || core.includes('!')) return false;
  const lower = core.toLowerCase();
  if (lower.includes('http') || lower.includes('www.')) return false;
  return true;
}

function trimTrailingPeriodFromInnerHtml(innerHtml) {
  // Remove a single trailing '.' immediately before optional closing inline tags/spaces and end
  // e.g. "... text.</em></strong>" => "... text</em></strong>"
  const pattern = /(\s*(?:<\/(?:em|strong|a|span|b|i|u|small|sup|sub)>)*)(\.)\s*$/i;
  return innerHtml.replace(pattern, '$1');
}

function processListItems(html, file) {
  const liRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  return html.replace(liRegex, (full, inner) => {
    const text = stripHtml(inner);
    if (shouldTrimTrailingPeriod(text)) {
      const updatedInner = trimTrailingPeriodFromInnerHtml(inner);
      if (VERBOSE) console.log(`  - [li] trimmed trailing '.' in ${path.relative(ROOT, file)} => "${text}"`);
      return full.replace(inner, updatedInner);
    }
    return full;
  });
}

function processFooties(html, file) {
  const sectionRegex = /<section\b([^>]*?)class=("|')[^"']*\bfooties\b[^"']*(\2)[^>]*>([\s\S]*?)<\/section>/gi;
  return html.replace(sectionRegex, (sectionFull, attrs, q1, q2, sectionInner) => {
    const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
    const newSectionInner = sectionInner.replace(pRegex, (pFull, pInner) => {
      const text = stripHtml(pInner);
      if (shouldTrimTrailingPeriod(text)) {
        const updatedInner = trimTrailingPeriodFromInnerHtml(pInner);
        if (VERBOSE) console.log(`  - [footies <p>] trimmed trailing '.' in ${path.relative(ROOT, file)} => "${text}"`);
        return pFull.replace(pInner, updatedInner);
      }
      return pFull;
    });
    return sectionFull.replace(sectionInner, newSectionInner);
  });
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;
  out = processListItems(out, file);
  out = processFooties(out, file);
  const changed = out !== src;
  if (changed && WRITE) {
    fs.writeFileSync(file, out, 'utf8');
  }
  return { changed, before: src, after: out };
}

function main() {
  const all = walk(START_DIR).filter(f => f.toLowerCase().endsWith('.html'));
  let changedFiles = 0;
  let totalChangesApprox = 0; // heuristic from diff length
  if (!WRITE) console.log('Dry run: no files will be modified');
  console.log(`Scanning ${all.length} HTML files under ${path.relative(ROOT, START_DIR) || '.'} ...`);
  for (const file of all) {
    const { changed, before, after } = processFile(file);
    if (changed) {
      changedFiles += 1;
      // Approximate: count how many instances of ">\n" length diffs as changes using regex match of periods removed
      const removals = (before.match(/<li[\s\S]*?\.<\/li>/gi) || []).length - (after.match(/<li[\s\S]*?\.<\/li>/gi) || []).length
        + (before.match(/<section[\s\S]*?class=("|')[^"']*\bfooties\b[\s\S]*?\.\s*<\/p>[\s\S]*?<\/section>/gi) || []).length
        - (after.match(/<section[\s\S]*?class=("|')[^"']*\bfooties\b[\s\S]*?\.\s*<\/p>[\s\S]*?<\/section>/gi) || []).length;
      totalChangesApprox += Math.max(1, removals);
      if (VERBOSE) console.log(`* ${path.relative(ROOT, file)} changed`);
    }
  }
  console.log(`${WRITE ? 'Applied' : 'Would apply'} punctuation cleanup to ${changedFiles} file(s)`);
  if (changedFiles) console.log(`Approximate occurrences fixed: ${totalChangesApprox}`);
  if (!WRITE) console.log('Run with --write to apply changes.');
}

main();
