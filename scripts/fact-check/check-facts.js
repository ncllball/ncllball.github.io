// Checks the website pages in CMS/ against facts-2027.json (the 2027 source of truth).
//
//   node scripts/fact-check/check-facts.js            report to stdout, exit 1 if any ERROR
//   node scripts/fact-check/check-facts.js --md out.md also write the report to a file
//
// What it checks:
//   ERROR  a division row in a table whose Fee / League Age / Birth Date Range / Cap column
//          disagrees with the facts (sport comes from the nearest heading, caption or label above
//          the table, or the file path)
//   WARN   banned or stale wording anywhere on a page (facts.staleOrBanned)
//   WARN   a "register by <date>" that isn't one of the agreed dates
// It only reads files. Judgment checks (prose, links, tone) are for the reviewer: see CODEX-BRIEF.md.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const CMS = path.join(ROOT, "CMS");
const factsArg = process.argv.indexOf("--facts"); // --facts <file>: check against another facts file (self-test)
const facts = JSON.parse(fs.readFileSync(factsArg > 0 ? process.argv[factsArg + 1] : path.join(__dirname, "facts-2027.json"), "utf8"));

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

function walk(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []);
}

const decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&ndash;|&mdash;|&#8211;|&#8212;/g, "-")
	.replace(/&rsquo;|&lsquo;|&#39;/g, "'").replace(/&ldquo;|&rdquo;|&quot;/g, '"').replace(/&#8209;/g, "-")
	.replace(/&[a-z]+;/g, " ");
const text = (html) => decode(html.replace(/<sup[\s\S]*?<\/sup>/gi, "").replace(/<[^>]+>/g, " ")).replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

// One "YYYY-MM-DD" from "Sept 1, 2020" / "Sep 1 2020" / "2020-09-01"; null if not a date.
function parseDate(s) {
	let m = s.match(/([A-Za-z]{3,5})\.?\s+(\d{1,2}),?\s+(\d{4})/);
	if (m && MONTHS[m[1].toLowerCase().slice(0, m[1].toLowerCase() === "sept" ? 4 : 3)]) {
		const mo = MONTHS[m[1].toLowerCase().slice(0, m[1].toLowerCase() === "sept" ? 4 : 3)];
		return `${m[3]}-${String(mo).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
	}
	m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
	return m ? m[0] : null;
}

// "Sept 1, 2020 - Aug 31, 2022" -> {from,to}; "2017-2019" -> {fromYear,toYear}
function parseRange(s) {
	const parts = s.split(/\s+(?:-|to)\s+/);
	if (parts.length === 2) {
		const a = parseDate(parts[0]), b = parseDate(parts[1]);
		if (a && b) return { from: a, to: b };
	}
	const y = s.match(/^(\d{4})\s*-\s*(\d{4})$/);
	return y ? { fromYear: y[1], toYear: y[2] } : null;
}

const sportOf = (s) => (/softball/i.test(s) ? "softball" : /baseball/i.test(s) ? "baseball" : null);

// A first cell like "AAA 3", "Tee Ball (5-6)" or "Juniors/Seniors (13-16)": the division(s) it names, and
// the ages in parentheses if any. Combined labels return every division they name.
function findDivisions(sport, cell) {
	if (!sport) return { divs: [], ages: null };
	const am = cell.match(/\(([\d\s-]+)\)\s*$/);
	const name = cell.replace(/\([^)]*\)\s*$/, "").replace(/\s*\d+$/, "").trim().toLowerCase();
	const list = facts.programs[sport].divisions;
	const one = (n) => list.find((d) => d.aliases.some((a) => a.toLowerCase() === n.trim()));
	const whole = one(name);
	const divs = whole ? [whole] : name.split("/").map(one);
	return { divs: divs.every(Boolean) ? divs : [], ages: am ? am[1].replace(/\s/g, "") : null };
}

const issues = [];
const checked = {}; // file -> division rows compared, so a clean run can be told apart from a missed table
const add = (level, file, line, msg) => issues.push({ level, file: path.relative(ROOT, file).replace(/\\/g, "/"), line, msg });

for (const file of walk(CMS)) {
	const raw = fs.readFileSync(file, "utf8");
	const src = raw.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " ")); // keep line numbers
	const fileSport = sportOf(path.basename(file));

	// ---- tables ---- (not on other programs' pages; they have their own divisions)
	const skipTables = new RegExp(facts.skipDivisionTablesIn.pattern, "i").test(path.relative(CMS, file));
	const tableRe = skipTables ? /(?!)/g : /<table[\s\S]*?<\/table>/gi;
	let t;
	while ((t = tableRe.exec(src))) {
		const tbl = t[0];
		const before = src.slice(Math.max(0, t.index - 3000), t.index);
		const ctx = [...before.matchAll(/<(h[1-6]|caption|summary|strong)[^>]*>([\s\S]*?)<\/\1>|aria-label="([^"]*)"/gi)]
			.map((m) => text(m[2] || m[3] || "")).filter((s) => sportOf(s));
		const capm = tbl.match(/<caption[^>]*>([\s\S]*?)<\/caption>|aria-label="([^"]*)"/i);
		const sport = sportOf(capm ? text(capm[1] || capm[2] || "") : "") || (ctx.length ? sportOf(ctx[ctx.length - 1]) : null) || fileSport;

		const rows = [...tbl.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((m) => ({
			idx: t.index + m.index,
			cells: [...m[0].matchAll(/<t([hd])[^>]*>([\s\S]*?)<\/t\1>/gi)].map((c) => ({ th: c[1] === "h", text: text(c[2]) })),
		}));
		const head = rows.find((r) => r.cells.length && r.cells.every((c) => c.th));
		const col = {};
		if (head) head.cells.forEach((c, i) => {
			const h = c.text.toLowerCase();
			if (/\bfee|price|cost/.test(h)) col.fee ??= i;
			if (/league age|^ages?$/.test(h)) col.age ??= i;
			if (/birth|born/.test(h)) col.born ??= i;
			if (/\bcap\b|max players|spots/.test(h)) col.cap ??= i;
		});

		for (const r of rows) {
			if (r === head || !r.cells.length) continue;
			const found = findDivisions(sport, r.cells[0].text);
			if (!found.divs.length) continue;
			const rel = path.relative(ROOT, file).replace(/\\/g, "/");
			checked[rel] = (checked[rel] || 0) + 1;
			const line = lineOf(src, r.idx);
			const cell = (k) => (col[k] != null && r.cells[col[k]] ? r.cells[col[k]].text : null);
			const feeTxt = cell("fee") ?? r.cells.slice(1).map((c) => c.text).find((x) => /^\$\s?\d/.test(x));
			const feeOf = (s) => { const m = s && s.match(/\$\s?([\d,]+)/); return m ? Number(m[1].replace(/,/g, "")) : null; };

			if (found.divs.length > 1) { // combined row: only the fee can be checked, against each division
				const fee = feeOf(feeTxt);
				for (const d of found.divs) if (fee != null && fee !== d.fee) add("ERROR", file, line, `${sport} ${d.label} (in "${r.cells[0].text}"): fee shows ${feeTxt}, facts say $${d.fee}`);
				continue;
			}
			const div = found.divs[0];
			const where = `${sport} ${div.label}`;
			if (found.ages && found.ages !== div.leagueAge) add("ERROR", file, line, `${where}: label says ages (${found.ages}), facts say ${div.leagueAge}`);
			if (feeTxt) {
				const fee = feeOf(feeTxt);
				if (fee != null && fee !== div.fee) add("ERROR", file, line, `${where}: fee shows ${feeTxt}, facts say $${div.fee}`);
			}
			const age = cell("age");
			if (age && age.replace(/\s/g, "") !== div.leagueAge) add("ERROR", file, line, `${where}: league age shows "${age}", facts say ${div.leagueAge}`);
			const born = cell("born") ?? r.cells.map((c) => c.text).find((x) => parseRange(x));
			if (born) {
				const rg = parseRange(born);
				if (rg && rg.from && (rg.from !== div.born.from || rg.to !== div.born.to))
					add("ERROR", file, line, `${where}: birth dates show "${born}", facts say ${div.born.from} to ${div.born.to}`);
				if (rg && rg.fromYear && (rg.fromYear !== div.born.from.slice(0, 4) || rg.toYear !== div.born.to.slice(0, 4)))
					add("ERROR", file, line, `${where}: birth years show "${born}", facts say ${div.born.from.slice(0, 4)}-${div.born.to.slice(0, 4)}`);
			}
			const cap = cell("cap");
			if (cap && /^\d+$/.test(cap) && Number(cap) !== div.cap) add("ERROR", file, line, `${where}: cap shows ${cap}, facts say ${div.cap}`);
		}
	}

	// ---- wording ----
	const plain = src.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, (m) => m.replace(/[^\n]/g, " "));
	for (const b of facts.staleOrBanned) {
		const re = new RegExp(b.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
		let m;
		while ((m = re.exec(plain))) {
			if (b.unlessNear && new RegExp(b.unlessNear, "i").test(text(plain.slice(Math.max(0, m.index - 400), m.index + 200)))) continue;
			// inside a tag (an attribute): only the UTM spelling matters there
			if (/<[^>]*$/.test(plain.slice(Math.max(0, m.index - 300), m.index)) && b.text !== "registration-2027") continue;
			add("WARN", file, lineOf(plain, m.index), `"${b.text}": ${b.why}`);
		}
	}
	const agreed = ["january 31", "jan 31", "january 17", "jan 17"];
	for (const m of text(plain).matchAll(/register by ([A-Za-z]+,?\s+)?([A-Za-z]+\.?\s+\d{1,2})/gi)) {
		if (!agreed.some((a) => m[2].toLowerCase().replace(".", "").startsWith(a)))
			add("WARN", file, 0, `"register by ${m[2]}" isn't one of the agreed dates (${facts.dates.registerBy}; baseball AAA/Majors ${facts.dates.registerByBaseballAAAMajors})`);
	}
}

// ---- report ----
const order = { ERROR: 0, WARN: 1 };
issues.sort((a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file) || a.line - b.line);
const counts = issues.reduce((o, i) => ((o[i.level] = (o[i.level] || 0) + 1), o), {});
const out = [`# Fact check vs facts-2027.json (pulled ${facts.pulled})`, "",
	`${counts.ERROR || 0} errors, ${counts.WARN || 0} warnings.`, "",
	...issues.map((i) => `- **${i.level}** \`${i.file}${i.line ? ":" + i.line : ""}\` ${i.msg}`),
	"", "## Division rows compared", "",
	...Object.entries(checked).sort().map(([f, n]) => `- \`${f}\`: ${n}`)].join("\n");
console.log(out);
const mdIdx = process.argv.indexOf("--md");
if (mdIdx > 0 && process.argv[mdIdx + 1]) fs.writeFileSync(process.argv[mdIdx + 1], out + "\n");
process.exit(counts.ERROR ? 1 : 0);
