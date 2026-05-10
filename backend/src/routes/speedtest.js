import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import speedTestService from '../services/SpeedTestService.js';
import storageService from '../services/StorageService.js';

const router = Router();

router.post('/run', authenticate, async (req, res) => {
  try {
    const result = await speedTestService.run();
    const saved  = storageService.saveResult(result);
    res.json(saved);
  } catch (err) {
    console.error('[speedtest] run failed:', err.message);
    res.status(500).json({ error: 'Speed test failed', detail: err.message });
  }
});

router.get('/history', authenticate, (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit  ?? '100', 10), 500);
  const offset = parseInt(req.query.offset ?? '0', 10);
  res.json(storageService.getAll({ limit, offset }));
});

router.get('/recent', authenticate, (req, res) => {
  const count = Math.min(parseInt(req.query.count ?? '50', 10), 200);
  res.json(storageService.getRecent(count));
});

export default router;
