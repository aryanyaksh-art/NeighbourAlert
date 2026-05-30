import React, { useState, useEffect } from 'react';
import { ShieldAlert, Wind, Activity, Bus, Home } from 'lucide-react';

const Header = ({ stats, showTransit, onTransitToggle, onHome }) => {
  const [aqhi, setAqhi] = useState(null);

  useEffect(() => {
    const fetchAqhi = async () => {
      try {
        const res = await fetch('/api/airquality');
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          setAqhi(data.features[0].properties.aqhi);
        }
      } catch (err) {
        console.error('Failed to fetch AQHI', err);
      }
    };
    fetchAqhi();
    const interval = setInterval(fetchAqhi, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAqhiColor = (val) => {
    if (!val) return '#94a3b8';
    if (val <= 3) return '#00e400';
    if (val <= 6) return '#ffff00';
    if (val <= 10) return '#ff7e00';
    return '#ff0000';
  };

  return (
    <header style={styles.header} className="glass-panel map-topbar">
      <div style={styles.logo}>
        <ShieldAlert color="#3b82f6" size={28} />
        <h1 style={styles.title}>NeighbourAlert</h1>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <Activity size={18} color="#94a3b8" />
          <span>{stats.totalActive || 0} Active</span>
        </div>
        <div style={styles.statBox}>
          <Wind size={18} color={getAqhiColor(aqhi)} />
          <span style={{ color: getAqhiColor(aqhi) }}>AQHI: {aqhi !== null ? aqhi : '--'}</span>
        </div>
        <button
          type="button"
          onClick={onTransitToggle}
          style={{
            ...styles.statBox,
            ...styles.toggleBtn,
            ...(showTransit ? styles.toggleActive : {}),
          }}
          title="Toggle transit stops"
        >
          <Bus size={18} />
          <span>Transit</span>
        </button>
        <button type="button" onClick={onHome} style={styles.homeBtn} title="Back to home">
          <Home size={18} />
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.025em',
  },
  statsContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  toggleBtn: {
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  toggleActive: {
    color: '#93c5fd',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    background: 'rgba(59, 130, 246, 0.15)',
  },
  homeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
};

export default Header;
