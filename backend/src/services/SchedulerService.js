import cron from 'node-cron';
import speedTestService from './SpeedTestService.js';
import storageService from './StorageService.js';

export class SchedulerService {
  #task = null;

  boot() {
    const config = storageService.getCronConfig();
    if (config.enabled) {
      this.start(config.schedule);
    }
  }

  start(schedule) {
    this.stop();
    if (!cron.validate(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`);
    }
    this.#task = cron.schedule(schedule, async () => {
      try {
        const { test_duration_seconds } = storageService.getSettings();
        const result = await speedTestService.run(null, test_duration_seconds);
        storageService.saveResult(result);
        console.log(`[cron] speed test complete — ${result.download} Mbps ↓ / ${result.upload} Mbps ↑`);
      } catch (err) {
        console.error('[cron] speed test failed:', err.message);
      }
    });
    console.log(`[cron] scheduled: ${schedule}`);
  }

  stop() {
    if (this.#task) {
      this.#task.stop();
      this.#task = null;
    }
  }

  apply(schedule, enabled) {
    if (enabled) {
      this.start(schedule);
    } else {
      this.stop();
    }
  }

  validate(schedule) {
    return cron.validate(schedule);
  }
}

export default new SchedulerService();
