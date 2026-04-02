import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-index-to-root',
      closeBundle() {
        const distIndex = path.join(__dirname, 'dist', 'index.html');
        const rootIndex = path.join(__dirname, 'index.html');
        if (fs.existsSync(distIndex)) {
          fs.copyFileSync(distIndex, rootIndex);
          console.log('[copy-index] Copied dist/index.html to root');
        }
      }
    }
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
