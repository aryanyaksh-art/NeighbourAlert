const express = require('express');
const router = express.Router();

// GET /api/airquality - Proxy to Environment Canada AQHI API
router.get('/', async (req, res) => {
  try {
    const response = await fetch('https://api.weather.gc.ca/collections/aqhi-observations-realtime/items?f=json&limit=1&sortby=-observation_datetime&location_name_en=Brampton');
    if (!response.ok) {
      throw new Error(`Environment Canada API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching air quality:', error);
    res.status(500).json({ error: 'Failed to fetch air quality data' });
  }
});

module.exports = router;
