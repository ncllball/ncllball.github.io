// Builds the Uniform PICKER (coach + player wizards) on the Uniforms Hub
// (CMS/Resources/uniforms-hub.html) from the data below.
//
//   node scripts/build-uniform-picker.js
//
// The picker is pure HTML/CSS (radio buttons + :has()), so every model, size and
// skip rule turns into a pile of selectors. Edit the data here, never the
// generated block in the hub. The script rewrites the hub's <style> block and
// everything between <!-- picker:start --> and <!-- picker:end -->; the intro,
// related links and rev marker stay hand-edited.
//
// Source of truth for models and sizes: docs/uniform-specs/specs.md, plus the
// 2027 review (docs/uniform-specs/2027-review.md). Registration answers are
// numbered; the picker summary shows the same "N: label" text the Sports Connect
// dropdown will show, so keep each question's option list in the registration
// order.

const fs = require("fs");
const path = require("path");

const HUB = path.join(__dirname, "..", "CMS", "Resources", "uniforms-hub.html");
const IMG = "https://ncllball.github.io/images/uniforms";
const REGISTER_URL = "https://www.ncllball.com/Default.aspx?tabid=2244720";

// ── Divisions ──────────────────────────────────────────────────────────────

const DIVISIONS = {
	bb: [
		["tb", "T-Ball"],
		["kcp", "Kindy&nbsp;/ Coach&nbsp;Pitch"],
		["a", "A"],
		["aa", "AA"],
		["aaa", "AAA"],
		["majors", "Majors"],
		["int", "Intermediate"],
		["juniors", "Juniors"],
		["seniors", "Seniors"],
	],
	sb: [
		["a", "A"],
		["aa", "AA"],
		["aaa", "AAA"],
		["majors", "Majors"],
		["juniors", "Juniors"],
		["seniors", "Seniors"],
	],
};

// Division sets used for skip rules and "provided" items (both sports).
const SETS = {
	upper: ["aaa", "majors", "int", "juniors", "seniors"], // hat + hoodie divisions
	lower: ["tb", "kcp", "a", "aa"], // no hat size, no hoodie
	socks: ["a", "aa", "aaa", "majors", "int", "juniors", "seniors"], // socks & belt (sheet: "A and up")
};

// ── Measurement helpers ────────────────────────────────────────────────────

const chest = (r) => `Fits chest ${r}&Prime;`;
const bust = (r) => `Fits bust ${r}&Prime;`;
const head = (r) => `Head ${r}&Prime;`;

// Chest ranges from the 2027 review sheet (body measurements).
const CHEST_4001_4011 = {
	yxs: "22&ndash;24", ys: "24&ndash;26", ym: "26&ndash;28", yl: "30&ndash;32", yxl: "32&ndash;34",
	as: "34&ndash;36", am: "38&ndash;40", al: "42&ndash;44", axl: "46&ndash;48", a2xl: "50&ndash;52", a3xl: "54&ndash;56",
};
const CHEST_ST350 = {
	yxs: "22&ndash;24", ys: "25&ndash;27", ym: "28&ndash;30", yl: "30&ndash;32", yxl: "32&ndash;34",
	axs: "32&ndash;34", as: "35&ndash;37", am: "38&ndash;40", al: "41&ndash;43", axl: "44&ndash;46", a2xl: "47&ndash;49", a3xl: "50&ndash;53", a4xl: "54&ndash;57",
};
// 4408 supplier sheet (docs/uniform-specs/SPEC_SHEET_4408_softball.jpg): the shirt laid flat,
// 1" below the armholes. Protime has no body-chest chart for girls/womens sizes.
const FLAT_4408 = {
	gs: "13½", gm: "15½", gl: "17½",
	ws: "19", wm: "20½", wl: "22", wxl: "23½", w2xl: "25",
};
const flat = (r) => `Shirt ${r}&Prime; across`;
// 4404: no measurements on file yet (ask Protime for the Dawson spec sheet).
const none = () => "";
// Sport-Tek LST350 size chart (body bust), from SanMar's spec sheet, 2026-11-03.
const BUST_LST350 = { lwxs: "32&ndash;34", lws: "35&ndash;36", lwm: "37&ndash;38", lwl: "39&ndash;41", lwxl: "42&ndash;44", lw2xl: "45&ndash;47", lw3xl: "48&ndash;51" };

const sized = (codes, table, fmt) => codes.map((c) => [c, fmt(table[c])]);

// ── Wizards ────────────────────────────────────────────────────────────────
//
// Each question = one registration dropdown. options: [code, "label"] in
// registration order (the number shown is the 1-based position). Each step
// has blocks; a block shows for its sport + divisions and offers size sets
// (each set names the item/SKU those sizes order).

// Questions are per program (baseball and softball are separate Sports Connect
// programs), so each sport gets its own numbered list. Coach questions are
// separate from player questions (asked of team staff only).

const PTS30 = [["xssm", head("6⅝&ndash;7")], ["smmd", head("7&ndash;7¼")], ["lgxl", head("7⅜&ndash;7⅝")]];
const ADULT_TOPS = [
	["axs", "Adult XS"], ["as", "Adult S"], ["am", "Adult M"], ["al", "Adult L"],
	["axl", "Adult XL"], ["a2xl", "Adult 2XL"], ["a3xl", "Adult 3XL"], ["a4xl", "Adult 4XL"],
];

const MENS_S_UP = [
	["as", "Mens S"], ["am", "Mens M"], ["al", "Mens L"],
	["axl", "Mens XL"], ["a2xl", "Mens 2XL"], ["a3xl", "Mens 3XL"], ["a4xl", "Mens 4XL"],
];
const WOMENS = [["lws", "Womens S"], ["lwm", "Womens M"], ["lwl", "Womens L"], ["lwxl", "Womens XL"], ["lw2xl", "Womens 2XL"], ["lw3xl", "Womens 3XL"]];

const PLAYER = {
	prefix: "",
	kind: "player",
	title: "NCLL Player Uniform PICKER",
	introImg: [`${IMG}/uniform-player.png`, "NCLL player uniform"],
	divisionQ: "Which division is your player in?",
	sportQ: "Are you registering for baseball or softball?",
	questions: {
		"shirt-bb": {
			sport: "bb",
			q: "What shirt size do you want to order?",
			options: [
				["yxs", "Youth XS"], ["ys", "Youth S"], ["ym", "Youth M"], ["yl", "Youth L"], ["yxl", "Youth XL"],
				...ADULT_TOPS,
			],
		},
		"shirt-sb": {
			sport: "sb",
			q: "What shirt size do you want to order?",
			options: [
				["gs", "Girls S"], ["gm", "Girls M"], ["gl", "Girls L"],
				["ws", "Womens S"], ["wm", "Womens M"], ["wl", "Womens L"], ["wxl", "Womens XL"], ["w2xl", "Womens 2XL"],
				// Every softball jersey (4408 and the Majors 4404) comes in Girls/Womens sizes only (Protime, 2026-11-03).
			],
		},
		"hat-bb": {
			sport: "bb",
			when: "upper",
			q: "What hat size do you want to order? (AAA and up only)",
			options: [["xssm", "Cap XS-SM"], ["smmd", "Cap SM-MD"], ["lgxl", "Cap LG-XL"]],
		},
		"hat-sb": {
			sport: "sb",
			when: "upper",
			q: "What visor size do you want to order? (AAA and up only)",
			options: [["visor-y", "Visor Youth"], ["visor-a", "Visor Adult"]],
		},
	},
	steps: [
		{
			key: "shirt",
			title: "Shirt",
			subtitle: "Choose a shirt size for your player.",
			next: [["hat", "upper", "Next: Hat"], ["included", "lower", "Next: Included items"]],
			blocks: [
				{
					q: "shirt-bb", sport: "bb", divs: ["tb", "kcp"],
					images: [[`${IMG}/shirts/YST350_TRUE-ROYAL_FRONT.png`, "YST350 youth tee"]],
					note: "T-Ball and Kindy players get the <strong>ST350</strong> performance tee (<strong>YST350</strong> in youth sizes). Measure around the fullest part of the chest.",
					sets: [
						{ title: "Youth", item: "ST350 tee (youth)", sizes: sized(["yxs", "ys", "ym", "yl", "yxl"], CHEST_ST350, chest) },
						{ title: "Adult", item: "ST350 tee", sizes: sized(["axs", "as", "am", "al", "axl", "a2xl", "a3xl", "a4xl"], CHEST_ST350, chest) },
					],
				},
				{
					q: "shirt-bb", sport: "bb", divs: ["a", "aa", "aaa"],
					images: [[`${IMG}/shirts/4001_MAROON_FRONT.png`, "4001 baseball jersey"]],
					note: "A, AA and AAA players get the <strong>4001</strong> baseball jersey. Measure around the fullest part of the chest.",
					sets: [{ item: "4001 jersey", sizes: sized(["yxs", "ys", "ym", "yl", "yxl", "as", "am", "al", "axl", "a2xl", "a3xl"], CHEST_4001_4011, chest) }],
				},
				{
					q: "shirt-bb", sport: "bb", divs: ["majors", "int", "juniors", "seniors"],
					images: [[`${IMG}/shirts/4011_GREEN_FRONT.png`, "4011 baseball jersey"]],
					note: "Majors, Intermediate, Juniors and Seniors players get the <strong>4011</strong> baseball jersey. Measure around the fullest part of the chest.",
					sets: [{ item: "4011 jersey", sizes: sized(["yxs", "ys", "ym", "yl", "yxl", "as", "am", "al", "axl", "a2xl", "a3xl"], CHEST_4001_4011, chest) }],
				},
				{
					q: "shirt-sb", sport: "sb", divs: ["a", "aa", "aaa", "juniors", "seniors"],
					images: [[`${IMG}/shirts/4408_LIGHT-BLUE_FRONT.png`, "4408 softball jersey"]],
					note: "Players get the <strong>4408</strong> softball jersey, in girls or womens sizes. Lay a shirt that fits now flat and measure straight across, one inch below the armpits; pick the size closest to that.",
					sets: [
						{ title: "Girls sizes", item: "4408 Girls jersey", sizes: sized(["gs", "gm", "gl"], FLAT_4408, flat) },
						{ title: "Womens sizes", item: "4408 Womens jersey", sizes: sized(["ws", "wm", "wl", "wxl", "w2xl"], FLAT_4408, flat) },
					],
				},
				{
					q: "shirt-sb", sport: "sb", divs: ["majors"],
					images: [[`${IMG}/shirts/4404_RED_FRONT.png`, "4404 Dawson softball jersey"]],
					note: "Softball Majors players get the <strong>4404</strong> Dawson jersey, in the same girls and womens sizes as the 4408 that A–AAA wear. Measurements for this jersey are coming; if your player wore a 4408 before, start with that size.",
					sets: [
						{ title: "Girls sizes", item: "4404 Girls jersey", sizes: sized(["gs", "gm", "gl"], {}, none) },
						{ title: "Womens sizes", item: "4404 Womens jersey", sizes: sized(["ws", "wm", "wl", "wxl", "w2xl"], {}, none) },
					],
				},
			],
		},
		{
			key: "hat",
			when: "upper",
			title: "Hat",
			subtitle: "Choose a hat size for your player.",
			back: [["shirt"]],
			next: [["included", null, "Next: Included items"]],
			blocks: [
				{
					q: "hat-bb", sport: "bb", divs: SETS.upper,
					images: [[`${IMG}/hats/PTS30_BLACK-MAROON_FINAL.jpg.png`, "PTS30 fitted cap"]],
					note: "Players get the <strong>PTS30</strong> fitted cap. Measure around the head, just above the ears.",
					sets: [{ item: "PTS30 fitted cap", sizes: PTS30 }],
				},
				{
					q: "hat-sb", sport: "sb", divs: ["aaa", "majors", "juniors", "seniors"],
					images: [[`${IMG}/hats/4302_SCARLET_SIDE.png`, "4302 softball visor"]],
					note: "Players get the <strong>4302</strong> adjustable softball visor.",
					sets: [{ item: "4302 visor", sizes: [["visor-y", head("6⅜&ndash;7¼")], ["visor-a", head("7&ndash;7¾")]] }],
				},
			],
		},
	],
	// Items with no size question: shown on the Included step and in the summary.
	provided: [
		["lower", "<strong>Hat:</strong> youth adjustable cap &mdash; one size fits all, nothing to pick."],
		["upper", "<strong>Hoodie:</strong> we order one size larger than the jersey you picked."],
		["socks", "<strong>Socks and belt:</strong> sized for your division."],
	],
	includedStep: true,
	includedWhen: null, // every player division has something included
	includedBack: [["hat", "upper"], ["shirt", "lower"]],
	includedImages: [[`${IMG}/hats/4301_ROYAL_FRONT.png`, "4301 adjustable cap", "lower"], [`${IMG}/outerwear/8203_ROYAL_FRONT.png`, "8203 hoodie", "upper"], [`${IMG}/socks-belts/7101_SCARLET_PAIR.png`, "Socks", "socks"], [`${IMG}/socks-belts/4350_SCARLET_FRONT.png`, "Belt", "socks"]],
};

const COACH = {
	prefix: "c-",
	kind: "coach",
	title: "NCLL Coach Uniform PICKER",
	introImg: [`${IMG}/uniform-coach.png`, "NCLL coach uniform"],
	divisionQ: "Which division are you coaching?",
	sportQ: "Are you coaching baseball or softball?",
	questions: {
		// Coach lists keep 2026's order so no existing Sports Connect option changes meaning;
		// the XS sizes added for 2027 are appended (baseball 15, softball 14-15).
		"shirt-bb": {
			sport: "bb",
			q: "What coach shirt size do you want to order?",
			options: [
				["axs", "Mens XS"], ...MENS_S_UP,
				...WOMENS, ["lwxs", "Womens XS"],
			],
		},
		"shirt-sb": {
			sport: "sb",
			q: "What coach shirt size do you want to order?",
			options: [...MENS_S_UP, ...WOMENS, ["axs", "Mens XS"], ["lwxs", "Womens XS"]],
		},
		"hat-bb": {
			sport: "bb",
			when: "upper",
			q: "What coach hat size do you want to order? (AAA and up only)",
			options: [["xssm", "Cap XS-SM"], ["smmd", "Cap SM-MD"], ["lgxl", "Cap LG-XL"]],
		},
		"hat-sb": {
			sport: "sb",
			when: "upper",
			q: "What coach hat size do you want to order? (AAA and up only)",
			options: [["hc10-sm", "Cap Small"], ["hc10-mxl", "Cap M-XL"]],
		},
		hoodie: {
			when: "upper",
			q: "What coach hoodie size do you want to order? (AAA and up only)",
			options: ADULT_TOPS.slice(1, 7), // S-3XL: the 8203 has no 4XL (Protime, 2026-11-03)
		},
	},
	steps: [
		{
			key: "shirt",
			title: "Shirt",
			subtitle: "Choose a shirt for yourself.",
			next: [["hat", "upper", "Next: Hat"], ["included", "lower", "Next: Included items"]],
			blocks: [
				{
					q: "shirt-bb", sport: "bb",
					images: [[`${IMG}/shirts/ST350_TRUE-RED_FRONT.png`, "ST350 mens tee"], [`${IMG}/shirts/LST350_TRUE-ROYAL_FRONT.png`, "LST350 womens tee"]],
					note: "Coaches get the <strong>ST350</strong> performance tee in a mens cut or the <strong>LST350</strong> in a womens cut. Pick one size from either list.",
					sets: [
						{ title: "Mens &mdash; ST350", item: "ST350 mens tee", sizes: sized(["axs", "as", "am", "al", "axl", "a2xl", "a3xl", "a4xl"], CHEST_ST350, chest) },
						{ title: "Womens &mdash; LST350", item: "LST350 womens tee", sizes: sized(["lwxs", "lws", "lwm", "lwl", "lwxl", "lw2xl", "lw3xl"], BUST_LST350, bust) },
					],
				},
				{
					q: "shirt-sb", sport: "sb",
					images: [[`${IMG}/shirts/ST350_TRUE-RED_FRONT.png`, "ST350 mens tee"], [`${IMG}/shirts/LST350_TRUE-ROYAL_FRONT.png`, "LST350 womens tee"]],
					note: "Coaches get the <strong>ST350</strong> performance tee in a mens cut or the <strong>LST350</strong> in a womens cut. Pick one size from either list.",
					sets: [
						{ title: "Mens &mdash; ST350", item: "ST350 mens tee", sizes: sized(["axs", "as", "am", "al", "axl", "a2xl", "a3xl", "a4xl"], CHEST_ST350, chest) },
						{ title: "Womens &mdash; LST350", item: "LST350 womens tee", sizes: sized(["lwxs", "lws", "lwm", "lwl", "lwxl", "lw2xl", "lw3xl"], BUST_LST350, bust) },
					],
				},
			],
		},
		{
			key: "hat",
			when: "upper",
			title: "Hat",
			subtitle: "Choose a hat size for yourself.",
			back: [["shirt"]],
			next: [["hoodie", null, "Next: Hoodie"]],
			blocks: [
				{
					q: "hat-bb", sport: "bb", divs: SETS.upper,
					images: [[`${IMG}/hats/PTS30_BLACK-MAROON_FINAL.jpg.png`, "PTS30 fitted cap"]],
					note: "Coaches get the <strong>PTS30</strong> fitted cap. Measure around the head, just above the ears.",
					sets: [{ item: "PTS30 fitted cap", sizes: PTS30 }],
				},
				{
					q: "hat-sb", sport: "sb", divs: ["aaa", "majors", "juniors", "seniors"],
					images: [[`${IMG}/hats/HC10_2.png`, "HC10 cap"]],
					note: "Softball coaches get the <strong>HC10</strong> (Champro) cap. Measure around the head, just above the ears.",
					sets: [{ item: "HC10 cap", sizes: [["hc10-sm", head("6¼&ndash;7")], ["hc10-mxl", head("7&ndash;7⅝")]] }],
				},
			],
		},
		{
			key: "hoodie",
			when: "upper",
			title: "Hoodie",
			subtitle: "Choose a hoodie size for yourself.",
			back: [["hat"]],
			next: [["summary", null, "See my answers"]],
			blocks: [
				{
					q: "hoodie", sport: "any", divs: SETS.upper,
					images: [[`${IMG}/outerwear/8203_ROYAL_FRONT.png`, "8203 hoodie"]],
					note: "AAA and up coaches get the <strong>8203</strong> hoodie. Measure around the fullest part of the chest.",
					sets: [{ item: "8203 hoodie", sizes: sized(["as", "am", "al", "axl", "a2xl", "a3xl"], CHEST_ST350, chest) }],
				},
			],
		},
	],
	provided: [["lower", "<strong>Hat:</strong> adult adjustable cap &mdash; one size fits all, nothing to pick."]],
	includedStep: true,
	includedWhen: "lower", // only T-Ball to AA coaches get something included (the cap); AAA and up pick everything
	includedBack: [["shirt"]],
	includedImages: [[`${IMG}/hats/4301_ROYAL_FRONT.png`, "4301 adjustable cap"]],
};

// ── Builders ───────────────────────────────────────────────────────────────

const css = [];
const rule = (selectors, body) => css.push(`${[].concat(selectors).join(",\n")} {\n\t${body.join(";\n\t")};\n}`);
const ids = (p, list) => list.map((x) => `#${p}${x}:checked`).join(", ");

function build(w) {
	const p = w.prefix;
	const steps = ["intro", "sport", "division", ...w.steps.map((s) => s.key), ...(w.includedStep ? ["included"] : []), "summary"];
	const stepId = (key) => (key === "intro" ? `${p}wiz-intro` : `${p}wiz-s${steps.indexOf(key) - 1}`);
	const W = ".unif-wizard";
	const divsOf = (sport) => DIVISIONS[sport].map((d) => d[0]);
	const allDivs = [...new Set([...divsOf("bb"), ...divsOf("sb")])];
	const setSel = (name) => `${W}:has(${ids(p + "div-", SETS[name])})`;
	const blockSel = (b) => {
		const sport = b.sport === "any" ? `${W}:has(${ids(p + "sport-", ["bb", "sb"])})` : `${W}:has(#${p}sport-${b.sport}:checked)`;
		return b.divs ? `${sport}:has(${ids(p + "div-", b.divs)})` : sport;
	};
	const radio = (name, id, checked) => `<input type="radio" name="${p}${name}" id="${p}${id}"${checked ? " checked" : ""} />`;

	// Panels show by step.
	steps.forEach((key) => rule(`#${stepId(key)}:checked ~ .wiz-body .wiz-panel--${key}`, ["display: flex"]));
	rule(`#${p}sport-bb:checked ~ .wiz-body .div-options--bb`, ["display: grid"]);
	rule(`#${p}sport-sb:checked ~ .wiz-body .div-options--sb`, ["display: grid"]);

	// Conditional pieces (buttons, progress dots, summary rows, provided items).
	for (const name of Object.keys(SETS)) {
		rule(`${setSel(name)} .wiz-btn.when-${name}`, ["display: inline-flex"]);
		rule(`${setSel(name)} .wiz-progress__step.when-${name}`, ["display: flex"]);
		rule(`${setSel(name)} .wiz-summary__row.when-${name}`, ["display: flex"]);
		rule(`${setSel(name)} li.when-${name}`, ["display: list-item"]);
		rule(`${setSel(name)} p.when-${name}`, ["display: block"]);
		// Pictures default to hidden here: css.css .div-product-preview__item (display: flex) beats the plain .when-* hide.
		rule(`${W} figure.when-${name}`, ["display: none"]);
		rule(`${setSel(name)} figure.when-${name}`, ["display: flex"]);
	}

	// Selected pills.
	rule(["bb", "sb"].map((s) => `${W}:has(#${p}sport-${s}:checked) label[for="${p}sport-${s}"]`), [
		"border-color: #1a3a6b", "background: #edf1f8", "color: #1a3a6b", "box-shadow: inset 0 0 0 2px #1a3a6b",
	]);
	const pillIds = [...allDivs.map((d) => `div-${d}`)];
	for (const [qk, q] of Object.entries(w.questions)) q.options.forEach(([c]) => pillIds.push(`${qk}-${c}`));
	rule(pillIds.map((id) => `${W}:has(#${p}${id}:checked) label[for="${p}${id}"]`), ["border-color: #1a3a6b", "background: #1a3a6b", "color: #fff"]);

	// Next buttons: enabled once the step has a valid answer.
	const enable = [`${W}:has(${ids(p + "sport-", ["bb", "sb"])}) .wiz-panel--sport .wiz-btn--next`];
	for (const s of ["bb", "sb"]) enable.push(`${W}:has(#${p}sport-${s}:checked):has(${ids(p + "div-", divsOf(s))}) .wiz-panel--division .wiz-btn--next`);
	for (const step of w.steps) {
		for (const b of step.blocks) {
			const codes = b.sets.flatMap((set) => set.sizes.map((s) => `${b.q}-${s[0]}`));
			enable.push(`${blockSel(b)}:has(${ids(p, codes)}) .wiz-panel--${step.key} .wiz-btn--next`);
		}
	}
	rule(enable, ["background: #1a3a6b", "border-color: #1a3a6b", "pointer-events: auto", "cursor: pointer"]);
	rule(enable.map((s) => `${s}:hover`), ["background: #14305a", "border-color: #14305a"]);

	// Blocks, summary values and item notes.
	for (const step of w.steps) {
		step.blocks.forEach((b, i) => {
			rule(`${blockSel(b)} .wiz-panel--${step.key} .blk--${step.key}-${i}`, ["display: block"]);
			b.sets.forEach((set, j) => {
				const codes = set.sizes.map((s) => `${b.q}-${s[0]}`);
				rule(`${blockSel(b)}:has(${ids(p, codes)}) .smodel--${step.key}-${i}-${j}`, ["display: block"]);
			});
		});
	}
	for (const [qk, q] of Object.entries(w.questions)) {
		q.options.forEach(([c]) => {
			rule(`#${p}${qk}-${c}:checked ~ .wiz-body .sval--${qk}-${c}`, ["display: inline"]);
			rule(`#${p}${qk}-${c}:checked ~ .wiz-body .sval--${qk}-none`, ["display: none"]);
		});
	}
	rule(["bb", "sb"].map((s) => `#${p}sport-${s}:checked ~ .wiz-body .sval--sport-${s}`), ["display: inline"]);
	rule(["bb", "sb"].map((s) => `#${p}sport-${s}:checked ~ .wiz-body .sval--sport-none`), ["display: none"]);
	rule(allDivs.map((d) => `#${p}div-${d}:checked ~ .wiz-body .sval--div-${d}`), ["display: inline"]);
	rule(allDivs.map((d) => `#${p}div-${d}:checked ~ .wiz-body .sval--div-none`), ["display: none"]);

	// ── HTML ──
	const t = (n) => "\t".repeat(n);
	const out = [];
	const line = (n, s) => out.push(t(n) + s);
	const total = steps.length - 2; // dots: sport … last step before summary, plus the final check
	const dotWhen = (key) => {
		if (key === "included" && w.includedWhen) return ` when-${w.includedWhen}`;
		const st = w.steps.find((s) => s.key === key);
		return st && st.when ? ` when-${st.when}` : "";
	};
	const progress = (n, current) => {
		line(n, `<div class="wiz-progress" aria-hidden="true">`);
		steps.slice(1, -1).forEach((key, i) => {
			const idx = steps.indexOf(current);
			const state = steps.indexOf(key) < idx ? " wiz-progress__step--done" : key === current ? " wiz-progress__step--active" : "";
			line(n + 1, `<span class="wiz-progress__step${state}${dotWhen(key)}"></span>`);
		});
		const final = current === "summary" ? " wiz-progress__step--active" : "";
		line(n + 1, `<span class="wiz-progress__step wiz-progress__step--final${final}"></span>`);
		line(n, `</div>`);
	};
	const btn = (n, cls, target, text, when) =>
		line(n, `<label class="wiz-btn wiz-btn--${cls}${when ? ` when-${when}` : ""}" for="${stepId(target)}">${text}</label>`);
	const preview = (n, images) => {
		if (!images) return;
		line(n, `<div class="div-product-preview">`);
		for (const [src, alt, when] of images) {
			line(n + 1, `<figure class="div-product-preview__item${when ? ` when-${when}` : ""}">`);
			line(n + 2, `<img src="${src}" alt="${alt.replace(/&mdash;/g, "—")}" />`);
			line(n + 2, `<figcaption>${alt}</figcaption>`);
			line(n + 1, `</figure>`);
		}
		line(n, `</div>`);
	};
	const panelOpen = (key, label) => {
		line(5, `<!-- ─ ${label} ─ -->`);
		line(5, `<section class="wiz-panel wiz-panel--${key}" aria-label="${label}">`);
		line(6, `<div class="wiz-panel-content">`);
	};
	const panelNav = () => {
		line(6, `</div>`);
		line(6, `<div class="wiz-nav">`);
	};
	const panelClose = () => {
		line(6, `</div>`);
		line(5, `</section>`);
		out.push("");
	};

	line(3, `<div class="wizard-section wizard-section--${w.kind}">`);
	line(3, `<div class="unif-wizard">`);
	steps.forEach((key, i) => line(4, radio("wiz-step", stepId(key).slice(p.length), i === 0)));
	out.push("");
	["bb", "sb"].forEach((s) => line(4, radio("sport", `sport-${s}`)));
	allDivs.forEach((d) => line(4, radio("division", `div-${d}`)));
	for (const [qk, q] of Object.entries(w.questions)) {
		out.push("");
		q.options.forEach(([c]) => line(4, radio(`${qk}-sz`, `${qk}-${c}`)));
	}
	out.push("");
	line(4, `<div class="wiz-header">`);
	line(5, `<h3 class="wiz-header__title"><span class="text-background">${w.title}</span></h3>`);
	line(4, `</div>`);
	line(4, `<div class="wiz-body">`);

	// Intro
	panelOpen("intro", `${w.kind === "coach" ? "Coach" : "Player"} uniform PICKER intro`);
	line(7, `<p class="wiz-intro-text"><strong>Why this exists:</strong> most uniform re-orders come from guessing sizes during registration. This takes the guessing out.</p>`);
	line(7, `<img class="wiz-intro-img" src="${w.introImg[0]}" alt="${w.introImg[1]}" />`);
	line(7, `<p class="wiz-intro-text">Pick the sport, the division and a size for each item. Photos show the style; yours come in your team&rsquo;s color. At the end you get the exact numbered answer to choose for each uniform question in registration.</p>`);
	panelNav();
	btn(7, "next", "sport", "Get Started &rarr;");
	panelClose();

	// Sport
	panelOpen("sport", "Choose your sport");
	progress(7, "sport");
	line(7, `<h4 class="wiz-title left">Sport</h4>`);
	line(7, `<p class="wiz-subtitle">${w.sportQ}</p>`);
	line(7, `<div class="wiz-options wiz-options--sport">`);
	for (const [s, name] of [["bb", "Baseball"], ["sb", "Softball"]]) {
		line(8, `<label class="wiz-opt wiz-opt--sport" for="${p}sport-${s}">`);
		line(9, `<img src="https://ncllball.github.io/images/site_navigation/${name.toLowerCase()}.png" alt="" />`);
		line(9, name);
		line(8, `</label>`);
	}
	line(7, `</div>`);
	panelNav();
	btn(7, "back", "intro", "&larr; Back");
	btn(7, "next", "division", "Next: Division &rarr;");
	panelClose();

	// Division
	panelOpen("division", "Choose your division");
	progress(7, "division");
	line(7, `<h4 class="wiz-title left">Division</h4>`);
	line(7, `<p class="wiz-subtitle">${w.divisionQ}</p>`);
	for (const s of ["bb", "sb"]) {
		line(7, `<div class="div-options--${s}">`);
		DIVISIONS[s].forEach(([d, name]) => line(8, `<label class="wiz-opt" for="${p}div-${d}">${name}</label>`));
		line(7, `</div>`);
	}
	panelNav();
	btn(7, "back", "sport", "&larr; Back");
	btn(7, "next", w.steps[0].key, `Next: ${w.steps[0].title} &rarr;`);
	panelClose();

	// Item steps
	for (const step of w.steps) {
		panelOpen(step.key, step.title);
		progress(7, step.key);
		line(7, `<h4 class="wiz-title left">${step.title}</h4>`);
		line(7, `<p class="wiz-subtitle">${step.subtitle}</p>`);
		step.blocks.forEach((b, i) => {
			line(7, `<div class="blk blk--${step.key}-${i}">`);
			preview(8, b.images);
			line(8, `<p class="wiz-shirt-note">${b.note}</p>`);
			for (const set of b.sets) {
				if (set.title) line(8, `<p class="wiz-block-title">${set.title}</p>`);
				line(8, `<div class="wiz-options">`);
				for (const [c, m] of set.sizes) {
					// Same "N: label" text as the registration dropdown line.
					const options = w.questions[b.q].options;
					const n = options.findIndex((o) => o[0] === c);
					line(9, `<label class="wiz-opt" for="${p}${b.q}-${c}">${n + 1}: ${options[n][1]}${m ? `<span class="wiz-opt__note">${m}</span>` : ""}</label>`);
				}
				line(8, `</div>`);
			}
			line(7, `</div>`);
		});
		panelNav();
		const back = step.back || [["division"]];
		back.forEach(([target, when]) => btn(7, "back", target, "&larr; Back", when));
		step.next.forEach(([target, when, text]) => btn(7, "next", target, `${text} &rarr;`, when));
		panelClose();
	}

	const providedList = (n) => {
		line(n, `<ul class="wiz-provided">`);
		w.provided.forEach(([when, text]) => line(n + 1, `<li class="when-${when}">${text}</li>`));
		line(n, `</ul>`);
	};

	// Included (player)
	if (w.includedStep) {
		panelOpen("included", "Included items");
		progress(7, "included");
		line(7, `<h4 class="wiz-title left">Included &mdash; nothing to pick</h4>`);
		line(7, `<p class="wiz-subtitle">These come with your registration. There's no size question for them.</p>`);
		providedList(7);
		preview(7, w.includedImages);
		panelNav();
		w.includedBack.forEach(([target, when]) => btn(7, "back", target, "&larr; Back", when));
		btn(7, "next", "summary", "See my answers &rarr;");
		panelClose();
	}

	// Summary
	panelOpen("summary", "Your registration answers");
	progress(7, "summary");
	line(7, `<h4 class="wiz-title left">Your registration answers</h4>`);
	// Where the questions sit in Sports Connect (checked in both 2027 programs, 2026-11-03).
	const where = w.kind === "coach" ? "in your coach position&rsquo;s questions" : "near the end of the player questions";
	line(7, `<p class="wiz-reg-callout">Take a screenshot of this screen. In registration, the uniform questions come right after &ldquo;Must read regarding Uniform Sizing!&rdquo; (${where}). For each one, pick the numbered option shown below.</p>`);
	line(7, `<dl class="wiz-summary">`);
	const plainRow = (label, key, values) => {
		line(8, `<div class="wiz-summary__row">`);
		line(9, `<dt class="wiz-summary__label">${label}</dt>`);
		line(9, `<dd class="wiz-summary__value">`);
		line(10, `<span class="sval sval--none sval--${key}-none">&mdash; not selected</span>`);
		values.forEach(([v, text]) => line(10, `<span class="sval sval--${key}-${v}">${text.replace(/&nbsp;/g, " ")}</span>`));
		line(9, `</dd>`);
		line(8, `</div>`);
	};
	plainRow("Sport", "sport", [["bb", "Baseball"], ["sb", "Softball"]]);
	plainRow("Division", "div", [...new Map([...DIVISIONS.bb, ...DIVISIONS.sb]).entries()]);
	const sportHas = (q) => (q.sport ? `:has(#${p}sport-${q.sport}:checked)` : "");
	for (const [qk, q] of Object.entries(w.questions)) {
		// A question shows once its sport (program) and, if limited, its divisions are picked.
		const cond = q.sport || q.when;
		if (cond) rule(`${W}${sportHas(q)}${q.when ? `:has(${ids(p + "div-", SETS[q.when])})` : ""} .q-row--${qk}`, ["display: flex"]);
		line(8, `<div class="wiz-summary__row wiz-summary__row--reg q-row--${qk}${cond ? " q-cond" : ""}">`);
		line(9, `<dt class="wiz-summary__q">${q.q}</dt>`);
		line(9, `<dd class="wiz-summary__answer">`);
		line(10, `<span class="sval sval--none sval--${qk}-none">&mdash; not selected</span>`);
		q.options.forEach(([c, label], i) => line(10, `<span class="sval sval--${qk}-${c}">${i + 1}: ${label}</span>`));
		line(9, `</dd>`);
		for (const step of w.steps)
			step.blocks.forEach((b, i) => {
				if (b.q === qk) b.sets.forEach((set, j) => line(9, `<dd class="smodel smodel--${step.key}-${i}-${j}">Orders the ${set.item}</dd>`));
			});
		line(8, `</div>`);
	}
	line(7, `</dl>`);
	// Included items have their own step; the answers page lists registration answers only.
	line(7, `<details class="wiz-options-ref">`);
	line(8, `<summary>Every option in each registration question</summary>`);
	for (const [qk, q] of Object.entries(w.questions)) {
		if (q.sport) rule(`${W}${sportHas(q)} .q-ref--${qk}`, ["display: block"]);
		line(8, `<div class="q-ref q-ref--${qk}${q.sport ? " q-sport" : ""}">`);
		line(9, `<p class="wiz-options-ref__q">${q.q}</p>`);
		line(9, `<ol class="wiz-options-ref__list">`);
		q.options.forEach(([, label]) => line(10, `<li>${label}</li>`));
		line(9, `</ol>`);
		line(8, `</div>`);
	}
	line(7, `</details>`);
	line(6, `</div>`);
	line(6, `<div class="wiz-nav wiz-nav--finish">`);
	const lastBefore = steps[steps.length - 2];
	if (w.includedStep && !w.includedWhen) btn(7, "back", lastBefore, "&larr; Back");
	else if (w.includedStep) {
		// Included only shows for some divisions: Back goes there for them, else to the last item step.
		btn(7, "back", "included", "&larr; Back", w.includedWhen);
		btn(7, "back", w.steps[w.steps.length - 1].key, "&larr; Back", w.includedWhen === "lower" ? "upper" : "lower");
	} else {
		btn(7, "back", lastBefore, "&larr; Back", "upper");
		btn(7, "back", w.steps[0].key, "&larr; Back", "lower");
	}
	// A form reset clears every radio back to its default (the intro step, nothing picked). The CMS allows no
	// JavaScript and the page sits inside DNN's one <form>, so this resets both pickers on the page.
	line(7, `<button class="wiz-btn wiz-btn--restart" type="reset">Start over</button>`);
	line(7, `<a class="wiz-btn wiz-btn--go" href="${REGISTER_URL}" rel="noopener">Go to registration &rarr;</a>`);
	line(6, `</div>`);
	line(5, `</section>`);
	line(4, `</div>`);
	line(4, `<!-- /.wiz-body -->`);
	line(3, `</div>`);
	line(3, `</div>`);
	return out.join("\n");
}

// ── Static styling (layout and look; no wiring) ────────────────────────────

// The picker's fixed look and layout lives in assets/css.css ("Uniform PICKER" section), moved there
// 2026-11-03 so the hub page carries only the generated wiring below.
const BASE_CSS = `
/* ── Generated by scripts/build-uniform-picker.js: edit the data there. Look and layout: assets/css.css ── */
`;

// ── Write ──────────────────────────────────────────────────────────────────

const html = [build(COACH), "", build(PLAYER)].join("\n");
const style = (BASE_CSS + "\n" + css.join("\n\n"))
	.split("\n")
	.map((l) => (l ? "\t\t\t" + l : l))
	.join("\n");

let hub = fs.readFileSync(HUB, "utf8");
// Match the real tag (own line), not mentions of it in the header comment.
hub = hub.replace(/^\t*<style>[\s\S]*?<\/style>/m, `\t\t<style>${style}\n\t\t</style>`);
const block = `<!-- picker:start (generated by scripts/build-uniform-picker.js; edit the data there) -->\n\t\t\t<div class="wizards-row">\n${html}\n\t\t\t</div>\n\t\t\t<!-- picker:end -->\n\t\t\t`;
if (hub.includes("<!-- picker:start")) {
	hub = hub.replace(/<!-- picker:start[\s\S]*?<!-- picker:end -->\n\t*/, block);
} else {
	// First run: replace the hand-built wizards up to the rev marker.
	hub = hub.replace(/<div class="wizards-row">[\s\S]*?(?=<p class="cms-rev">)/, block);
}
fs.writeFileSync(HUB, hub);
console.log(`Wrote ${path.relative(process.cwd(), HUB)} (${css.length} generated rules)`);
