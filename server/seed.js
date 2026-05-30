const { writeDb } = require('./db');
const newsByDescription = require('./data/newsIncidents');

const seedData = [
  { type: 'theft', description: 'Car break-in spotted, window smashed', latitude: 43.6856, longitude: -79.7593, address: 'Queen St & Main St' },
  { type: 'suspicious', description: 'Suspicious person checking door handles', latitude: 43.693, longitude: -79.761, address: 'Vodden St E' },
  { type: 'accident', description: 'Fender bender at intersection', latitude: 43.7115, longitude: -79.785, address: 'Bovaird Dr & Kennedy Rd' },
  { type: 'vandalism', description: 'Graffiti spray-painted on fence', latitude: 43.6705, longitude: -79.7405, address: 'McMurchy Ave S' },
  { type: 'theft', description: 'Package stolen from porch', latitude: 43.735, longitude: -79.79, address: 'Sandalwood Pkwy W' },
  { type: 'suspicious', description: 'Group loitering near playground after dark', latitude: 43.718, longitude: -79.722, address: 'Chinguacousy Park' },
  { type: 'accident', description: 'Hit and run, silver sedan heading east', latitude: 43.665, longitude: -79.732, address: 'Steeles Ave W & Hurontario St' },
  { type: 'theft', description: 'Attempted break-in at business', latitude: 43.688, longitude: -79.762, address: 'Main St N' },
  { type: 'suspicious', description: 'Abandoned vehicle on roadside', latitude: 43.7, longitude: -79.715, address: 'Dixie Rd' },
  { type: 'other', description: 'Loud altercation outside store', latitude: 43.66, longitude: -79.742, address: 'Shoppers World Brampton' },
];

console.log('Seeding demo data into JSON DB...');

const now = new Date();
const incidents = seedData.map((item, index) => {
  const created = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
  const expires = new Date(created.getTime() + 48 * 60 * 60 * 1000);
  const newsMeta = newsByDescription[item.description] || {};
  return {
    id: index + 1,
    ...item,
    ...newsMeta,
    created_at: created.toISOString(),
    expires_at: expires.toISOString(),
    upvotes: 0,
    downvotes: 0,
    voters: {},
  };
});

writeDb({ incidents });
console.log('Database seeded with verified news-linked incidents!');
