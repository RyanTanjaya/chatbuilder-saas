// Single axios instance — wires the JWT from localStorage onto every request.
// Token gets set in Step 3 (auth) by the login flow.
import axios from 'axios';

export const TOKEN_KEY = 'chatbuilder_token';

export const api = axios.create({
  baseURL: '/api', // proxied to http://localhost:4000 in dev (see vite.config.ts)
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // session expired or never authed — let pages decide what to do
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(err);
  }
);
