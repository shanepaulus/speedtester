# SpeedTester

A self-hosted internet speed monitoring tool. Runs Ookla-powered speed tests on demand or on a schedule, stores results, and visualises them with interactive charts.

## Features

- Run speed tests manually or on a cron schedule
- Historical results stored in SQLite — no external database required
- Charts for download, upload, ping, and jitter over time
- JWT-protected API; credentials configured entirely via environment variables
- Light and dark mode

## Quick start with Docker

```bash
cp .env.example .env
# Edit .env and set a strong JWT_SECRET, AUTH_USERNAME, and AUTH_PASSWORD
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080) and sign in with the credentials you set.

## Local development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API starts on `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI starts on `http://localhost:5173` and proxies `/api` to the backend automatically.

## Environment variables

| Variable        | Default       | Description                          |
| --------------- | ------------- | ------------------------------------ |
| `AUTH_USERNAME` | `admin`       | Login username                       |
| `AUTH_PASSWORD` | `admin`       | Login password                       |
| `JWT_SECRET`    | `changeme...` | Secret used to sign JWT tokens       |
| `PORT`          | `8080`        | Host port the UI is exposed on       |

## Cron expressions

Configure scheduled tests from the dashboard UI. Standard 5-field cron syntax:

| Expression    | Meaning          |
| ------------- | ---------------- |
| `0 * * * *`   | Every hour       |
| `0 */6 * * *` | Every 6 hours    |
| `0 12 * * *`  | Daily at noon    |
| `*/30 * * * *`| Every 30 minutes |

## API reference

All routes except `POST /api/auth/login` require `Authorization: Bearer <token>`.

| Method | Path                   | Description                    |
| ------ | ---------------------- | ------------------------------ |
| POST   | `/api/auth/login`      | Authenticate, returns JWT      |
| POST   | `/api/speedtest/run`   | Run a speed test               |
| GET    | `/api/speedtest/recent`| Last N results                 |
| GET    | `/api/speedtest/history`| Paginated full history        |
| GET    | `/api/cron`            | Get cron config                |
| PUT    | `/api/cron`            | Update cron config             |

## Data

SQLite database is stored at `backend/data/speedtester.db` (locally) or in the named Docker volume `speedtester-data` (compose). Back it up by copying that file.
