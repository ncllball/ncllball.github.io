# Case Study: AI-Powered League Communications
## "2026 NCLL Home Run Derby — Post-Event Content Package"

**Service concept:** Sideline  
**Date:** May 28, 2026  
**League:** North Central Little League, Seattle WA  
**Author:** John Shikella, Registrar & League Webmaster

---

## The Ask

The 2026 NCLL Home Run Derby wrapped up on a Wednesday evening at Lower Woodland Park. By the next morning, the league registrar had one goal: turn a folder of raw event photos into polished, published post-event content — fast, and without pulling in a designer, a copywriter, or a web developer.

The deliverables:

- **A rotator banner** (1110×510px) for the ncllball.com homepage carousel — the first thing families, coaches, and sponsors see when they visit the site
- **A full recap article** updating the league's HRD page — players recognized by name, winners called out, and a historic moment documented

The source material: 18 raw photos on a shared network drive, player names scattered across a Google Chat space, and a 2,000-row registration Excel file.

Total time from "let's do this" to published content: **one session.**

---

## Step 1 — Confirming the Story

Before writing a word, the AI pulled the facts together.

**Player name verification** — A common league problem: nicknames in photos, legal names in registration. The AI parsed the 2026 registration xlsx directly, cross-referencing every contestant name against the authoritative source. It found one real discrepancy: "Kia Johnston" in the chat log was actually **Kai Johnston** in registration. The rest were nicknames (Will for William, Izzi for Isabel) — flagged and resolved in conversation.

**L→R photo order** — The Google Chat "Home Run Derby Contest" space had the lineup. The AI retrieved it via MCP, matched names to positions, and produced the caption-ready player lists for both baseball and softball.

**The angle** — Beyond the group shots and winner call-outs, the AI surfaced the storyline worth telling: for the first time in NCLL Home Run Derby history, a mother pitched for her son in the baseball competition. Emma York-Jones pitched for Elliot York-Jones. That became its own section.

---

## Step 2 — The Recap Article

The existing HRD page was pre-event boilerplate. The AI rewrote it entirely as a post-event recap:

- Intro paragraph with tone and setting
- **Softball section** — group photo, winner (Izzi Parsons), player list L→R, acknowledgment of Nora Dodgion's 3-year championship run
- **Baseball section** — group photo, winner (Luke Jacobsen), full 12-player lineup with row positions
- **A Historic First** — mother/son photo, the Emma York-Jones story
- **Champions** — the side-by-side winner photo
- Social media follow links

HTML written to match the league's existing conventions: stylesheet links, `<figure>` patterns, `<span>` emphasis, relative image paths. No manual coding required.

---

## Step 3 — The Rotator Banner (And Three Pivots)

This is where the session got interesting.

**Attempt 1 — Canva MCP**  
The plan was to use Canva's API (via MCP) to generate a professional rotator with the actual event photos. The AI connected to the Canva MCP, uploaded the photos, and generated four design candidates for each of baseball and softball. The designs looked promising. Then: `export-design` returned *"Not allowed to access design."* Newly AI-generated Canva designs can't be exported programmatically — only designs already in the account work. Dead end via automation.

**Attempt 2 — GitHub Pages + Canva Upload**  
The photos needed to be publicly accessible for Canva's asset uploader. The registrar had just committed and pushed the photo files. But GitHub Pages was still building — the upload returned 404. The AI detected the build-in-progress state, waited, retried when the registrar confirmed the build finished. Both photos uploaded successfully (baseball: `MAHLAFKHvdU`, softball: `MAHLANYMfo4`). But the export wall remained.

**Attempt 3 — Python / Pillow (the pivot that worked)**  
Rather than burning more time on Canva's export limitations, the AI wrote a Python script using Pillow to generate the rotators programmatically:

- Cover-crop each source photo to exactly 1110×510
- Apply a dark gradient overlay on the bottom 55% (adjustable curve)
- Render layered text: title (Arial Black 52pt), sport subtitle in NCLL red (34pt), winner line (30pt bold), callout (21pt gray)
- Drop shadow on the title for contrast

Output: two pixel-perfect rotators at the exact CMS dimensions, generated locally in seconds. The registrar then took those as reference, built the final version in Canva himself with the actual photo, and used the AI-written blurb:

> *"Congratulations to our 2026 Home Run Derby champions — Luke Jacobsen (Baseball) and Izzi Parsons (Softball)! Plus, history was made at the plate. Click through for the full recap!"*

**The final rotator** used a full-width photo spanning both groups — a creative choice the registrar made in Canva — paired with a Breaking News visual treatment and the blurb as a caption overlay.

---

## Step 4 — Supporting Assets

Two additional assets came out of the session:

**Half-panel crops (555×510)**  
The registrar wanted the girls' and boys' group photos as separate files to arrange in Canva. The AI generated both, then noticed a perspective problem: the softball photo was shot close-up (tight frame), the baseball photo was shot from farther away (kids appear smaller). It applied a 1.5× zoom multiplier and adjusted the vertical crop bias on the baseball photo so both panels looked proportionate side-by-side.

**Winner cutout — background removed**  
From a two-person photo of the baseball winner standing on the field, the AI isolated just the winner (Luke Jacobsen) with AI-powered background removal (`rembg`), trimmed transparent whitespace, and scaled the result to rotator height (510px). Three crop iterations to dial in the bounding box before the final clean cutout landed. Result: a transparent-background PNG ready to drop into any design.

---

## What This Looked Like From the League's Side

The registrar opened a chat window. He described what he wanted. He answered a handful of clarifying questions (is Kai or Kia correct? which photo for the winners shot?). He approved the player lists, the article draft, the blurb. He picked up Canva when he wanted creative control. He made one final design call.

Everything else — data verification, photo processing, article writing, script generation, image cropping, background removal, asset sizing — happened in the session.

No Photoshop. No InDesign. No web developer. No copywriter on retainer.

---

## The Opportunity

Every recreational sports league in the country runs on volunteer labor. The board president is an accountant. The registrar is a nurse. The communications director is whoever said yes last spring. Nobody has time to learn photo editing, nobody has budget for a creative agency, and the league's digital presence shows it.

The gap is real:
- **Leagues want to celebrate their players** — they just can't produce the content
- **CMS platforms exist** — but they need someone to feed them
- **The knowledge is there** — rosters, schedules, photos, stories — it's just scattered

What Sideline does is be the layer between the data and the published page. A league communicates what happened. Sideline handles everything from that sentence to a published rotator, article, and social caption — across baseball, softball, basketball, soccer, swim, whatever the league runs.

Powered by AI. Managed by someone who knows their community. That person doesn't need to be a developer. They just need to know their league.

---

## Deliverables from This Session

| Asset | File | Status |
|---|---|---|
| Recap article | `Season/2026/2026 home run derby.html` | ✅ Published |
| Homepage rotator | `images/rotators/2026-hrd-rotator.png` | ✅ Ready for CMS |
| Baseball half-panel | `images/rotators/2026-hrd-bb-half.png` | ✅ 555×510 |
| Softball half-panel | `images/rotators/2026-hrd-sb-half.png` | ✅ 555×510 |
| Winner cutout (Luke) | `images/rotators/2026-hrd-winner-bb-cutout.png` | ✅ Transparent PNG, 510px tall |
| Python rotator script | `_temp/make_hrd_rotators.py` | ✅ Reusable |
| Background removal script | `_temp/cutout_hrd_kid.py` | ✅ Reusable |

---

*This document was produced as a capability demonstration for Sideline — AI-powered communications for recreational sports leagues.*
