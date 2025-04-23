import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { config } from 'process';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss({
      config:{
        darkMode:'class'
      }
    }), 
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5132',
        changeOrigin: true,
        secure: false, 
      },
    },
  },
  
  build: {
    outDir: 'build',
  },
});
