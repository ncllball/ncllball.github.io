#!/usr/bin/env node
/**
 * PD Dates Formatter (linter/fixer) — DRAFT
 *
 * Purpose
 * - Scan Player Development program pages for the tag strip `Dates:` item
 * - Validate against `Player Development/pd-date-format.md`
 * - Optionally rewrite minor issues (spacing, ampersands, single-year placement)
 *
 * Usage
 *   Dry run: node scripts/pd/update-pd-dates-format.js
 *   Apply:   node scripts/pd/update-pd-dates-format.js --write
 *   Verbose: add --verbose
 *
 * Notes
 * - This is a conservative checker; it logs suggested changes when in dry-run mode.
 * - Adjust rules below if the standard document changes.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const VERBOSE = args.includes('--verbose');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PD_DIR = path.join(REPO_ROOT, 'Player Development');

function listProgramFiles(){
  return fs.readdirSync(PD_DIR)
    .filter(f => f.endsWith('.html') && /^2025 /.test(f) && !/landing/i.test(f))
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
  // Ensure single spaces around & and commas
  out = out.replace(/\s*&\s*/g, ' & ');
  out = out.replace(/,\s*/g, ', ');
  out = out.replace(/\s{2,}/g, ' ');
  out = out.replace(/\s+<\/strong>/, '</strong>');
  // Keep hyphen spacing for ranges " A - B " (date line uses normal hyphen per pd-date-format.md)
  // Only replace hyphens that are outside of HTML tags (not in attributes)
  out = out.replace(/>([^<]*?)\s*-\s*([^<]*?)</g, '>$1 - $2<');
  // One space before year comma
  out = out.replace(/\s*,\s*(20\d{2})/, ', $1');
  // Trim extra spaces inside the <li>
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
  if (VERBOSE) console.log(`* ${path.relative(REPO_ROOT, file)}: normalized Dates line`);
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
