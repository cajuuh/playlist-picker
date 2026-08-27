import { getPlaylistInfo, isAuthorized } from './_lib/youtube.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!(await isAuthorized())) {
    return res.status(503).json({ error: 'not_connected' });
  }
  try {
    const info = await getPlaylistInfo();
    res.status(200).json(info);
  } catch (err) {
    console.error('Failed to load playlist info:', err.message);
    res.status(502).json({ error: 'Could not load playlist info' });
  }
}
