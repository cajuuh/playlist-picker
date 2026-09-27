import CoverArt from './CoverArt.jsx';
import './AppHeader.css';

// Frosted sticky top bar shared by Search and Review: optional back button,
// a small playlist cover + name, and an optional "n/total" progress pill.
export default function AppHeader({ playlist, progress, onBack }) {
  const full = progress && progress.current >= progress.total;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {onBack && (
          <button className="app-header-back" onClick={onBack} aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <CoverArt src={playlist?.cover} size={36} radius="var(--r-sm)" className="app-header-cover" />
        <span className="app-header-name">{playlist?.name || 'A Playlist'}</span>

        {progress && (
          <span className={`app-header-progress${full ? ' is-full' : ''}`}>
            {progress.current}/{progress.total}
          </span>
        )}
      </div>
    </header>
  );
}
