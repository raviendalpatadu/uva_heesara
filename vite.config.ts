import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Custom domain uses root path, not subdirectory
  server: {
    host: "127.0.0.1",
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production to prevent API exposure
    minify: 'terser',
  },
  // Remove manual define - let Vite handle environment variables automatically
  // Vite will automatically load .env.local, .env.development, etc.
})
