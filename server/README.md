# Speechify Learning Companion - Backend API

Backend for the Speechify Learning Companion: auth, sessions, quiz tracking, and retention analytics.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT, bcrypt

## Prerequisites

- Node.js 18 or higher
- Supabase account (or any PostgreSQL database)
- npm

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (from Supabase Dashboard > Project Settings > Database) |
| `OPENAI_API_KEY` | OpenAI API key for quiz generation (get from platform.openai.com) |
| `JWT_SECRET` | Random string for signing JWTs (min 32 chars). Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | Server port (default: 3001) |

**Password URL encoding:** If your database password has special characters (`!`, `@`, `#`, etc.), URL-encode them in `DATABASE_URL`:
- `!` → `%21`
- `@` → `%40`

**Connection pooler (Supabase):** If the direct connection fails, use the Session pooler URL from Supabase:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### 3. Database migration

Run the SQL migrations in Supabase SQL Editor (or your PostgreSQL client):

1. `supabase/migrations/001_initial_schema.sql` — users, listening_sessions, quiz_attempts
2. `supabase/migrations/002_triggers_and_audit.sql` — triggers and audit table

## Running the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at **http://localhost:3001**

## API Endpoints

### Health
- `GET /` — API info
- `GET /api/health` — Health check

### Auth (no token required)
- `POST /api/auth/register` — Register user. Body: `{ "email": "...", "password": "..." }`
- `POST /api/auth/login` — Login. Body: `{ "email": "...", "password": "..." }`

### Auth (token required)
- `GET /api/auth/me` — Current user. Header: `Authorization: Bearer <token>`

### Sessions (token required)
- `POST /api/sessions` — Create session. Body: `{ "content_text": "...", "content_title": "...", "total_duration_seconds": 300 }`
- `GET /api/sessions` — List sessions (query: `?limit=20&offset=0`)
- `GET /api/sessions/:id` — Get single session

### Quiz (token required)
- `POST /api/quiz/generate` — Generate quiz question from content. Body: `{ "content": "text chunk from last 5 min of listening" }`. Returns `{ question, options: { A, B, C, D }, correct_answer }`. Requires `OPENAI_API_KEY` in env.
- `POST /api/quiz/attempt` — Save quiz attempt. Body: `{ "session_id": "...", "question": "...", "options": {...}, "user_answer": "A", "correct_answer": "A", "is_correct": true }`
- `GET /api/quiz/attempts/:sessionId` — List attempts for session

### Analytics (token required)
- `GET /api/analytics/dashboard` — Total quizzes, avg score, streak
- `GET /api/analytics/score-trends` — Last 7 sessions with scores

## Project structure

```
server/
├── index.js          # Entry point
├── db/               # Database connection
├── middleware/       # Auth middleware
├── routes/           # API routes
│   ├── auth.js
│   ├── sessions.js
│   ├── quiz.js
│   └── analytics.js
├── .env.example
└── package.json
```

## Quick test

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
```
