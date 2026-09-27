import AppHeader from '../components/AppHeader.jsx';
import TrackRow from '../components/TrackRow.jsx';
import './Locked.css';

function ConfirmedBadge() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--positive)" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="var(--positive-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Locked({ playlist, tracks }) {
  return (
    <div className="locked-screen">
      <AppHeader playlist={playlist} />

      <div className="locked-content">
        <div className="locked-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
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
            <TrackRow
              key={track.videoId}
              track={track}
              variant="compact"
              trailing={<ConfirmedBadge />}
            />
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
