#!/usr/bin/env node
/**
 * De-duplicate the standard scholarship footnote <section class="footies"> blocks.
 *
 * Behavior:
 * - Scans HTML files under the provided --path (default: repo root)
 * - Detects scholarship footnote sections by matching the standard marker sentence
 * - If more than one scholarship footnote appears in a file, removes all but the first
 * - Dry-run by default; apply changes with --write
 * - Verbose logging with --verbose
 *
 * Node 6 compatible (no optional catch bindings / arrow functions)
 */

var fs = require('fs');
var path = require('path');

var args = process.argv.slice(2);
var WRITE = args.indexOf('--write') !== -1;
var VERBOSE = args.indexOf('--verbose') !== -1;
var PATH_ARG = (function() {
  for (var i = 0; i < args.length; i++) {
    if (args[i].indexOf('--path=') === 0) {
      return args[i].slice('--path='.length);
    }
  }
  return '';
})();

var ROOT = path.resolve(process.cwd(), PATH_ARG || '.');

// Identify scholarship footnote by this canonical phrase
var SCHOLAR_MARKER = 'NCLL believes that no one should be denied the ability to play ball due to economic circumstances';

// Regex to capture any footies section
var FOOTIES_BLOCK_RE = /<section\s+class="footies"[\s\S]*?<\/section>/g;

var changed = [];
var scanned = 0;

function isHtmlFile(fp) {
  return /\.html?$/i.test(fp);
}

function walk(dir, accumulator) {
  accumulator = accumulator || [];
  var list;
  try {
    list = fs.readdirSync(dir);
  } catch (e) {
    if (VERBOSE) console.error('Failed to read dir:', dir, e.message);
    return accumulator;
  }
  for (var i = 0; i < list.length; i++) {
    var name = list[i];
    var fp = path.join(dir, name);
    var stat;
    try {
      stat = fs.statSync(fp);
    } catch (e2) {
      if (VERBOSE) console.error('Failed to stat:', fp, e2.message);
      continue;
    }
    if (stat.isDirectory()) {
      // Skip common irrelevant folders
      if (name === 'node_modules' || name === '.git' || name === '.github') continue;
      walk(fp, accumulator);
    } else if (stat.isFile() && isHtmlFile(fp)) {
      accumulator.push(fp);
    }
  }
  return accumulator;
}

function dedupScholarFooties(html) {
  var blocks = [];
  var m;
  FOOTIES_BLOCK_RE.lastIndex = 0;
  while ((m = FOOTIES_BLOCK_RE.exec(html)) !== null) {
    blocks.push({ index: m.index, text: m[0] });
  }

  if (blocks.length === 0) return { updated: false, html: html, removedCount: 0 };

  // Filter only scholarship footnote blocks (contain the marker text)
  var schol = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].text.indexOf(SCHOLAR_MARKER) !== -1) {
      schol.push(blocks[i]);
    }
  }

  if (schol.length <= 1) return { updated: false, html: html, removedCount: 0 };

  // Keep the first occurrence, remove the rest
  schol.sort(function(a, b) { return a.index - b.index; });
  var toRemove = schol.slice(1);

  // Remove from the end to preserve indices
  toRemove.sort(function(a, b) { return b.index - a.index; });
  var updated = html;
  for (var j = 0; j < toRemove.length; j++) {
    var block = toRemove[j];
    // Find this exact block instance at or after index to be safe
    var start = updated.indexOf(block.text, block.index - 50);
    if (start === -1) {
      // fallback search
      start = updated.indexOf(block.text);
    }
    if (start !== -1) {
      var end = start + block.text.length;
      updated = updated.slice(0, start) + '' + updated.slice(end);
    }
  }

  return { updated: updated !== html, html: updated, removedCount: toRemove.length };
}

function processFile(fp) {
  scanned++;
  var src;
  try {
    src = fs.readFileSync(fp, 'utf8');
  } catch (e) {
    if (VERBOSE) console.error('Failed to read file:', fp, e.message);
    return;
  }

  var res = dedupScholarFooties(src);
  if (res.updated) {
    if (VERBOSE) console.log('De-duplicated scholarship footnote(s):', fp, '(removed', res.removedCount, ')');
    changed.push(fp);
    if (WRITE) {
      try {
        fs.writeFileSync(fp, res.html, 'utf8');
      } catch (e2) {
        console.error('Failed to write file:', fp, e2.message);
      }
    }
  }
}

var files = walk(ROOT, []);
for (var i = 0; i < files.length; i++) {
  processFile(files[i]);
}

if (WRITE) {
  console.log('Applied scholarship footnote de-duplication in', changed.length, 'file(s).');
} else {
  console.log('Would apply scholarship footnote de-duplication in', changed.length, 'file(s).');
}
if (changed.length && VERBOSE) {
  for (var k = 0; k < changed.length; k++) {
    console.log('-', changed[k]);
  }
}

// Exit code to indicate if changes were proposed/applied
process.exit(0);
