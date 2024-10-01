import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['vitest-canvas-mock'],
  },
  test: {
    globals: true,
    setupFiles: './src/setupTests.ts',
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
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
