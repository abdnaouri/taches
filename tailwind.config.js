/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Business Grade Moroccan Brand Palette (Trust Blue & Royal Slate)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Work-zilla primary action blue
          700: '#1d4ed8', // Deep trustworthy royal blue
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Escrow & Guarantee Green (Daman)
        daman: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Ultra-readable high-contrast neutrals
        ink: {
          DEFAULT: '#0f172a',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f8fafc',
          muted: '#f1f5f9',
          border: '#e2e8f0',
        },
        // Backward-compatibility aliases for existing sub-components
        unu: {
          dark: '#0f172a',
          darker: '#020617',
          card: '#ffffff',
          cardhover: '#f8fafc',
          violet: '#1d4ed8',
          purple: '#2563eb',
          violetDeep: '#1e3a8a',
          lime: '#059669',
          mint: '#10b981',
          teal: '#0284c7',
          blue: '#2563eb',
          line: '#e2e8f0',
          linelight: '#f1f5f9',
          soft: '#f8fafc',
          muted: '#64748b',
          mutedDark: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans Arabic', 'sans-serif'],
        display: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'input': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
