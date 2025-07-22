import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Assurez-vous que ce plugin est importé si vous l'utilisez
import tailwindcss from '@tailwindcss/vite' // Le plugin Tailwind CSS pour Vite

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});