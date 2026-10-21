import { defineConfig } from 'vite';

// base: './' -> relative asset URLs, works on GitHub Pages sub-paths AND inside Capacitor WebView.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200
  }
});
