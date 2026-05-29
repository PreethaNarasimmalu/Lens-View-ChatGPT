/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
        fadeIn: 'fadeIn 0.2s ease',
      },
      colors: {
        sidebar: {
          bg: '#171717',
          hover: '#212121',
          border: '#2d2d2d',
        },
        chat: {
          bg: '#212121',
          input: '#2f2f2f',
          border: '#3d3d3d',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
