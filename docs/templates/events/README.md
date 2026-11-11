# Event ticket cards (Events Hub): the full version

The Events Hub ([CMS/Resources/events-hub.html](../../../CMS/Resources/events-hub.html), tabid 2244434) runs in two modes:

- **Off-season (now, r9):** one simple card per event: blurb, one team logo, "2027: dates coming soon" with last year's date and price, and one button.
- **In season:** the full card below, once a date, a ticket link and a price are set. [events-hub-2026-ticket-cards.html](events-hub-2026-ticket-cards.html) is the live 2026 page (r8), kept as the working example. Copy a card from it, then change the dates, links and prices.

## Layout of a full card

Two panels: the intro (what, when, where) and **Details** (tickets and how to buy), ending on the buy button.

**Intro panel**

1. **Blurb line:** `<p class="ncll-card__blurb events-ticket__blurb">UW Baseball @ Husky Baseball Stadium</p>`. For Mariners days, add a second line such as `<p class="subtle events-ticket__blurb">Official NCLL day.</p>`.
2. **Logo vs. logo row:** both team logos with the "vs" mark between them:

   ```html
   <div class="ncll-card__graphics ncll-card__graphics--logos">
   	<img class="ncll-card__graphic ncll-card__graphic--smallest" src="https://ncllball.github.io/images/logos/washington-huskies.svg" alt="Washington Huskies logo" />
   	<img class="events-logos__vs" src="https://ncllball.github.io/images/versus.svg" alt="vs" />
   	<img class="ncll-card__graphic ncll-card__graphic--smallest" src="https://ncllball.github.io/images/logos/northwestern-wildcats.svg" alt="Northwestern Wildcats logo" />
   </div>
   ```

   Logos live in `images/logos/` (on hand: washington-huskies.svg, seattle-mariners.png, maryland-terps.svg, northwestern-wildcats.svg, kansas-city-royals.svg, arizona-diamondbacks.svg). Add the 2027 opponents' logos there, as SVG where possible.
3. **Facts list** (`ul.ncll-card__meta`), each label in `<span class="ncll-italic-accent">Date:</span>`:
   - **Date**, followed by the Add to Calendar menu (below)
   - **Time**
   - **Opponent**
   - **Location**: full address plus a Map link

**Details panel** (`h4.left` "Details")

- Tickets: the price
- Purchase: "link below"
- About: seating together, how much of each ticket comes back to NCLL
- Then the buy button: `<div class="ncll-card__cta"><a class="button button--primary" href="(GoFevo or Mariners link)" target="_blank" rel="noopener">Buy UW Baseball Tickets</a></div>`
- Then the contact line, a text link: "Questions? Email Akiko." Akiko Yabuki runs the Mariners and UW days.

Follow the house rules: pictures go between text, the card ends on its button, and each panel is 500px or less at 390px wide.

## Add to Calendar menu

Inline after the date. The CSS is `.cal-dropdown`, `.cal-trigger`, `.cal-menu` in `assets/css.css`, scoped to `.events-landing` and `.coaches-landing`.

```html
<span class="cal-dropdown">
	<span class="cal-trigger icon-only" tabindex="0" role="button" aria-haspopup="menu" aria-label="Add this event to your calendar"></span>
	<span class="cal-menu" role="menu" aria-label="Calendar services">
		<a class="ncll" role="menuitem" data-cal="google" ...>Google Calendar</a>
		<!-- outlook, m365, teams, yahoo, apple, ics -->
	</span>
</span>
```

The seven links per event: Google Calendar, Outlook.com, Microsoft 365, Teams, Yahoo, Apple Calendar and Download .ics. Copy them from the template and change:

- **Times:** Google and Yahoo use UTC (`20260329T200500Z`; Pacific daylight time is UTC−7). Outlook, M365 and Teams use local time with an offset (`2026-03-29T13:05:00-07:00`). Make the end time 3 hours after the start.
- **Title, details and location,** URL-encoded.
- **Apple and .ics** both point at the event's `.ics` file.

**.ics files:** one per event in the repo's `ics/` folder, named `<event>-YYYY-MM-DD.ics`. Samples are in this folder: copy one and change UID, SUMMARY, DESCRIPTION, DTSTART, DTEND and LOCATION. **Use full links, not relative ones:** `href="https://ncllball.github.io/ics/uw-baseball-ncll-day-2027-03-28.ics"`. The 2026 cards used `../ics/...`, which from an ncllball.com page points at ncllball.com, where the files don't exist.

Add the new `.ics` files and the cards in the same commit. When the season ends, remove both together, so no button points at a missing file.

## Switching back to full cards

1. Get the 2027 dates, times, opponents, ticket links and prices from Akiko (Mariners: the board approves the dates first).
2. For each event, copy the matching card from the template into `CMS/Resources/events-hub.html` and update it.
3. Add the `.ics` files. Fix the page title and description (2027).
4. Check the panel fit, then publish with the usual CMS steps (tabid 2244434, mid 2338077).
