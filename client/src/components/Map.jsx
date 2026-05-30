import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import VoteButtons from './VoteButtons';
import IncidentSource from './IncidentSource';
import { getEffectiveRadiusKm } from '../utils/search';

const createCustomIcon = (type) => {
  return L.divIcon({
    className: `pulse-marker marker-${type}`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
};

const transitIcon = L.divIcon({
  className: 'transit-stop-marker',
  html: '<div class="transit-stop-inner">🚌</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -12],
});

const searchLocationIcon = L.divIcon({
  className: 'search-location-marker',
  html: '<div class="search-location-pin"></div>',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

const draftReportIcon = L.divIcon({
  className: 'draft-report-marker',
  html: '<div class="draft-report-pin"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: async (e) => {
      let address = '';
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`,
          { headers: { 'User-Agent': 'NeighbourAlert/1.0' } }
        );
        const data = await res.json();
        address = data.address?.road
          ? `${data.address.road}${data.address.neighbourhood ? ', ' + data.address.neighbourhood : ''}`
          : data.display_name.split(',')[0];
      } catch (err) {
        console.error('Geocoding failed', err);
      }
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }, address);
    },
  });
  return null;
};

function zoomForRadiusKm(radiusKm) {
  if (radiusKm >= 20) return 11;
  if (radiusKm >= 15) return 11;
  if (radiusKm >= 10) return 12;
  if (radiusKm >= 5) return 13;
  if (radiusKm >= 2) return 14;
  return 15;
}

const MapController = ({ focusLocation, searchCenter, searchZoomKey, radiusKm }) => {
  const map = useMap();

  useEffect(() => {
    if (searchCenter) {
      const r = radiusKm > 0 ? radiusKm : 5;
      map.flyTo([searchCenter.lat, searchCenter.lng], zoomForRadiusKm(r), { duration: 1.2 });
    } else if (focusLocation) {
      map.flyTo([focusLocation.lat, focusLocation.lng], 16, { duration: 1.5 });
    }
  }, [searchCenter, searchZoomKey, focusLocation, radiusKm, map]);

  return null;
};

const Map = ({
  incidents,
  onMapClick,
  focusLocation,
  searchCenter,
  radiusKm,
  transitStops,
  showTransit,
  voterId,
  onVote,
  draftReportLocation,
}) => {
  const effectiveRadiusKm = getEffectiveRadiusKm(searchCenter, radiusKm);
  const showRadius = searchCenter && effectiveRadiusKm > 0;

  return (
    <MapContainer
      center={[43.7315, -79.7624]}
      zoom={13}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <MapEvents onMapClick={onMapClick} />
      <MapController
        focusLocation={focusLocation}
        searchCenter={searchCenter}
        radiusKm={effectiveRadiusKm}
        searchZoomKey={searchCenter ? `${searchCenter.lat},${searchCenter.lng},${effectiveRadiusKm}` : ''}
      />

      {draftReportLocation && (
        <Marker
          position={[draftReportLocation.lat, draftReportLocation.lng]}
          icon={draftReportIcon}
          zIndexOffset={1100}
        />
      )}

      {searchCenter && (
        <Marker position={[searchCenter.lat, searchCenter.lng]} icon={searchLocationIcon} zIndexOffset={1000}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong style={{ fontSize: '0.85rem', color: '#93c5fd' }}>Your search</strong>
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem' }}>
                {searchCenter.label || 'Selected address'}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {showRadius && (
        <Circle
          key={`search-radius-${effectiveRadiusKm}`}
          center={[searchCenter.lat, searchCenter.lng]}
          radius={effectiveRadiusKm * 1000}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: effectiveRadiusKm >= 10 ? '10 6' : '6 8',
          }}
        />
      )}

      {showTransit &&
        transitStops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={transitIcon}>
            <Popup>
              <div style={{ padding: '4px' }}>
                <strong style={{ fontSize: '0.85rem' }}>{stop.name}</strong>
                <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Brampton Transit stop
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.latitude, incident.longitude]}
          icon={createCustomIcon(incident.type)}
        >
          <Popup>
            <div style={{ padding: '4px', minWidth: '200px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <strong
                  style={{
                    color: 'var(--color-' + incident.type + ')',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {incident.type}
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                </span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '500' }}>
                {incident.description}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {incident.address}
                {incident.distanceKm != null && (
                  <span style={{ display: 'block', marginTop: '4px', color: '#93c5fd' }}>
                    {incident.distanceKm < 1
                      ? `${Math.round(incident.distanceKm * 1000)} m away`
                      : `${incident.distanceKm.toFixed(1)} km away`}
                  </span>
                )}
              </div>
              <IncidentSource incident={incident} compact />
              <VoteButtons incident={incident} voterId={voterId} onVote={onVote} compact />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
