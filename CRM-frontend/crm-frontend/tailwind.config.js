/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#FAF9F5',
        'paper-dim': '#F0EEE6',
        ink: {
          DEFAULT: '#14151A',
          soft: '#1D1F26',
          line: '#2A2C35',
        },
        amber: {
          50: '#FDF6E9',
          100: '#FAEACB',
          300: '#EFC876',
          400: '#E8B24E',
          500: '#DE9A2B',
          600: '#B87A1C',
        },
        stage: {
          discovery: '#7C8CF8',
          proposal: '#E8B24E',
          negotiation: '#F08A5D',
          won: '#4FAE7E',
          lost: '#E1615E',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,21,26,0.06), 0 8px 24px -12px rgba(20,21,26,0.12)',
        'card-dark': '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
    },
  },
  plugins: [],
};
