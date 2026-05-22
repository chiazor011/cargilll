# Render Deployment Guide

This app is packaged as a single service: the Vite frontend is built into `dist/`, and the Express server serves those static files while also running the SQLite-backed API.

## Quick Deploy (Render Blueprint)

1. Push this repo to GitHub.
2. In the Render dashboard, click **New +** → **Blueprint**.
3. Connect your GitHub repo.
4. Render will read `render.yaml` and create the web service automatically.
5. **Important:** After the service is created, go to the service's **Environment** tab and set the secret values that were marked `sync: false` in `render.yaml`:
   - `SMTP_PASS` — your Gmail App Password
   - `OLLAMA_API_KEY` — your Ollama Cloud API key
   - `GEMINI_API_KEY` — your Gemini API key (optional)
6. Redeploy after adding the secrets.

## Manual Deploy (New Web Service)

If you prefer not to use the Blueprint:

1. Click **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Set the following:
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables (see full list below).
5. Click **Create Web Service**.

## Environment Variables (Required)

| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Server port |
| `DATABASE_PATH` | `/opt/render/project/src/data/platform.db` | SQLite file path |
| `JWT_SECRET` | *(generate a random string)* | Signing key for auth tokens |
| `ADMIN_PASSWORD` | `AdminPass123!` | Admin user password |
| `DEMO_PASSWORD` | `DemoPass123!` | Demo user password |
| `APP_URL` | `https://cargill-institutional.onrender.com` | Your Render app URL |

## Environment Variables (SMTP Emails)

| Variable | Value | Description |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_USER` | `cargillinvestmentsstake@gmail.com` | Your Gmail address |
| `SMTP_PASS` | *(your Gmail App Password)* | **Secret — add in Render dashboard** |
| `FROM_EMAIL` | `cargillinvestmentsstake@gmail.com` | Sender email address |

## Environment Variables (Ollama Cloud Chatbot)

| Variable | Value | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `https://ollama.com` | Ollama Cloud base URL |
| `OLLAMA_API_KEY` | *(your API key)* | **Secret — add in Render dashboard** |
| `OLLAMA_MODEL` | `ministral-3:3b` | Model to use |

## Environment Variables (Optional)

| Variable | Value | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(your key)* | Gemini AI API key |

## Important Notes

- **Single service:** The Express server (`server/server.ts`) serves the built React app from `dist/` and handles `/api/*` routes. No separate frontend server is needed.
- **SQLite persistence:** On the **free plan**, the filesystem is ephemeral. The database will be recreated from seeds on every deploy and after the service spins down. To keep data across restarts, upgrade to a paid plan and uncomment the `disk` block in `render.yaml`.
- **Health check:** The server exposes `/api/health` for uptime monitoring.
- **Default logins:**
  - Admin: `admin@cargill.com` / whatever you set for `ADMIN_PASSWORD`
  - Demo: `demo@investor.com` / whatever you set for `DEMO_PASSWORD`

## Step-by-Step Checklist

1. `git add . && git commit -m "Add email, support, chatbot, tier restructure"`
2. `git push origin master`
3. Go to [dashboard.render.com](https://dashboard.render.com)
4. Click **New +** → **Blueprint**
5. Select your repo
6. After the service deploys, go to the service → **Environment** tab
7. Add these secrets:
   - `SMTP_PASS` = `ndtrcflixwcguior` (your Gmail App Password)
   - `OLLAMA_API_KEY` = `1cfdec06eb3d4e62adc5a824493be9b3.BNDqR7oK4ILQeEXYfwrMkpLb`
8. Click **Manual Deploy** → **Deploy latest commit**
