# Fact check

Checks that the website pages in `CMS/` say the same thing as Sports Connect and the decisions we've made.

| File | What it is |
|---|---|
| `facts-2027.json` | The source of truth: every 2027 division (fee, league age, birth dates, cap, SC close date), key dates, sponsor prices, key links, and banned or stale wording |
| `check-facts.js` | Compares the pages against the facts. `node scripts/fact-check/check-facts.js [--md report.md] [--facts other.json]`. Exit 1 if there are errors |
| `CODEX-BRIEF.md` | The brief for Codex's review (the script plus the judgment checks a script can't do) |

## Refreshing the facts from Sports Connect

Division data comes from Sports Connect, read-only. Codex can't log in there, so refresh it from Claude Code (or by hand) before a check:

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

## Scope

- Division tables are checked on every page except other programs' pages (`skipDivisionTablesIn`: All-Stars, Summerball, Winterball, Sandlot), which have their own divisions.
- Wording checks run on every page.
- Prose (cards, paragraphs, FAQs) can't be checked reliably by a script; that's the reviewer's job in `CODEX-BRIEF.md`.
