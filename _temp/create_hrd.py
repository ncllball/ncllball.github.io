import urllib.request, json, sys

text = """# Home Run Derby

## Overview

The Home Run Derby is an optional single-day event, typically held after the All-Stars team announcement and before tournament play begins. It gives All-Stars players a competitive and festive pre-tournament experience and builds community excitement around the All-Stars program.

| | |
|---|---|
| **Eligible players** | All-Stars roster players (all divisions) |
| **Format** | Bracket or round-robin; see Format Options below |
| **Duration** | ~3 hours total (setup + event + cleanup) |
| **Typical timing** | Weekend after All-Stars announcement; before first tournament |
| **Location** | Home field (typically Fair Oaks Park) |

---

## Roles

| Role | Responsibility | Notes |
|---|---|---|
| Event Coordinator | Overall planning, communication, equipment, scoring | All-Stars Coordinator or delegate |
| Umpire / Pitcher | Pitches to batters; calls fair/foul | Consistent strike-zone pitcher recommended |
| Scorekeeper | Tracks outs and home runs per round | One per field |
| Field Setup | Bases, home run markers, scoring table | Arrive 45 min early |
| Concessions | Optional: water, snacks | Coordinate with snack bar if open |
| Announcer | MC energy, introduces batters | Optional but adds fun |

---

## Format Options

### Standard (Recommended)

Each batter gets a fixed number of outs per round. A "miss" or non-HR hit counts as an out.

| Round | Outs per batter |
|---|---|
| First round (all players) | 10 |
| Semifinal | 7 |
| Final | 5 |

### Timed

Each batter gets 3 minutes. All swings count; HR total at end of time wins. Good for large participant counts.

### Bracket

Single-elimination bracket. Each head-to-head round is 5 outs each. Faster format; works well for 8–16 players.

---

## Pre-Event Checklist

- [ ] Confirm field reservation and availability
- [ ] Announce event to All-Stars families (email + app notification)
- [ ] Collect participant RSVPs
- [ ] Prepare bracket or roster draw
- [ ] Gather equipment (balls, batting tee if needed, score sheets)
- [ ] Confirm pitcher/umpire volunteer
- [ ] Print scoring sheets
- [ ] Set up home run distance marker (chalk or cone)
- [ ] Notify concessions / coordinate snack bar hours

---

## Day-Of Timeline

| Time | Task |
|---|---|
| T − 45 min | Field setup: bases, scoring table, home run marker |
| T − 15 min | Player check-in; bracket draw or seeding |
| T + 0 | Welcome, rules explanation, first round begins |
| T + 60–90 min | Semifinals |
| T + 90–120 min | Finals + award presentation |
| T + 30 min after end | Cleanup, equipment return |

---

## Equipment

- Batting helmets (1–2; players may use own)
- Baseballs / softballs: minimum 12 per field
- Cones or chalk for home run line
- Score sheets (printed)
- Clipboard + pens
- Portable speaker (optional, for music/announcer)
- First aid kit

---

## Scoring Sheet Template

```
Division: ____________   Date: ____________

Batter Name        | Round 1 HRs | Round 2 HRs | Final HRs | Total
-------------------|-------------|-------------|-----------|------
                   |             |             |           |
                   |             |             |           |
                   |             |             |           |
```

---

## Communications

**Announcement email (send ~2 weeks before):**

> Subject: NCLL All-Stars Home Run Derby — [Date]
>
> Congratulations again to our 2026 All-Stars! Before tournament play begins, we're hosting a Home Run Derby on [Date] at [Time] at [Field]. All All-Stars players are welcome. RSVPs appreciated — reply to this email by [RSVP date].

**Reminder (send 2–3 days before):**

> Reminder: Home Run Derby is this [Saturday/Sunday] at [Time]. Meet at [Field]. Bring your helmet and batting gloves. See you there!

---

## Lessons Learned

| Year | Note |
|---|---|
| (add after first event) | |
"""

payload = {
    "title": "Home Run Derby",
    "collectionId": "12ab240d-ecb0-4b22-b1ba-a557baab328c",
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
