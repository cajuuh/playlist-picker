import { Router } from 'express';
import { searchTracks, isAuthorized } from '../youtube.js';

const router = Router();

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ items: [] });
  if (!isAuthorized()) {
    return res.status(503).json({ error: "This playlist isn't ready yet — ask the host to finish setup." });
  }
  try {
    const items = await searchTracks(q);
    res.json({ items });
  } catch (err) {
    console.error('Search failed:', err.message);
    res.status(502).json({ error: 'Search failed, try again' });
  }
});

export default router;
