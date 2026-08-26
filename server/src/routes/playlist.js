import { Router } from 'express';
import { getPlaylistInfo, isAuthorized } from '../youtube.js';

const router = Router();

router.get('/', async (req, res) => {
  if (!isAuthorized()) {
    return res.status(503).json({ error: 'not_connected' });
  }
  try {
    const info = await getPlaylistInfo();
    res.json(info);
  } catch (err) {
    console.error('Failed to load playlist info:', err.message);
    res.status(502).json({ error: 'Could not load playlist info' });
  }
});

export default router;
