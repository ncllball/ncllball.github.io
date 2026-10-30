# Scripts

The tools still in use for ncllball.com. Run from the repo root. Cleaned up 2026-10-29: the 2025 one-off normalizers, migration helpers and registration-CSV tools were retired (they're in git history).

| Script | What it does |
| --- | --- |
| `dnn-radeditor-sync.js` | Publishes a `CMS/` page to its ncllball.com module (`node --env-file=.env scripts\dnn-radeditor-sync.js <file> [--save]`; the cms-sync skill). |
| `dnn-radeditor-pull.js`, `dnn-radeditor-pull-batch.js` | Pull a page's (or many pages') current HTML down from the CMS. |
| `ncll-news-admin.js` | Adds a "Comings and Goings" news item (the `/news-add` command). |
| `hrd-sync.js` | Home Run Derby page sync. |
| `deploy-css.ps1` | Deploys `assets/css.css` to Cloudflare Pages (`assets.ncllball.com`) and waits until it's live. |
| `format-css.js` | Formats `assets/css.css`. |
| `rotators/` | Builds homepage rotator slides (see `rotators/README.md`). |

## data/

Reference lists for cleaning the "school" answers in registration exports (public school names and addresses only, no family data):

- `school-names.all.csv`: the 34 canonical school names.
- `school-names.variants.csv`: 112 spellings families have used, each mapped to its canonical name.
- `school-addresses.csv`: street addresses for 31 of them.

Registration exports themselves never go in this repo; work on them in a local folder outside it.
