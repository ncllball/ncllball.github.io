import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\regis\\AppData\\Roaming\\Code\\User\\globalStorage\\state.vscdb');

// List all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

// Check if there's scope info
const sample = db.prepare("SELECT * FROM ItemTable LIMIT 3").all();
console.log('\nSample rows (columns):', Object.keys(sample[0] || {}));
console.log(sample);
db.close();
