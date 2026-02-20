import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: '.', // Place assets directly in the outDir
  },
  base: './', // Ensure relative paths work correctly
});
