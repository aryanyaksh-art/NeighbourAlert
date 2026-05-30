// Includes Churchville, north Brampton, and other edge neighbourhoods
const BRAMPTON_BOUNDS = {
  minLat: 43.58,
  maxLat: 43.88,
  minLng: -79.95,
  maxLng: -79.55,
};

const BRAMPTON_CENTER = { lat: 43.7315, lng: -79.7624 };

const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInBrampton(lat, lng) {
  return (
    lat >= BRAMPTON_BOUNDS.minLat &&
    lat <= BRAMPTON_BOUNDS.maxLat &&
    lng >= BRAMPTON_BOUNDS.minLng &&
    lng <= BRAMPTON_BOUNDS.maxLng
  );
}

function isRelevantToBrampton(lat, lng, displayName = '') {
  if (isInBrampton(lat, lng)) return true;
  const lower = displayName.toLowerCase();
  return (
    lower.includes('brampton') ||
    lower.includes('peel region') ||
    lower.includes('churchville') ||
    lower.includes('caledon') && lower.includes('brampton')
  );
}

module.exports = {
  BRAMPTON_BOUNDS,
  BRAMPTON_CENTER,
  haversineKm,
  isInBrampton,
  isRelevantToBrampton,
};
