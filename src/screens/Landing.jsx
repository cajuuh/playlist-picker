import { useState } from 'react';
import './Landing.css';

export default function Landing({ playlist, onJoin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && phone.trim().length >= 7 && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await onJoin({ name, phone });
    setSubmitting(false);
  }

  return (
    <div className="landing">
      <div className="landing-glow-top" />
      <div className="landing-glow-bottom" />

      <div className="landing-content">
        <span className="landing-kicker">You're invited to add music</span>
        <h2 className="display landing-desktop-heading">Let's get you in</h2>

        <div className="landing-playlist">
          <div className="landing-cover">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M9 18V6l11-2v12" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" />
              <circle cx="17" cy="16" r="3" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" />
            </svg>
          </div>
          <h1 className="display landing-title">{playlist?.name || 'The Playlist'}</h1>
          <span className="landing-subtitle">Everyone gets 2 picks. Make them count.</span>
        </div>

        <form className="landing-form" onSubmit={handleSubmit}>
          <label className="landing-field">
            <span>Your name</span>
            <input
              type="text"
              placeholder="e.g. Marina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="landing-field">
            <span>Phone number</span>
            <div className="landing-phone-input">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.9c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1L6.6 10.8Z"
                  stroke="var(--text-muted)"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </div>
            <span className="landing-hint">
              Just so we know whose picks are whose — no verification code needed.
            </span>
          </label>

          <button type="submit" className="landing-submit" disabled={!canSubmit}>
            {submitting ? 'One sec…' : "Let's go"}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
