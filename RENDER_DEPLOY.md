# Render Deployment Guide

This app is packaged as a single service: the Vite frontend is built into `dist/`, and the Express server serves those static files while also running the SQLite-backed API.

## Quick Deploy (Render Blueprint)

1. Push this repo to GitHub.
2. In the Render dashboard, click **New +** → **Blueprint**.
3. Connect your GitHub repo.
4. Render will read `render.yaml` and create the web service automatically.

## Manual Deploy (New Web Service)

If you prefer not to use the Blueprint:

1. Click **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Set the following:
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add these environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render sets this automatically, but you can be explicit)
   - `JWT_SECRET` = any strong random string
   - `ADMIN_PASSWORD` = your desired admin password
   - `DEMO_PASSWORD` = your desired demo password
   - `GEMINI_API_KEY` = your Gemini API key (optional)
   - `DATABASE_PATH` = `/opt/render/project/src/data/platform.db`
5. Click **Create Web Service**.

## Important Notes

- **Single service:** The Express server (`server/server.ts`) serves the built React app from `dist/` and handles `/api/*` routes. No separate frontend server is needed.
- **SQLite persistence:** On the **free plan**, the filesystem is ephemeral. The database will be recreated from seeds on every deploy and after the service spins down. To keep data across restarts, upgrade to a paid plan and uncomment the `disk` block in `render.yaml`.
- **Health check:** The server exposes `/api/health` for uptime monitoring.
- **Default logins:**
  - Admin: `admin@cargill.com` / whatever you set for `ADMIN_PASSWORD`
  - Demo: `demo@investor.com` / whatever you set for `DEMO_PASSWORD`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Server port |
| `DATABASE_PATH` | `./data/platform.db` | SQLite file path |
| `JWT_SECRET` | *(required in prod)* | Signing key for auth tokens |
| `ADMIN_PASSWORD` | `AdminPass123!` | Admin user password |
| `DEMO_PASSWORD` | `DemoPass123!` | Demo user password |
| `GEMINI_API_KEY` | — | Gemini AI API key |
| `APP_URL` | `http://localhost:3000` | Used for CORS in dev |
