# BSB Support Ticket — Summerball26 Custom Answer Data Loss

**Submit to:** BlueSombrero / Sports Connect support portal or support@bluesombrero.com  
**Priority:** High — season starts July 6, teams announced July 4  
**Contact:** registrar@ncllball.com

---

## Organization

- **Portal ID:** 83437
- **Organization:** North Central Little League (WA)
- **Program Name:** Summerball26
- **Program ID:** 80150943

---

## What Happened

On approximately June 10–11, 2026, an admin API call was made to:

```
PUT /proxy/registration-setup/api/v1/programs/80150943/programQuestions
```

The request body accidentally contained only **1 question** instead of the full 21-question array. This caused the server to delete all existing custom question definitions for the program and replace them with a single question, assigning new question IDs to all 21 questions when they were subsequently recreated.

---

## Impact

**49 player registrations** now have `answer: null` for custom questions Q7–Q21 (all guardian contact information and consent answers). These answers were entered by families at the time of registration and are now inaccessible.

The predefined Q1–Q6 answers are intact and were not affected.

---

## Technical State

### Current custom question IDs (post-accident — new IDs, no answers linked)

| Question | New ID (post-accident) |
|---|---|
| Q7 — Guardian 1 First Name | 22576916 |
| Q8 — Guardian 1 Last Name | 22576917 |
| Q9 — Guardian 1 Phone | 22576918 |
| Q10 — Guardian 1 Email | 22576919 |
| Q11 — Guardian 1 Relationship | 22576920 |
| Q12 — Guardian 2 First Name | 22576921 |
| Q13 — Guardian 2 Last Name | 22576922 |
| Q14 — Guardian 2 Phone | 22576923 |
| Q15 — Guardian 2 Email | 22576924 |
| Q16 — Guardian 2 Relationship | 22576925 |
| Q17 — Photo Permission | 22576926 |
| Q18 — Spring 2026 Division | 22576927 |
| Q19 — Club/Select Team | 22577005 |
| Q20 — Volunteer Acknowledgment | 22577006 |
| Q21 — Medical Waiver | 22577007 |

### Reference program with intact data

Spring 2026 program (**ID 80125669**) contains custom question answers for most of the same players under these question IDs:

| Field | Spring 2026 Question ID |
|---|---|
| Guardian 1 First Name | 19283131 |
| Guardian 1 Last Name | 19283139 |
| Guardian 1 Phone | 19283132 |
| Guardian 1 Email | 19283133 |
| Guardian 1 Relationship | 19283134 |
| Guardian 2 First Name | 19283135 |
| Guardian 2 Last Name | 19283140 |
| Guardian 2 Phone | 19283136 |
| Guardian 2 Email | 19283137 |
| Guardian 2 Relationship | 19283138 |
| Photo Permission | 19283141 |
| Division | 19283143 |
| Club/Select | 19283144 |
| Volunteers | 19283147 |

---

## What We Need (choose the fastest option)

### Option A — Restore original question IDs (preferred)
The original Summerball26 custom question IDs (before the accident) had answers linked to them. Those orphaned answers likely still exist in your database. If you can restore the original question definition IDs for program 80150943 — or re-link the orphaned answers to the new IDs listed above — all 49 registrations would be restored immediately with no family action required.

### Option B — Bulk import from provided data
We have the correct guardian data for all 49 players from our own records. We can provide a complete data file. Please bulk-import these answers to the custom question IDs listed above (22576916–22577007) for the 49 player IDs listed below.

### Option C — API access
If BSB can temporarily enable admin write access to `PUT /proxy/registration/api/v1/AccountInfo/playerQuestions` for portal 83437, we can restore the data ourselves via script. Currently this endpoint returns 405 for admin sessions even with `mimickeduserid` impersonation headers.

---

## Affected Player IDs (all 49)

84226310, 84327477, 84449318, 85561975, 84344440, 84328540, 84328543, 84364691, 85513796, 84386941, 85551367, 84339305, 84235710, 85957004, 84361016, 84361017, 84327555, 84348771, 85961775, 85957746, 85081070, 84229875, 84355315, 85485292, 84412968, 84334039, 84474868, 84228856, 84358040, 84270999, 85368733, 85368734, 84641696, 84618346, 85870723, 85960471, 84341605, 84312490, 84413135, 84593921, 85496555, 84319705, 85378613, 84254217, 84338941, 84348444, 84348445, 85579453, 85461394

---

## Timeline

- Registration closed: June 30, 2026
- Teams announced: ~July 4, 2026
- Season starts: July 6, 2026

We need resolution by **June 28** at the latest to avoid sending a family re-entry email.
