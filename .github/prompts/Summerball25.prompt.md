---
mode: ask
---
# Little League Team Formation Guidelines

I am the registrar of a little league in Seattle named North Central Little League (NCLL). I am tasked with running our summer baseball and softball programs. I am responsible for creating balanced teams from a roster of divisions, players, and their registration data. Your goal is to generate initial team assignments that consider coach request, teammate request, school name, and League Age, to distribute kids as evenly as possible across divisions and teams; and assign coaches and volunteers.

## Divisions

Here are the specific divisions. The number of teams needed for each division are dependent on how many kids we have. We try to keep it to around 13-16 players per team. Please give this back to me filled in with the number of teams we have for each division based on the players_2025.csv file. The divisions are as follows:

- **BASEBALL-Single-A:** [Z] teams (e.g., 2 teams)
- **BASEBALL-Double-AA:** [X] teams (e.g., 4 teams)
- **BASEBALL-Triple-AAA:** [B] teams (e.g., 5 teams)
- **BASEBALL-Majors:** [Y] teams (e.g., 3 teams)
- **BASEBALL-TEEN/JUNIOR:** [A] teams (e.g., 2 teams)
- **SOFTBALL-AA/AAA:** [C] teams (e.g., 2 teams)
- **SOFTBALL-AAA/Majors:** [D] teams (e.g., 1 team)

*Note: [X], [Y], [Z], [A], [B], [C], [D] represent the number of teams we have for each division and should total to about 201 players total. We try to keep it to around 13-16 players per team. Exception: Juniors need about 20 per team.*

## Players Division breakdown like this:

Welcome to the 2025 Summerball25 season! Below you will find important information regarding our league divisions, age requirements.

For each division, include a summary of coaches, assistants, and volunteers as well. Who is listed as volunteers **and** have a child registered in that division i.e., **BASEBALL-Single-A**


## Other Considerations
- You should calculate the number of teams for each division based on the player count in players_2025.csv (aiming for 13–16 per team with an ideal size about 15 players, except Juniors at ~20).
- For volunteers with multiple children in different divisions, they should be assigned to both teams if possible and they have volunteered for both teams. 
- Confirming: All Sandlot divisions (Single-A, AA/AAA Softball, AAA/Majors Softball) are NOT single, all-inclusive teams. Ask more about this if it's not clear. Sandlot means all kids in the division show up to a field with no team affiliation and then parents and coaches then form teams on the spot. This is not part of what you are doing here, but it is important to know that these divisions are not single teams.
- Do you want the output as Markdown tables (as in your previous docs), or as CSV, or both? Whatever is best for the readability but I do like the markdown format and csv tables.
- For team names please use sea animals found in the Pacific Northwest.
- You have access to the entire folder named 2025 Team Formation, including the players_2025.csv, players_2024.csv file, and the volunteers_2025.csv file. Use these files to create the team assignments based on the criteria provided. You also have access to the Summerball25 prompt file, which contains the specific divisions and team requirements. Also, read summerball25.html file and understand league age vs chronological age. 
## Output Requirements

For each division, provide a separate list of proposed teams. For each team, list the players assigned to it, along with their:

- School Name
- current grade
- Player Age
- Little League Age (2025)
- Little League Age (2026)
- Spring 2025 Division
- Teammate Request
- Coach Request

**Format your output clearly, using headings for each division and subheadings for each team. Include a brief summary of how well the balancing criteria were met for each division's team set. Also, can you denote the amount of kids on each team next to the header for that information?**

### Division Output Order

| # | Division Name |
|---|--------------|
| 1 | SOFTBALL-AA/AAA |
| 2 | SOFTBALL-AAA/Majors |
| 3 | BASEBALL-Single-A |
| 4 | BASEBALL-Double-AA |
| 5 | BASEBALL-Triple-AAA |
| 6 | BASEBALL-Majors |
| 7 | BASEBALL-TEEN/JUNIOR |


**Please add other kids that fit the criteria and priorities to this team. Also, do not include Adam Bennett's daughters on every team he coaches, just the one. **

- highlight the kids who are like nolan davidson — their 'Age' is 12 and their 'LL Age '25' is also 12.
- **I would like the full player lists for sandlot divisions and I am liking the markdown**
