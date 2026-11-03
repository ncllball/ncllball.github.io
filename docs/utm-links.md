# Tagged links (UTMs) for anything NCLL shares

Google Analytics (GA4 `G-RWR33H14KS`) can only tell which email, post or flyer brought a family to the site if the link carries tags. Without them, most of that traffic shows up as "direct".

## The rule

Add tags to every link that goes **out**: emails, Sports Connect newsletters, social posts, QR codes, flyers, GameChanger and Google Chat messages, partner sites.
**Never** tag links between pages on ncllball.com or from ncllball.github.io to ncllball.com: that restarts the visit and breaks the reports.

All lowercase, words joined with hyphens.

| Tag | What it says | Use one of |
|---|---|---|
| `utm_source` | where the link lives | `email`, `newsletter` (Sports Connect blast), `instagram`, `facebook`, `qr`, `flyer`, `gamechanger`, `google-chat`, or the partner's name (e.g. `bf-day`) |
| `utm_medium` | what kind of channel | `email`, `social`, `print`, `chat`, `referral` |
| `utm_campaign` | the push it belongs to | `<year>-<topic>`: `2027-registration`, `2026-holiday-store`, `2027-allstars`, `2027-hrd` |
| `utm_content` (optional) | which link, if one message has several | `button`, `header-link`, `poster-a`, `poster-b` |

Format: `<page URL>&utm_source=…&utm_medium=…&utm_campaign=…` (ncllball.com URLs already have `?tabid=`, so the tags start with `&`).

## Ready to use: 2027 registration

Registration page: `https://www.ncllball.com/Default.aspx?tabid=2244720`

| Where | Link |
|---|---|
| Registration email (Gmail) | `https://www.ncllball.com/Default.aspx?tabid=2244720&utm_source=email&utm_medium=email&utm_campaign=2027-registration` |
| Sports Connect newsletter | `https://www.ncllball.com/Default.aspx?tabid=2244720&utm_source=newsletter&utm_medium=email&utm_campaign=2027-registration` |
| Instagram (bio link / story) | `https://www.ncllball.com/Default.aspx?tabid=2244720&utm_source=instagram&utm_medium=social&utm_campaign=2027-registration` |
| Facebook post | `https://www.ncllball.com/Default.aspx?tabid=2244720&utm_source=facebook&utm_medium=social&utm_campaign=2027-registration` |
| QR code on flyers/posters | `https://www.ncllball.com/Default.aspx?tabid=2244720&utm_source=qr&utm_medium=print&utm_campaign=2027-registration` |
| GameChanger message | `https://www.ncllball.com/Default.aspx?tabid=2244720&utm_source=gamechanger&utm_medium=chat&utm_campaign=2027-registration` |
| Text message (SMS) | `https://www.ncllball.com/Default.aspx?tabid=2244720&utm_source=sms&utm_medium=text&utm_campaign=2027-registration` |

Reminder emails later: same as the email link plus `&utm_content=reminder-1`, `reminder-2`, … so each send shows separately in GA. The campaign stays `2027-registration` everywhere (Tower's T-16 links used `registration-2027`; GA would count that as a different campaign, so don't use it).

GA only sees visitors who click "Accept All Cookies" on the OneTrust banner, so it undercounts. "Register" leaves for login.stacksports.com, which GA doesn't cover: count actual registrations in Sports Connect reports.

Already-printed QR codes can't change; tag the next print run.

## Reading the results

GA4 › Reports › Acquisition › Traffic acquisition, set the dimension to **Session campaign** (or Session source / medium). The `registration_start` key event (a view of the Register page, tabid 1932702) shows how many of those visitors went on to start registering.

Keep in mind ncllball.com only counts visitors who accept the cookie banner, so treat the numbers as a comparison between channels, not a head count.
