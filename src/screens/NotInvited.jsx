import './NotInvited.css';

export default function NotInvited() {
  return (
    <div className="not-invited-screen">
      <div className="not-invited-icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3.5" stroke="var(--text-muted)" strokeWidth="1.6" />
          <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4.5 4.5l15 15" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="display not-invited-title">Esse número não está na lista</h1>
      <p className="not-invited-text">
        Peça pro anfitrião te adicionar como convidado e tente de novo.
      </p>
      <button className="not-invited-retry" onClick={() => window.location.reload()}>
        Tentar de novo
      </button>
    </div>
  );
}
