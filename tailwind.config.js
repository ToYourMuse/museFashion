/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'futura': ['var(--font-futura)'],
        'meie-script': ['var(--font-meie-script)'],
      },
    },
  },
  plugins: [],
}