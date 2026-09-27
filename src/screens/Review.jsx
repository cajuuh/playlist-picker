import AppHeader from '../components/AppHeader.jsx';
import TrackRow from '../components/TrackRow.jsx';
import './Review.css';

export default function Review({ playlist, tracks, submitting, error, onBack, onConfirm }) {
  return (
    <div className="review-screen">
      <AppHeader playlist={playlist} onBack={onBack} />

      <div className="review-content">
        <div className="review-intro">
          <h2 className="display review-title">Revise suas escolhas</h2>
          <p className="review-subtitle">
            Última chance de mudar de ideia — elas vão direto pra{' '}
            {playlist?.name || 'a playlist'}.
          </p>
        </div>

        <div className="review-list">
          {tracks.map((track) => (
            <TrackRow key={track.videoId} track={track} variant="card" />
          ))}
        </div>

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
