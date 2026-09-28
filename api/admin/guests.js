import { isAuthedRequest } from '../_lib/admin-auth.js';
import { listGuests, addGuest, removeGuest } from '../_lib/store.js';

export default async function handler(req, res) {
  if (!isAuthedRequest(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const guests = await listGuests();
      return res.status(200).json({ guests });
    } catch (err) {
      console.error('Failed to list guests:', err.message);
      return res.status(502).json({ error: 'Não foi possível carregar a lista' });
    }
  }

  if (req.method === 'POST') {
    const { name, phone } = req.body || {};
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    try {
      await addGuest(phone, name);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Failed to add guest:', err.message);
      return res.status(502).json({ error: 'Não foi possível adicionar' });
    }
  }

  if (req.method === 'DELETE') {
    const phone = req.query.phone;
    if (!phone) return res.status(400).json({ error: 'Telefone obrigatório' });
    try {
      await removeGuest(phone);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Failed to remove guest:', err.message);
      return res.status(502).json({ error: 'Não foi possível remover' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
