# TaskProof — Verified Micro-Task Marketplace

A hackathon prototype demonstrating a two-sided marketplace where **businesses** post micro-tasks and **contributors** complete them for verifiable on-chain rewards.

---

## Architecture

```
Browser
  ↓
Render Static Site  (React/Vite — dist/)
  ↓ /api/* rewrite
Render Web Service  (FastAPI — backend/)
  ↓
SQLite  (backend/taskproof.db — ephemeral on Render free tier)
```

---

## Demo Accounts

| Role        | Email                    | How to log in               |
|-------------|--------------------------|------------------------------|
| Contributor | `parth@taskproof.dev`    | Click **"Try as Contributor"** on Sign Up |
| Business    | `admin@techcorp.com`     | Click **"Try as Business"** on Sign Up |

No password required — these are demo accounts that auto-login.

---

## Local Development

### Prerequisites

- **Node.js** `v24.20.0` (see `.node-version`)
- **Python** `3.12` or `3.14`

### 1. Backend

```powershell
cd backend

# Create virtual environment
py -m venv .venv

# Activate
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the server (tables created + demo data seeded automatically)
uvicorn app.main:app --reload --port 8000
```

Backend is available at:
- **API Docs**: http://127.0.0.1:8000/docs
- **Health check**: http://127.0.0.1:8000/health
- **API prefix**: http://127.0.0.1:8000/api/...

### 2. Frontend

```powershell
# In a separate terminal, from the repository root:
npm install
npm run dev
```

Frontend is available at: http://localhost:5173

### 3. Environment Variables (local)

The local `.env` file is created automatically by this setup:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

See `.env.example` for all documented options.

---

## Render Deployment

### Overview

Two free Render services are deployed from this single repository:

| Service | Type | Root Dir | Build | Start |
|---------|------|----------|-------|-------|
| `taskproof-backend` | Web Service (Python) | `backend/` | `pip install -r requirements.txt` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| `taskproof-frontend` | Static Site | `.` (root) | `npm ci && npm run build` | N/A |

### Step-by-Step Render Deployment

#### Step 1 — Deploy the Backend

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
   - **Plan**: Free
4. Click **Create Web Service**
5. Wait for deployment. Note the backend URL, e.g.:
   ```
   https://taskproof-backend.onrender.com
   ```

#### Step 2 — Deploy the Frontend

1. Go to **New → Static Site**
2. Connect the same GitHub repository
3. Configure:
   - **Root Directory**: *(leave blank — repository root)*
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free
4. Add **Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `/api`
5. Add **Rewrite Rule**:
   - Source: `/api/*`
   - Destination: `https://taskproof-backend.onrender.com/api/*`
   - Action: **Rewrite**
6. Add another **Rewrite Rule** (SPA fallback — must be AFTER the API rule):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**
7. Click **Create Static Site**
8. Note the frontend URL, e.g.:
   ```
   https://taskproof-frontend.onrender.com
   ```

#### Step 3 — Set CORS on the Backend

1. Go back to your **backend** Web Service on Render
2. **Environment → Add Environment Variable**:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://taskproof-frontend.onrender.com`
3. Click **Save** — Render will redeploy the backend automatically

---

## Environment Variables

### Frontend (Vite — prefix `VITE_`)

| Variable | Local | Production |
|----------|-------|------------|
| `VITE_API_URL` | `http://127.0.0.1:8000/api` | `/api` |

### Backend (FastAPI)

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:5173 http://127.0.0.1:5173 http://localhost:4173` | Space-separated list of allowed CORS origins |
| `DATABASE_URL` | `sqlite:///backend/taskproof.db` | Override SQLite path |
| `PORT` | *(injected by Render)* | Listening port |

---

## SPA Routing

This application uses **React Router** for client-side routing.

Render Static Site must serve `index.html` for all frontend routes, **except** `/api/*` which gets proxied to the backend.

Rewrite rule order matters:

```
1.  /api/*  → https://<backend>.onrender.com/api/*  (Rewrite — proxy to FastAPI)
2.  /*      → /index.html                            (Rewrite — SPA fallback)
```

The API rule must come **first** so API requests are not swallowed by the SPA fallback.

---

## API Architecture

```
Frontend (React)
  └── src/services/apiClient.ts
        └── API_BASE = import.meta.env.VITE_API_URL
              Local:      http://127.0.0.1:8000/api
              Production: /api  (resolved via Render rewrite to FastAPI)
```

All API calls go through `apiClient.ts`. No hardcoded `localhost` URLs in production code.

---

## SQLite Limitation

> [!WARNING]
> Render's free tier uses an **ephemeral filesystem**. SQLite data is lost whenever:
> - The service is redeployed
> - The instance spins down (after ~15 min of inactivity) and restarts
> - Render performs infrastructure maintenance

**This is acceptable for the hackathon prototype.** On every cold start, the backend automatically:
1. Creates all tables (`init_db`)
2. Detects whether demo data exists (`SELECT` on `users`)
3. Seeds demo records if the database is empty

The judge can always log in with the demo accounts immediately after any restart.

For production use, migrate to [Render PostgreSQL](https://render.com/docs/databases) or a managed SQLite solution.

---

## Database & Seeding

**Seed is idempotent** — it checks for `user-contributor-demo` before inserting. Re-running is always safe.

**What is seeded:**
- 2 demo users (contributor + business)
- Contributor profile, badges, XP
- 5 leaderboard users
- Business profile
- 8 tasks (various categories and difficulties)
- Contributor + business wallets with realistic balances
- Historical transactions and reward proofs
- 6 submissions in various states (rewarded, under review, rejected)

**Manual re-seed** (if needed):
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m app.db.seed
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run build` | TypeScript compile + Vite production bundle |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview the production build locally |
| `uvicorn app.main:app --reload` | Start FastAPI dev server (from `backend/`) |
| `python -m app.db.seed` | Manually seed demo data (from `backend/`) |

---

## Troubleshooting

### "Demo contributor not found" / "Demo business not found"

The seed has not run. This should not happen with auto-seed, but if it does:
```powershell
cd backend && python -m app.db.seed
```

### Frontend shows network errors in production

1. Verify the `/api/*` rewrite rule points to your **actual** backend Render URL
2. Verify `VITE_API_URL=/api` is set on the frontend Static Site
3. Verify `ALLOWED_ORIGINS` on the backend includes the frontend URL
4. Check the backend service is **live** (free tier spins down — first request may take ~30s)

### CORS error in browser console

`ALLOWED_ORIGINS` on the backend does not include the frontend origin. Update the environment variable in the Render backend Dashboard and redeploy.

### Backend returns 500 on startup

Check Render logs. Usually a missing dependency. Run `pip install -r backend/requirements.txt` locally to verify.

### Vite build fails on Render

Ensure `VITE_API_URL=/api` is set as a **Static Site environment variable** (not just locally). Vite bakes `import.meta.env.*` into the bundle at build time.
