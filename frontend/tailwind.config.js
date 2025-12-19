/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#c9d9c9',
          300: '#9fb89f',
          400: '#6f916f',
          500: '#4f7350', // Main sage green
          600: '#3d5a3e',
          700: '#324933',
          800: '#2a3c2b',
          900: '#243225',
        },
        accent: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce5cb',
          300: '#8fd0a8',
          400: '#5bb37e',
          500: '#389662',
          600: '#2a7850',
          700: '#246042',
          800: '#204d37',
          900: '#1c402f',
        },
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

