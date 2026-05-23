import urllib.request, json, sys

text = """# SignUpGenius — NCLL Sign-Ups Index

A running index of all NCLL SignUpGenius pages. Add new sign-ups here as they're created so they're easy to find each year.

**Account credentials:**
- **Login:** registrar@ncllball.com
- **Password:** Player1Assessment!

Jason DeMotts led creation of the 2026 HRD signup; Cole Parsons created the 2026 assessment and clinic signups.

---

## 2026 Season

| Sign-Up | Purpose | Owner | Link | Notes |
|---|---|---|---|---|
| Home Run Derby Setup & Cleanup | Volunteer slots for HRD setup, safety, scoring, cleanup | Jason DeMotts | [Sign up](https://www.signupgenius.com/go/70A054FAAAF22A3F85-63971121-2026/198036979) | Sent May 15, 2026. Includes physician slot, fence movers, pops distribution. Had duplicate "Manage SB Batting Order" slot — fix before reuse. |
| AAA/Majors Assessments | Volunteer coaches for assessment day at Eagle Staff | Cole Parsons | [Sign up](https://www.signupgenius.com/go/70A054FAAAF22A3F85-61414227-2026#/) | Sent Jan 23, 2026. Included field map for Eagle Staff. |
| Free February Clinics | Coaches/volunteers for AAA/MAJ open clinics at Eagle Staff (Saturdays 6–8pm) | Cole Parsons | [Sign up](https://www.signupgenius.com/go/70A054FAAAF22A3F85-61675693-2026#/) | Also referenced as "pre-season Winterball opportunity" in AAA team welcome emails. 3 Saturdays in February. |
| UW Husky Day — Softball Anthem Buddies | Collect info from players interested in being an anthem buddy at UW Softball game (Mar 15) | Akiko Yabuki | [Sign up](https://www.signupgenius.com/go/10C044BAAAF2FA20-62359594-ncll) | Created Feb 2026. First-come, first-served. |
| UW Husky Day — Baseball Anthem Buddies | Collect info from players interested in being an anthem buddy at UW Baseball game (Mar 29) | Akiko Yabuki | [Sign up](https://www.signupgenius.com/go/10C044BAAAF2FA20-62359980-ncll) | Created Feb 2026. First-come, first-served. |

---

## Notes for Future Years

- The NCLL SignUpGenius account login was shared via Google Chat (May 2026). Keep credentials current in the board credentials doc.
- For the Home Run Derby, review all volunteer slots before publishing — 2026 had a duplicate "Manage SB Batting Order" slot.
- Anthem Buddy signups are created by Akiko Yabuki (UW Husky Days coordinator) — not a board-created signup. Coordinate with her each year.
- Free clinics signups are created by the Baseball Commissioner — copy the template from the prior year.
"""

payload = {
    "title": "SignUpGenius — NCLL Sign-Ups Index",
    "collectionId": "8c7cbb9d-ed73-4d79-bd44-7a6f8e45d7ea",
    "publish": True,
    "text": text
}

req = urllib.request.Request(
    "https://outline.shikella.me/api/documents.create",
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Authorization": "Bearer ol_api_lbfitIJV02TmadBBTuwEBANzEDb5UFcGUGt6vW",
        "Content-Type": "application/json"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        r = json.load(resp)
        d = r["data"]
        print(f"Created: {d['title']}")
        print(f"URL: {d['url']}")
        print(f"ID: {d['id']}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code}: {body}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
