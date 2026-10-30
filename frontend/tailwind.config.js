/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agriDark: '#082717',
        agriForest: '#0b3d22',
        agriEmerald: '#10b981',
        agriMint: '#34d399',
        agriCard: '#ffffff',
        agriBorder: '#e2ece4'
      }
    },
  },
  plugins: [],
}
