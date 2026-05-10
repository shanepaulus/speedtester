import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import storageService from '../services/StorageService.js';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json(storageService.getSettings());
});

router.put('/', authenticate, (req, res) => {
  const dur = parseInt(req.body.testDuration, 10);
  if (!Number.isInteger(dur) || dur < 1 || dur > 60) {
    return res.status(400).json({ error: 'Duration must be between 1 and 60 seconds' });
  }
  res.json(storageService.updateSettings({ testDuration: dur }));
});

export default router;
