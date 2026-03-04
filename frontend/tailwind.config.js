/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        panel: 'var(--panel)',
        card: 'var(--card)',
        accent: 'var(--accent)',
        accentHover: 'var(--accentHover)',
        negative: 'var(--negative)',
      },
    },
  },
  plugins: [],
}
