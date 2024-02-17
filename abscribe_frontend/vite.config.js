import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
      open: false,
    }
  };
});
