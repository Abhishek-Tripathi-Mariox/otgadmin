/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          500: '#FB923C',
          600: '#FB7A1A',
          900: '#7C2D12',
        },
        secondary: {
          500: '#8B5CF6'
        },
        danger: {
          500: '#EF4444',
          600: '#dc2626'
        },
        success: {
          500: '#10B981'
        },
        warning: {
          500: '#F59E0B'
        },
      },
    },
  },
  plugins: [],
}
