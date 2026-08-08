/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#ff385c',
          dark:    '#e0304f',
          light:   '#fff1f3',
          50:      '#fff1f3',
          100:     '#ffe4e8',
          200:     '#ffc9d0',
          400:     '#ff6b85',
          500:     '#ff385c',
          600:     '#e0304f',
          700:     '#c02040',
        },
      },
      boxShadow: {
        'xs':         '0 1px 2px 0 rgba(0,0,0,0.05)',
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.07)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.12)',
        'modal':      '0 20px 60px rgba(0,0,0,0.18)',
        'nav':        '0 2px 12px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '4xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in':    'fadeIn .25s ease both',
        'slide-up':   'slideUp .28s ease both',
        'slide-down': 'slideDown .28s ease both',
        'scale-in':   'scaleIn .2s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                                 to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(10px)' },  to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(.96)' },        to: { opacity: 1, transform: 'scale(1)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient':   'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      },
    },
  },
  plugins: [],
}
