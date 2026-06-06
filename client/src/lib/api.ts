// Single axios instance — wires the JWT from localStorage onto every request.
// Token gets set in Step 3 (auth) by the login flow.
import axios from 'axios';

export const TOKEN_KEY = 'chatbuilder_token';

// Base URL for every API call. In dev this stays unset, so it falls back to the
// relative '/api' that the Vite proxy forwards to http://localhost:4000 (see
// vite.config.ts). In production it's baked in at build time as the absolute
// Render URL, e.g. https://chatbuilder-api.onrender.com/api. Shared by the axios
// instance below, the SSE chat stream (chatStream.ts), and the public chat page.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
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
