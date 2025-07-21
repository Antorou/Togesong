// frontend/src/components/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams pour récupérer l'ID de l'URL, Link pour la navigation
import { useUser, useAuth } from '@clerk/clerk-react'; // Pour vérifier l'utilisateur actuel
// import './ProfilePage.css'; // Pour les styles spécifiques au profil

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function ProfilePage() {
  const { userId: profileUserId } = useParams(); // Récupère l'ID utilisateur depuis l'URL
  const { user: currentUser } = useUser(); // Informations de l'utilisateur connecté
  const { isSignedIn, userId: currentUserId } = useAuth(); // ID de l'utilisateur connecté

  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/posts/user/${profileUserId}`); // Nouvelle route back-end
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
  }, [profileUserId]); // Recharge si l'ID utilisateur dans l'URL change

  // Afficher le nom de l'utilisateur du profil ou "Utilisateur inconnu"
  const displayName = userPosts.length > 0 ? userPosts[0].userName : (currentUser && currentUser.id === profileUserId ? currentUser.fullName || currentUser.username : `Utilisateur ID: ${profileUserId.substring(0, 8)}...`);
  const profileImage = userPosts.length > 0 ? userPosts[0].userImageUrl : (currentUser && currentUser.id === profileUserId ? currentUser.imageUrl : 'https://www.gravatar.com/avatar/?d=mp'); // Placeholder si pas d'image

  return (
    <div className="profile-page-container" style={{ padding: '20px', maxWidth: '800px', margin: 'auto', textAlign: 'center', backgroundColor: '#282c34', color: '#e0e0e0' }}>
      <Link to="/" style={{ color: '#1DB954', textDecoration: 'none', marginBottom: '20px', display: 'block' }}>&larr; Retour au feed principal</Link>

      <h2 style={{ color: '#1DB954', marginTop: '20px' }}>Profil de {displayName}</h2>
      <img src={profileImage} alt="Photo de profil" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #1DB954', marginBottom: '20px' }} />

      {loading && <p>Chargement des musiques de l'utilisateur...</p>}
      {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}

      <h3 style={{ color: '#e0e0e0', marginTop: '30px', marginBottom: '20px' }}>Musiques partagées par {displayName}</h3>
      <div className="user-posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div key={post._id} className="feed-item" style={{ border: '1px solid #555', backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              {post.albumImageUrl && (
                <img src={post.albumImageUrl} alt={post.title} style={{ width: '60px', height: '60px', borderRadius: '8px', marginRight: '10px' }} />
              )}
              <div>
                <h3>{post.title}</h3>
                <p>{post.artist} - {post.album}</p>
                {post.previewUrl && (
                  <audio controls src={post.previewUrl} style={{ width: '100%', marginTop: '10px' }}>
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                )}
                <p style={{ fontSize: '0.8em', color: '#aaa', marginTop: '10px' }}>Posté le : {new Date(post.postedAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>Cet utilisateur n'a pas encore partagé de musiques.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;