# Vercel Deployment - Frontend Setup

Deploy the Speechify Learning Companion frontend to Vercel in ~5 minutes.

---

## Step 1: Sign up

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Sign up with **GitHub**

---

## Step 2: Import Project

1. Click **Add New...** → **Project**
2. Import `PMAIGURU2026/speechify-learning-companion` (or your fork)
3. Select branch (e.g. `main` or `backend`)

---

## Step 3: Configure Build

| Field | Value |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

## Step 4: Environment Variables

Add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend URL (e.g. `https://speechify-api.onrender.com`) |

---

## Step 5: Deploy

1. Click **Deploy**
2. Wait 1–2 minutes
3. App live at `https://your-project.vercel.app`

---

## Redeploy

Push to the connected branch to auto-redeploy.
