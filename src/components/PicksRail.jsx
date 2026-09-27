import './PicksRail.css';

// The "your picks" surface for the Search screen. Same markup at every width;
// CSS makes it a sticky bottom action bar under 1024px and a sticky right-hand
// rail at/above it.
export default function PicksRail({
  selected,
  max = 2,
  onRemove,
  onReview,
  ctaLabel = 'Revisar escolhas',
}) {
  const full = selected.length >= max;
  const emptySlots = Math.max(0, max - selected.length);

  return (
    <aside className="picks-rail">
      <div className="picks-rail-head">
        <span className="picks-rail-title">Suas escolhas</span>
        <span className={`picks-rail-count${full ? ' is-full' : ''}`}>
          {selected.length}/{max}
        </span>
      </div>

      <div className="picks-rail-list">
        {selected.map((track) => (
          <div key={track.videoId} className="pick-card">
            {track.thumbnail ? (
              <img className="pick-card-thumb" src={track.thumbnail} alt="" loading="lazy" />
            ) : (
              <div className="pick-card-thumb pick-card-thumb--placeholder" />
            )}
            <div className="pick-card-text">
              <span className="pick-card-title">{track.title}</span>
              <span className="pick-card-meta">{track.artist}</span>
            </div>
            <button
              className="pick-card-remove"
              onClick={() => onRemove(track.videoId)}
              aria-label={`Remover ${track.title}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} className="pick-card pick-card--empty">
            <span>Vaga livre</span>
          </div>
        ))}
      </div>

      <button className="picks-rail-cta" disabled={!full} onClick={onReview}>
        {ctaLabel}
      </button>
    </aside>
  );
}
