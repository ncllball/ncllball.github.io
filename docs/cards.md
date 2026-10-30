# NCLL cards (`ncll-card`)

How the cards on ncllball.com are built. Every hub (baseball, softball, coaches, parents, volunteer, helping, events, safety, umpires, registration, player development, All-Stars), the assessments and Summerball pages, and the sponsors page use them. Styles live in `assets/css.css` (search `.ncll-card`); deploy with `scripts/deploy-css.ps1`. Rewritten 2026-10-29 from what the live pages actually use.

The quickest way to build a new card is to copy a working one from the same page and change it. The newest examples are the Intermediate card in `CMS/Programs/baseball-hub.html` and the Seniors card in `CMS/Programs/softball-hub.html`.

## Two kinds of card

| Kind | Root classes | Used for |
| --- | --- | --- |
| **Plain** | `ncll-card` (+ optional modifier) | One panel of content: sponsors, simple info cards |
| **Toggle** | `ncll-card ncll-card--overlay ncll-card--toggle` (+ modifier) | Several panels with Back / Next / Start Over buttons: division cards, volunteer roles, player development |

Modifiers in use: `ncll-card--division` (baseball/softball divisions), `ncll-card--volunteer` (volunteer roles), `ncll-card--pd-landing` (player development).

Cards sit inside `<div class="program-grid">`, which lays them out in columns.

## Plain card

```html
<article class="ncll-card" aria-labelledby="sp-bongos-title">
	<div class="ncll-card__body">
		<div class="ncll-card__details">
			<img class="ncll-card__graphic" src="https://ncllball.github.io/images/..." alt="..." />
			<h3 class="ncll-card__title" id="sp-bongos-title">Bongos</h3>
			<p class="ncll-card__blurb">One or two sentences.</p>
		</div>
	</div>
</article>
```

## Toggle card (division card)

The panels switch with hidden radio buttons. No JavaScript, so it works inside the CMS.

```html
<article id="uniforms-baseball-intermediate-toggle" class="ncll-card ncll-card--division ncll-card--overlay ncll-card--toggle" aria-labelledby="uniforms-baseball-intermediate-h3">
	<!-- 1. One radio per panel, all the same name. IDs end in -intro, -0, -1, -2 ... -->
	<input type="radio" name="uniforms-baseball-intermediate" id="uniforms-baseball-intermediate-intro" checked />
	<input type="radio" name="uniforms-baseball-intermediate" id="uniforms-baseball-intermediate-0" />
	<input type="radio" name="uniforms-baseball-intermediate" id="uniforms-baseball-intermediate-1" />

	<!-- 2. Sticky heading: sport icon, title, rules book (division cards), sport icon -->
	<div class="ncll-card__sticky-heading" aria-hidden="true">
		<div class="ncll-card__heading-title">
			<img class="ncll-card__sport-icon" src="https://ncllball.github.io/images/site_navigation/baseball.png" alt="Baseball icon" />
			<h3 class="ncll-card__title" id="uniforms-baseball-intermediate-h3"><span class="text-background">Intermediate (50/70)</span></h3>
			<a class="rules-icon-btn rules-icon-btn--plain" href="https://www.ncllball.com/Default.aspx?tabid=..." target="_blank" rel="noopener" aria-label="Intermediate (50/70) rules of play" title="Rules of Play"><img src="https://ncllball.github.io/images/rules/rules-book-plain-baseball-intermediate.png" alt="" /></a>
			<img class="ncll-card__sport-icon" src="https://ncllball.github.io/images/site_navigation/baseball.png" alt="Baseball icon" />
		</div>
	</div>

	<!-- 3. Intro panel: blurb, picture, key facts -->
	<div class="ncll-card__body panel panel-intro">
		<div class="ncll-card__details">
			<p class="ncll-card__blurb">One sentence about the division.</p>
			<div class="ncll-card__graphics">
				<img class="ncll-card__graphic ncll-card__graphic--small" src="https://ncllball.github.io/images/bb_cards/int.png" alt="..." />
			</div>
			<ul class="ncll-card__meta">
				<li><strong>League ages:</strong> 11-13</li>
				<li><strong>Schedule:</strong> ...</li>
			</ul>
		</div>
	</div>

	<!-- 4. Numbered panels: panel0, panel1 ... -->
	<div class="ncll-card__body panel panel0">
		<div class="ncll-card__details">
			<h4 class="left">Panel heading</h4>
			<p>...</p>
		</div>
	</div>
	<div class="ncll-card__body panel panel1">
		<div class="ncll-card__details">
			<h4 class="left">Last panel</h4>
			<p>...</p>
			<div class="ncll-card__cta">
				<a class="button button--primary" href="https://www.ncllball.com/Default.aspx?tabid=2112172">Register</a>
			</div>
		</div>
	</div>

	<!-- 5. Footer buttons: a Back and a Next label per panel; CSS shows only the pair for the open panel -->
	<div class="ncll-card__sticky-footer">
		<div class="actions" role="group" aria-label="Intermediate (50/70) card controls (footer)">
			<label class="button button--secondary btn-prev btn-prev-start" for="uniforms-baseball-intermediate-1">Back</label>
			<label class="button button--primary btn-next btn-next-intro" for="uniforms-baseball-intermediate-0">Next</label>
			<label class="button button--secondary btn-prev btn-prev-0" for="uniforms-baseball-intermediate-intro">Back</label>
			<label class="button button--primary btn-next btn-next-0" for="uniforms-baseball-intermediate-1">Next</label>
			<label class="button button--secondary btn-prev btn-prev-1" for="uniforms-baseball-intermediate-0">Back</label>
			<label class="button button--primary btn-next btn-next-1" for="uniforms-baseball-intermediate-intro">Start Over</label>
		</div>
	</div>
</article>
```

### Wiring rules for toggle cards

- **Radio IDs must end in `-intro`, `-0`, `-1` …** The CSS matches on the ending (`[id$="-0"]`), so the prefix can be anything unique on the page.
- **Panel classes match the radio:** `-intro` → `panel-intro`, `-0` → `panel0`, `-1` → `panel1`.
- **Up to 14 numbered panels** (`panel0`–`panel13`). Past that, the CSS needs new lines.
- **Buttons per panel:** `btn-next-N` goes to the next panel; `btn-prev-N` goes back one. On the intro, `btn-prev-start` goes to the **last** panel. On the last panel, `btn-next-N` says "Start Over" and points at `-intro`.
- **Radios first.** The radios have to come before the panels and the footer inside the `<article>`, because the CSS uses the `~` (later sibling) selector.
- **Add or remove a panel:** add or remove its radio, its `panelN` div and its two footer labels, then re-point the last panel's "Start Over" and the intro's `btn-prev-start`.

## Parts

| Class | What it is |
| --- | --- |
| `ncll-card__body` | One panel (plain cards have one; toggle cards add `panel panel-intro` / `panel panelN`) |
| `ncll-card__details` | Inner wrapper for a panel's content |
| `ncll-card__sticky-heading` › `ncll-card__heading-title` | Toggle card header that stays put while panels change |
| `ncll-card__title` | The card's `h3` (wrap text in `span.text-background` on toggle cards) |
| `ncll-card__sport-icon` | Baseball/softball icon on each side of the title |
| `rules-icon-btn rules-icon-btn--plain` | Rules book in a division card's header; opens that division's rules page in a new tab |
| `ncll-card__blurb` (`--sm` smaller) | Short intro paragraph |
| `ncll-card__meta` | Key-facts list (`<li><strong>Label:</strong> value</li>`); `ncll-card__meta-note` for a small note under it |
| `ncll-card__graphics` › `ncll-card__graphic` | Picture area. To make images open large, add `lightbox-scope` plus the lightbox markup (copy it from `CMS/Programs/all-stars/allstars-history.html`). `ncll-card__graphics--logos` for a row of logos |
| `ncll-card__graphic--smallest/small/medium/large` | Image width 50 / 80 / 95 / 110 px (more sizes and one-offs like `--glove`, `--bat` exist; check the CSS) |
| `ncll-card__caption` | Caption under a picture |
| `ncll-card__note` | Small print at the bottom of a panel |
| `ncll-card__cta` | Button row (Register, Sign up) |
| `ncll-card__sticky-footer` › `.actions` | Toggle card Back / Next buttons |

## Conventions

- `class` is the first attribute on every element, and the `<article>` has `aria-labelledby` pointing at the title's `id`.
- Image URLs are absolute (`https://ncllball.github.io/images/...`).
- Card text follows the site voice: short sentences, facts in the meta list, one idea per panel.
- Division cards: the rules book goes between the title and the second sport icon, and every division has its own rules-book image in `images/rules/`.
- Don't put a `<style>` block in a page to restyle one card. Add a modifier in `assets/css.css` and deploy.

## Leftovers

`ncll-card__clipboard` (`--float`, `--pinned`, `-img`) was the original opt-in clipboard icon from the 2025 rollout. Only `CMS/Get-Involved/join-our-friends-lists.html` still uses it; don't use it on new cards.
