import './Unavailable.css';

export default function Unavailable() {
  return (
    <div className="unavailable-screen">
      <div className="unavailable-icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V6l11-2v12" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" stroke="var(--text-muted)" strokeWidth="1.6" />
          <circle cx="17" cy="16" r="3" stroke="var(--text-muted)" strokeWidth="1.6" />
        </svg>
      </div>
      <h1 className="display unavailable-title">Ainda não tá pronto</h1>
      <p className="unavailable-text">
        O anfitrião ainda não terminou de conectar a conta do YouTube. Peça pra ele
        finalizar e volte aqui depois.
      </p>
      <button className="unavailable-retry" onClick={() => window.location.reload()}>
        Tentar de novo
      </button>
    </div>
  );
}
