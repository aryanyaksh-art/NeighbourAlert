const express = require('express');
const {
  BRAMPTON_BOUNDS,
  isRelevantToBrampton,
  BRAMPTON_CENTER,
  haversineKm,
} = require('../utils/geo');

const router = express.Router();

const NOMINATIM_HEADERS = {
  'User-Agent': 'NeighbourAlert/1.0 (Brampton Hackathon contact@localhost)',
};

const VIEWBOX = `${BRAMPTON_BOUNDS.minLng},${BRAMPTON_BOUNDS.maxLat},${BRAMPTON_BOUNDS.maxLng},${BRAMPTON_BOUNDS.minLat}`;
const CACHE_TTL_MS = 30 * 60 * 1000;
const MIN_NOMINATIM_INTERVAL_MS = 1100;

const cache = new Map();
let lastNominatimCall = 0;
let nominatimQueue = Promise.resolve();

function normalizeQuery(q) {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCached(q) {
  const key = normalizeQuery(q);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.results;
}

function setCache(q, results) {
  cache.set(normalizeQuery(q), { at: Date.now(), results });
}

function buildSingleQuery(q) {
  const base = q.trim();
  const lower = base.toLowerCase();
  if (lower.includes('brampton') || lower.includes('peel')) return base;
  return `${base}, Brampton, Peel, Ontario, Canada`;
}

function formatShortLabel(r) {
  const a = r.address || {};
  const streetParts = [a.house_number, a.road || a.pedestrian || a.footway].filter(Boolean);
  const street = streetParts.join(' ');
  const area =
    a.suburb ||
    a.neighbourhood ||
    a.quarter ||
    a.city_district ||
    a.town ||
    a.city ||
    'Brampton';
  if (street) return `${street}, ${area}`;
  return (r.display_name || '').split(',').slice(0, 3).join(', ');
}

function isAcceptableResult(lat, lng, displayName) {
  if (isRelevantToBrampton(lat, lng, displayName)) return true;
  if (haversineKm(lat, lng, BRAMPTON_CENTER.lat, BRAMPTON_CENTER.lng) <= 22) return true;
  const lower = (displayName || '').toLowerCase();
  return (
    lower.includes('brampton') ||
    lower.includes('peel region') ||
    lower.includes('churchville') ||
    lower.includes('caledon')
  );
}

function scoreResult(r, queryLower) {
  const name = (r.display_name || '').toLowerCase();
  let score = 0;
  if (name.includes('brampton')) score += 12;
  if (name.includes('peel region')) score += 6;
  if (name.includes(queryLower)) score += 8;
  const lat = parseFloat(r.lat);
  const lng = parseFloat(r.lon);
  if (isAcceptableResult(lat, lng, r.display_name)) score += 5;
  score -= haversineKm(lat, lng, BRAMPTON_CENTER.lat, BRAMPTON_CENTER.lng) * 0.5;
  return score;
}

function mapResults(raw, query) {
  const seen = new Set();
  const queryLower = query.toLowerCase();
  const sorted = [...raw].sort((a, b) => scoreResult(b, queryLower) - scoreResult(a, queryLower));
  const mapped = [];

  for (const r of sorted) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (!isAcceptableResult(lat, lng, r.display_name)) continue;

    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    mapped.push({
      displayName: r.display_name,
      shortLabel: formatShortLabel(r),
      lat,
      lng,
    });
  }

  return mapped.slice(0, 10);
}

function waitForRateLimit() {
  const now = Date.now();
  const wait = Math.max(0, MIN_NOMINATIM_INTERVAL_MS - (now - lastNominatimCall));
  return new Promise((resolve) => setTimeout(resolve, wait));
}

function queueNominatimSearch(query) {
  nominatimQueue = nominatimQueue.then(async () => {
    await waitForRateLimit();
    lastNominatimCall = Date.now();

    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json&limit=12&addressdetails=1&countrycodes=ca` +
      `&viewbox=${VIEWBOX}&dedupe=1`;

    const response = await fetch(url, { headers: NOMINATIM_HEADERS });

    if (response.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      lastNominatimCall = Date.now();
      const retry = await fetch(url, { headers: NOMINATIM_HEADERS });
      if (!retry.ok) throw new Error(`Nominatim rate limited (${retry.status})`);
      return retry.json();
    }

    if (!response.ok) {
      throw new Error(`Nominatim responded with ${response.status}`);
    }

    return response.json();
  });

  return nominatimQueue;
}

// GET /api/geocode/search?q=...
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) {
    return res.json([]);
  }

  const cached = getCached(q);
  if (cached) {
    return res.json(cached);
  }

  try {
    const query = buildSingleQuery(q);
    const raw = await queueNominatimSearch(query);
    const mapped = mapResults(raw, q);
    setCache(q, mapped);
    res.json(mapped);
  } catch (error) {
    console.error('Geocode search error:', error.message);
    const stale = getCached(q);
    if (stale) return res.json(stale);
    res.status(503).json({
      error: 'Address search is busy — wait a second and try again.',
    });
  }
});

module.exports = router;
