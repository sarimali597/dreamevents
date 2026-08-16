import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function unwrap(res) {
  return res?.data?.data ?? res?.data;
}

export function apiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join('. ');
  if (typeof msg === 'string' && msg.trim()) return msg;
  return err?.message || fallback;
}

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
  const { response, config } = err;
  if (
  response?.status === 401 &&
  config &&
  !config._retried &&
  !String(config.url).includes('/auth/')
  ) {
  config._retried = true;
  try {
  refreshing = refreshing || api.post('/auth/refresh').catch(() => {});
  await refreshing;
  refreshing = null;
  return api(config);
  } catch {
  refreshing = null;
  window.dispatchEvent(new CustomEvent('auth:expired'));
  }
  }
  return Promise.reject(err);
  }
);
