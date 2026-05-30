const express = require('express');
const cors = require('cors');
const db = require('./db');
const incidentsRouter = require('./routes/incidents');
const airQualityRouter = require('./routes/airquality');
const geocodeRouter = require('./routes/geocode');
const transitRouter = require('./routes/transit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/airquality', airQualityRouter);
app.use('/api/geocode', geocodeRouter);
app.use('/api/transit', transitRouter);

const { readDb, writeDb } = require('./db');

// Auto-expiry cleanup interval (every 1 hour)
const cleanExpired = () => {
  try {
    const data = readDb();
    const now = new Date().toISOString();
    const activeIncidents = data.incidents.filter(i => i.expires_at > now);
    
    if (activeIncidents.length < data.incidents.length) {
      console.log(`Cleaned up ${data.incidents.length - activeIncidents.length} expired incidents.`);
      writeDb({ incidents: activeIncidents });
    }
  } catch (err) {
    console.error('Error cleaning up expired incidents:', err);
  }
};
setInterval(cleanExpired, 60 * 60 * 1000);
// Run once on startup
cleanExpired();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
