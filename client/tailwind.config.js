/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E53935',
          hover: '#C62828',
          light: '#FFEBEE',
          muted: 'rgba(229,57,53,0.1)',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          surface: '#121212',
          elevated: '#1a1a1a',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0,0,0,0.05)',
        'glass-dark': '0 8px 32px 0 rgba(0,0,0,0.4)',
        premium: '0 20px 40px -10px rgba(0,0,0,0.1)',
        float: '0 30px 60px -15px rgba(0,0,0,0.15)',
        glow: '0 0 30px rgba(229,57,53,0.4)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        slideDown: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        slideDown: 'slideDown 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
