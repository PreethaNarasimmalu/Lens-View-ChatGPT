/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ChatGPT dark sidebar
        sidebar: {
          bg: '#171717',
          hover: '#212121',
          border: '#2d2d2d',
        },
        // ChatGPT dark main area
        chat: {
          bg: '#212121',
          input: '#2f2f2f',
          border: '#3d3d3d',
        },
      },
    },
  },
  plugins: [],
}
