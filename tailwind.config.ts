import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './frontend/index.html',
    './frontend/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--col-bg-base)',
          surface: 'var(--col-bg-surface)',
          raised: 'var(--col-bg-raised)',
        },
        border: 'var(--col-border)',
        text: {
          primary: 'var(--col-text-primary)',
          secondary: 'var(--col-text-secondary)',
          muted: 'var(--col-text-muted)',
        },
        accent: {
          teal: 'var(--col-accent-teal)',
          orange: 'var(--col-accent-orange)',
          amber: 'var(--col-accent-amber)',
          red: 'var(--col-accent-red)',
          green: 'var(--col-accent-green)',
          violet: 'var(--col-accent-violet)',
          slate: 'var(--col-accent-slate)',
        },
        alert: {
          watch: 'var(--col-alert-watch)',
          warning: 'var(--col-alert-warning)',
          critical: 'var(--col-alert-critical)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-ring': 'ping-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        'ping-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
