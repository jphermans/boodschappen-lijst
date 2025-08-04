import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  // base: '/boodschappen-lijst/', // Temporarily commented for local testing
  server: {
    host: true,
    port: 5173
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk for React and related libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            
            // Firebase chunk
            if (id.includes('firebase')) {
              return 'firebase';
            }
            
            // UI libraries chunk
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui';
            }
            
            // QR code libraries
            if (id.includes('qrcode') || id.includes('jsqr')) {
              return 'qr';
            }
            
            // Other vendor libraries
            return 'vendor';
          }
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    
    // Enable source maps for better debugging
    sourcemap: false, // Disable in production for smaller bundle
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  }
})