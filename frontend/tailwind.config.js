/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          navy: '#0B192C',
          royal: '#1E3E62',
          gold: '#D4AF37',
          'gold-light': '#F3E5AB',
          amber: '#E65100',
          burgundy: '#6B1D2F',
          cream: '#FDFBF7',
          warmgray: '#F3F4F6'
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
