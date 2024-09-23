import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'tailwind.config.js',
        'postcss.config.js',
        '.eslintrc.cjs',
        'vite.config.ts',
        'src/main.tsx',
        'src/tests/**/*',
      ],
    },
  },
});
