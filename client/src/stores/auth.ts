// Global auth state. JWT lives in localStorage (chose the simple path) and is
// added to every request by the axios interceptor in lib/api.ts. The store also
// hydrates from /api/auth/me on first mount so a returning user stays logged in.
import { create } from 'zustand';
import { api, TOKEN_KEY } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean; // true while we hydrate from /me on initial mount
  hydrate: () => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<AuthUser>;
  login: (input: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  hydrate: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await api.get<{ user: AuthUser }>('/auth/me');
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, loading: false });
    }
  },

  register: async (input) => {
    const { data } = await api.post<{ user: AuthUser; token: string }>('/auth/register', input);
    localStorage.setItem(TOKEN_KEY, data.token);
    set({ user: data.user });
    return data.user;
  },

  login: async (input) => {
    const { data } = await api.post<{ user: AuthUser; token: string }>('/auth/login', input);
    localStorage.setItem(TOKEN_KEY, data.token);
    set({ user: data.user });
    return data.user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null });
  },
}));
