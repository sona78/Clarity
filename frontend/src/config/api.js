// API Configuration
// This will use Vercel function URLs in production and localhost in development

const getApiBaseUrl = () => {
  // In production (Vercel), API routes are served from the same domain
  // Vercel routes /api/* requests to the Python function at api/index.py
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  
  // In development, use environment variable or fallback to localhost:8000
  // This allows local FastAPI server testing
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  generatePlan: (username) => `${API_BASE_URL}/api/v3/generate-plan/${encodeURIComponent(username)}`,
  updateCascade: (timeframe, username) => `${API_BASE_URL}/api/v3/milestone/${timeframe}/${encodeURIComponent(username)}/update-cascade`,
  directUpdate: (timeframe, username) => `${API_BASE_URL}/api/v3/milestone/${timeframe}/${encodeURIComponent(username)}/direct-update`,
  regenerateSubsequent: (username) => `${API_BASE_URL}/api/v3/plan/${username}/regenerate-subsequent`,
  processThoughts: (timeframe, username) => `${API_BASE_URL}/api/v3/milestone/${timeframe}/${encodeURIComponent(username)}/process-thoughts`
};