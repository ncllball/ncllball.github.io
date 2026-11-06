// Builds docs/uniform-specs/contact-sheet.html: the uniform images ncllball.com pages use, with where each appears.
// Run from the website repo root: node scripts/uniform-contact-sheet.mjs
import fs from "node:fs";
import path from "node:path";

// Only images a site page uses: every images/uniforms URL in CMS/, labeled with the page and card it sits on.
const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name).split(path.sep).join("/")]);
const BASE = "https://ncllball.github.io/";
const uses = new Map(); // repo path -> Set of "Page › Card"
for (const page of walk("CMS").filter((f) => f.endsWith(".html"))) {
  const h = fs.readFileSync(page, "utf8");
  const title = ((h.match(/<title>([^<]*)/) || [])[1] || path.basename(page)).replace(/\s*[|–-]\s*(NCLL|North Central).*$/i, "").trim();
  const re = /https?:\/\/ncllball\.github\.io\/(images\/uniforms\/[^"' )]+\.(?:png|jpe?g|webp|svg|gif))/gi;
  let m;
  while ((m = re.exec(h))) {
    const before = h.slice(0, m.index);
    // The Uniforms Hub is two pickers (coach, then player); each opens with its uniform-<who>.png and has
    // steps headed h4.wiz-title (Shirt, Hat, Hoodie...). Other pages: the nearest card title.
    const who = [...before.matchAll(/images\/uniforms\/uniform-(coach|player)\.png/g)].pop();
    const step = [...before.matchAll(/class="(?:wiz-title left|ncll-card__title)"[^>]*>(?:<span[^>]*>)?([^<]+)/g)].pop();
    const isIntro = /uniform-(coach|player)\.png$/.test(m[1]);
    const pageName = path.basename(page, ".html").split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
    const label = pageName
      + (who || isIntro ? " › " + (isIntro ? m[1].match(/uniform-(coach|player)/)[1] : who[1]) + " picker" : "")
      + (step && !isIntro && (!who || before.lastIndexOf(step[0]) > before.lastIndexOf(who[0])) ? " › " + step[1].replace(/&mdash;/g, "—").trim() : "");
    if (!uses.has(m[1])) uses.set(m[1], new Set());
    uses.get(m[1]).add(label);
  }
}
const files = [...uses.keys()].sort();
const missing = files.filter((f) => !fs.existsSync(f));
// Group by where families see it (first use): "Uniforms Hub › coach picker › Shirt", etc.
const groups = {};
for (const f of files) {
  const g = [...uses.get(f)][0];
  (groups[g] ||= []).push(f);
}
const order = (g) => (/coach/.test(g) ? 0 : 1) * 100 + (/picker$/.test(g) ? 0 : /Shirt/.test(g) ? 1 : /Hat/.test(g) ? 2 : /Hoodie/.test(g) ? 3 : 4);
const sorted = Object.fromEntries(Object.entries(groups).sort((a, b) => order(a[0]) - order(b[0])));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const kb = (f) => fs.existsSync(f) ? Math.round(fs.statSync(f).size / 1024) : 0;

let body = "";
for (const [g, list] of Object.entries(sorted)) {
  body += `<h2>${esc(g)} <span class="n">${list.length}</span></h2>\n<div class="grid">\n`;
  for (const f of list) {
    body += `<figure><a href="../../${f}" target="_blank"><img src="../../${f}" loading="lazy" alt="${esc(path.basename(f))}"></a>`
      + `<figcaption><b>${esc(path.basename(f))}</b><span class="dim" data-kb="${kb(f)}">${kb(f)} KB</span>`
      + `<span class="use">${[...uses.get(f)].map(esc).join("<br>")}</span>`
      + `<code>${BASE}${esc(f)}</code></figcaption></figure>\n`;
  }
  body += "</div>\n";
}

const html = `<!doctype html>
<!-- docs/uniform-specs/contact-sheet.html: the uniform images ncllball.com pages use (a working page, not a site page).
     Rebuild: node scripts/uniform-contact-sheet.mjs -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Uniform Images</title>
<style>
:root{--bg:#f4f5f7;--card:#fff;--ink:#1d2433;--muted:#6b7280;--line:#e2e5ea;--accent:#c8102e}
@media (prefers-color-scheme:dark){:root{--bg:#14161b;--card:#1e2128;--ink:#e8eaee;--muted:#9aa1ad;--line:#2d313a}}
body{margin:0;padding:16px;background:var(--bg);color:var(--ink);font:14px/1.4 "Segoe UI",system-ui,sans-serif}
h1{margin:0 0 4px;font-size:22px}p.sub{margin:0 0 16px;color:var(--muted)}
h2{font-size:16px;margin:24px 0 8px;border-bottom:2px solid var(--accent);padding-bottom:4px;}
.n{color:var(--muted);font-weight:400}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden;display:flex;flex-direction:column}
figure a{display:flex;align-items:center;justify-content:center;height:160px;background:repeating-conic-gradient(#0000000d 0 25%,transparent 0 50%) 0 0/16px 16px}
figure img{max-width:100%;max-height:160px;object-fit:contain}
figcaption{padding:8px;display:flex;flex-direction:column;gap:2px;word-break:break-all}
figcaption b{font-size:12px}.dim{font-size:11px;color:var(--muted)}
figcaption .use{font-size:11px;color:var(--ink)}
code{font-size:10px;color:var(--muted);user-select:all}
</style></head><body>
<h1>Uniform Images</h1>
<p class="sub">${files.length} uniform images used on ncllball.com, with the page and card each one appears on. Click a picture to open it full size; the gray checks show where a background is transparent. The address under each one is what pages link to.</p>
${body}<script>
document.querySelectorAll("figure img").forEach(i=>{const d=()=>{const s=i.closest("figure").querySelector(".dim");s.textContent=i.naturalWidth+" × "+i.naturalHeight+" px · "+s.dataset.kb+" KB"};i.complete?d():i.addEventListener("load",d)});
</script></body></html>
`;
fs.writeFileSync("docs/uniform-specs/contact-sheet.html", html);
if (missing.length) console.log("MISSING FILES:", missing);
console.log(files.length, "images", Object.fromEntries(Object.entries(groups).map(([g, l]) => [g, l.length])));
