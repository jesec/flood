import path from 'node:path';

import {lingui} from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  root: 'client/src',
  publicDir: 'public',
  resolve: {
    alias: {
      '@client': path.resolve('./client/src/javascript'),
      '@shared': path.resolve('./shared'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
  plugins: [react(), lingui()],
  server: {
    port: 4200,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../../dist/assets',
    emptyOutDir: true,
    sourcemap: true,
  },
});
