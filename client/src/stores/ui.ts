// UI preferences: color theme + sidebar collapse. Both persist to localStorage
// and are independent of auth, so they survive logout. The initial theme class
// is applied by an inline script in index.html (before paint) — this store reads
// that resolved state on init and owns all subsequent toggles.
import { create } from 'zustand';

type Theme = 'light' | 'dark';

const THEME_KEY = 'chatbuilder_theme';
const COLLAPSE_KEY = 'chatbuilder_sidebar_collapsed';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme; // native controls + scrollbars
}

// Trust the class the inline boot script already set; fall back to localStorage.
function initialTheme(): Theme {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useUI = create<UIState>((set, get) => ({
  theme: initialTheme(),
  sidebarCollapsed: localStorage.getItem(COLLAPSE_KEY) === '1',

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),

  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    set({ sidebarCollapsed: collapsed });
  },
  toggleSidebar: () => get().setSidebarCollapsed(!get().sidebarCollapsed),
}));
