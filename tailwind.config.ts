import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        card: 'var(--card)',
        card2: 'var(--card2)',
        border: {
          DEFAULT: 'var(--border)',
          2: 'var(--border2)',
        },
        text: {
          DEFAULT: 'var(--text)',
          2: 'var(--text2)',
          3: 'var(--text3)',
          4: 'var(--text4)',
        },
        purple: {
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
          light: '#a78bfa',
        },
        cyan: '#06b6d4',
        emerald: '#10b981',
        amber: '#f59e0b',
        rose: '#ef4444',
        pink: '#ec4899',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      animation: {
        'slide-in': 'slideIn 0.25s ease',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
