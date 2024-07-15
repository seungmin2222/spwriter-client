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
    },
  },
  plugins: [],
};
