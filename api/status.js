import { getRecord } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const phone = String(req.query.phone || '');
  try {
    const record = await getRecord(phone);
    const remaining = record ? Math.max(0, 2 - record.tracks.length - record.reserved) : 2;
    res.status(200).json({
      remaining,
      tracks: record ? record.tracks : [],
      name: record ? record.name : null,
    });
  } catch (err) {
    console.error('Status lookup failed:', err.message);
    res.status(502).json({ error: 'Could not load status' });
  }
}
