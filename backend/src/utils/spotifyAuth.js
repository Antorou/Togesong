const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let spotifyAccessToken = null;
let tokenExpiryTime = 0;


const getSpotifyAccessToken = async () => {
    const currentTime = Date.now();
    if (spotifyAccessToken && (tokenExpiryTime - currentTime > 60 * 1000)) {
        return spotifyAccessToken;
    }

    const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authString}`
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        if (data.access_token) {
            spotifyAccessToken = data.access_token;
            tokenExpiryTime = currentTime + (data.expires_in * 1000);
            console.log('Nouveau token Spotify obtenu ! Valide pour', data.expires_in, 'secondes.');
            return spotifyAccessToken;
        } else {
            console.error('Erreur lors de l\'obtention du token Spotify:', data);
            spotifyAccessToken = null;
            return null;
        }
    } catch (error) {
        console.error('Erreur de réseau lors de l\'obtention du token Spotify:', error.message);
        spotifyAccessToken = null;
        return null;
    }
};

module.exports = { getSpotifyAccessToken };