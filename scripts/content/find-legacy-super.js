#!/usr/bin/env node
// Detect (and optionally replace) legacy <super>...</super> with <sup>...</sup>
// Dry run by default. Use --write to apply replacements.
// Optional: --path="Some Folder" to limit scope.

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const VERBOSE = args.includes('--verbose');
const PATH_ARG = (() => {
  const p = args.find(a => a.startsWith('--path='));
  if (!p) return null; return p.split('=')[1] || null;
})();

const ROOT = process.cwd();
const START_DIR = PATH_ARG ? path.resolve(ROOT, PATH_ARG) : ROOT;
const IGNORE = new Set(['node_modules','.git','.github','images','images_unused','fonts','docs','ics']);

function walk(dir, out) {
  out = out || [];
  let list;
  try { list = fs.readdirSync(dir); } catch (e) { return out; }
  for (const name of list) {
    const fp = path.join(dir, name);
  let st; try { st = fs.statSync(fp); } catch (e2) { continue; }
    if (st.isDirectory()) {
      if (IGNORE.has(name)) continue;
      walk(fp, out);
    } else if (st.isFile() && fp.toLowerCase().endsWith('.html')) {
      out.push(fp);
    }
  }
  return out;
}

// Replace <super>st</super> etc. with <sup>st</sup>
function replaceSuper(html) {
  if (!/<super>/i.test(html)) return { changed: false, html };
  const updated = html.replace(/<super>(.*?)<\/super>/gi, '<sup>$1</sup>');
  return { changed: updated !== html, html: updated };
}

function processFile(f) {
  const src = fs.readFileSync(f, 'utf8');
  const { changed, html } = replaceSuper(src);
  if (changed && WRITE) fs.writeFileSync(f, html, 'utf8');
  if (changed && VERBOSE) console.log('* replaced <super> in', path.relative(ROOT, f));
  return changed;
}

function main() {
  if (!WRITE) console.log('Dry run: no files will be modified');
  const files = walk(START_DIR);
  let changed = 0;
  for (const f of files) {
    if (processFile(f)) changed++;
  }
  console.log(`${WRITE ? 'Applied' : 'Would apply'} legacy <super> replacements in ${changed} file(s)`);
  if (!WRITE) console.log('Run with --write to apply changes.');
}

main();
