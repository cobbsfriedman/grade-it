/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        barlow: ['Barlow', 'sans-serif'],
      },
      colors: {
        bg: '#0a0a0c',
        surface: '#141418',
        surface2: '#1c1c22',
        surface3: '#242428',
        accent: '#f0b429',
        accent2: '#e05c2a',
        text: '#f0eff4',
        'text-muted': '#58586a',
        'text-mid': '#9090a8',
        correct: '#4ade80',
        wrong: '#f87171',
      },
    },
  },
  plugins: [],
}
