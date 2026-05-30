import React from 'react';
import { MapPin, X } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import { DEFAULT_RADIUS_KM, RADIUS_OPTIONS_KM } from '../utils/search';

const AddressSearch = ({ searchCenter, radiusKm, onSearchChange, onRadiusChange, onClear }) => {
  const [query, setQuery] = React.useState('');

  const handleSelect = (item) => {
    const radius = radiusKm > 0 ? radiusKm : DEFAULT_RADIUS_KM;
    onSearchChange(
      { lat: item.lat, lng: item.lng, label: item.displayName },
      radius
    );
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  const activeRadius = searchCenter ? radiusKm : 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.searchHeader}>
        <AddressAutocomplete
          value={query}
          onChange={setQuery}
          onSelect={handleSelect}
          placeholder="Type street name or number..."
          minLength={2}
        />
        {(query || searchCenter) && (
          <button type="button" onClick={handleClear} style={styles.clearBtn} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      {searchCenter && (
        <div style={styles.activeLocation}>
          <MapPin size={14} />
          <span style={styles.activeLabel}>{searchCenter.label?.split(',')[0] || 'Selected area'}</span>
        </div>
      )}

      <div style={styles.radiusSection}>
        <label style={styles.radiusLabel}>
          Radius {searchCenter ? `· ${activeRadius} km` : ''}
        </label>
        <div className="radius-chips" style={styles.radiusChips}>
          {RADIUS_OPTIONS_KM.map((km) => (
            <button
              key={km}
              type="button"
              className={`radius-chip${activeRadius === km ? ' radius-chip-active' : ''}`}
              disabled={!searchCenter}
              onClick={() => onRadiusChange(km)}
            >
              {km} km
            </button>
          ))}
        </div>
        {!searchCenter && (
          <span style={styles.hint}>Pick an address from the dropdown list</span>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: { width: '100%' },
  searchHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
  },
  clearBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '10px',
    flexShrink: 0,
    marginTop: 0,
  },
  activeLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
    fontSize: '0.75rem',
    color: '#93c5fd',
  },
  activeLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  radiusSection: { marginTop: '10px' },
  radiusLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
  radiusChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  hint: {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
};

export default AddressSearch;
