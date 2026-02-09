/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './contexts/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './services/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // MaVault Dark Theme Colors
        'midnight-slate': '#0F172A',
        'deep-navy': '#1E293B',
        'glass-bg': 'rgba(30, 41, 59, 0.7)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'accent-primary': '#6366F1',
        'accent-secondary': '#8B5CF6',
        'success': '#10B981',
        'danger': '#EF4444',
        'warning': '#F59E0B',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};