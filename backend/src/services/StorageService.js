import db from '../config/database.js';

export class StorageService {
  saveResult(result) {
    const stmt = db.prepare(`
      INSERT INTO speed_tests (download, upload, ping, jitter, packet_loss, server_name, server_location, isp)
      VALUES (@download, @upload, @ping, @jitter, @packet_loss, @server_name, @server_location, @isp)
    `);
    const info = stmt.run(result);
    return this.getById(info.lastInsertRowid);
  }

  getById(id) {
    return db.prepare('SELECT * FROM speed_tests WHERE id = ?').get(id);
  }

  getAll({ limit = 100, offset = 0 } = {}) {
    const rows  = db.prepare('SELECT * FROM speed_tests ORDER BY timestamp DESC LIMIT ? OFFSET ?').all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM speed_tests').get().count;
    return { rows, total };
  }

  getRecent(count = 50) {
    return db.prepare('SELECT * FROM speed_tests ORDER BY timestamp DESC LIMIT ?').all(count);
  }

  getCronConfig() {
    return db.prepare('SELECT * FROM cron_config WHERE id = 1').get();
  }

  updateCronConfig({ schedule, enabled }) {
    db.prepare('UPDATE cron_config SET schedule = ?, enabled = ? WHERE id = 1').run(schedule, enabled ? 1 : 0);
    return this.getCronConfig();
  }
}

export default new StorageService();
