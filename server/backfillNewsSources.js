const { readDb, writeDb } = require('./db');
const newsByDescription = require('./data/newsIncidents');

const data = readDb();

data.incidents = data.incidents.map((incident) => {
  const newsMeta = newsByDescription[incident.description];
  if (newsMeta) {
    return { ...incident, ...newsMeta };
  }
  if (incident.source === 'news') {
    return incident;
  }
  return { ...incident, source: 'community' };
});

writeDb(data);
console.log('Backfilled news sources on matching incidents; others marked community.');
