/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'neon-flicker': 'neon-flicker 3s infinite',
        'neon-buzz': 'neon-buzz 0.2s ease-in-out',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'neon-flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            opacity: '1',
            textShadow: '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
          },
          '20%, 24%, 55%': {
            opacity: '0.5',
            textShadow: '0 0 5px rgba(34,211,238,0.3), 0 0 10px rgba(34,211,238,0.2)',
          },
        },
        'neon-buzz': {
          '0%, 100%': {
            opacity: '1',
            textShadow: '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
          },
          '50%': {
            opacity: '0.3',
            textShadow: '0 0 3px rgba(34,211,238,0.2), 0 0 6px rgba(34,211,238,0.1)',
          },
        },
        'neon-pulse': {
          '0%, 100%': {
            textShadow: '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(34,211,238,0.9), 0 0 40px rgba(34,211,238,0.5)',
          },
        },
      },
    },
  },
  plugins: [],
}
