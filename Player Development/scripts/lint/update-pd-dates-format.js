#!/usr/bin/env node
/**
 * PD-local Dates Formatter (linter/fixer)
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const VERBOSE = args.includes('--verbose');

const PD_SCRIPTS = __dirname; // Player Development/scripts/lint
const PD_DIR = path.resolve(PD_SCRIPTS, '..', '..');

function listProgramFiles(){
  return fs.readdirSync(PD_DIR)
    .filter(f => f.endsWith('.html') && !/^index\.html$/i.test(f) && !/landing/i.test(f))
    .map(f => path.join(PD_DIR, f));
}

function extractDatesLine(html){
  const ulMatch = html.match(/<ul class="tag[\s\S]*?<\/ul>/i);
  if (!ulMatch) return null;
  const block = ulMatch[0];
  const liMatch = block.match(/<li class="tag-item"[^>]*data-tag="dates"[^>]*>([\s\S]*?)<\/li>/i);
  if (!liMatch) return null;
  return liMatch[0];
}

function normalize(dateHtml){
  if (!dateHtml) return { html: dateHtml, changed: false };
  let out = dateHtml;
  out = out.replace(/\s*&\s*/g, ' & ');
  out = out.replace(/,\s*/g, ', ');
  out = out.replace(/\s{2,}/g, ' ');
  out = out.replace(/\s+<\/strong>/, '</strong>');
  out = out.replace(/>([^<]*?)\s*-\s*([^<]*?)</g, '>$1 - $2<');
  out = out.replace(/\s*,\s*(20\d{2})/, ', $1');
  out = out.replace(/\s+<\/li>/, '</li>');
  return { html: out, changed: out !== dateHtml };
}

function processFile(file){
  const src = fs.readFileSync(file, 'utf8');
  const datesLi = extractDatesLine(src);
  if (!datesLi) return { changed: false };
  const { html: fixed, changed } = normalize(datesLi);
  if (!changed) return { changed: false };
  const updated = src.replace(datesLi, fixed);
  if (WRITE) fs.writeFileSync(file, updated, 'utf8');
  if (VERBOSE) console.log(`* ${path.basename(file)}: normalized Dates line`);
  return { changed: true };
}

function main(){
  const files = listProgramFiles();
  if (!WRITE) console.log('Dry run: no files will be modified');
  let changedCount = 0;
  for (const f of files){
    const res = processFile(f);
    if (res.changed) changedCount++;
  }
  console.log(`${WRITE ? 'Applied' : 'Would apply'} Dates line normalization in ${changedCount} file(s)`);
  if (!WRITE) console.log('Run with --write to apply changes.');
}

main();
