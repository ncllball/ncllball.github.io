# Notes for Codex

This repo is the North Central Little League website (ncllball.com, Sports Connect / DNN). `CLAUDE.md` has the repo rules (what `CMS/` is, the stylesheet, hub URLs); follow it too. For fact checks, start with `scripts/fact-check/CODEX-BRIEF.md`.

## Sports Connect and the ncllball.com CMS: read only

You have the `ncll-browser` MCP server: a view of the VS Code integrated browser, which is logged in to Sports Connect (registration admin) and the ncllball.com CMS **as an administrator**. It is **read only on purpose**. Your config enables only the viewing tools (open/close your own tab, navigate, URL, snapshot, markdown, DOM, screenshot); there is no click, type, key press or JavaScript. Keep it that way:

- **Never ask for, enable or work around** the click / type / eval tools, and never use another route (curl, scripts, cookies) to reach these sites as the logged-in user.
- **Open your own tab** (`browser_tab_open`) and close it when done. Don't navigate tabs you didn't open; John or Claude may be working in them.
- **Navigating is a GET.** Only go to addresses that just show something. Never navigate to an address containing `logout`, `logoff`, `delete`, `remove`, `cancel`, `refund`, `void`, `archive`, `send`, `resend`, `publish`, `copy`, `clone`, `ctl=Delete` or `Bulk`, or any `__doPostBack` / `javascript:` link.

### Buttons to stay away from (you can't press them; don't ask anyone to press them for you)

Sports Connect registration admin (`registration-setup.bluesombrero.com/registration-admin/83437/...`):
- **Save** on any tab, the row check mark (done / save icons), **Add Question**, the **trash** icons (they delete questions and every answer families gave; in June 2026 one bad save wiped 49 players' answers), drag handles, **Bulk Edit**, **Copy / Copy +1 Year**, **Archive**, **Publish**, **Open/Close registration** dates.
- Division price, cap, waitlist and date fields: registration is live for board testing at a $5,000 test price.

Sports Connect classic admin (`www.ncllball.com/Default.aspx?tabid=...` menus Registration, Orders, Teams, Email, Text):
- **Email / Text: Send, Resend, Schedule** (they go to every family), **Orders: Refund, Cancel, Void, Edit**, **Teams: Add, Allocate, Submit Teams, roster actions**.

ncllball.com CMS (pages with `ctl=Edit`, the Page Editor bar):
- **Save, Delete Page, Page Settings, Website Manager**, any RadEditor change. Publishing pages is done by Claude with John watching, from the files in `CMS/`.

### Safe and useful

- Sports Connect read-only JSON: navigate to `https://registration-setup.bluesombrero.com/proxy/registration-setup/api/v1/<path>` and read it with `browser_markdown` or `browser_dom`. Useful GETs: `programs/<programId>/divisions`, `programQuestions/<programId>`, `programEmails/<programId>`, `programs/<programId>/volunteers/<volunteerTypeId>/customQuestions`. 2027 programs: baseball `80158833`, softball `80158834`. Volunteer types: Head Coach `80038935`, Assistant Coach `80038936`, Team Manager `80038937`.
- Public pages: `https://www.ncllball.com/Default.aspx?tabid=<id>` (check the live `[rN · date · tabid]` marker against the file in `CMS/`).
- If something looks wrong, **report it**; don't fix it in Sports Connect or the CMS.
