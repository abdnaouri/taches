/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#17201d',
          50: '#f4f6f5',
          100: '#e5e9e7',
          200: '#cdd5d1',
          300: '#a7b6b0',
          400: '#7a9188',
          500: '#5c736a',
          600: '#485c54',
          700: '#3c4a44',
          800: '#2b3531',
          900: '#17201d',
          950: '#0c1210',
        },
        lime: {
          DEFAULT: '#d5f34a',
          50: '#fbffe5',
          100: '#f6ffc7',
          200: '#edff94',
          300: '#e1ff54',
          400: '#d5f34a',
          500: '#b2d913',
          600: '#8caa0a',
          700: '#68800c',
          800: '#536510',
          900: '#465512',
        },
        cream: {
          DEFAULT: '#f7f8f3',
          light: '#ffffff',
          dark: '#eceee3',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
