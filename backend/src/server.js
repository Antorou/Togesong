
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { getSpotifyAccessToken } = require('./utils/spotifyAuth');
const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, async () => {
  console.log(`Le serveur back-end est lancé sur le port ${PORT}`);
  await getSpotifyAccessToken();
});