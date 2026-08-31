import './Locked.css';

export default function Locked({ playlist, tracks }) {
  return (
    <div className="locked-screen">
      <div className="locked-header">
        <div className="locked-header-row">
          <span className="display locked-title">Encontre uma música</span>
          <span className="locked-counter">2/2 escolhidas</span>
        </div>
        <div className="locked-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="var(--text-muted)" strokeWidth="1.8" />
            <path d="m20 20-3.5-3.5" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>A busca fechou pra você</span>
        </div>
      </div>

      <div className="locked-content">
        <div className="locked-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="var(--text-muted)" strokeWidth="1.7" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <div className="locked-text">
          <h1 className="display locked-heading">Suas escolhas estão confirmadas</h1>
          <p className="locked-subtitle">
            Você já adicionou suas 2 músicas a {playlist?.name || 'a playlist'}. Valeu pelas
            escolhas — te vejo na pista.
          </p>
        </div>

        <div className="locked-tracks">
          {tracks.map((track) => (
            <div key={track.videoId} className="locked-track">
              {track.thumbnail ? (
                <img className="locked-thumb" src={track.thumbnail} alt="" />
              ) : (
                <div className="locked-thumb locked-thumb--placeholder" />
              )}
              <div className="locked-track-text">
                <span className="locked-track-title">{track.title}</span>
                <span className="locked-track-meta">{track.artist}</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="var(--accent-2)" />
                <path d="M8 12.5l2.5 2.5L16 9.5" stroke="var(--accent-2-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {playlist?.url && (
        <div className="locked-footer">
          <a className="locked-open" href={playlist.url} target="_blank" rel="noreferrer">
            Abrir playlist no YouTube Music
          </a>
        </div>
      )}
    </div>
  );
}
