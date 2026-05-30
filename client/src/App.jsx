import React, { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ReportForm from './components/ReportForm';
import LandingPage from './components/LandingPage';
import AddressSearch from './components/AddressSearch';
import { getVoterId } from './utils/voterId';
import { getEffectiveRadiusKm, DEFAULT_RADIUS_KM } from './utils/search';

function App() {
  const [view, setView] = useState('landing');
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({});
  const [reportLocation, setReportLocation] = useState(null);
  const [focusLocation, setFocusLocation] = useState(null);
  const [searchCenter, setSearchCenter] = useState(null);
  const [radiusKm, setRadiusKm] = useState(0);
  const [transitStops, setTransitStops] = useState([]);
  const [showTransit, setShowTransit] = useState(true);
  const [voterId] = useState(() => getVoterId());

  const effectiveRadiusKm = getEffectiveRadiusKm(searchCenter, radiusKm);

  const buildIncidentsUrl = useCallback(() => {
    if (searchCenter && effectiveRadiusKm > 0) {
      const params = new URLSearchParams({
        lat: String(searchCenter.lat),
        lng: String(searchCenter.lng),
        radiusKm: String(effectiveRadiusKm),
      });
      return `/api/incidents?${params}`;
    }
    return '/api/incidents';
  }, [searchCenter, effectiveRadiusKm]);

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch(buildIncidentsUrl());
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    }
  }, [buildIncidentsUrl]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/incidents/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchTransit = async () => {
    try {
      const res = await fetch('/api/transit/stops');
      const data = await res.json();
      setTransitStops(data);
    } catch (err) {
      console.error('Failed to fetch transit stops', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTransit();
  }, []);

  useEffect(() => {
    if (view !== 'map') return;

    fetchIncidents();
    const interval = setInterval(() => {
      fetchIncidents();
      fetchStats();
    }, 15000);

    return () => clearInterval(interval);
  }, [view, fetchIncidents]);

  const handleVote = async (incidentId, direction) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, direction }),
      });
      if (res.ok) {
        const updated = await res.json();
        setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      }
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  const handleSearchChange = (center, radius = DEFAULT_RADIUS_KM) => {
    setSearchCenter(center);
    setRadiusKm(radius > 0 ? radius : DEFAULT_RADIUS_KM);
    setFocusLocation({ lat: center.lat, lng: center.lng });
  };

  const handleRadiusChange = (radius) => {
    if (!searchCenter) return;
    setRadiusKm(radius);
  };

  const handleClearSearch = () => {
    setSearchCenter(null);
    setRadiusKm(0);
  };

  const handleMapClick = (latlng, address) => {
    setReportLocation({
      lat: latlng.lat,
      lng: latlng.lng,
      address: address || '',
    });
  };

  const handleReportSubmit = (newIncident) => {
    setReportLocation(null);
    fetchStats();
    fetchIncidents();
    setFocusLocation({ lat: newIncident.latitude, lng: newIncident.longitude });
  };

  const handleIncidentClick = (incident) => {
    setFocusLocation({ lat: incident.latitude, lng: incident.longitude });
  };

  if (view === 'landing') {
    return <LandingPage stats={stats} onEnter={() => setView('map')} />;
  }

  return (
    <div className="map-shell">
      <Header
        stats={stats}
        showTransit={showTransit}
        onTransitToggle={() => setShowTransit((v) => !v)}
        onHome={() => setView('landing')}
      />

      <aside className="map-left-column">
        <div className="map-search-panel glass-panel">
          <AddressSearch
            searchCenter={searchCenter}
            radiusKm={effectiveRadiusKm}
            onSearchChange={handleSearchChange}
            onRadiusChange={handleRadiusChange}
            onClear={handleClearSearch}
          />
        </div>
        <Sidebar
          incidents={incidents}
          onIncidentClick={handleIncidentClick}
          searchCenter={searchCenter}
          radiusKm={effectiveRadiusKm}
          voterId={voterId}
          onVote={handleVote}
        />
      </aside>

      {reportLocation && (
        <ReportForm
          location={reportLocation}
          searchCenter={searchCenter}
          onLocationChange={setReportLocation}
          onClose={() => setReportLocation(null)}
          onSubmit={handleReportSubmit}
        />
      )}

      <Map
        incidents={incidents}
        onMapClick={handleMapClick}
        focusLocation={focusLocation}
        searchCenter={searchCenter}
        radiusKm={effectiveRadiusKm}
        draftReportLocation={reportLocation}
        transitStops={transitStops}
        showTransit={showTransit}
        voterId={voterId}
        onVote={handleVote}
      />
    </div>
  );
}

export default App;
