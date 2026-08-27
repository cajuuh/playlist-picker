import { searchTracks, isAuthorized } from './_lib/youtube.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const q = String(req.query.q || '').trim();
  if (!q) return res.status(200).json({ items: [] });

  if (!(await isAuthorized())) {
    return res.status(503).json({ error: "This playlist isn't ready yet — ask the host to finish setup." });
  }
  try {
    const items = await searchTracks(q);
    res.status(200).json({ items });
  } catch (err) {
    console.error('Search failed:', err.message);
    res.status(502).json({ error: 'Search failed, try again' });
  }
}
