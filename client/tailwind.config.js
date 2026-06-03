/** @type {import('tailwindcss').Config} */
// Mirrors the design tokens from design-handoff/.../styles.css so shadcn-style
// components in src/components/ui pick up the right colors/radii/shadows.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — editorial ink-indigo
        primary: {
          DEFAULT: '#3b3d80',
          dark: '#2f3168',
          light: '#e6e4f0',
        },
        navy: {
          DEFAULT: '#211d16',
          800: '#26211a',
          700: '#332d24',
        },
        // Text — channel triples so opacity modifiers still work; flips with .dark
        text: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
          strong: 'rgb(var(--text-strong) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        // Surfaces
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
        },
        bg: 'rgb(var(--bg) / <alpha-value>)',
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },
        // Status — sage / ochre / plum on warm paper
        success: { DEFAULT: '#5a7d4f', soft: '#e7eee0' },
        warning: { DEFAULT: '#a8791f', soft: '#f1e6cd' },
        danger: { DEFAULT: '#bb3f3f', soft: '#f4e2de' },
        accent: { purple: '#7a4a73', 'purple-soft': '#efe4ed' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        input: '10px',
        pill: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(28, 24, 18, .05), 0 1px 3px rgba(28, 24, 18, .04)',
        md: '0 4px 12px rgba(28, 24, 18, .06), 0 2px 4px rgba(28, 24, 18, .04)',
        lg: '0 12px 32px rgba(28, 24, 18, .12), 0 4px 8px rgba(28, 24, 18, .06)',
        pop: '0 24px 60px rgba(28, 24, 18, .18)',
        panel: '0 1px 2px rgba(28, 24, 18, .04), 0 22px 36px -28px rgba(28, 24, 18, .22)',
      },
      width: {
        sidebar: '260px',
      },
    },
  },
  plugins: [import('tailwindcss-animate')],
};
