import { Router } from 'express';
import { reserveSlots, commitTrack, releaseReservation } from '../store.js';
import { getVideoDetails, addToPlaylist, isAuthorized } from '../youtube.js';

const router = Router();

router.post('/', async (req, res) => {
  const { phone, name, videoIds } = req.body || {};

  if (!phone || !name) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  const ids = Array.isArray(videoIds) ? [...new Set(videoIds)].filter(Boolean) : [];
  if (ids.length === 0 || ids.length > 2) {
    return res.status(400).json({ error: 'Pick 1 or 2 songs' });
  }
  if (!isAuthorized()) {
    return res.status(503).json({ error: "This playlist isn't ready yet — ask the host to finish setup." });
  }

  // Synchronous check-and-reserve happens before any network call, so two
  // concurrent submits for the same phone can't both slip past the limit.
  const reserved = reserveSlots(phone, name, ids.length);
  if (!reserved) {
    return res.status(409).json({ error: "You've already used your picks" });
  }

  const added = [];
  const failed = [];
  for (const videoId of ids) {
    try {
      const details = await getVideoDetails(videoId);
      await addToPlaylist(videoId);
      commitTrack(phone, details);
      added.push(details);
    } catch (err) {
      console.error('Failed to add track', videoId, err.message);
      releaseReservation(phone, 1);
      failed.push(videoId);
    }
  }

  if (added.length === 0) {
    return res.status(502).json({ error: 'Could not add your songs, try again' });
  }

  res.json({ added, failed });
});

export default router;
