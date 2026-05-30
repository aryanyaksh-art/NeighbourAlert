const express = require('express');
const { readDb, writeDb } = require('../db');
const { haversineKm, isInBrampton, isRelevantToBrampton } = require('../utils/geo');
const router = express.Router();

// GET /api/incidents - Get all active incidents (optional lat, lng, radiusKm filter)
router.get('/', (req, res) => {
  try {
    const data = readDb();
    const now = new Date().toISOString();
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radiusKm);
    const hasRadiusFilter =
      Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(radiusKm) && radiusKm > 0;

    let activeIncidents = data.incidents
      .filter((i) => i.expires_at > now)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (hasRadiusFilter) {
      activeIncidents = activeIncidents
        .map((i) => ({
          ...i,
          distanceKm: haversineKm(lat, lng, i.latitude, i.longitude),
        }))
        .filter((i) => i.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.json(activeIncidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/incidents/stats - Get summary statistics
router.get('/stats', (req, res) => {
  try {
    const data = readDb();
    const now = new Date();
    const nowIso = now.toISOString();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    
    const activeIncidents = data.incidents.filter(i => i.expires_at > nowIso);
    const lastHourIncidents = activeIncidents.filter(i => i.created_at > oneHourAgo);
    
    const typeCounts = {};
    activeIncidents.forEach(i => {
      typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
    });
    
    let mostCommonType = null;
    let maxCount = 0;
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = type;
      }
    }
    
    res.json({
      totalActive: activeIncidents.length,
      lastHour: lastHourIncidents.length,
      mostCommonType
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/incidents - Create a new incident
router.post('/', (req, res) => {
  const { type, description, latitude, longitude, address } = req.body;
  
  if (!type || !description || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'Invalid map coordinates — click the map or use Update pin.' });
  }

  if (!isInBrampton(lat, lng) && !isRelevantToBrampton(lat, lng, address || '')) {
    return res.status(400).json({ error: 'Reports must be within Brampton. Use Update pin to fix location.' });
  }

  try {
    const data = readDb();
    const now = new Date();
    
    const newIncident = {
      id: Date.now(),
      type,
      description,
      latitude,
      longitude,
      address,
      source: 'community',
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      upvotes: 0,
      downvotes: 0,
      voters: {},
    };
    
    data.incidents.push(newIncident);
    writeDb(data);
    
    res.status(201).json(newIncident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/incidents/:id/vote
router.post('/:id/vote', (req, res) => {
  const id = Number(req.params.id);
  const { voterId, direction } = req.body;

  if (!voterId || !['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid vote payload' });
  }

  try {
    const data = readDb();
    const incident = data.incidents.find((i) => i.id === id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    if (!incident.voters) incident.voters = {};
    if (incident.upvotes == null) incident.upvotes = 0;
    if (incident.downvotes == null) incident.downvotes = 0;

    const previous = incident.voters[voterId];

    if (previous === direction) {
      delete incident.voters[voterId];
      if (direction === 'up') incident.upvotes = Math.max(0, incident.upvotes - 1);
      else incident.downvotes = Math.max(0, incident.downvotes - 1);
    } else {
      if (previous === 'up') incident.upvotes = Math.max(0, incident.upvotes - 1);
      if (previous === 'down') incident.downvotes = Math.max(0, incident.downvotes - 1);
      incident.voters[voterId] = direction;
      if (direction === 'up') incident.upvotes += 1;
      else incident.downvotes += 1;
    }

    writeDb(data);
    res.json(incident);
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
