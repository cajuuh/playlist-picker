import './TrackRow.css';

// The one track-row used everywhere a song is listed (search results, review,
// success, locked). `variant` tunes density; `trailing` is the right-hand slot
// (a toggle check, a confirmed badge, a remove button…). Interactive rows
// (onClick set) render as a real <button>.
export default function TrackRow({
  track,
  variant = 'list',
  trailing = null,
  selected = false,
  disabled = false,
  onClick,
}) {
  const interactive = typeof onClick === 'function';
  const Tag = interactive ? 'button' : 'div';

  const props = interactive
    ? { type: 'button', onClick, disabled, 'aria-pressed': selected }
    : {};

  return (
    <Tag
      className={`track-row track-row--${variant}${selected ? ' is-selected' : ''}${
        disabled ? ' is-disabled' : ''
      }`}
      {...props}
    >
      {track.thumbnail ? (
        <img className="track-row-thumb" src={track.thumbnail} alt="" loading="lazy" />
      ) : (
        <div className="track-row-thumb track-row-thumb--placeholder" />
      )}
      <span className="track-row-text">
        <span className="track-row-title">{track.title}</span>
        <span className="track-row-meta">
          {track.artist}
          {track.duration ? ` · ${track.duration}` : ''}
        </span>
      </span>
      {trailing != null && <span className="track-row-trailing">{trailing}</span>}
    </Tag>
  );
}
