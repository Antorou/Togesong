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
    <div className="w-full max-w-xl md:max-w-3xl card-background p-6 md:p-8 rounded-lg shadow-xl mx-auto my-6 md:my-8 text-primary">
      <Link to="/" className="text-accent no-underline text-base md:text-lg font-bold block mb-4 md:mb-5 hover:underline text-center">
        &larr; Retour au feed principal
      </Link>

      <h2 className="text-3xl md:text-4xl font-bold text-primary mt-4 md:mt-5 mb-5 md:mb-6 text-center">Profil de {displayName}</h2>
      <img src={profileImage} alt="Photo de profil" className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-accent mb-5 md:mb-6 mx-auto" />

      {loading && <p className="text-secondary text-center">Chargement des musiques de l'utilisateur...</p>}
      {error && <p className="text-error-color text-center">{error}</p>}

      <h3 className="text-xl md:text-2xl font-semibold text-primary mt-6 md:mt-8 mb-5 md:mb-6 text-center">Musiques partagées par {displayName}</h3>
      <div className="flex flex-col gap-4">
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div key={post._id} className="flex items-start content-background p-3 md:p-4 rounded-lg shadow-md transition-transform duration-200 hover:translate-y-[-2px] flex-wrap">
              {post.albumImageUrl && (
                <img src={post.albumImageUrl} alt={post.title} className="w-14 h-14 md:w-16 md:h-16 rounded-md mr-3 md:mr-4 object-cover flex-shrink-0" />
              )}
              <div className="flex-grow flex flex-col justify-center">
                <h3 className="text-base md:text-lg font-semibold text-primary mb-1">{post.title}</h3>
                <p className="text-secondary text-sm mb-2">{post.artist} - {post.album}</p>
                {post.previewUrl ? (
                  <audio controls src={post.previewUrl} className="w-full min-w-[150px] mt-2 audio-control-colors rounded-md outline-none"></audio>
                ) : (
                  <p className="text-sm text-secondary italic mt-2">Pas de prévisualisation disponible.</p>
                )}
                <p className="text-xs text-secondary mt-2">Posté le : {new Date(post.postedAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          !loading && <p className="text-secondary text-center">Cet utilisateur n'a pas encore partagé de musiques.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;