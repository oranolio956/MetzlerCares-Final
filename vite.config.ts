import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // SECURITY: No hardcoded fallbacks. 
  // API Keys must be provided via environment variables in the CI/CD pipeline.
  // The frontend will fail gracefully if keys are missing (triggering Mock Mode).
  const apiKey = env.API_KEY; 
  
  return {
    plugins: [react()],
    // Use relative asset paths so the app can be served from sub-paths
    // like /dashboard without breaking module resolution.
    base: './',
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env': JSON.stringify(env)
    },
  };
});