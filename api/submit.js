import { reserveSlots, commitTrack, releaseReservation } from './_lib/store.js';
import { getVideoDetails, addToPlaylist, isAuthorized } from './_lib/youtube.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, name, videoIds } = req.body || {};
  if (!phone || !name) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  const ids = Array.isArray(videoIds) ? [...new Set(videoIds)].filter(Boolean) : [];
  if (ids.length === 0 || ids.length > 2) {
    return res.status(400).json({ error: 'Pick 1 or 2 songs' });
  }
  if (!(await isAuthorized())) {
    return res.status(503).json({ error: "This playlist isn't ready yet — ask the host to finish setup." });
  }

  let reserved;
  try {
    reserved = await reserveSlots(phone, name, ids.length);
  } catch (err) {
    console.error('Reservation check failed:', err.message);
    return res.status(502).json({ error: 'Something went wrong, try again' });
  }
  if (!reserved) {
    return res.status(409).json({ error: "You've already used your picks" });
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
    return res.status(502).json({ error: 'Could not add your songs, try again' });
  }

  res.status(200).json({ added, failed });
}
