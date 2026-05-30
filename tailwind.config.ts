import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── العلم السوداني ── */
        sudan: {
          red:        '#D21034',
          'red-dark': '#9A0B25',
          'red-light':'#FF1A45',
          black:      '#000000',
          white:      '#FFFFFF',
          green:      '#007229',
          'green-dark': '#004F1C',
          'green-light':'#00A33C',
        },
        /* ── واجهة ── */
        bg: {
          primary:   '#050505',
          secondary: '#0a0a0a',
          card:      '#0f0f0f',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Amiri', 'sans-serif'],
      },
      backgroundImage: {
        'national': 'linear-gradient(135deg, #9A0B25 0%, #000000 50%, #004F1C 100%)',
        'national-h': 'linear-gradient(90deg, #9A0B25 0%, #000000 50%, #004F1C 100%)',
      },
      animation: {
        'float':       'float-p 5s ease-in-out infinite',
        'hero-up':     'hero-up .8s ease both',
        'count-pop':   'count-pop .7s ease both',
        'marquee':     'marquee-move 28s linear infinite',
        'pulse-red':   'pulse-red 2s ease-in-out infinite',
        'glow-green':  'glow-green 3s ease-in-out infinite',
        'shimmer':     'shimmer 1.8s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
