# Apps Script: Import Players CSV into Google Sheet

Paste this into Extensions → Apps Script in your Google Sheet, then run `importPlayersFromCSV` and authorize the script when prompted. It will create a new tab named "Players (imported)" and populate it with the table.

```javascript
function importPlayersFromCSV() {
  const csv = `Program/Division,Hat Model #,Shirt Model #,Hoodie Model #
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

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Players (imported)';

  const existing = ss.getSheetByName(sheetName);
  if (existing) ss.deleteSheet(existing);

  const rows = csv.trim().split('\n').map(function(line){
    return Utilities.parseCsv(line)[0];
  });

  const sh = ss.insertSheet(sheetName);
  sh.getRange(1,1,rows.length, rows[0].length).setValues(rows);
  sh.getRange(1,1,1,rows[0].length).setFontWeight('bold');
  SpreadsheetApp.flush();
  Logger.log('Imported ' + rows.length + ' rows into "' + sheetName + '".');
}
```

Notes
- The script writes into the current Google Sheet only; you must run it from the Sheet at the link you provided.
- If you prefer, you can import `Parents/sizing/specs-players.csv` via File → Import → Upload and choose "Insert new sheet(s)".
