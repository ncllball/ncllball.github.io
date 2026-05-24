import urllib.request, json, sys

text = """# Welcome to the NCLL Wiki

This is the internal operations wiki for **North Central Little League (NCLL)**. It's the canonical home for board and coordinator knowledge — how we run events, what roles exist, what we've learned, and how to hand things off.

**This wiki is for board members, division leads, and key volunteers.** It is not public-facing. For public-facing information, go to [ncllball.com](https://www.ncllball.com).

---

## Content Strategy

| Tool | Purpose |
|---|---|
| **This wiki (Outline)** | Internal admin operations: playbooks, checklists, role guides, lessons learned, contacts, email templates |
| **ncllball.com** | Public program info: schedules, registration, rules, events, resources for families |
| **Google Drive** | Source documents, spreadsheets, forms in active use; legacy content being migrated here |
| **Google Chat** | Real-time coordination; ephemeral decisions that should be summarized here once settled |
| **Sports Connect** | Registration, team management, official communications to families |
| **GameChanger** | In-season team communication, scores, schedules |

**The rule of thumb:** If it's something a future coordinator or board member would need to know to do their job, it belongs here — not in someone's inbox or a Google Doc only they can find.

---

## Collections

### 📋 Resources
General references that don't fit a single event or role. Includes this welcome doc, the SignUpGenius index, platform guides, and operational how-tos.

### 📅 Events
Playbooks for recurring NCLL events: All-Stars Tryouts, All-Stars Announcement, Home Run Derby, and others. Each doc covers roles, checklist, format, communications templates, and lessons learned.

### 📣 Communications
Guides for using NCLL's communication platforms — how to send emails in Sports Connect, how to review sent messages, push notification how-tos, and decision guides for which channel to use.

### 🏟️ Facilities
Field locations, Lower Woodland details, permit contacts, and field-use notes.

### ⚾ Coaches
Resources for coaches: policies, processes, and guides relevant to managing a team within NCLL.

### 🏆 Programs
Admin and operations guides for each program area: Baseball, Softball, All-Stars, Player Development. Each doc covers how the program runs, key contacts, and annual checklist. These feed the public website — coordinators maintain here, registrar updates ncllball.com.

### 👤 Roles
One doc per board role and key volunteer position. Covers responsibilities, annual tasks, key contacts, and handoff notes. The master doc ("2026 Board of Directors & Key Volunteers") lists everyone.

### 🗓️ Timeline
Season calendar and key dates. The 2026 Season Calendar is the source of record for the public timeline page on ncllball.com.

---

## How to Use This Wiki

- **Search** (Cmd/Ctrl + K) is the fastest way to find anything.
- **Each event doc** has a Pre-Event Checklist — start there when planning.
- **Each role doc** has an annual checklist and handoff notes — read it when starting a new role.
- **Lessons Learned sections** are the most valuable part of event docs. Read before planning; add to after the event.
- If you find something out of date, fix it. This wiki is only useful if it's current.

---

## Updating This Wiki

The registrar (John Shikella) maintains the overall structure. Coordinators own their program and event docs. If you need a new doc or collection, ask in the [NCLL Admin Google Chat space](https://chat.google.com) or reach out to the registrar at registrar@ncllball.com.

For events, the convention is: **docs define what an event looks like** (playbook, roles, checklist, lessons learned) — not specific dates (those live on the public timeline page).
"""

payload = {
    "title": "Welcome to the NCLL Wiki",
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
