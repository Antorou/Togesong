import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function ProfilePage() {
  const { userId: profileUserId } = useParams();
  const { user: currentUser } = useUser();

  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/posts/user/${profileUserId}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des posts de l\'utilisateur.');
        }
        const data = await response.json();
        setUserPosts(data);
      } catch (err) {
        console.error("Erreur lors du chargement des posts de l'utilisateur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profileUserId) {
      fetchUserPosts();
    }
  }, [profileUserId]);

  const displayName = userPosts.length > 0
    ? userPosts[0].userName
    : (currentUser && currentUser.id === profileUserId
        ? currentUser.fullName || currentUser.username || (currentUser.primaryEmailAddress ? currentUser.primaryEmailAddress.emailAddress : `Utilisateur ID: ${profileUserId.substring(0, 8)}...`)
        : `Utilisateur ID: ${profileUserId ? profileUserId.substring(0, 8) + '...' : 'Inconnu'}`);

  const profileImage = userPosts.length > 0
    ? userPosts[0].userImageUrl
    : (currentUser && currentUser.id === profileUserId
        ? currentUser.imageUrl
        : 'https://www.gravatar.com/avatar/?d=mp');

  return (
    <div className="w-full max-w-3xl bg-togesongCard p-8 rounded-lg shadow-xl mx-auto my-8 border border-togesongBorder text-togesongText">
      <Link to="/" className="text-spotifyGreen no-underline text-lg font-bold block mb-5 hover:underline text-center">
        &larr; Retour au feed principal
      </Link>

      <h2 className="text-4xl font-bold text-togesongText mt-5 mb-6 text-center">Profil de {displayName}</h2>
      <img src={profileImage} alt="Photo de profil" className="w-32 h-32 rounded-full object-cover border-4 border-spotifyGreen mb-6 mx-auto" />

      {loading && <p className="text-togesongTime text-center">Chargement des musiques de l'utilisateur...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <h3 className="text-2xl font-semibold text-togesongText mt-8 mb-6 text-center">Musiques partagées par {displayName}</h3>
      <div className="flex flex-col gap-4">
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div key={post._id} className="flex items-start bg-gray-50 p-4 rounded-lg shadow-md transition-transform duration-200 hover:translate-y-[-2px] flex-wrap border border-togesongBorder">
              {post.albumImageUrl && (
                <img src={post.albumImageUrl} alt={post.title} className="w-16 h-16 rounded-md mr-4 object-cover flex-shrink-0" />
              )}
              <div className="flex-grow flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-togesongText mb-1">{post.title}</h3>
                <p className="text-togesongTime text-sm mb-2">{post.artist} - {post.album}</p>
                {post.previewUrl ? (
                  <audio controls src={post.previewUrl} className="w-full min-w-[150px] mt-2 bg-togesongBorder rounded-md outline-none"></audio>
                ) : (
                  <p className="text-sm text-togesongTime italic mt-2">Pas de prévisualisation disponible.</p>
                )}
                <p className="text-xs text-togesongTime mt-2">Posté le : {new Date(post.postedAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          !loading && <p className="text-togesongTime text-center">Cet utilisateur n'a pas encore partagé de musiques.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
