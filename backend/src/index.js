import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import speedTestRoutes from './routes/speedtest.js';
import cronRoutes from './routes/cron.js';
import settingsRoutes from './routes/settings.js';
import schedulerService from './services/SchedulerService.js';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/speedtest', speedTestRoutes);
app.use('/api/cron',      cronRoutes);
app.use('/api/settings',  settingsRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`);
  schedulerService.boot();
});
