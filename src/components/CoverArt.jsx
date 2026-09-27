import { useState } from 'react';
import './CoverArt.css';

// Playlist artwork with a graceful fallback: when there's no cover URL (or it
// fails to load) we render the original gradient tile + music-note mark so
// every surface still has something branded to show.
export default function CoverArt({ src, size = 128, radius, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  const style = {
    width: size,
    height: size,
    borderRadius: radius ?? 'var(--r-lg)',
  };

  return (
    <div className={`cover-art ${className}`.trim()} style={style}>
      {showImage ? (
        <img
          className="cover-art-img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <svg
          className="cover-art-mark"
          width="46%"
          height="46%"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 18V6l11-2v12"
            stroke="oklch(98% 0.01 280)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" />
          <circle cx="17" cy="16" r="3" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" />
        </svg>
      )}
    </div>
  );
}
