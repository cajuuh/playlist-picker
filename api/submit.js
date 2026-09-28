import { reserveSlots, commitTrack, releaseReservation, isGuest, getRecord } from './_lib/store.js';
import { getVideoDetails, addToPlaylist, isAuthorized } from './_lib/youtube.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, name, videoIds } = req.body || {};
  if (!phone || !name) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }
  const ids = Array.isArray(videoIds) ? [...new Set(videoIds)].filter(Boolean) : [];
  if (ids.length === 0 || ids.length > 2) {
    return res.status(400).json({ error: 'Escolha 1 ou 2 músicas' });
  }

  // Already having a submissions row means they joined before being added
  // to (or removed from) the guest list — don't retroactively lock them out.
  const [guest, existing] = await Promise.all([isGuest(phone), getRecord(phone)]);
  if (!guest && !existing) {
    return res.status(403).json({ error: 'not_invited' });
  }

  if (!(await isAuthorized())) {
    return res.status(503).json({ error: 'A playlist ainda não está pronta — peça pro anfitrião finalizar.' });
  }

  let reserved;
  try {
    reserved = await reserveSlots(phone, name, ids.length);
  } catch (err) {
    console.error('Reservation check failed:', err.message);
    return res.status(502).json({ error: 'Algo deu errado, tente de novo' });
  }
  if (!reserved) {
    return res.status(409).json({ error: 'Você já usou suas escolhas' });
  }

  const added = [];
  const failed = [];
  for (const videoId of ids) {
    try {
      const details = await getVideoDetails(videoId);
      await addToPlaylist(videoId);
      await commitTrack(phone, details);
      added.push(details);
    } catch (err) {
      console.error('Failed to add track', videoId, err.message);
      await releaseReservation(phone, 1).catch(() => {});
      failed.push(videoId);
    }
  }

  if (added.length === 0) {
    return res.status(502).json({ error: 'Não foi possível adicionar suas músicas, tente de novo' });
  }

  res.status(200).json({ added, failed });
}
