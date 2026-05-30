import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Filter } from 'lucide-react';
import VoteButtons from './VoteButtons';
import IncidentSource, { isVerifiedNewsIncident } from './IncidentSource';
import { formatDistanceKm } from '../utils/geo';
import { getEffectiveRadiusKm } from '../utils/search';

const typeColors = {
  theft: '#ef4444',
  suspicious: '#f59e0b',
  accident: '#f97316',
  vandalism: '#a855f7',
  other: '#3b82f6',
};

const Sidebar = ({ incidents, onIncidentClick, searchCenter, radiusKm, voterId, onVote }) => {
  const effectiveRadius = getEffectiveRadiusKm(searchCenter, radiusKm);
  const filtered = searchCenter && effectiveRadius > 0;

  return (
    <div style={styles.sidebar} className="glass-panel map-sidebar-panel">
      <div style={styles.titleRow}>
        <h2 style={styles.title}>Live Feed</h2>
        {filtered && (
          <span style={styles.filterBadge}>
            <Filter size={12} />
            {effectiveRadius} km
          </span>
        )}
      </div>
      {filtered && (
        <p style={styles.filterHint}>Showing reports near your search area</p>
      )}
      <div style={styles.feed}>
        {incidents.length === 0 ? (
          <p style={styles.empty}>
            {filtered ? 'No incidents in this radius.' : 'No active incidents.'}
          </p>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              style={{
                ...styles.card,
                ...(isVerifiedNewsIncident(incident) ? styles.cardVerified : {}),
              }}
              onClick={() => onIncidentClick(incident)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.badgeGroup}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: `${typeColors[incident.type]}20`,
                      color: typeColors[incident.type],
                    }}
                  >
                    {incident.type.toUpperCase()}
                  </span>
                  {isVerifiedNewsIncident(incident) && (
                    <span style={styles.verifiedBadge}>Verified</span>
                  )}
                </div>
                <span style={styles.time}>
                  {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                </span>
              </div>
              <p style={styles.desc}>{incident.description}</p>
              <div style={styles.location}>
                <MapPin size={14} />
                <span>{incident.address || 'Unknown location'}</span>
              </div>
              {incident.distanceKm != null && (
                <div style={styles.distance}>{formatDistanceKm(incident.distanceKm)} away</div>
              )}
              <IncidentSource incident={incident} compact />
              <div style={styles.voteRow} onClick={(e) => e.stopPropagation()}>
                <VoteButtons incident={incident} voterId={voterId} onVote={onVote} compact />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: 0,
  },
  filterBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#93c5fd',
    background: 'rgba(59, 130, 246, 0.15)',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  filterHint: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '12px',
  },
  feed: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '4px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '14px',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s ease',
  },
  cardVerified: {
    borderColor: 'rgba(34, 197, 94, 0.25)',
    background: 'rgba(34, 197, 94, 0.04)',
  },
  badgeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#86efac',
    background: 'rgba(34, 197, 94, 0.15)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  badge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  time: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  desc: {
    fontSize: '0.9rem',
    lineHeight: '1.4',
    marginBottom: '8px',
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  distance: {
    fontSize: '0.75rem',
    color: '#93c5fd',
    marginTop: '6px',
  },
  voteRow: {
    marginTop: '10px',
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    marginTop: '20px',
    fontSize: '0.9rem',
  },
};

export default Sidebar;
