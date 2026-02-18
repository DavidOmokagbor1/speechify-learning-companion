# Speechify Learning Companion

Transform passive audio learning into active learning with AI-powered comprehension quizzes.

## About

A Speechify clone with **Learning Companion Mode**: AI-generated comprehension questions during listening, retention tracking, and analytics dashboard.

## Project Structure

```
├── client/          # Frontend (React, Vite, Tailwind)
├── server/          # Backend API (Node.js, Express, PostgreSQL)
├── supabase/        # Database migrations
└── docs/            # MoSCoW, Value/Effort, schema docs
```

## Backend Setup

### Prerequisites

- Node.js 18+
- Supabase account (or PostgreSQL)
- npm

### 1. Install & configure

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
- `DATABASE_URL` — PostgreSQL connection string (Supabase: Project Settings > Database)
- `JWT_SECRET` — Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `PORT` — Default: 3001

**Password with special chars?** URL-encode in `DATABASE_URL`: `!` → `%21`

**Connection pooler (Supabase):** Use Session pooler if direct fails:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. Run migrations

In Supabase SQL Editor, run:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_triggers_and_audit.sql`

### 3. Start server

```bash
cd server
npm run dev
```

API: **http://localhost:3001**

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/` | — |
| GET | `/api/health` | — |
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | Bearer |
| POST | `/api/sessions` | Bearer |
| GET | `/api/sessions` | Bearer |
| GET | `/api/sessions/:id` | Bearer |
| POST | `/api/quiz/attempt` | Bearer |
| GET | `/api/quiz/attempts/:sessionId` | Bearer |
| GET | `/api/analytics/dashboard` | Bearer |
| GET | `/api/analytics/score-trends` | Bearer |

See [server/README.md](server/README.md) for full API docs.

## Quick Test

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
```

## Frontend (client/)

```bash
cd client
npm install
npm run dev
```

Runs at **http://localhost:5173** (proxies `/api` to backend).

Set `VITE_API_URL` in `client/.env` for production (backend URL).

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL (Supabase), JWT, bcrypt, OpenAI
- **Frontend:** React, Vite, Tailwind, Web Speech API, Recharts

## Team

- **David O:** Database, API, analytics, docs
- **Nefera:** Frontend, OpenAI integration, audio player
