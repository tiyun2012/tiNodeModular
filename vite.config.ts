import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@core': path.resolve(__dirname, './core'),
      '@store': path.resolve(__dirname, './store'),
      '@plugins': path.resolve(__dirname, './plugins'),
      '@configs': path.resolve(__dirname, './configs'),
      '@components': path.resolve(__dirname, './components'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@contexts': path.resolve(__dirname, './contexts'),
      '@events': path.resolve(__dirname, './events'),
      '@utils': path.resolve(__dirname, './utils'),
      '@types': path.resolve(__dirname, './types'),
    },
  },
});