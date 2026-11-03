# Fact check

Checks that the website pages in `CMS/` say the same thing as Sports Connect and the decisions we've made.

| File | What it is |
|---|---|
| `facts-2027.json` | The source of truth: every 2027 division (fee, league age, birth dates, cap, SC close date), key dates, sponsor prices, key links, and banned or stale wording |
| `check-facts.js` | Compares the pages against the facts. `node scripts/fact-check/check-facts.js [--md report.md] [--facts other.json]`. Exit 1 if there are errors |
| `CODEX-BRIEF.md` | The brief for Codex's review (the script plus the judgment checks a script can't do) |

## Refreshing the facts from Sports Connect

Division data comes from Sports Connect, read-only. Codex can read it itself through the read-only `ncll-browser` tools (see `AGENTS.md`); to refresh the facts file from Claude Code or by hand:

1. In the integrated browser, open any `registration-setup.bluesombrero.com/registration-admin/83437/...` page while logged in.
2. Run this in the page (it only reads):

```js
(async () => {
  const B = "https://registration-setup.bluesombrero.com/proxy/registration-setup/api/v1/";
  const g = async (p) => { const j = await (await fetch(B + p, { credentials: "include" })).json(); return j.data || j; };
  const out = {};
  for (const [sport, id] of [["baseball", 80158833], ["softball", 80158834]])
    out[sport] = (await g(`programs/${id}/divisions`)).filter((d) => !d.isArchived)
      .map((d) => ({ id: d.divisionId, name: d.divisionName, price: d.price, close: d.closeRegistration,
        bornFrom: d.maxAge, bornTo: d.minAge, cap: d.maxPlayers }));
  return out;
})()
```

3. Update the matching fields in `facts-2027.json` (`born.from` = SC `maxAge`, `born.to` = SC `minAge`, `cap` = `maxPlayers`, `scClose` = `closeRegistration`) and the `pulled` date. SC prices stay at the $5,000 test price until launch, so `fee` holds the real 2027 fee, not the SC price.

Decisions that live outside Sports Connect (register-by dates, sponsor prices, banned wording) are edited by hand in `facts-2027.json`.

## Uniform picker vs registration (run whenever sizes change)

Codex can run this through its read-only `ncll-browser` tools, or Claude Code from the logged-in browser. It compares every uniform question in both programs (player questions, and Head Coach / Assistant Coach / Team Manager custom questions) with the option lists the Uniforms Hub picker shows ("Every option in each registration question"):

1. Pull the picker's lists from `CMS/Resources/uniforms-hub.html` (each `div.q-ref` holds the question text and its `<li>` options, in order).
2. In a `registration-setup.bluesombrero.com` tab, GET `programQuestions/<programId>` and `programs/<programId>/volunteers/<volunteerTypeId>/customQuestions` (volunteer types: Head Coach 80038935, Assistant 80038936, Team Manager 80038937), keep the questions whose name contains "size do you want to order", and sort each one's `answerOptions` by `sortOrder`.
3. Every SC option must read `N: <label>` with N = its position and `<label>` = the picker's option at that position, and the counts must match.

Last run 2026-11-03 (after the coach-shirt XS sizes were added): 22 of 22 questions match.

## Scope

- Division tables are checked on every page except other programs' pages (`skipDivisionTablesIn`: All-Stars, Summerball, Winterball, Sandlot), which have their own divisions.
- Wording checks run on every page.
- Prose (cards, paragraphs, FAQs) can't be checked reliably by a script; that's the reviewer's job in `CODEX-BRIEF.md`.
