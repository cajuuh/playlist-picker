import { useEffect, useState } from 'react';
import { adminLogin, listGuests, addGuest, removeGuest } from './adminApi.js';
import './AdminApp.css';

export default function AdminApp() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [guests, setGuests] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [listError, setListError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  async function loadGuests() {
    setLoadingGuests(true);
    setListError('');
    try {
      const data = await listGuests();
      setGuests(data.guests);
      setAuthed(true);
    } catch (err) {
      if (err.status === 401) {
        setAuthed(false);
      } else {
        // The auth check in api/admin/guests.js runs before the Supabase
        // call, so any non-401 error means the session cookie is valid and
        // the failure is downstream — stay on the guest-list view and show
        // the error there instead of bouncing back to the password screen.
        setAuthed(true);
        setListError(err.message);
      }
    } finally {
      setLoadingGuests(false);
      setChecking(false);
    }
  }

  useEffect(() => {
    loadGuests();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      await adminLogin(password);
      setPassword('');
      // The password was accepted and the session cookie is set — treat
      // this as authed even if the guest list itself fails to load next,
      // so that failure surfaces inline instead of bouncing back to the
      // password screen with no explanation.
      setAuthed(true);
      loadGuests();
    } catch (err) {
      setLoginError(err.status === 401 ? 'Senha incorreta' : err.message);
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      await addGuest(name, phone);
      setName('');
      setPhone('');
      await loadGuests();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(phoneToRemove) {
    setGuests((g) => g.filter((guest) => guest.phone !== phoneToRemove));
    try {
      await removeGuest(phoneToRemove);
    } catch (err) {
      setListError(err.message);
      loadGuests();
    }
  }

  if (checking) {
    return <div className="admin-shell" />;
  }

  if (!authed) {
    return (
      <div className="admin-shell">
        <form className="admin-login" onSubmit={handleLogin}>
          <h1 className="display admin-title">Área do anfitrião</h1>
          <label className="admin-field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </label>
          {loginError && <p className="admin-error">{loginError}</p>}
          <button type="submit" className="admin-submit" disabled={loggingIn}>
            {loggingIn ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-content">
        <h1 className="display admin-title">Lista de convidados</h1>
        <p className="admin-subtitle">Só quem estiver aqui consegue entrar e adicionar músicas.</p>

        <form className="admin-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" disabled={adding}>
            {adding ? 'Adicionando…' : 'Adicionar'}
          </button>
        </form>
        {addError && <p className="admin-error">{addError}</p>}
        {listError && <p className="admin-error">{listError}</p>}

        {loadingGuests ? (
          <p className="admin-hint">Carregando lista…</p>
        ) : guests.length === 0 ? (
          <p className="admin-hint">Nenhum convidado ainda.</p>
        ) : (
          <ul className="admin-guest-list">
            {guests.map((guest) => (
              <li key={guest.phone} className="admin-guest-row">
                <div className="admin-guest-info">
                  <span className="admin-guest-name">{guest.name}</span>
                  <span className="admin-guest-phone">{guest.phone}</span>
                </div>
                <button
                  type="button"
                  className="admin-remove"
                  onClick={() => handleRemove(guest.phone)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
