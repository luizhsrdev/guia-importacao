import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          secondary: 'var(--background-secondary)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          overlay: 'var(--surface-overlay)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          muted: 'var(--primary)15',
        },
        accent: {
          gold: 'var(--accent-gold)',
          'gold-muted': 'var(--accent-gold)10',
          blue: 'var(--accent-blue)',
          'blue-muted': 'var(--accent-blue)10',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          muted: 'var(--danger)10',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          emphasis: 'var(--border-emphasis)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'base': ['0.875rem', { lineHeight: '1.5rem' }],
        'lg': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],
        'xl': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
        '3xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '4xl': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'glow': 'var(--shadow-glow)',
        'glow-sm': '0 0 10px -3px var(--primary-glow)',
        'glow-md': '0 0 20px -5px var(--primary-glow-strong)',
        'glow-lg': '0 0 30px -5px var(--primary-glow-strong)',
        'glow-gold': '0 0 20px -5px var(--accent-gold-glow)',
        'glow-danger': '0 0 20px -5px var(--danger-glow)',
        'elevation-1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'elevation-2': '0 2px 8px -2px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'elevation-3': '0 8px 24px -4px rgb(0 0 0 / 0.12), 0 2px 8px -2px rgb(0 0 0 / 0.06)',
        'elevation-4': '0 16px 48px -8px rgb(0 0 0 / 0.15), 0 4px 12px -2px rgb(0 0 0 / 0.08)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.06)',
        'premium': '0 8px 30px -10px var(--primary-glow-strong)',
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.97)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'fade-out': 'fade-out 0.1s ease-in forwards',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
        'scale-out': 'scale-out 0.15s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'slide-up': 'slide-up 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-down': 'slide-down 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
        shimmer: 'shimmer 2s infinite linear',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
