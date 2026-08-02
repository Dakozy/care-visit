import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: change "base" to match your GitHub repository name exactly.
// If your repo is https://github.com/<user>/senior-care-visit-app
// then base must be '/senior-care-visit-app/'
export default defineConfig({
  plugins: [react()],
  base: '/senior-care-visit-app/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
  },
});
