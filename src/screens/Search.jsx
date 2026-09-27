import { useEffect, useRef, useState } from 'react';
import { searchSongs } from '../api.js';
import AppHeader from '../components/AppHeader.jsx';
import TrackRow from '../components/TrackRow.jsx';
import PicksRail from '../components/PicksRail.jsx';
import './Search.css';

function CheckDot({ selected }) {
  return (
    <span className={`search-check${selected ? ' is-on' : ''}`}>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="var(--accent-ink)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

export default function Search({ playlist, initialSelected, onReview }) {
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
      <AppHeader playlist={playlist} progress={{ current: selected.length, total: 2 }} />

      <div className="search-body">
        <div className="search-main">
          <div className="search-bar-wrap">
            <div className="search-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="var(--text-muted)" strokeWidth="1.8" />
                <path
                  d="m20 20-3.5-3.5"
                  stroke="var(--text-muted)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
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
            {!loading && error && (
              <p className="search-status search-status--error">{error}</p>
            )}
            {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
              <p className="search-status">Nada encontrado para "{query.trim()}"</p>
            )}
            {!loading && query.trim().length < 2 && (
              <p className="search-status">
                Comece a digitar pra buscar uma música ou artista.
              </p>
            )}

            {results.map((track) => {
              const isSelected = selected.some((t) => t.videoId === track.videoId);
              return (
                <TrackRow
                  key={track.videoId}
                  track={track}
                  variant="list"
                  selected={isSelected}
                  disabled={!isSelected && full}
                  onClick={() => toggle(track)}
                  trailing={<CheckDot selected={isSelected} />}
                />
              );
            })}
          </div>
        </div>

        <PicksRail
          selected={selected}
          max={2}
          onRemove={remove}
          onReview={() => onReview(selected)}
        />
      </div>
    </div>
  );
}
