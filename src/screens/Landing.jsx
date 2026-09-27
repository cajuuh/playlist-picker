import { useState } from 'react';
import CoverArt from '../components/CoverArt.jsx';
import './Landing.css';

export default function Landing({ playlist, onJoin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && phone.trim().length >= 7 && !submitting;
  const count = playlist?.trackCount;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await onJoin({ name, phone });
    setSubmitting(false);
  }

  return (
    <div className="landing">
      <div className="landing-content">
        <div className="landing-poster">
          <CoverArt src={playlist?.cover} size={160} className="landing-cover" />
          <span className="landing-kicker">Você foi convidado pra adicionar músicas</span>
          <h1 className="display landing-title">{playlist?.name || 'A Playlist'}</h1>
          <span className="landing-subtitle">
            Cada um escolhe 2 músicas
            {typeof count === 'number' && count > 0 ? ` · ${count} na lista` : ''}. Capriche.
          </span>
        </div>

        <form className="landing-form" onSubmit={handleSubmit}>
          <div className="landing-form-inner">
            <h2 className="display landing-form-heading">Bora começar</h2>

            <label className="landing-field">
              <span>Seu nome</span>
              <input
                type="text"
                placeholder="ex: Marina"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>

            <label className="landing-field">
              <span>Telefone</span>
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
                  placeholder="(11) 91234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>
              <span className="landing-hint">
                Só pra saber de quem é cada escolha — sem código de verificação.
              </span>
            </label>

            <button type="submit" className="landing-submit" disabled={!canSubmit}>
              {submitting ? 'Só um segundo…' : 'Bora'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="var(--accent-ink)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
