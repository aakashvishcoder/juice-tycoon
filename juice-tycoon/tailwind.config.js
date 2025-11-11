export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'fredoka': ['Fredoka', 'sans-serif'],
        'press-start': ['"Press Start 2P"', 'cursive']
      },
      colors: {
        'juice-orange': '#FF8C42',
        'juice-green': "#4CAF50",
        'juice-purple': "#9C27B0",
        'juice-yellow': "#FFD700",
        'juice-pink': "#E91E63",
        'juice-blue': "#2196F3",
        'juice-brown': "#795548",
      },
      animation: {
        'pour': 'pour 0.8s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        pour: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(200px) scale(0.8)', opacity: '0' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' }
        }
      }
    },
  },
  plugins: [],
};