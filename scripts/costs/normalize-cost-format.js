#!/usr/bin/env node
// MOVED (2025-09-23): formerly scripts/normalize-cost-format.js
// See scripts/README.md for usage.

/**
 * Normalize cost formatting site-wide to: "$<amount> / <unit>"
 * (Relocated to scripts/costs/normalize-cost-format.js)
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const VERBOSE = args.includes('--verbose');
const PATH_ARG = (() => {
  const a = args.find(x => x.startsWith('--path'));
  if (!a) return null; const [, v] = a.split('='); return v || null;})();

const ROOT = process.cwd();
const START_DIR = PATH_ARG ? path.resolve(ROOT, PATH_ARG) : ROOT;
const IGNORE_DIRS = new Set(['node_modules', '.git', 'images', 'images_unused', 'fonts', 'docs', 'ics']);

function walk(dir){
  const out = []; for (const name of fs.readdirSync(dir)){ const full = path.join(dir,name); let st; try{ st=fs.statSync(full);}catch(e){continue;} if(st.isDirectory()){ if(IGNORE_DIRS.has(name)) continue; out.push(...walk(full)); } else if (st.isFile() && full.toLowerCase().endsWith('.html')) out.push(full);} return out; }

function normalizeCostText(text){ if(/\bfree\b/i.test(text)) return { text, changed:false}; let t=text; const original=t; t=t.replace(/\bper\b/gi,'/'); t=t.replace(/\$(\d+(?:\.\d{2})?)\s*(?:\/)\s*([A-Za-z][A-Za-z &\-]*[A-Za-z]|[A-Za-z]+)([^<]*)/g,(_m,amt,unit,rest)=>`$${amt} / ${unit}${rest}`); t=t.replace(/\$(\d+(?:\.\d{2})?)\s*\/\s*/g,(_m,amt)=>`$${amt} / `); return { text:t, changed:t!==original}; }

function normalizeTagStripCost(html){ let changed=false; let out=html; out=out.replace(/(<li\b[^>]*\bdata-tag=\"cost\"[^>]*>\s*<strong>\s*Cost:\s*<\/strong>)([\s\S]*?)(<\/li>)/gi,(full,open,inner,close)=>{ const {text,c}=(()=>{const r=normalizeCostText(inner); return {text:r.text,c:r.changed};})(); if(c) changed=true; return open+text+close;}); return { html:out, changed}; }
function normalizeCostSection(html){ let changed=false; let out=html; const re=/(<h2\b[^>]*id=\"cost\"[^>]*>\s*Cost\s*<\/h2>)([\s\S]*?)(<p\b[^>]*>)([\s\S]*?)(<\/p>)/gi; out=out.replace(re,(match,h2,between,pOpen,pInner,pClose)=>{ const { text,c }=normalizeCostText(pInner); if(!c) return match; changed=true; return h2+between+pOpen+text+pClose;}); return { html:out, changed}; }

function processFile(file){ const src=fs.readFileSync(file,'utf8'); let changed=false; let out=src; const a=normalizeTagStripCost(out); out=a.html; changed=changed||a.changed; const b=normalizeCostSection(out); out=b.html; changed=changed||b.changed; if(changed){ if(WRITE) fs.writeFileSync(file,out,'utf8'); if(VERBOSE) console.log(`* ${path.relative(ROOT,file)} updated`);} return changed; }

function main(){ if(!WRITE) console.log('Dry run: no files will be modified'); const files=walk(START_DIR); let changedCount=0; for(const f of files){ if(processFile(f)) changedCount++; } console.log(`${WRITE ? 'Applied':'Would apply'} cost spacing normalization in ${changedCount} file(s)`); if(!WRITE) console.log('Run with --write to apply changes.'); }

main();
