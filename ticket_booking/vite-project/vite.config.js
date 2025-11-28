import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/events': 'http://localhost:8080',
      '/bookings': 'http://localhost:8080',
      '/organizer': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
    },
  },
});