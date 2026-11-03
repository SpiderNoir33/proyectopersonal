import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // import { x } from "@shared/schemas/product.js" en vez de ../../..
      "@shared": path.resolve(rootDir, "..", "shared"),
    },
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: [rootDir, path.resolve(rootDir, '..')],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
