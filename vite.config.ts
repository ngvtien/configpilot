import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'app'),  // 👈 point Vite root here
  build: {
    outDir: path.resolve(__dirname, 'dist-renderer'), // where the built files go
    emptyOutDir: true,
  },
  plugins: [react()],
});
