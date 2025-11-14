/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        serif: ['Roboto Slab', 'serif'],
      },
      colors: {
        'primary-green': {
          DEFAULT: '#45b97c',
          'light': '#e0f3ea',
          'dark': '#3a9a69',
        },
        'accent-lime': '#b1d249',
        'accent-yellow-green': {
          DEFAULT: '#d5e05b',
          'light': '#f8fae8',
        },
        'warm-gray': {
          50: '#f9f9f8',
          100: '#f3f3f1',
          200: '#e8e8e5',
          300: '#d9d9d3',
          400: '#b0b0a9',
          500: '#8a8a80',
          600: '#6f6f66',
          700: '#5a5a54',
          800: '#4a4a45',
          900: '#3e3e3a',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
       animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-fast': 'fadeIn 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideInUp: {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
