const express = require('express');
const { getSpotifyAccessToken } = require('../utils/spotifyAuth');


const router = express.Router();

router.get('/search', async (req, res) => {
    const searchTerm = req.query.q;

    if (!searchTerm) {
        return res.status(400).json({ message: 'Le terme de recherche est requis.' });
    }

    const accessToken = await getSpotifyAccessToken();
    if (!accessToken) {
        return res.status(500).json({ message: 'Impossible d\'obtenir le token Spotify pour la recherche.' });
    }

    try {
        const spotifyResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=10`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const spotifyData = await spotifyResponse.json();
        res.json(spotifyData);
    } catch (error) {
        console.error('Erreur lors de la recherche Spotify:', error.message);
        res.status(500).json({ message: 'Erreur lors de la recherche Spotify.' });
    }
});

module.exports = router;