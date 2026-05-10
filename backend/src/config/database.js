import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(join(DATA_DIR, 'speedtester.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS speed_tests (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    download   REAL    NOT NULL,
    upload     REAL    NOT NULL,
    ping       REAL    NOT NULL,
    jitter     REAL    NOT NULL,
    packet_loss REAL   NOT NULL DEFAULT 0,
    server_name TEXT,
    server_location TEXT,
    isp        TEXT
  );

  CREATE TABLE IF NOT EXISTS cron_config (
    id         INTEGER PRIMARY KEY CHECK (id = 1),
    schedule   TEXT    NOT NULL DEFAULT '0 * * * *',
    enabled    INTEGER NOT NULL DEFAULT 0
  );

  INSERT OR IGNORE INTO cron_config (id, schedule, enabled) VALUES (1, '0 * * * *', 0);
`);

export default db;
