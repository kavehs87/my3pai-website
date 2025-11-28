import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // Load env variables based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  
  // Backend URL for proxy - uses VITE_API_BASE_URL or falls back to localhost
  const backendUrl = env.VITE_API_BASE_URL 
    ? new URL(env.VITE_API_BASE_URL).origin 
    : 'http://localhost:8000'
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        // Proxy storage requests to Laravel backend to avoid CORS issues in development
        // In production, the backend should be configured with proper CORS headers
        '/storage': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      sourcemap: true
    }
  }
})
