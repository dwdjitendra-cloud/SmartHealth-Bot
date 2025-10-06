import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          'vendor-auth': ['axios'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging
    sourcemap: true,
    // Use esbuild for minification (faster and built-in)
    minify: 'esbuild',
  },
  server: {
    // Enable hot module replacement
    hmr: true,
    // Open browser automatically
    open: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
});
