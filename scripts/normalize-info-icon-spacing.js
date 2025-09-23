#!/usr/bin/env node
/**
 * Normalize spacing after info-icon spans
 *
 * Goal: Remove any spaces/newlines between </span> of <span class="info-icon" ...> and the next character.
 * Affects any usage site-wide (scholarship footnotes, parking notes, etc.).
 *
 * Usage:
 *   node scripts/normalize-info-icon-spacing.js            # dry run
 *   node scripts/normalize-info-icon-spacing.js --write    # apply changes
 *   node scripts/normalize-info-icon-spacing.js --path="Player Development"  # limit scope
 *   node scripts/normalize-info-icon-spacing.js --verbose  # verbose logging
 */
var fs = require('fs');
var path = require('path');

var args = process.argv.slice(2);
var WRITE = args.indexOf('--write') !== -1;
var VERBOSE = args.indexOf('--verbose') !== -1;

function getArgValue(flag){
  for (var i=0; i<args.length; i++){
    if (args[i].indexOf(flag + '=') === 0) return args[i].slice((flag + '=').length);
  }
  return null;
}

var START_DIR = path.resolve(process.cwd(), getArgValue('--path') || '.');
var IGNORE_DIRS = {
  '.git': true,
  'fonts': true,
  'images': true,
  'ics': true,
  'docs': true,
  'node_modules': true
};

function walk(dir){
  var out = [];
  var names = fs.readdirSync(dir);
  for (var i=0; i<names.length; i++){
    var name = names[i];
    var full = path.join(dir, name);
    var st;
    try { st = fs.statSync(full); } catch (e) { continue; }
    if (st.isDirectory()){
      if (IGNORE_DIRS[name]) continue;
      Array.prototype.push.apply(out, walk(full));
    } else if (st.isFile() && /\.html?$/i.test(full)){
      out.push(full);
    }
  }
  return out;
}

// Pattern: <span class="info-icon" ...>...</span> [whitespace] next
// We remove only the whitespace immediately following the info-icon closing span.
var INFO_ICON_AFTER_SPACE = new RegExp('(<span\\s+class=\\"info-icon\\"[\\s\\S]*?<\\/span>)\\s+', 'ig');

function processFile(file){
  var src = fs.readFileSync(file, 'utf8');
  var changed = false;
  var updated = src.replace(INFO_ICON_AFTER_SPACE, function(_, group1){
    changed = true;
    return group1; // drop the following whitespace entirely
  });
  if (changed && WRITE){
    fs.writeFileSync(file, updated, 'utf8');
  }
  if (changed && VERBOSE){
    console.log('* ' + path.relative(process.cwd(), file) + ' fixed info-icon spacing');
  }
  return changed;
}

function main(){
  if (!WRITE) console.log('Dry run: no files will be modified');
  var files = walk(START_DIR);
  var count = 0;
  for (var i=0; i<files.length; i++){
    if (processFile(files[i])) count++;
  }
  console.log((WRITE ? 'Applied' : 'Would apply') + ' info-icon spacing normalization in ' + count + ' file(s)');
  if (!WRITE) console.log('Run with --write to apply changes.');
}

main();
