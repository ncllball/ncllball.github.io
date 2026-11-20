# Fact check

Checks that the website pages in `CMS/` and Sports Connect say the same thing as the decisions we've made.

## Which way the facts flow

`facts-2027.json` is the master for NCLL's decisions. Everything else copies it:

**Little League → `facts-2027.json` → Sports Connect, the website, Ask NCLL**

- **Above the file:** league ages and birth-date ranges come from Little League International's age chart; division rules come from the rulebook and District 8. The file follows those. Don't "correct" them to match Sports Connect.
- **The file:** the board's decisions (fees, caps, which divisions exist, registration close dates, sponsor prices, key links, banned wording). A change starts here, after the board decides it.
- **Below the file:** Sports Connect's registration setup, the website pages and Ask NCLL. When one of them differs from the file, fix it to match. Never copy Sports Connect into the file.
- **Dates** follow the wiki page *2027 Season Dates* (the one source of truth for dates). The dates in this file are copies of it; when the wiki page changes, update them here.
- **Board and volunteers** (who holds each role) follow the wiki page *Current Board of Directors & Key Volunteers*, not this file.

Sports Connect is what families pay through, so check it often: a difference there is urgent whichever side is wrong. The fix is either "change Sports Connect" or "the board changed its mind: update the file first, then Sports Connect". It's never an automatic copy in either direction.

| File | What it is |
|---|---|
| `facts-2027.json` | The master: every 2027 division (fee, league age, birth dates, cap, SC close date), key dates (copied from the wiki's 2027 Season Dates), sponsor prices, key links, and banned or stale wording |
| `check-facts.js` | Compares the pages against the facts. `node scripts/fact-check/check-facts.js [--md report.md] [--facts other.json]`. Exit 1 if there are errors |
| `CODEX-BRIEF.md` | The brief for Codex's review (the script plus the judgment checks a script can't do) |

## Checking Sports Connect against the facts

Read Sports Connect (read-only) and compare it with the file. List the differences for John; don't edit the file to match. Codex can read it itself through the read-only `ncll-browser` tools (see `AGENTS.md`); from Claude Code or by hand:

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

3. Compare the matching fields with `facts-2027.json` (`born.from` ↔ SC `maxAge`, `born.to` ↔ SC `minAge`, `cap` ↔ `maxPlayers`, `scClose` ↔ `closeRegistration`, `fee` ↔ `price`) and list every difference, with which side looks wrong. Record the check date in `pulled`. Change Sports Connect (or the file, after a board decision) only once John says which.

Every field in `facts-2027.json` is edited by hand, and only for a decision: a board decision, a Little League/District 8 rule, or a date already on the wiki's 2027 Season Dates.

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
