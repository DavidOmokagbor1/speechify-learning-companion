# Speechify Learning Companion - Frontend

React frontend with TTS, quiz flow, and retention dashboard.

## Setup

```bash
cd client
npm install
```

## Run locally

```bash
npm run dev
```

Runs at **http://localhost:5173**. Proxies `/api` to `http://localhost:3001` (start the backend first).

## Environment

Create `client/.env`:

```
VITE_API_URL=
```

Leave empty for local dev (uses proxy). For production, set to your backend URL (e.g. `https://speechify-api.onrender.com`).

## Features

- Auth (login, register)
- Text paste + TTS (Web Speech API)
- Quiz every 5 min during playback (no skip)
- Retention dashboard with score trends
