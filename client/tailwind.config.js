/** @type {import('tailwindcss').Config} */
// Mirrors the design tokens from design-handoff/.../styles.css so shadcn-style
// components in src/components/ui pick up the right colors/radii/shadows.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#e0e7ff',
        },
        navy: {
          DEFAULT: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        // Text
        text: {
          DEFAULT: '#334155',
          strong: '#0f172a',
          muted: '#64748b',
        },
        // Surfaces
        surface: '#ffffff',
        bg: '#f8fafc',
        border: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },
        // Status
        success: { DEFAULT: '#10b981', soft: '#d1fae5' },
        warning: { DEFAULT: '#f59e0b', soft: '#fef3c7' },
        danger: { DEFAULT: '#ef4444', soft: '#fee2e2' },
        accent: { purple: '#8b5cf6', 'purple-soft': '#ede9fe' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '9px',
        input: '9px',
        pill: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15, 23, 42, .06), 0 1px 3px rgba(15, 23, 42, .04)',
        md: '0 4px 12px rgba(15, 23, 42, .06), 0 2px 4px rgba(15, 23, 42, .04)',
        lg: '0 12px 32px rgba(15, 23, 42, .12), 0 4px 8px rgba(15, 23, 42, .06)',
        pop: '0 24px 60px rgba(15, 23, 42, .18)',
      },
      width: {
        sidebar: '260px',
      },
    },
  },
  plugins: [import('tailwindcss-animate')],
};
