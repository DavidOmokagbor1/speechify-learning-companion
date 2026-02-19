/**
 * API base URL for backend.
 * Uses VITE_API_URL if set at build time; otherwise at runtime, if we're not on
 * localhost (i.e. deployed), uses the Render backend URL so it works even when
 * env wasn't set during build.
 */
const RENDER_BACKEND = 'https://speechify-learning-companion.onrender.com';
const envUrl = import.meta.env.VITE_API_URL;
const isProduction =
  typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
export const API_URL = envUrl || (isProduction ? RENDER_BACKEND : '');
