import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\regis\\AppData\\Roaming\\Code\\User\\globalStorage\\state.vscdb');
const row = db.prepare("SELECT value FROM ItemTable WHERE key = 'extensionsIdentifiers/disabled'").get();
if (row) {
  const list = JSON.parse(row.value);
  console.log(`${list.length} extensions in disabled list:`);
  list.forEach(e => console.log(' ', e.id));
} else {
  console.log('No disabled list found.');
}
db.close();
