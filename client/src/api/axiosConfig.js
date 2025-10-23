import axios from 'axios';

const rawEnvBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : null
const defaultBase = 'http://127.0.0.1:5000/api'

let baseURL = defaultBase
if (rawEnvBase) {
  let b = rawEnvBase.replace(/\/$/, '')
  if (!b.endsWith('/api')) {
    b = b + '/api'
  }
  baseURL = b
}


const api = axios.create({
  baseURL,
});

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


const BACKEND_ORIGIN = api.defaults.baseURL.replace(/\/api\/?$/, '')

function buildUrl(path) {
  if (!path) return path

  try {
    const parsed = new URL(path)
    return parsed.toString()
  } catch {
    //not an absolute URL, continue
  }

  let normalized = path.replace(/(^|.*)instance\/uploads\//, '/uploads/')
  const p = normalized.startsWith('/') ? normalized : `/${normalized}`
  return `${BACKEND_ORIGIN.replace(/\/$/, '')}${p}`
}

export { BACKEND_ORIGIN, buildUrl }
