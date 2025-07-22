import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function SearchPostPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasPostedToday, setHasPostedToday] = useState(false);

  const { isSignedIn, getToken, userId } = useAuth();
  const { user } = useUser();

  const checkUserPostStatus = async () => {
    if (!isSignedIn || !userId) {
      setHasPostedToday(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`);
      if (!response.ok) throw new Error('Erreur lors de la vérification du statut de publication.');
      const data = await response.json();
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const userPost = data.find(
        (post) => new Date(post.postedAt).getTime() >= twentyFourHoursAgo
      );
      setHasPostedToday(!!userPost);
    } catch (err) {
      console.error("Erreur lors de la vérification du statut de publication:", err);
      setHasPostedToday(false);
    }
  };

  useEffect(() => {
    checkUserPostStatus();
    const intervalId = setInterval(checkUserPostStatus, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [isSignedIn, userId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTracks([]);

    try {
      const response = await fetch(`${API_BASE_URL}/spotify/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la recherche Spotify');
      }

      const data = await response.json();
      setTracks(data.tracks.items || []);
    } catch (err) {
      console.error("Erreur de recherche:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostTrack = async (track) => {
    if (!isSignedIn || !user) {
      alert("Veuillez vous connecter pour poster une musique.");
      return;
    }
    if (hasPostedToday) {
      alert("Vous avez déjà posté une musique DailyTune pour aujourd'hui. Revenez demain !");
      return;
    }

    try {
      const token = await getToken({ template: 'long_lived' });

      const postData = {
        spotifyId: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        albumImageUrl: track.album.images.length > 0 ? track.album.images[0].url : '',
        previewUrl: track.preview_url,
        userName: user.fullName || user.username || (user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : 'Utilisateur'),
        userImageUrl: user.imageUrl
      };

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la publication de la musique.');
      }

      alert('Musique postée avec succès !');
      setSearchTerm('');
      setTracks([]);
      setHasPostedToday(true);
    } catch (err) {
      console.error("Erreur de publication:", err);
      alert(`Erreur lors de la publication : ${err.message}`);
    }
  };

  return (
    <div className="py-8">
      <h2 className="text-4xl font-bold text-spotifyGreen mb-8 text-center">Rechercher et poster une musique</h2>
      <form onSubmit={handleSearch} className="flex gap-4 justify-center mb-5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une musique..."
          className="p-3 rounded-lg w-80 bg-spotifyCard text-spotifyTextDark border border-spotifyAccent focus:border-spotifyGreen focus:outline-none"
        />
        <button type="submit" className="bg-spotifyGreen text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-all duration-300 shadow-md">
          Rechercher
        </button>
      </form>

      {loading && <p className="text-spotifyTextLight mt-4">Chargement des résultats...</p>}
      {error && <p className="text-red-500 font-bold mt-4">{error}</p>}

      {isSignedIn && hasPostedToday && (
        <p className="text-orange-500 font-bold mt-4">
          Vous avez déjà posté votre musique DailyTune pour aujourd'hui. Revenez demain !
        </p>
      )}
      {!isSignedIn && (
        <p className="text-spotifyTextLight mt-4">
          Connectez-vous pour poster votre musique DailyTune !
        </p>
      )}

      <div className="flex flex-col gap-4 mt-8 w-full">
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <div key={track.id} className="flex items-start bg-spotifyCard p-4 rounded-lg shadow-lg transition-transform duration-200 hover:scale-[1.02] flex-wrap">
              {track.album.images.length > 0 && (
                <img src={track.album.images[0].url} alt={track.name} className="w-20 h-20 rounded-lg mr-4 object-cover flex-shrink-0" />
              )}
              <div className="flex-grow flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-spotifyTextDark mb-1">{track.name}</h3>
                <p className="text-spotifyTextLight text-sm mb-2">{track.artists.map(artist => artist.name).join(', ')} - {track.album.name}</p>
                {track.preview_url ? (
                  <audio controls src={track.preview_url} className="w-full min-w-[200px] mt-2 bg-spotifyAccent rounded-md outline-none"></audio>
                ) : (
                  <p className="text-sm text-spotifyTextLight italic mt-2">Pas de prévisualisation disponible.</p>
                )}
                <button
                  onClick={() => handlePostTrack(track)}
                  disabled={!isSignedIn || hasPostedToday}
                  className="mt-4 px-4 py-2 bg-spotifyGreen text-white rounded-md font-bold hover:bg-green-600 transition-all duration-300 self-start disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Poster cette musique
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && !error && searchTerm && <p className="text-spotifyTextLight mt-4">Aucun résultat trouvé pour "{searchTerm}".</p>
        )}
      </div>
    </div>
  );
}

export default SearchPostPage;
