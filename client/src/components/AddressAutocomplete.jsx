import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin } from 'lucide-react';

/**
 * Shared typeahead — shows address suggestions in a dropdown while typing.
 * onSelect({ lat, lng, displayName, shortLabel })
 */
const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing an address...',
  minLength = 2,
  showSearchIcon = true,
  inputStyle = {},
  disabled = false,
  id,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState(null);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const seqRef = useRef(0);

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownRect({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 280),
    });
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapperRef.current?.contains(e.target)) return;
      if (e.target.closest?.('.address-autocomplete-dropdown')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [updateDropdownPosition]);

  const pickSuggestion = useCallback(
    (item) => {
      onChange(item.shortLabel || item.displayName.split(',')[0]);
      setSuggestions([]);
      setStatusMessage('');
      setOpen(false);
      setHighlightIndex(-1);
      onSelect?.(item);
    },
    [onChange, onSelect]
  );

  const fetchSuggestions = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (trimmed.length < minLength) {
        setSuggestions([]);
        setStatusMessage('');
        setOpen(false);
        return [];
      }

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = ++seqRef.current;

      setLoading(true);
      updateDropdownPosition();
      setOpen(true);

      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (seq !== seqRef.current) return [];

        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          setSuggestions([]);
          setStatusMessage(
            data.error || 'Search busy — wait a moment and keep typing.'
          );
          return [];
        }

        setSuggestions(data);
        setHighlightIndex(data.length ? 0 : -1);
        updateDropdownPosition();

        if (data.length === 0) {
          setStatusMessage(`No matches for "${trimmed}". Try a street name or number.`);
        } else {
          setStatusMessage('');
        }
        return data;
      } catch (err) {
        if (err.name === 'AbortError') return [];
        if (seq !== seqRef.current) return [];
        setSuggestions([]);
        setStatusMessage('Cannot reach server — run npm run dev from project root.');
        return [];
      } finally {
        if (seq === seqRef.current) setLoading(false);
      }
    },
    [minLength, updateDropdownPosition]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      if (abortRef.current) abortRef.current.abort();
      setSuggestions([]);
      setStatusMessage('');
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => fetchSuggestions(trimmed), 550);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, minLength, fetchSuggestions]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length) {
        setOpen(true);
        setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (open && suggestions.length > 0 && highlightIndex >= 0) {
        pickSuggestion(suggestions[highlightIndex]);
      } else {
        fetchSuggestions(value).then((data) => {
          if (data.length > 0) pickSuggestion(data[0]);
        });
      }
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && (loading || statusMessage || suggestions.length > 0);

  const dropdown =
    showDropdown &&
    dropdownRect &&
    createPortal(
      <ul
        className="glass-panel address-autocomplete-dropdown address-suggestions-portal"
        style={{
          position: 'fixed',
          top: dropdownRect.top,
          left: dropdownRect.left,
          width: dropdownRect.width,
          zIndex: 20000,
          listStyle: 'none',
          padding: '6px',
          margin: 0,
          maxHeight: '300px',
          overflowY: 'auto',
        }}
        role="listbox"
      >
        {loading && suggestions.length === 0 && (
          <li style={dropdownStyles.status}>Finding addresses in Brampton...</li>
        )}
        {!loading && statusMessage && suggestions.length === 0 && (
          <li style={dropdownStyles.status}>{statusMessage}</li>
        )}
        {suggestions.map((item, idx) => (
          <li key={`${item.lat}-${item.lng}-${idx}`} role="option" aria-selected={idx === highlightIndex}>
            <button
              type="button"
              style={{
                ...dropdownStyles.item,
                ...(idx === highlightIndex ? dropdownStyles.itemActive : {}),
              }}
              onMouseEnter={() => setHighlightIndex(idx)}
              onClick={() => pickSuggestion(item)}
            >
              <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong style={dropdownStyles.short}>{item.shortLabel}</strong>
                <span style={dropdownStyles.full}>{item.displayName}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>,
      document.body
    );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={styles.inputRow}>
        {showSearchIcon && <Search size={18} color="#94a3b8" />}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            updateDropdownPosition();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            updateDropdownPosition();
            if (value.trim().length >= minLength || suggestions.length) setOpen(true);
          }}
          placeholder={placeholder}
          style={{ ...styles.input, ...inputStyle }}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
      </div>
      {dropdown}
    </div>
  );
};

const dropdownStyles = {
  status: {
    padding: '12px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: 1.45,
  },
  item: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  itemActive: {
    background: 'rgba(59, 130, 246, 0.22)',
  },
  short: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: 2,
  },
  full: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    lineHeight: 1.35,
  },
};

const styles = {
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 12px',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
  },
};

export default AddressAutocomplete;
