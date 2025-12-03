/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    // Explicitly exclude mock directories
    '!./mock-travel-collaboration/**',
    '!./wanderluxe---influencer-profile/**',
    '!./mock-dark-blue-creator-profile/**',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Blue Theme Colors (from React mock theme)
        'primary': '#00344e',
        'secondary': '#48c4c8',
        'surface': '#f8fafc',
        'text': {
          'main': '#333333',
          'muted': '#666666',
          'light': '#999999',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%, 100%': { height: '10%' },
          '50%': { height: '100%' },
        },
      },
    },
  },
  plugins: [],
}

