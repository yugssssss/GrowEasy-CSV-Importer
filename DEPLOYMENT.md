# Deployment Guide — Free Hosting

You'll host two things:

- **Backend (Express)** → **Render** (free web service)
- **Frontend (React/Vite)** → **Vercel** (free static hosting)

Deploy the **backend first**, because the frontend needs the backend's URL.

> This repo has `backend/` and `frontend/` as sibling folders in one GitHub repo.
> Both platforms let you pick a "root directory," so a single repo works fine.

---

## 0. Push to GitHub

```bash
cd groweasy-csv-importer
git init
git add .
git commit -m "GrowEasy AI CSV Importer"
git branch -M main
git remote add origin https://github.com/<your-username>/groweasy-csv-importer.git
git push -u origin main
```

Make sure the repo is **public** (the assignment asks for a public GitHub URL).
Your `.env` files are gitignored, so no secrets get pushed.

---

## 1. Backend on Render (free)

1. Go to **https://render.com** and sign up (GitHub login is easiest).
2. Click **New +  →  Web Service** and connect your repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Open **Environment** and add:
   - `OPENAI_API_KEY` = your key
   - `OPENAI_MODEL` = `gpt-4o-mini` (optional)
   - `CORS_ORIGIN` = `*` for now (tighten in step 3)
5. Click **Create Web Service**. Wait for the build to finish.
6. You'll get a URL like `https://groweasy-importer-api.onrender.com`.
   Verify it: open `https://<your-url>/api/health` — you should see
   `{"status":"ok", ...}`.

> **Free-tier note:** Render free services sleep after ~15 minutes idle, so the
> first request after a nap takes ~30–50s to wake. That's expected. For a live
> demo, hit the health URL once beforehand to warm it up.

**Alternative:** Railway (`https://railway.app`) works the same way — New
Project → Deploy from repo → set root to `backend`, add the same env vars,
start command `npm start`.

---

## 2. Frontend on Vercel (free)

1. Go to **https://vercel.com** and sign up (GitHub login).
2. **Add New…  →  Project**, import your repo.
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite` (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Add an **Environment Variable**:
   - `VITE_API_URL` = your Render backend URL, e.g.
     `https://groweasy-importer-api.onrender.com`
     *(no trailing slash)*
5. Click **Deploy**. You'll get a URL like
   `https://groweasy-importer.vercel.app`.

---

## 3. Lock down CORS (recommended)

Back in **Render → your service → Environment**, set:

```
CORS_ORIGIN = https://groweasy-importer.vercel.app
```

Save — Render redeploys automatically. Now only your frontend can call the API.

---

## 4. Final smoke test

1. Open your Vercel URL.
2. Drop `sample-data/real-estate-crm.csv`.
3. Confirm import.
4. You should see mapped CRM records, one skipped row (the walk-in with no
   contact), and the totals.

---

## What to email

Per the assignment, send to **varun@groweasy.ai**:

- **Hosted application URL:** your Vercel link
- **GitHub repository URL:** your public repo
- **Position applied for:** Intern *or* Full-Time

The `README.md` (setup instructions) is already in the repo. Done. 🎯
