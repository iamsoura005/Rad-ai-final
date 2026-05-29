/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#0EA5E9',
        'medical-cyan': '#06B6D4',
        'medical-gray': '#1F2937',
        'medical-dark': '#111827',
        'medical-darker': '#030712',
      }
    },
  },
  plugins: [],
}