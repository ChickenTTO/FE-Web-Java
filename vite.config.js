import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: env.VITE_DEMO_MODE === 'false' ? {
        '/api': {
          target: env.API_PROXY_TARGET || 'https://covetable-unthreateningly-nia.ngrok-free.dev',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: '',
          headers: { 'ngrok-skip-browser-warning': 'true' },
        },
      } : {},
    },
  };
})
