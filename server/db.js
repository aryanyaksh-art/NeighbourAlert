const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'neighbouralert.json');

// Initialize JSON database
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ incidents: [] }));
  console.log('JSON Database schema initialized.');
}

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

module.exports = { readDb, writeDb };
