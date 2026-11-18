# Update a page on ncllball.com (no AI needed)

For whoever keeps the website current: a fact changed (a date, a fee, a contact) and a page needs to say so. Plan on about 15 minutes. You need a GitHub login with access to `ncllball/ncllball.github.io` and a Sports Connect admin login for ncllball.com.

## 1. Find the page's file

Every ncllball.com page has one file in the `CMS/` folder of this repo, filed the way the site menu is (e.g. Resources › Coaches Hub is `CMS/Resources/coaches-hub.html`). Not sure which file? Open the page on ncllball.com and note the `tabid=` number in the address bar, then search the repo for it (on github.com, type `tabid=2111982` in the search box). The top of each file says:

```
CMS: tabid=2111982 | mid=2340162
```

Write down both numbers. You need them in step 4.

## 2. Make the change

On github.com, open the file and click the pencil (Edit).

- Change only the words that need changing. Leave the tags (`<li>`, `<strong>`, `class="…"`) alone.
- Near the bottom is a revision marker like `[r30 · 2026-11-11 · 2111982]`. Add one to the number and put today's date: `[r31 · 2026-11-17 · 2111982]`. That's how you'll know the live page has your version.
- Never add a `<style>` block or a `style="…"` with odd characters; ncllball.com's firewall rejects the save.

Click **Commit changes**, with a one-line note on what changed and who asked for it (e.g. "Coaches Hub r31: photo day dates TBA (Jason, Nov 17)").

## 3. Let the fact check look at it

Within a minute, GitHub runs the fact check on your commit (Actions tab, "Fact check"). A green check means the page doesn't contradict `scripts/fact-check/facts-2027.json`. A red X means it does: open the run to see which line, fix it, and commit again. If the fact itself changed (a new fee, a new date), update `facts-2027.json` first, with who decided it and when.

## 4. Paste it into ncllball.com

1. Sign in to ncllball.com as an admin.
2. Go to `https://www.ncllball.com/Default.aspx?tabid=TABID&ctl=Edit&mid=MID`, using the two numbers from step 1.
3. In the editor, switch to **HTML** view (the tab at the bottom of the editor), select everything and delete it.
4. On github.com, open the file, click **Raw**, select all, copy, and paste it into the HTML view.
5. Click **Preview** first. If it shows the page, click **Save**. If you get an error page instead, don't save; the firewall didn't like something you added.

## 5. Check the live page

Open the page in a private window (so you aren't signed in) and scroll to the bottom: the revision marker should show your new number. Check the line you changed.

Still showing the old version after a few minutes? Open the edit page again and click Save once more without changing anything. That clears ncllball.com's cache.

## What not to change this way

- **The stylesheet** (`assets/css.css`): it's deployed separately to Cloudflare. See CLAUDE.md, "Stylesheet".
- **Files outside `CMS/`**, especially `QR/` (printed QR codes point there).
- **Division rules pages:** edit the rules in the Outline wiki first (Programs › Division Rules), then the page.
