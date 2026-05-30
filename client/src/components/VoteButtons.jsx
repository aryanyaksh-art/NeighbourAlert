import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const VoteButtons = ({ incident, voterId, onVote, compact = false }) => {
  const [loading, setLoading] = useState(false);
  const myVote = incident.voters?.[voterId];

  const handleVote = async (direction) => {
    if (loading) return;
    setLoading(true);
    try {
      await onVote(incident.id, direction);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.row, gap: compact ? '6px' : '10px' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleVote('up');
        }}
        disabled={loading}
        style={{
          ...styles.btn,
          ...(myVote === 'up' ? styles.btnActiveUp : {}),
          padding: compact ? '4px 8px' : '6px 10px',
        }}
        title="Confirm this report"
      >
        <ThumbsUp size={compact ? 14 : 16} />
        <span>{incident.upvotes ?? 0}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleVote('down');
        }}
        disabled={loading}
        style={{
          ...styles.btn,
          ...(myVote === 'down' ? styles.btnActiveDown : {}),
          padding: compact ? '4px 8px' : '6px 10px',
        }}
        title="Dispute this report"
      >
        <ThumbsDown size={compact ? 14 : 16} />
        <span>{incident.downvotes ?? 0}</span>
      </button>
    </div>
  );
};

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '6px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  btnActiveUp: {
    color: '#4ade80',
    borderColor: 'rgba(74, 222, 128, 0.4)',
    background: 'rgba(74, 222, 128, 0.12)',
  },
  btnActiveDown: {
    color: '#f87171',
    borderColor: 'rgba(248, 113, 113, 0.4)',
    background: 'rgba(248, 113, 113, 0.12)',
  },
};

export default VoteButtons;
