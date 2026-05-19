# Apps Script: Import Players and Coaches CSVs into Google Sheet

Paste this into Extensions → Apps Script in your Google Sheet, then run `importPlayersAndCoaches` and authorize the script when prompted. It will create two tabs named "Players (imported)" and "Coaches (imported)" and populate them with the tables.

```javascript
function importPlayersAndCoaches() {
  const playersCsv = `Program/Division,Hat Model #,Shirt Model #,Hoodie Model #
Baseball - T-Ball,4301,ST350,none
Baseball - Kindy,4301,ST350,none
Baseball - A,4301,4003,none
Baseball - AA,4301,4003,none
Baseball - AAA,Richardson PTS30,4003,PC90H
Baseball - Majors,Richardson PTS30,4003,PC90H
Baseball - Juniors,Richardson PTS30,4003,PC90H
Baseball - Seniors,Richardson PTS30,4003,PC90H
Softball - A,4302,4408,none
Softball - AA,4302,4408,none
Softball - AAA,4302,4408,PC90H
Softball - Majors,4302,4408,PC90H
Softball - Juniors,4302,4408,PC90H
Softball - Seniors,4302,4408,PC90H
`;

  const coachesCsv = `Program/Division,Hat Model #,Shirt Model #,Hoodie Model #
Baseball - T-Ball Coaches,4301,ST350,none
Baseball - Kindy Coaches,4301,ST350,none
Baseball - A Coaches,4301,ST350,none
Baseball - AA Coaches,4301,ST350,none
Baseball - AAA Coaches,Richardson PTS30,ST350/ST550,PC90H
Baseball - Majors Coaches,Richardson PTS30,ST350/ST550,PC90H
Baseball - Juniors Coaches,Richardson PTS30,ST350/ST550,PC90H
Baseball - Seniors Coaches,Richardson PTS30,ST350/ST550,PC90H
Softball - A Coaches,Champro HC10,4408,none
Softball - AA Coaches,Champro HC10,4408,none
Softball - AAA Coaches,Champro HC10,ST350/ST550,PC90H
Softball - Majors Coaches,Champro HC10,ST350/ST550,PC90H
Softball - Juniors Coaches,Champro HC10,ST350/ST550,PC90H
Softball - Seniors Coaches,Champro HC10,ST350/ST550,PC90H
`;

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function importCsvToSheet(csv, sheetName) {
    // Remove existing sheet if present
    const existing = ss.getSheetByName(sheetName);
    if (existing) ss.deleteSheet(existing);

    // Parse CSV lines to arrays
    const rows = csv.trim().split('\n').map(function(line) {
      return Utilities.parseCsv(line)[0];
    });

    // Create and populate sheet
    const sh = ss.insertSheet(sheetName);
    sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    sh.getRange(1,1,1,rows[0].length).setFontWeight('bold');
  }

  importCsvToSheet(playersCsv, 'Players (imported)');
  importCsvToSheet(coachesCsv, 'Coaches (imported)');

  SpreadsheetApp.flush();
  Logger.log('Imported Players and Coaches tables.');
}
```

Notes
- The script writes only to the current Google Sheet (the one you open the Apps Script editor from).
- The script deletes and recreates the two target tabs each time it runs.
- If you'd rather have the data appended instead of replacing, I can modify the script to append rows.
- If you want the CSVs pulled from a raw URL or a repo file, I can adjust the script to fetch them instead (would require the files to be hosted and accessible).

