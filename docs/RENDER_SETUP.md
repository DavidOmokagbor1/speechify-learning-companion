# Render Deployment - Easy Setup

Deploy the Speechify Learning Companion backend to Render in ~5 minutes.

---

## Step 1: Sign up

1. Go to [render.com](https://render.com)
2. Click **Get Started**
3. Sign up with **GitHub** (easiest)

---

## Step 2: Create Web Service

1. Click **New +** → **Web Service**
2. Connect your repo:
   - If using your **fork**: Select `YOUR-USERNAME/speechify-learning-companion`
   - If using **original**: Select `PMAIGURU2026/speechify-learning-companion`
3. Click **Connect**

---

## Step 3: Configure

| Field | Value |
|-------|-------|
| **Name** | `speechify-api` (or any name) |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && npm start` |
| **Instance Type** | **Free** |

---

## Step 4: Environment Variables

Click **Advanced** → **Add Environment Variable**

Add these 3 variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase pooler URL (from `.env`) |
| `JWT_SECRET` | Your JWT secret (from `.env`) |
| `NODE_ENV` | `production` |

Copy from your `server/.env` file. Do NOT commit `.env` — only add in Render dashboard.

---

## Step 5: Deploy

1. Click **Create Web Service**
2. Wait 2–3 minutes for build
3. When you see **Live**, your API is deployed

---

## Your API URL

After deploy, you'll get a URL like:

```
https://speechify-api.onrender.com
```

Test it:
```bash
curl https://speechify-api.onrender.com/api/health
```

---

## Quick Reference

| What | Where |
|------|-------|
| Build logs | Render Dashboard → Your service → Logs |
| Env vars | Render Dashboard → Your service → Environment |
| Redeploy | Push to `backend` branch (auto-deploys if connected) |

---

## Free Tier Note

- Service sleeps after ~15 min of no traffic
- First request after sleep may take 30–60 seconds (cold start)
- 750 hours/month free
