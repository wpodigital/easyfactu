import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api calls to the Express backend during local development.
    // This avoids CORS issues when VITE_API_URL is not set.
    // Override the target with the BACKEND_URL env var if needed, e.g.:
    //   BACKEND_URL=http://localhost:4000 npm run dev
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
