/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    // Explicitly exclude mock directories
    '!./mock-travel-collaboration/**',
    '!./wanderluxe---influencer-profile/**',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

