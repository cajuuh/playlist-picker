import { Router } from 'express';
import { getRecord, remainingSlots } from '../store.js';

const router = Router();

router.get('/', (req, res) => {
  const phone = String(req.query.phone || '');
  const record = getRecord(phone);
  res.json({
    remaining: remainingSlots(phone),
    tracks: record ? record.tracks : [],
    name: record ? record.name : null,
  });
});

export default router;
