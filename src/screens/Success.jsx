import './Success.css';

export default function Success({ playlist, tracks }) {
  return (
    <div className="success-screen">
      <div className="success-glow" />
      <div className="success-content">
        <div className="success-check">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l5 5L20 6" stroke="var(--accent-2-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="success-text">
          <h1 className="display success-title">Você tá na lista</h1>
          <p className="success-subtitle">
            Adicionadas a
            <br />
            <strong>{playlist?.name || 'a playlist'}</strong>
          </p>
        </div>

        <div className="success-tracks">
          {tracks.map((track) => (
            <div key={track.videoId} className="success-track">
              {track.thumbnail ? (
                <img className="success-thumb" src={track.thumbnail} alt="" />
              ) : (
                <div className="success-thumb success-thumb--placeholder" />
              )}
              <div className="success-track-text">
                <span className="success-track-title">{track.title}</span>
                <span className="success-track-meta">{track.artist}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="success-footer">
        {playlist?.url && (
          <a className="success-open" href={playlist.url} target="_blank" rel="noreferrer">
            Abrir no YouTube Music
          </a>
        )}
        <span className="success-note">
          Você já usou suas 2 escolhas. Te vejo na pista.
        </span>
      </div>
    </div>
  );
}
