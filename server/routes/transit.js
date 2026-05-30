const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const stopsPath = path.resolve(__dirname, '../data/transit-stops.json');
const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf8'));

// GET /api/transit/stops
router.get('/stops', (req, res) => {
  res.json(stops);
});

module.exports = router;
