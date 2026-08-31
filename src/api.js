// Same-origin by default — the API routes deploy alongside the frontend on
// Vercel. Override only if you're pointing at a separately-hosted API.
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
    error.code = data.error;
    throw error;
  }
  return data;
}

export function getPlaylistInfo() {
  return request('/api/playlist');
}

export function getStatus(phone) {
  return request(`/api/status?phone=${encodeURIComponent(phone)}`);
}

export function searchSongs(q) {
  return request(`/api/search?q=${encodeURIComponent(q)}`);
}

export function submitPicks({ phone, name, videoIds }) {
  return request('/api/submit', {
    method: 'POST',
    body: JSON.stringify({ phone, name, videoIds }),
  });
}
