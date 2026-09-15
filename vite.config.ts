import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    // Use the next available port instead of failing when 5173 is occupied.
    strictPort: false,
    watch: {
      ignored: ['**/target/**', '**/contracts/**/target/**', '**/.git/**'],
    },
  },
});
