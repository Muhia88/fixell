import axios from 'axios';

// Determine baseURL from Vite env or fallback
// Vite exposes env as import.meta.env and variables prefixed with VITE_ are available.
const rawEnvBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : null
const defaultBase = 'http://127.0.0.1:5000/api'

// Normalize env base: ensure it ends with /api
let baseURL = defaultBase
if (rawEnvBase) {
  // strip trailing slash
  let b = rawEnvBase.replace(/\/$/, '')
  if (!b.endsWith('/api')) {
    b = b + '/api'
  }
  baseURL = b
}

// Create an Axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to attach the JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Export backend origin (base without the /api suffix) so UI can build absolute image URLs
const BACKEND_ORIGIN = api.defaults.baseURL.replace(/\/api\/?$/, '')

// Helper to build an absolute URL from a backend-relative path like '/uploads/abc.jpg'
// Ensures there are no double slashes and handles full URLs transparently.
function buildUrl(path) {
  if (!path) return path
  // if it's already an absolute URL, return as-is
  try {
    const parsed = new URL(path)
    return parsed.toString()
  } catch {
    // not an absolute URL, continue
  }

  // Ensure path starts with a single slash
  // Normalize common server-stored variants like '../instance/uploads/...' or 'instance/uploads/...'
  let normalized = path.replace(/(^|.*)instance\/uploads\//, '/uploads/')
  // Ensure leading slash
  const p = normalized.startsWith('/') ? normalized : `/${normalized}`
  // join origin and path without duplicate slashes
  return `${BACKEND_ORIGIN.replace(/\/$/, '')}${p}`
}

export { BACKEND_ORIGIN, buildUrl }
