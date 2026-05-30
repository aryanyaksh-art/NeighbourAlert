import React from 'react';
import { ShieldAlert, MapPin, Bus, ThumbsUp, ArrowRight } from 'lucide-react';

const LandingPage = ({ stats, onEnter }) => {
  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <main style={styles.main} className="glass-panel">
        <div style={styles.badge}>Brampton Hackathon · Community Safety</div>
        <div style={styles.heroIcon}>
          <ShieldAlert size={48} color="#3b82f6" />
        </div>
        <h1 style={styles.title}>NeighbourAlert</h1>
        <p style={styles.subtitle}>
          Real-time neighbourhood incident reports for Brampton — see what&apos;s happening near you,
          near transit, and along your commute.
        </p>

        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <strong>{stats.totalActive ?? 0}</strong>
            <span>Active reports</span>
          </div>
          <div style={styles.stat}>
            <strong>{stats.lastHour ?? 0}</strong>
            <span>Last hour</span>
          </div>
          <div style={styles.stat}>
            <strong>{stats.mostCommonType ? stats.mostCommonType.toUpperCase() : '—'}</strong>
            <span>Top type</span>
          </div>
        </div>

        <ul style={styles.features}>
          <li style={styles.featureItem}>
            <MapPin size={20} color="#3b82f6" />
            <div>
              <strong style={styles.featureTitle}>Address search & radius</strong>
              <span style={styles.featureDesc}>Focus the map on your street and filter reports within 500 m–5 km.</span>
            </div>
          </li>
          <li style={styles.featureItem}>
            <Bus size={20} color="#3b82f6" />
            <div>
              <strong style={styles.featureTitle}>Transit overlays</strong>
              <span style={styles.featureDesc}>See major Brampton Transit stops alongside live incident pins.</span>
            </div>
          </li>
          <li style={styles.featureItem}>
            <ThumbsUp size={20} color="#3b82f6" />
            <div>
              <strong style={styles.featureTitle}>Community upvotes</strong>
              <span style={styles.featureDesc}>Confirm or dispute reports so the feed stays trustworthy.</span>
            </div>
          </li>
        </ul>

        <button type="button" style={styles.cta} onClick={onEnter}>
          Open Live Map
          <ArrowRight size={20} />
        </button>
        <p style={styles.footer}>Click the map to report · Reports expire after 48 hours</p>
      </main>
    </div>
  );
};

const styles = {
  page: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background:
      'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), var(--bg-color)',
  },
  glow: {
    position: 'absolute',
    width: '480px',
    height: '480px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.08)',
    filter: 'blur(80px)',
    top: '10%',
    right: '15%',
    pointerEvents: 'none',
  },
  main: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '560px',
    width: '100%',
    padding: '40px 36px',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#93c5fd',
    marginBottom: '20px',
  },
  heroIcon: {
    marginBottom: '12px',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    marginBottom: '12px',
  },
  subtitle: {
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '28px',
    fontSize: '1rem',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '28px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  features: {
    listStyle: 'none',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  featureItem: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
  },
  featureTitle: {
    display: 'block',
    fontSize: '0.9rem',
    marginBottom: '4px',
  },
  featureDesc: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  cta: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '10px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  footer: {
    marginTop: '16px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
};

export default LandingPage;
