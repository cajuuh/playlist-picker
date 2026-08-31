import './Review.css';

export default function Review({ playlist, tracks, submitting, error, onBack, onConfirm }) {
  return (
    <div className="review-screen">
      <div className="review-header">
        <button className="review-back" onClick={onBack} aria-label="Voltar para a busca">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <span className="display review-title">Revise suas escolhas</span>
          <p className="review-subtitle">
            Última chance de mudar de ideia — elas vão direto pra {playlist?.name || 'a playlist'}.
          </p>
        </div>
      </div>

      <div className="review-list">
        {tracks.map((track) => (
          <div key={track.videoId} className="review-track">
            {track.thumbnail ? (
              <img className="review-thumb" src={track.thumbnail} alt="" />
            ) : (
              <div className="review-thumb review-thumb--placeholder" />
            )}
            <div className="review-track-text">
              <span className="review-track-title">{track.title}</span>
              <span className="review-track-meta">
                {track.artist}
                {track.duration ? ` · ${track.duration}` : ''}
              </span>
            </div>
          </div>
        ))}

        <div className="review-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.6" />
            <path d="M12 8v5M12 16h.01" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>Depois de confirmar, não dá pra trocar — são só 2.</span>
        </div>

        {error && <p className="review-error">{error}</p>}
      </div>

      <div className="review-footer">
        <button className="review-confirm" disabled={submitting} onClick={onConfirm}>
          {submitting ? 'Adicionando…' : 'Adicionar à playlist'}
        </button>
      </div>
    </div>
  );
}
