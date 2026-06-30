import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// В Docker dev target должен быть именно backend-сервис (см. docker-compose API_PROXY_TARGET).
const proxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:3000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Важно для Docker
    port: 5173,
    watch: {
      usePolling: true // fallback для старых версий docker/windows
    },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true
      }
    }
  }
});
