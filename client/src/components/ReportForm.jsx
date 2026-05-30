import React, { useState, useEffect } from 'react';
import { X, Send, Crosshair } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

const ReportForm = ({ location, onLocationChange, searchCenter, onClose, onSubmit }) => {
  const [type, setType] = useState('suspicious');
  const [description, setDescription] = useState('');
  const [addressInput, setAddressInput] = useState(location.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.address) setAddressInput(location.address.split(',')[0]);
  }, [location.address]);

  const handleAddressSelect = (item) => {
    onLocationChange({
      lat: item.lat,
      lng: item.lng,
      address: item.shortLabel || item.displayName,
    });
    setError('');
  };

  const useSearchCenter = () => {
    if (!searchCenter) return;
    onLocationChange({
      lat: searchCenter.lat,
      lng: searchCenter.lng,
      address: searchCenter.label?.split(',')[0] || addressInput,
    });
    setAddressInput(searchCenter.label?.split(',')[0] || addressInput);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const lat = Number(location.lat);
    const lng = Number(location.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Pick a location from the dropdown or click the map.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          description,
          latitude: lat,
          longitude: lng,
          address: addressInput || location.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        onSubmit(data);
      } else {
        setError(data.error || `Could not submit report (${response.status})`);
      }
    } catch (err) {
      console.error('Failed to submit report', err);
      setError('Cannot reach server — run npm run dev from the project root.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container} className="glass-panel report-form-panel">
      <div style={styles.header}>
        <h2 style={styles.title}>Report Incident</h2>
        <button type="button" onClick={onClose} style={styles.closeBtn}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Location</label>
          <AddressAutocomplete
            value={addressInput}
            onChange={setAddressInput}
            onSelect={handleAddressSelect}
            placeholder="Type street name or number..."
            minLength={2}
            inputStyle={styles.autocompleteInput}
          />
          {searchCenter && (
            <button type="button" style={styles.secondaryBtn} onClick={useSearchCenter}>
              <Crosshair size={14} />
              Use map search address
            </button>
          )}
          <p style={styles.coords}>
            Pin: {Number(location.lat).toFixed(5)}, {Number(location.lng).toFixed(5)}
            <span style={styles.coordsHint}> · click map to adjust</span>
          </p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Incident Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={styles.select}>
            <option value="theft">Theft</option>
            <option value="suspicious">Suspicious Activity</option>
            <option value="accident">Accident</option>
            <option value="vandalism">Vandalism</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what's happening..."
            style={styles.textarea}
            maxLength={280}
            rows={4}
            required
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          style={{
            ...styles.submitBtn,
            opacity: isSubmitting || !description.trim() ? 0.5 : 1,
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Post to Map'}
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    top: '92px',
    right: '20px',
    width: '340px',
    padding: '24px',
    animation: 'slideIn 0.3s ease-out forwards',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: { fontSize: '1.2rem', fontWeight: '600', margin: 0 },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    padding: '4px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' },
  autocompleteInput: {
    background: 'transparent',
    fontSize: '0.9rem',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#93c5fd',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  coords: { fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 },
  coordsHint: { color: '#64748b' },
  select: {
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
  },
  textarea: {
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
  },
  error: { color: '#f87171', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 },
  submitBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
};

export default ReportForm;
