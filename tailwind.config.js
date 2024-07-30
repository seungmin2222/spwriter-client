/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      userSelect: {
        none: 'none',
      },
      backgroundImage: {
        checkerboard: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                        linear-gradient(135deg, #ccc 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #ccc 75%),
                        linear-gradient(135deg, transparent 75%, #ccc 75%)`,
      },
      backgroundSize: {
        checkerboard: '20px 20px',
      },
      backgroundPosition: {
        checkerboard: '0 0, 10px 0, 10px -10px, 0px 10px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        fadeOut: 'fadeOut 0.5s ease-in',
        fadeInFast: 'fadeIn 0.3s ease-out',
      },
      colors: {
        'custom-purple': '#2d2d2e',
        'custom-light-purple': '#ecebe8',
      },
    },
  },
  plugins: [],
};
