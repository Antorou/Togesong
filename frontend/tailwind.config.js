// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        // --- NOUVELLES COULEURS POUR LE DESIGN "TOGESONG" ---
        togesongBlueLight: '#E0EEFF', // Couleur bleue claire pour le dégradé du haut/bas
        togesongBlueDark: '#A0C0FF',  // Couleur bleue foncée pour le dégradé du haut/bas
        togesongText: '#2C2C2C',      // Couleur de texte sombre pour les cartes claires
        togesongCardBg: '#FFFFFF',    // Fond blanc des cartes
        togesongBorder: '#E5E5E5',    // Bordure des cartes/éléments
        togesongTime: '#808080',      // Couleur du texte de l'heure
        togesongPlaceholder: '#D3D3D3', // Couleur des placeholders (images/avatar non chargés)
        // ----------------------------------------------------
      },
      fontFamily: { // Configure la police Poppins
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: { // Ajoute une ombre plus prononcée pour les cartes
        'card': '0 10px 20px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}