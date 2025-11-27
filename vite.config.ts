import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  const apiKey = env.API_KEY || "AlzaSyAqMCWgPXROSW7TmIJUtbWYs3fjwaWizsE";
  return {
    plugins: [react()],
    define: {
      // This ensures your existing code using process.env.API_KEY works
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env': JSON.stringify(env)
    },
  };
});