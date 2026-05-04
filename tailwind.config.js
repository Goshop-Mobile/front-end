/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red:     '#9B1C1C',
          'red-light': '#C53030',
          'red-dark':  '#7B1515',
          blue:    '#1E3A8A',
          'blue-light': '#2563EB',
          'blue-dark':  '#172554',
        },
        glass: {
          white:   'rgba(255,255,255,0.07)',
          border:  'rgba(255,255,255,0.12)',
          'border-strong': 'rgba(255,255,255,0.2)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
        'glass-xl': '40px',
      },
      boxShadow: {
        glass:     '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-sm':'0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg':'0 16px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        'red-glow': '0 0 20px rgba(155,28,28,0.4)',
        'blue-glow':'0 0 20px rgba(30,58,138,0.5)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'slide-up':   'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-right':'slide-right 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':    'fade-in 0.3s ease',
        'scale-in':   'scale-in 0.2s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
