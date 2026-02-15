# Technical Notes - Speechify Learning Companion

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Component Structure](#component-structure)
6. [Development Setup](#development-setup)
7. [Environment Variables](#environment-variables)
8. [Authentication Flow](#authentication-flow)
9. [State Management](#state-management)
10. [Testing Strategy](#testing-strategy)
11. [Deployment](#deployment)
12. [Known Issues & Solutions](#known-issues--solutions)
13. [Performance Considerations](#performance-considerations)

---

## Project Overview

**Speechify Learning Companion** is an AI-powered educational platform that combines audio playback with interactive comprehension quizzes to enhance learning efficiency and retention. The platform uses Web Speech API for text-to-speech (TTS) synthesis and provides real-time analytics on user learning patterns.

### Key Features
- 📱 **Audio Playback**: Web Speech API-powered TTS with multiple voice options
- 🎯 **Interactive Quizzes**: Automatic quiz generation every 5 minutes during learning sessions
- 📊 **Learning Analytics**: Real-time dashboard with performance metrics and trend analysis
- 🔐 **JWT Authentication**: Secure token-based authentication with automatic refresh
- 💾 **Data Persistence**: PostgreSQL/Supabase for robust data storage
- 🎨 **Responsive Design**: Mobile-first UI built with Tailwind CSS
- ⚡ **Fast Performance**: Vite bundler with HMR (Hot Module Reloading)

### Tech Stack Summary
- **Frontend**: React 18.3.1, Vite 5.0.8, Tailwind CSS 3.4.1
- **Backend**: Node.js/Express (David's segment)
- **Database**: PostgreSQL (Supabase)
- **HTTP Client**: Axios with JWT interceptors
- **State Management**: Zustand 4.4.1
- **Charts**: Recharts 2.10.3
- **Deployment**: Vercel (frontend), Render.com/Railway (backend)

---

## Architecture

### Frontend Architecture

```
src/
├── components/
│   ├── AudioPlayer.jsx       (Web Speech API integration, highlighting)
│   ├── QuizModal.jsx         (Quiz display & submission)
│   ├── Dashboard.jsx         (Analytics & performance insights)
│   └── [Additional components]
├── pages/
│   ├── LearnPage.jsx         (Main learning interface)
│   ├── DashboardPage.jsx     (Analytics dashboard)
│   └── [Auth pages]
├── utils/
│   ├── api.js                (Axios client with JWT interceptors)
│   ├── auth.js               (Token management, user extraction)
│   └── formatters.js         (Data formatting utilities)
├── config/
│   └── constants.js          (API endpoints, config, feature flags)
├── styles/
│   └── index.css             (Global Tailwind directives & animations)
├── App.jsx                   (Main router & app logic)
├── main.jsx                  (React entry point)
└── index.html                (HTML template)
```

### Backend Architecture (David's Segment)

```
backend/
├── src/
│   ├── middleware/
│   │   ├── auth.js           (JWT verification)
│   │   └── errorHandler.js   (Global error handling)
│   ├── routes/
│   │   ├── auth.js           (Login, signup, refresh)
│   │   ├── users.js          (Profile, settings)
│   │   ├── learning.js       (Text upload, retrieval)
│   │   ├── quizzes.js        (Quiz submission, history)
│   │   └── subscriptions.js  (Plan management)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── quizController.js
│   │   └── [Other controllers]
│   ├── models/
│   │   ├── User.js
│   │   ├── Text.js
│   │   ├── Quiz.js
│   │   ├── Subscription.js
│   │   └── [Other models]
│   ├── db/
│   │   └── connection.js     (PostgreSQL/Supabase connection)
│   └── server.js             (Express app setup)
└── package.json
```

### Data Flow Diagram

```
User Interface (React Components)
        ↓
State Management (Zustand)
        ↓
HTTP Client (Axios with JWT)
        ↓
Express API Server
        ↓
Database (PostgreSQL/Supabase)
        ↓
Business Logic (Controllers)
        ↓
Response back through middleware & interceptors
```

---

## Database Schema

### PostgreSQL Schema (Supabase)

#### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'premium'
  daily_streak INT DEFAULT 0,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
```

#### 2. Texts Table (Uploaded Learning Materials)
```sql
CREATE TABLE texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  word_count INT,
  estimated_reading_time INT, -- in minutes
  language VARCHAR(10) DEFAULT 'en',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_texts_user_id ON texts(user_id);
CREATE INDEX idx_texts_created_at ON texts(created_at);
```

#### 3. Quizzes Table
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  question VARCHAR(500) NOT NULL,
  options JSONB, -- ['Option A', 'Option B', 'Option C', 'Option D']
  correct_answer VARCHAR(1), -- 'A', 'B', 'C', or 'D'
  explanation TEXT,
  difficulty_level VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quizzes_text_id ON quizzes(text_id);
CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty_level);
```

#### 4. Quiz Submissions Table (User Responses)
```sql
CREATE TABLE quiz_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_answer VARCHAR(1), -- 'A', 'B', 'C', 'D', or NULL for skip
  is_correct BOOLEAN,
  time_spent INT, -- seconds
  session_id VARCHAR(255), -- Group submissions by learning session
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_submissions_user_id ON quiz_submissions(user_id);
CREATE INDEX idx_quiz_submissions_quiz_id ON quiz_submissions(quiz_id);
CREATE INDEX idx_quiz_submissions_session_id ON quiz_submissions(session_id);
```

#### 5. Learning Sessions Table
```sql
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  duration_seconds INT,
  total_quizzes INT,
  correct_answers INT,
  accuracy_percentage DECIMAL(5,2),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_sessions_created_at ON learning_sessions(started_at);
```

#### 6. Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'premium'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### 7. User Preferences Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_speech_rate DECIMAL(2,2) DEFAULT 1.0, -- 0.5 to 2.0
  default_voice VARCHAR(255),
  default_volume DECIMAL(3,2) DEFAULT 1.0,
  quiz_frequency INT DEFAULT 300, -- seconds (5 minutes)
  auto_play_next BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

---

## API Endpoints

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.speechify.app/api`

### Authentication Endpoints

#### POST `/auth/signup`
Register new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

**Status Codes:**
- 201: User created
- 400: Invalid input
- 409: Email already exists

---

#### POST `/auth/login`
Authenticate user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "subscriptionTier": "pro"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

**Status Codes:**
- 200: Login successful
- 400: Invalid credentials
- 404: User not found

---

#### POST `/auth/refresh`
Refresh JWT access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh-token-value"
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

**Status Codes:**
- 200: Token refreshed
- 401: Invalid refresh token
- 403: Refresh token expired

---

#### POST `/auth/logout`
Invalidate user session (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### User Endpoints

#### GET `/users/profile`
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://...",
    "subscriptionTier": "pro",
    "dailyStreak": 12,
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

---

#### PUT `/users/profile`
Update user profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Jane Doe",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": { /* updated user object */ }
}
```

---

#### GET `/users/settings`
Get user preferences and settings.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "defaultSpeechRate": 1.0,
    "defaultVoice": "Google UK English Female",
    "defaultVolume": 1.0,
    "quizFrequency": 300,
    "autoPlayNext": true,
    "emailNotifications": true,
    "darkMode": false,
    "language": "en"
  }
}
```

---

### Learning Endpoints

#### POST `/learning/upload`
Upload or paste text for learning.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Solar System Overview",
  "content": "The solar system consists of...",
  "language": "en"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Text uploaded successfully",
  "data": {
    "id": "uuid",
    "title": "Solar System Overview",
    "wordCount": 245,
    "estimatedReadingTime": 2,
    "createdAt": "2026-02-15T10:00:00Z"
  }
}
```

**Status Codes:**
- 201: Text uploaded
- 400: Invalid input
- 413: Text too long
- 429: Upload limit reached (free tier)

---

#### GET `/learning`
Get all uploaded texts for current user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
```
?page=1&limit=20&sortBy=createdAt&order=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "texts": [
      {
        "id": "uuid",
        "title": "Solar System",
        "wordCount": 245,
        "estimatedReadingTime": 2,
        "createdAt": "2026-02-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

---

#### GET `/learning/:id`
Get specific text content.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Solar System Overview",
    "content": "The solar system consists of...",
    "wordCount": 245,
    "language": "en",
    "createdAt": "2026-02-15T10:00:00Z"
  }
}
```

---

#### DELETE `/learning/:id`
Delete uploaded text.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Text deleted successfully"
}
```

---

### Quiz Endpoints

#### GET `/quizzes/:textId`
Get quizzes for a specific text (returns 1 quiz at a time).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": "C",
    "explanation": "Paris is the capital of France...",
    "difficultyLevel": "easy"
  }
}
```

---

#### POST `/quizzes/submit`
Submit quiz answer and record response.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "quizId": "uuid",
  "userAnswer": "C",
  "timeSpent": 15,
  "sessionId": "session-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz submitted",
  "data": {
    "isCorrect": true,
    "correctAnswer": "C",
    "explanation": "Paris is the capital of France...",
    "pointsEarned": 10,
    "accuracy": 87.5
  }
}
```

**Status Codes:**
- 200: Quiz submitted
- 400: Invalid quiz or answer
- 404: Quiz not found

---

#### GET `/quizzes/history`
Get user's quiz submission history.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
```
?page=1&limit=20&sessionId=optional-session-id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "question": "What is the capital of France?",
        "userAnswer": "C",
        "correctAnswer": "C",
        "isCorrect": true,
        "timeSpent": 15,
        "submittedAt": "2026-02-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156
    }
  }
}
```

---

#### GET `/quizzes/stats`
Get user's quiz statistics and accuracy.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalQuizzes": 156,
    "correctAnswers": 136,
    "accuracy": 87.18,
    "averageTimePerQuiz": 18,
    "sevenDayTrend": [
      { "session": "1", "accuracy": 72 },
      { "session": "2", "accuracy": 75 },
      { "session": "3", "accuracy": 78 },
      { "session": "4", "accuracy": 85 },
      { "session": "5", "accuracy": 88 },
      { "session": "6", "accuracy": 86 },
      { "session": "7", "accuracy": 92 }
    ],
    "sessionData": [
      {
        "sessionId": "uuid",
        "date": "2026-02-15",
        "duration": 1200,
        "quizzesCompleted": 24,
        "accuracy": 89.3
      }
    ]
  }
}
```

---

### Dashboard Endpoints

#### GET `/dashboard`
Get all dashboard data for current user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalQuizzes": 156,
      "averageScore": 87.5,
      "dailyStreak": 12,
      "subscriptionTier": "Premium"
    },
    "trendData": [
      { "session": "1", "accuracy": 72 },
      { "session": "2", "accuracy": 75 },
      ...
    ],
    "insights": [
      {
        "title": "Focus on Definitions",
        "description": "You're stronger with comprehension questions..."
      }
    ]
  }
}
```

---

### Subscription Endpoints

#### GET `/subscriptions/plans`
Get available subscription plans (public endpoint).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "free",
        "name": "Free",
        "price": 0,
        "duration": "forever",
        "features": [...]
      },
      {
        "id": "pro",
        "name": "Pro",
        "price": 9.99,
        "duration": "month",
        "features": [...]
      },
      {
        "id": "premium",
        "name": "Premium",
        "price": 19.99,
        "duration": "month",
        "features": [...]
      }
    ]
  }
}
```

---

#### GET `/subscriptions/current`
Get current user's subscription details.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "planType": "Premium",
    "status": "active",
    "currentPeriodStart": "2026-01-15T00:00:00Z",
    "currentPeriodEnd": "2026-02-15T00:00:00Z",
    "autoRenew": true,
    "nextBillingDate": "2026-02-15T00:00:00Z"
  }
}
```

---

#### POST `/subscriptions/upgrade`
Upgrade subscription plan.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "newPlan": "premium",
  "paymentMethodId": "pm_stripe_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription upgraded",
  "data": {
    "planType": "Premium",
    "currentPeriodEnd": "2026-03-15T00:00:00Z"
  }
}
```

---

## Component Structure

### AudioPlayer Component

**Location**: `src/components/AudioPlayer.jsx`

**Props:**
```javascript
{
  text: string,              // Text to be read aloud
  onQuizTrigger: function,  // Callback when quiz should appear
  onComplete: function      // Callback when audio finishes
}
```

**Features:**
- Web Speech API integration for TTS
- Real-time word highlighting synchronized to speech
- Play/pause/skip controls
- Speed adjustment (0.5x - 2x)
- Voice selection (4 system voices)
- Volume control
- Progress bar with time display
- Quiz trigger every 5 minutes (300 seconds)

**State:**
```javascript
const [isPlaying, setIsPlaying] = useState(false);
const [currentWord, setCurrentWord] = useState('');
const [elapsedTime, setElapsedTime] = useState(0);
const [selectedVoice, setSelectedVoice] = useState('Google UK English Female');
const [speechRate, setSpeechRate] = useState(1);
const [volume, setVolume] = useState(1);
```

**Key Methods:**
- `togglePlayPause()` - Play/pause audio
- `handleSpeedChange(rate)` - Change playback speed
- `skipToTime(seconds)` - Skip forward/backward
- `highlightCurrentWord()` - Update highlighted word based on character position
- `triggerQuiz()` - Fire quiz at 5-minute intervals

---

### QuizModal Component

**Location**: `src/components/QuizModal.jsx`

**Props:**
```javascript
{
  quiz: {
    question: string,
    options: string[],
    correctAnswer: string,
    explanation: string
  },
  onSubmit: function,      // (result) => void
  onSkip: function,        // () => void
  isOpen: boolean
}
```

**Features:**
- Display question and 4 multiple-choice options
- Visual feedback (green for correct, red for incorrect)
- Show explanation after selection
- Auto-dismiss after 10 seconds
- Manual continue button

**State:**
```javascript
const [selectedAnswer, setSelectedAnswer] = useState(null);
const [showFeedback, setShowFeedback] = useState(false);
const [isCorrect, setIsCorrect] = useState(false);
const [timeRemaining, setTimeRemaining] = useState(10);
```

---

### Dashboard Component

**Location**: `src/components/Dashboard.jsx`

**Props:**
```javascript
{
  userId: string,
  isLoading: boolean,
  stats: {
    totalQuizzes: number,
    averageScore: number,
    dailyStreak: number,
    subscriptionTier: string,
    trendData: array,
    insights: array
  }
}
```

**Features:**
- 4 stats cards (total quizzes, avg score, streak, tier)
- Recharts line chart for 7-session accuracy trend
- Performance insights with actionable tips
- Premium upgrade prompts
- Responsive grid layout

---

## Development Setup

### Prerequisites
- Node.js v16.0.0+
- npm v8.0.0+
- Git
- PostgreSQL 13+ (or Supabase account)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PMAIGURU2026/speechify-learning-companion.git
cd speechify-learning-companion
```

2. **Switch to frontend branch**
```bash
git checkout feature/frontend-v1
```

3. **Install dependencies**
```bash
npm install
```

4. **Setup environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

5. **Start development server**
```bash
npm run dev
```

Server runs at `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

---

## Environment Variables

### Frontend (.env.local)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# TTS Settings
VITE_DEFAULT_SPEECH_RATE=1
VITE_DEFAULT_SPEECH_PITCH=1
VITE_DEFAULT_SPEECH_VOLUME=1

# Quiz Configuration
VITE_QUIZ_TRIGGER_INTERVAL=300000  # 5 minutes in ms
VITE_QUIZ_AUTO_DISMISS_TIME=10000  # 10 seconds in ms

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_BETA_FEATURES=false

# Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

### Backend (.env - David's segment)

```env
# Server
PORT=3001
NODE_ENV=development
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/speechify
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Cors
CORS_ORIGIN=http://localhost:5173,https://speechify.app
```

---

## Authentication Flow

### JWT Token Structure

**Access Token Payload:**
```json
{
  "sub": "user-id-uuid",
  "id": "user-id-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "tier": "pro",
  "iat": 1707978000,
  "exp": 1707981600
}
```

**Token Lifecycle:**
1. User logs in with email/password
2. Server returns `accessToken` (15 min expiry) and `refreshToken` (7 day expiry)
3. Client stores tokens in localStorage
4. Every request includes token in Authorization header: `Bearer <token>`
5. When access token expires, use refresh token to get new access token
6. If refresh token also expired, redirect to login

### Request Interceptor Flow

```
1. User makes API request
   ↓
2. Request interceptor adds JWT to headers
   ↓
3. Server validates token
   ↓
4. If valid: Process request
   If invalid (401): Response interceptor triggers
   ↓
5. Response interceptor attempts token refresh
   ↓
6. If refresh succeeds: Retry original request with new token
   If refresh fails: Redirect to login
```

### Token Refresh Implementation

```javascript
// In api.js
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt refresh
      const refreshToken = localStorage.getItem('refreshToken');
      const newTokens = await axios.post('/auth/refresh', { refreshToken });
      
      // Store new tokens
      localStorage.setItem('accessToken', newTokens.data.accessToken);
      
      // Retry original request
      return client(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

---

## State Management

### Using Zustand

**Why Zustand?**
- Lightweight (2KB vs Redux 40KB)
- No boilerplate
- Doesn't require context wrappers
- Built-in persistence
- Perfect for mid-size apps

### Example Store

```javascript
// src/store/authStore.js
import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      
      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        set({ 
          user: response.data.user,
          tokens: { 
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
          }
        });
      },
      
      logout: () => set({ user: null, tokens: null }),
    }),
    {
      name: 'auth-store', // persisted to localStorage
    }
  )
);
```

### Usage in Components

```javascript
// In any component
const { user, login, logout } = useAuthStore();

// Automatic persistence to localStorage
// State persists across page reloads
```

---

## Testing Strategy

### Frontend Testing

#### Unit Tests (components)
```bash
npm install --save-dev vitest @testing-library/react
```

**Test Example:**
```javascript
// AudioPlayer.test.jsx
import { render, screen } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';

describe('AudioPlayer', () => {
  it('renders play button', () => {
    render(<AudioPlayer text="Hello world" />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
  
  it('triggers quiz after 5 minutes', async () => {
    const onQuizTrigger = vi.fn();
    render(<AudioPlayer text="Test" onQuizTrigger={onQuizTrigger} />);
    
    // Simulate 5 minutes passing
    vi.advanceTimersByTime(300000);
    
    expect(onQuizTrigger).toHaveBeenCalled();
  });
});
```

#### Integration Tests
```bash
npm install --save-dev cypress
```

**Test Scenarios:**
1. User signup → Login → Upload text → Play audio → Answer quiz
2. Quiz submission → Score update → Dashboard refresh
3. Token refresh → API call with new token
4. Error handling → Retry logic

#### E2E Tests (Cypress)
```javascript
// cypress/e2e/learning.cy.js
describe('Learning Flow', () => {
  it('completes a full learning session', () => {
    cy.visit('http://localhost:5173');
    cy.get('button').contains('Continue as Demo User').click();
    cy.get('textarea').type('Sample learning text...');
    cy.get('button').contains('Start Learning').click();
    cy.get('button').contains('Play').click();
    cy.wait(5000);
    cy.get('[role="dialog"]').should('be.visible');
  });
});
```

### Backend Testing (David's segment)

```bash
npm install --save-dev jest supertest
```

**API Endpoint Tests:**
```javascript
describe('POST /auth/login', () => {
  it('returns tokens on valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
  });
  
  it('returns 400 on invalid email', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'invalid', password: 'Password123!' });
    
    expect(response.status).toBe(400);
  });
});
```

---

## Deployment

### Frontend Deployment (Vercel)

1. **Connect GitHub repository**
```bash
# Push to GitHub
git push origin feature/frontend-v1
```

2. **Connect to Vercel**
   - Go to vercel.com
   - Import project from GitHub
   - Select "speechify-learning-companion"
   - Auto-detected as Vite project

3. **Environment Variables**
```
VITE_API_BASE_URL=https://api.speechify.app/api
VITE_ENABLE_OFFLINE_MODE=false
```

4. **Deploy**
```bash
# Vercel auto-deploys on push to main
# Preview deploys on pull requests
```

### Backend Deployment (Render.com or Railway)

1. **Push backend code**
```bash
git push origin feature/backend-api
```

2. **Create Render service**
   - Connect GitHub repo
   - Select Node environment
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Environment Variables** (set in Render dashboard)
   - All .env variables from backend section

4. **Database**
   - Use Supabase PostgreSQL (managed, backed up)
   - Connection pooling via Supabase

### Production Checklist

- [ ] SSL certificates installed (automatic on Vercel)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error logging setup (Sentry)
- [ ] Performance monitoring (Datadog)
- [ ] Database backups automated
- [ ] Env variables migrated to production
- [ ] API endpoints tested with production DB
- [ ] CDN configured for static assets
- [ ] Security headers added (helmet)

---

## Known Issues & Solutions

### Issue #1: Web Speech API Not Available
**Problem:** User's browser doesn't support Web Speech API
**Solution:** 
```javascript
// Fallback for unsupported browsers
if (!('webkitSpeechRecognition' in window) && !('SpeechSynthesisUtterance' in window)) {
  return <AudioUnavailableMessage />;
}
```

### Issue #2: Token Refresh Loop
**Problem:** Refresh token also expired, causing infinite redirect loops
**Solution:**
```javascript
// Check token expiration BEFORE attempting refresh
if (getTokenExpirationTime() < 0) {
  logout(); // Go straight to login
  return;
}
```

### Issue #3: Text Highlighting Out of Sync
**Problem:** Character boundaries don't align with speech boundaries
**Solution:**
```javascript
// Use boundary event listeners instead of character counting
utterance.onboundary = (event) => {
  // event.charIndex gives accurate character position
};
```

### Issue #4: Mobile Audio Playback Autoplay Policy
**Problem:** Browsers block autoplay of audio
**Solution:**
```javascript
// Require user gesture to start audio
<button onClick={() => startSpeech()}>Play Audio</button>

// Never auto-play on mount
// Always respond to user interaction
```

---

## Performance Considerations

### Frontend Optimization

**Code Splitting:**
```javascript
// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

**Image Optimization:**
- Use WebP with PNG fallback
- Compress avatars to < 50KB
- Lazy load images with IntersectionObserver

**Bundle Size:**
- Current size: ~250KB (Vite optimized)
- Gzipped: ~65KB
- Monitor with `npm run build && npm run preview`

**Caching Strategy:**
```javascript
// Cache API responses with SWR or React Query
import useSWR from 'swr';

const { data, error } = useSWR('/api/users/profile', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1 minute
});
```

### Backend Optimization

**Database Indexing:**
```sql
-- Already created indexes on frequently queried fields
CREATE INDEX idx_quiz_submissions_user_id ON quiz_submissions(user_id);
CREATE INDEX idx_texts_user_id ON texts(user_id);
```

**API Response Caching:**
```javascript
// Cache quiz stats for 5 minutes
app.get('/quizzes/stats', cacheMiddleware(300), handler);
```

**Connection Pooling:**
```javascript
// Use pg pool for connection reuse
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## Development Workflow

### Branch Strategy
```
main (production)
  ↓
develop (staging)
  ↓
feature/frontend-v1 (Paula - current)
feature/backend-api (David)
```

### Making Changes

1. **Create feature branch from develop**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/feature-name
```

2. **Commit with clear messages**
```bash
git commit -m "feat: Add new component"
git commit -m "fix: Resolve token refresh bug"
git commit -m "refactor: Simplify audio player logic"
```

3. **Push to GitHub**
```bash
git push origin feature/feature-name
```

4. **Create pull request**
   - Request review from team
   - Wait for tests to pass
   - Merge to develop after approval

5. **Deploy to production**
```bash
git checkout main
git merge develop
git push origin main
```

---

## Resources & Documentation

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Zustand**: https://github.com/pmndrs/zustand
- **Recharts**: https://recharts.org
- **Axios**: https://axios-http.com
- **Supabase**: https://supabase.com/docs
- **Vercel Deployment**: https://vercel.com/docs

---

**Last Updated**: February 15, 2026
**Version**: 1.0.0
**Status**: In Development (MVP Phase)
