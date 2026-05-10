import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import storageService from '../services/StorageService.js';
import schedulerService from '../services/SchedulerService.js';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json(storageService.getCronConfig());
});

router.put('/', authenticate, (req, res) => {
  const { schedule, enabled } = req.body;

  if (typeof schedule !== 'string' || !schedulerService.validate(schedule)) {
    return res.status(400).json({ error: 'Invalid cron expression' });
  }

  const config = storageService.updateCronConfig({ schedule, enabled: !!enabled });
  schedulerService.apply(schedule, !!enabled);
  res.json(config);
});

export default router;
