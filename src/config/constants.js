/**
 * Application Constants
 * 
 * Centralized configuration for:
 * - API endpoints
 * - Audio/TTS settings
 * - Quiz configuration
 * - Subscription tiers
 * - UI messages
 * - Storage keys
 * - Feature flags
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_VERIFY: '/auth/verify',

  // User
  USER_PROFILE: '/users/profile',
  USER_UPDATE: '/users/profile',
  USER_SETTINGS: '/users/settings',
  USER_PREFERENCES: '/users/preferences',

  // Audio/Learning
  UPLOAD_TEXT: '/learning/upload',
  GET_TEXT: '/learning/:id',
  DELETE_TEXT: '/learning/:id',
  GET_TEXTS: '/learning',

  // Quiz
  GET_QUIZ: '/quizzes/:id',
  SUBMIT_QUIZ: '/quizzes/submit',
  GET_QUIZ_HISTORY: '/quizzes/history',
  GET_QUIZ_STATS: '/quizzes/stats',

  // Dashboard
  GET_DASHBOARD: '/dashboard',
  GET_STATS: '/dashboard/stats',
  GET_ANALYTICS: '/dashboard/analytics',

  // Subscription
  GET_PLANS: '/subscriptions/plans',
  GET_CURRENT_PLAN: '/subscriptions/current',
  UPGRADE_PLAN: '/subscriptions/upgrade',
  CANCEL_SUBSCRIPTION: '/subscriptions/cancel',
};

// Audio/TTS Configuration
export const AUDIO_CONFIG = {
  SPEECH_RATE_OPTIONS: [
    { label: '0.5x (Very Slow)', value: 0.5 },
    { label: '0.75x (Slow)', value: 0.75 },
    { label: '1x (Normal)', value: 1 },
    { label: '1.5x (Fast)', value: 1.5 },
    { label: '2x (Very Fast)', value: 2 },
  ],
  DEFAULT_SPEECH_RATE: 1,
  MIN_SPEECH_RATE: 0.5,
  MAX_SPEECH_RATE: 2,

  PITCH_OPTIONS: [
    { label: 'Low', value: 0.8 },
    { label: 'Normal', value: 1 },
    { label: 'High', value: 1.2 },
  ],
  DEFAULT_PITCH: 1,
  MIN_PITCH: 0.1,
  MAX_PITCH: 2,

  VOLUME_OPTIONS: [
    { label: '0%', value: 0 },
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1 },
  ],
  DEFAULT_VOLUME: 1,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
};

// Quiz Configuration
export const QUIZ_CONFIG = {
  QUESTIONS_PER_QUIZ: 4,
  TIME_BEFORE_QUIZ: 300, // 5 minutes in seconds
  QUIZ_DISPLAY_TIME: 10, // seconds before auto-dismiss
  CORRECT_ANSWER_POINTS: 10,
  INCORRECT_ANSWER_POINTS: 0,
  SKIP_ANSWER_POINTS: 0,
  MIN_QUIZZES_FOR_STATS: 3,
  STREAK_RESET_HOURS: 24,
  ACCURACY_CALCULATION_WINDOW: 7, // sessions
};

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    duration: 'forever',
    features: [
      'Basic audio playback',
      'Limited quizzes (5/month)',
      'Basic analytics',
    ],
    limits: {
      uploadsPerMonth: 5,
      quizzesPerMonth: 5,
      maxTextLength: 2000,
      voiceOptions: 1,
      storageMB: 10,
    },
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    duration: 'month',
    features: [
      'Unlimited audio playback',
      'Unlimited quizzes',
      'Advanced analytics',
      'All voice options',
      'Priority support',
    ],
    limits: {
      uploadsPerMonth: 100,
      quizzesPerMonth: 500,
      maxTextLength: 50000,
      voiceOptions: 5,
      storageMB: 500,
    },
  },
  PREMIUM: {
    name: 'Premium',
    price: 19.99,
    duration: 'month',
    features: [
      'Everything in Pro',
      'Custom learning paths',
      'AI-powered recommendations',
      'Export reports',
      'Dedicated support',
      'Team collaboration',
    ],
    limits: {
      uploadsPerMonth: 500,
      quizzesPerMonth: 2000,
      maxTextLength: 500000,
      voiceOptions: 10,
      storageMB: 5000,
    },
  },
};

// UI Messages
export const UI_MESSAGES = {
  ERRORS: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_FAILED: 'Authentication failed. Please try again.',
    UPLOAD_FAILED: 'Failed to upload text. Please try again.',
    QUIZ_LOAD_FAILED: 'Failed to load quiz. Please try again.',
    GENERAL_ERROR: 'Something went wrong. Please try again.',
  },
  SUCCESS: {
    UPLOAD_SUCCESS: 'Text uploaded successfully!',
    QUIZ_SUBMITTED: 'Quiz submitted successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    LOGOUT_SUCCESS: 'You have been logged out.',
  },
  WARNINGS: {
    SESSION_ENDING: 'Your session will expire in 5 minutes.',
    OFFLINE_MODE: 'You are offline. Some features may be unavailable.',
    QUOTA_REACHED: 'You have reached your usage limit. Upgrade to continue.',
  },
  INFO: {
    WELCOME: 'Welcome to Speechify Learning Companion!',
    FIRST_QUIZ: 'Complete your first quiz to see your progress!',
    STREAK_ACHIEVEMENT: '🔥 You\'re on a streak!',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFS: 'userPreferences',
  AUDIO_SETTINGS: 'audioSettings',
  THEME: 'theme',
  LAST_VISITED: 'lastVisited',
  DRAFT_TEXT: 'draftText',
  RECENTLY_UPLOADED: 'recentlyUploaded',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AUDIO_PLAYBACK: true,
  ENABLE_QUIZ_MODE: true,
  ENABLE_ANALYTICS: true,
  ENABLE_SOCIAL_SHARING: false,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_MOBILE_APP: false,
  BETA_AI_RECOMMENDATIONS: false,
};

// Routes
export const ROUTES = {
  HOME: '/',
  LEARN: '/learn',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PRICING: '/pricing',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
  NOT_FOUND: '/404',
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#3b82f6', // Blue
  SECONDARY: '#8b5cf6', // Purple
  SUCCESS: '#10b981', // Green
  WARNING: '#f59e0b', // Amber
  ERROR: '#ef4444', // Red
  INFO: '#06b6d4', // Cyan
  LIGHT_BG: '#f9fafb', // Gray 50
  DARK_BG: '#111827', // Gray 900
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 50000,
  MIN_TEXT_LENGTH: 10,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Common Timeouts (ms)
export const TIMEOUTS = {
  API_REQUEST: 30000,
  IDLE_SESSION: 15 * 60 * 1000, // 15 minutes
  TOKEN_REFRESH_CHECK: 5 * 60 * 1000, // 5 minutes
  TOAST_DURATION: 4000,
};

// Voice Options (from Web Speech API)
export const VOICE_OPTIONS = {
  DEFAULT: 'Google UK English Female',
  OPTIONS: [
    'Google UK English Female',
    'Google UK English Male',
    'Google US English Female',
    'Google US English Male',
  ],
};

export default {
  API_ENDPOINTS,
  AUDIO_CONFIG,
  QUIZ_CONFIG,
  SUBSCRIPTION_TIERS,
  UI_MESSAGES,
  STORAGE_KEYS,
  HTTP_STATUS,
  FEATURE_FLAGS,
  ROUTES,
  COLORS,
  VALIDATION,
  PAGINATION,
  TIMEOUTS,
  VOICE_OPTIONS,
};
