import React from 'react';
import { ExternalLink, Users, Newspaper } from 'lucide-react';

export function isVerifiedNewsIncident(incident) {
  return incident?.source === 'news' && Boolean(incident?.sourceUrl);
}

const IncidentSource = ({ incident, compact = false, onClickStop }) => {
  const stop = (e) => {
    e.stopPropagation();
    onClickStop?.(e);
  };

  if (isVerifiedNewsIncident(incident)) {
    return (
      <a
        href={incident.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="incident-source-link"
        style={compact ? styles.linkCompact : styles.link}
        onClick={stop}
      >
        <Newspaper size={compact ? 13 : 14} />
        <span>
          {compact ? 'News source' : `Read on ${incident.sourceName || 'News'}`}
        </span>
        <ExternalLink size={12} style={{ opacity: 0.7 }} />
      </a>
    );
  }

  if (incident?.source === 'community') {
    return (
      <span style={compact ? styles.communityCompact : styles.community} className="incident-community-tag">
        <Users size={12} />
        <span>Community report</span>
      </span>
    );
  }

  return null;
};

const styles = {
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
    padding: '6px 10px',
    borderRadius: '6px',
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    color: '#86efac',
    fontSize: '0.78rem',
    fontWeight: '600',
    textDecoration: 'none',
  },
  linkCompact: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '8px',
    padding: '5px 8px',
    borderRadius: '6px',
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    color: '#86efac',
    fontSize: '0.72rem',
    fontWeight: '600',
    textDecoration: 'none',
  },
  community: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '8px',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  communityCompact: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '6px',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
};

export default IncidentSource;
