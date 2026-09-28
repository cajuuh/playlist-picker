const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Algo deu errado');
    error.status = res.status;
    throw error;
  }
  return data;
}

export function adminLogin(password) {
  return request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
}

export function listGuests() {
  return request('/api/admin/guests');
}

export function addGuest(name, phone) {
  return request('/api/admin/guests', { method: 'POST', body: JSON.stringify({ name, phone }) });
}

export function removeGuest(phone) {
  return request(`/api/admin/guests?phone=${encodeURIComponent(phone)}`, { method: 'DELETE' });
}
