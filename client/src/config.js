/**
 * API base URL for backend.
 * Set VITE_API_URL in Vercel (or .env) for production; if missing at build time,
 * this fallback is used so the deployed app still hits your Render backend.
 */
const envUrl = import.meta.env.VITE_API_URL;
const productionFallback = 'https://speechify-learning-companion.onrender.com';
export const API_URL = envUrl || (import.meta.env.PROD ? productionFallback : '');
