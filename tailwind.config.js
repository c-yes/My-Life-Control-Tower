/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#0f172a',
        pink: {
          50: '#fdf2f7',
          100: '#fbe6f1',
          200: '#f5c4df',
          300: '#ec98c3',
          400: '#de70a6',
          500: '#c45c8a',
          600: '#a84a75',
          700: '#8a3860',
          800: '#6d2a4b',
          900: '#501e38',
          950: '#341126',
        },
      }
    },
  },
  plugins: [],
}
