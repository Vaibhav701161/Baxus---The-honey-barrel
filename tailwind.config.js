/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'luxury-black': '#0A0A0A',
        'luxury-dark': '#1A1A1A',
        'luxury-gold': '#D4AF37',
        'luxury-gold-light': '#F5E7A3',
        'luxury-cream': '#F5F5F5',
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
} 