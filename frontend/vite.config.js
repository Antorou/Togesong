// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Assurez-vous que ce plugin est importé si vous l'utilisez
import tailwindcss from '@tailwindcss/vite' // Le plugin Tailwind CSS pour Vite

export default defineConfig({
  plugins: [
    react(), // Le plugin React pour Vite
    tailwindcss({
      // --- Configuration Tailwind CSS v4.x ---
      // C'est l'équivalent de la section 'theme' dans tailwind.config.js de v3
      theme: {
        extend: {
          colors: {
            // Couleurs existantes (Spotify)
            spotifyGreen: '#1DB954',
            spotifyDark: '#121212',
            spotifyCard: '#1e1e1e',
            spotifyAccent: '#333',
            spotifyTextLight: '#ccc',
            spotifyTextDark: '#fff',
            // NOUVELLES COULEURS POUR LE DESIGN "TOGESONG"
            togesongBlueLight: '#E0EEFF', // Couleur bleue claire pour le dégradé du haut/bas
            togesongBlueDark: '#A0C0FF',  // Couleur bleue foncée pour le dégradé du haut/bas
            togesongText: '#2C2C2C',      // Couleur de texte sombre pour les cartes claires
            togesongCardBg: '#FFFFFF',    // Fond blanc des cartes
            togesongBorder: '#E5E5E5',    // Bordure des cartes/éléments
            togesongTime: '#808080',      // Couleur du texte de l'heure
            togesongPlaceholder: '#D3D3D3', // Couleur des placeholders (images/avatar non chargés)
          },
          fontFamily: { // Configure la police Poppins
            sans: ['Poppins', 'sans-serif'], // 'sans' est le nom par défaut pour les polices sans-serif
          },
          boxShadow: { // Ajoute une ombre plus prononcée pour les cartes
            'card': '0 10px 20px rgba(0, 0, 0, 0.1)',
          }
        },
      },
      // Si vous aviez un fichier postcss.config.js pour Tailwind dans v3,
      // certaines configurations pourraient devoir être ici si elles ne sont pas automatiques en v4.
      // Mais pour l'heure, le setup via 'plugins' devrait être suffisant pour le thème.
    }),
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