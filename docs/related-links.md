# Related links boxes

Every page that has a "Related links" box uses the same markup, the same group names and the same label for each destination. Set 2026-11-02, when all 23 boxes were brought into line.

## Markup

Copy this exactly. The inline styles are deliberate: they are on all 23 boxes, and a `<style>` block would trip the CMS WAF.

```html
<aside
	class="hub-intro__aside hub-intro__aside--accent related-links related-links--grouped"
	style="padding: 0; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; box-shadow: none"
	aria-label="Related links"
>
	<h4 class="hub-aside__title">Related links</h4>
	<div style="padding: 4px 10px 14px">
		<div class="related-links__group">
			<span class="related-links__group-title">Pages</span>
			<ul class="hub-aside__list related-links">
				<li><a class="ncll" href="https://www.ncllball.com/Default.aspx?tabid=2111982" rel="noopener">Coaches Hub</a></li>
			</ul>
		</div>
	</div>
</aside>
```

- Use absolute `https://www.ncllball.com/Default.aspx?tabid=…` links.
- Don't link a page to itself.
- The "open in new" icon only shows on links with `target="_blank"`, so add that only when the link really opens a new tab, such as a PDF or an outside site.

## Groups

Use only these, in this order, and leave out any that would be empty:

| Group | What goes in it |
|---|---|
| **Pages** | Other NCLL pages |
| **Sign-ups** | Things you sign up for: registration, volunteer sign-ups, assessment sign-ups |
| **Downloads** | Files (PDF applications and the like) |
| **Contact** | Email addresses |

## Labels

One label per destination:

| Destination | Label |
|---|---|
| 2027 Registration guide (tabid 2244720) | 2027 Registration (a section link such as `#league-age` may use the section name) |
| Registration Hub (2114737) | Registration Hub; section links use the section name: 2027 Key Dates, Fees, Financial Aid, Eligibility & Boundaries, Team Formation |
| Assessments (2112173) | 2027 Assessments |
| Assessments FAQ (2246759) | Assessments FAQ |
| Assessments: What to Expect (2246737) | What to Expect |
| Draft page (2112136) | How the draft works |
| All-Stars hub (2252519) | All-Stars |
| All-Stars History (2118070) | All-Stars History |
| Hubs | Coaches Hub, Volunteer Hub, Parents Hub, Safety Hub, Umpires Hub, Helping Hub, Events Hub, Uniforms Hub, Baseball Hub, Softball Hub, Player Development Hub |

Update the year in labels at season rollover (2027 Registration, 2027 Assessments, 2027 Key Dates).
