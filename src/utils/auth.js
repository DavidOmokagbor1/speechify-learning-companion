import { jwtDecode } from 'jwt-decode';

/**
 * Authentication Utilities
 * 
 * JWT token management helpers:
 * - Token storage/retrieval
 * - Token decoding
 * - User extraction
 * - Expiration checking
 * - Logout
 */

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Store JWT tokens in localStorage
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token (optional)
 */
export const storeTokens = (accessToken, refreshToken = null) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Retrieve access token from localStorage
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Retrieve refresh token from localStorage
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Remove tokens from localStorage
 */
export const removeTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Decode JWT token
 * @param {string} token - JWT token to decode
 * @returns {object|null} Decoded token or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // Convert exp (seconds) to milliseconds and check against current time
  return decoded.exp * 1000 < Date.now();
};

/**
 * Get current user from token
 * @returns {object|null} Current user object or null if not authenticated
 */
export const getCurrentUser = () => {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }

  const decoded = decodeToken(token);
  return decoded ? {
    id: decoded.sub || decoded.id,
    email: decoded.email,
    name: decoded.name,
    tier: decoded.tier || 'free',
    iat: decoded.iat,
    exp: decoded.exp,
  } : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if valid token exists
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  return token && !isTokenExpired(token);
};

/**
 * Logout - remove tokens and clear session
 */
export const logout = () => {
  removeTokens();
  // Optional: Clear any other session data
  sessionStorage.clear();
};

/**
 * Get time remaining until token expiration
 * @returns {number} Milliseconds until expiration, or -1 if expired
 */
export const getTokenExpirationTime = () => {
  const token = getAccessToken();
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) return -1;

  const expiresAt = decoded.exp * 1000;
  const timeRemaining = expiresAt - Date.now();

  return timeRemaining > 0 ? timeRemaining : -1;
};

/**
 * Refresh token if needed
 * @returns {boolean} True if refresh was successful
 */
export const shouldRefreshToken = () => {
  const timeRemaining = getTokenExpirationTime();
  // Refresh if less than 5 minutes remaining
  return timeRemaining > 0 && timeRemaining < 5 * 60 * 1000;
};
