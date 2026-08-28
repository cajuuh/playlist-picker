import './Intro.css';

// Exported so App.jsx and Intro.css stay in lockstep on timing.
export const INTRO_MIN_MS = 750;
export const INTRO_EXIT_MS = 280;

export default function Intro({ exiting }) {
  return (
    <div
      className={`intro${exiting ? ' intro--exiting' : ''}`}
      style={{ '--intro-exit-ms': `${INTRO_EXIT_MS}ms` }}
      aria-hidden="true"
    >
      <div className="intro-aurora intro-aurora--a" />
      <div className="intro-aurora intro-aurora--b" />
      <div className="intro-aurora intro-aurora--c" />

      <div className="intro-mark">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V6l11-2v12" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" />
          <circle cx="17" cy="16" r="3" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" />
        </svg>
      </div>
    </div>
  );
}
