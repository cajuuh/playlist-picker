import { useEffect, useRef, useState } from 'react';
import { searchSongs } from '../api.js';
import './Search.css';

export default function Search({ initialSelected, onReview }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(initialSelected || []);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError('');
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await searchSongs(trimmed);
        setResults(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function toggle(track) {
    setSelected((prev) => {
      const already = prev.some((t) => t.videoId === track.videoId);
      if (already) return prev.filter((t) => t.videoId !== track.videoId);
      if (prev.length >= 2) return prev;
      return [...prev, track];
    });
  }

  function remove(videoId) {
    setSelected((prev) => prev.filter((t) => t.videoId !== videoId));
  }

  const full = selected.length >= 2;

  return (
    <div className="search-screen">
      <div className="search-header">
        <div className="search-header-row">
          <span className="display search-title">Encontre uma música</span>
          <span className={`search-counter ${full ? 'search-counter--full' : ''}`}>
            {selected.length}/2 escolhidas
          </span>
        </div>
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="var(--text-muted)" strokeWidth="1.8" />
            <path d="m20 20-3.5-3.5" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar no YouTube Music"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="search-results">
        {loading && <p className="search-status">Buscando…</p>}
        {!loading && error && <p className="search-status search-status--error">{error}</p>}
        {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
          <p className="search-status">Nada encontrado para "{query.trim()}"</p>
        )}
        {!loading && query.trim().length < 2 && (
          <p className="search-status">Comece a digitar pra buscar uma música ou artista.</p>
        )}

        {results.map((track) => {
          const isSelected = selected.some((t) => t.videoId === track.videoId);
          return (
            <div
              key={track.videoId}
              className="search-row"
              role="button"
              tabIndex={0}
              onClick={() => toggle(track)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(track)}
              style={{
                background: isSelected ? 'var(--bg-raised)' : 'transparent',
                opacity: !isSelected && full ? 0.4 : 1,
              }}
            >
              {track.thumbnail ? (
                <img className="search-thumb" src={track.thumbnail} alt="" />
              ) : (
                <div className="search-thumb search-thumb--placeholder" />
              )}
              <div className="search-row-text">
                <span className="search-row-title">{track.title}</span>
                <span className="search-row-meta">
                  {track.artist}
                  {track.duration ? ` · ${track.duration}` : ''}
                </span>
              </div>
              <div
                className="search-check"
                style={{
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                  background: isSelected ? 'var(--accent)' : 'transparent',
                }}
              >
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="var(--accent-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="search-footer">
        <div className="search-chips">
          {selected.length === 0 && <span className="search-chips-hint">Toque em até 2 músicas acima</span>}
          {selected.map((track) => (
            <div key={track.videoId} className="search-chip">
              <span>{track.title}</span>
              <span className="search-chip-remove" onClick={() => remove(track.videoId)}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6 6 18" stroke="var(--text)" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          ))}
        </div>
        <button
          className="search-review-btn"
          disabled={!full}
          onClick={() => onReview(selected)}
        >
          Revisar escolhas
        </button>
      </div>
    </div>
  );
}
