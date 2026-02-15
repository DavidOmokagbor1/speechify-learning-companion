# Database Schema

**Speechify Learning Companion**

*David O | Pursuit AI Fellowship*

---

## Entity Relationship

```
users (1) ──────< (many) listening_sessions
                        │
                        └──────< (many) quiz_attempts
```

---

## Tables

### users

| Column | Type | Constraints |
|--------|------|--------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| subscription_tier | VARCHAR(20) | DEFAULT 'free' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** `idx_users_email` (UNIQUE on email)

---

### listening_sessions

| Column | Type | Constraints |
|--------|------|--------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL |
| content_text | TEXT | NOT NULL |
| content_title | VARCHAR(255) | |
| total_duration_seconds | INTEGER | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** `idx_sessions_user_id`, `idx_sessions_created_at`

---

### quiz_attempts

| Column | Type | Constraints |
|--------|------|--------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| session_id | UUID | FOREIGN KEY → listening_sessions.id, NOT NULL |
| question | TEXT | NOT NULL |
| options | JSONB | NOT NULL — `{"A":"...","B":"...","C":"...","D":"..."}` |
| user_answer | CHAR(1) | NOT NULL |
| correct_answer | CHAR(1) | NOT NULL |
| is_correct | BOOLEAN | NOT NULL |
| timestamp | TIMESTAMPTZ | When quiz was shown |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** `idx_quiz_session_id`, `idx_quiz_created_at`

---

## Row Level Security (Supabase)

- `users`: Users can read/update only their own row
- `listening_sessions`: Users can CRUD only their own sessions
- `quiz_attempts`: Users can read/write only via their sessions
