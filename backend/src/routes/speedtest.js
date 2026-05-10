import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import speedTestService from '../services/SpeedTestService.js';
import storageService from '../services/StorageService.js';


const router = Router();

router.post('/run', authenticate, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const { test_duration_seconds } = storageService.getSettings();
    const result = await speedTestService.run(send, test_duration_seconds);
    const saved  = storageService.saveResult(result);
    send({ phase: 'done', result: saved });
  } catch (err) {
    console.error('[speedtest] run failed:', err.message);
    send({ phase: 'error', error: err.message });
  } finally {
    res.end();
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
