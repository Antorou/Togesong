import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth, SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [feed, setFeed] = useState([]);
  const [hasPostedToday, setHasPostedToday] = useState(false);

  const [showCommentsForPost, setShowCommentsForPost] = useState(null);
  const [currentCommentText, setCurrentCommentText] = useState('');
  const [comments, setComments] = useState({});

  const { isSignedIn, getToken, userId } = useAuth();
  const { user } = useUser();

  const fetchFeed = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/feed`);
      if (!response.ok) throw new Error('Erreur lors de la récupération du feed.');
      const data = await response.json();
      setFeed(data);
    } catch (err) {
      console.error("Erreur lors du chargement du feed:", err);
    }
  };

  const checkUserPostStatus = async () => {
    if (!isSignedIn || !userId) {
      setHasPostedToday(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/posts/feed`);
      if (!response.ok) throw new Error('Erreur lors de la vérification du statut de publication.');
      const data = await response.json();
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const userPost = data.find(
        (post) => post.userId === userId && new Date(post.postedAt).getTime() >= twentyFourHoursAgo
      );
      setHasPostedToday(!!userPost);
    } catch (err) {
      console.error("Erreur lors de la vérification du statut de publication:", err);
      setHasPostedToday(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    checkUserPostStatus();
    const intervalId = setInterval(() => {
      fetchFeed();
      checkUserPostStatus();
    }, 60 * 1000);
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
      alert("Vous avez déjà posté une musique dans les dernières 24 heures. Revenez demain !");
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
      fetchFeed();
      setHasPostedToday(true);
    } catch (err) {
      console.error("Erreur de publication:", err);
      alert(`Erreur lors de la publication : ${err.message}`);
    }
  };

  const handleLikeToggle = async (postId) => {
    if (!isSignedIn) {
      alert("Veuillez vous connecter pour liker un post.");
      return;
    }

    try {
      const token = await getToken({ template: 'long_lived' });
      const postToUpdate = feed.find(post => post._id === postId);
      if (!postToUpdate) return;

      const isLiked = postToUpdate.likes.includes(userId);
      const endpoint = isLiked ? `${API_BASE_URL}/posts/${postId}/unlike` : `${API_BASE_URL}/posts/${postId}/like`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la gestion du like.');
      }

      setFeed(prevFeed => prevFeed.map(post => {
        if (post._id === postId) {
          const newLikes = isLiked
            ? post.likes.filter(id => id !== userId)
            : [...post.likes, userId];
          return { ...post, likes: newLikes };
        }
        return post;
      }));
    } catch (err) {
      console.error("Erreur lors de la gestion du like:", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  const toggleComments = async (postId) => {
    if (showCommentsForPost === postId) {
      setShowCommentsForPost(null);
      setCurrentCommentText('');
    } else {
      setShowCommentsForPost(postId);
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des commentaires.');
        const data = await response.json();
        setComments(prevComments => ({
          ...prevComments,
          [postId]: data
        }));
      } catch (err) {
        console.error("Erreur lors du chargement des commentaires:", err);
        alert(`Erreur lors du chargement des commentaires : ${err.message}`);
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!isSignedIn || !user) {
      alert("Veuillez vous connecter pour commenter.");
      return;
    }
    if (currentCommentText.trim() === '') {
      alert("Le commentaire ne peut pas être vide.");
      return;
    }

    try {
      const token = await getToken({ template: 'long_lived' });
      const commentData = {
        text: currentCommentText,
        userName: user.fullName || user.username || (user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : 'Utilisateur'),
        userImageUrl: user.imageUrl
      };

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout du commentaire.');
      }

      const newComment = await response.json();
      setComments(prevComments => ({
        ...prevComments,
        [postId]: [newComment.comment, ...(prevComments[postId] || [])]
      }));
      setCurrentCommentText('');
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-bar">
          <h1>TOGESONG</h1>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        <h2>Rechercher et poster une musique</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}ffee
            placeholder="Rechercher une musique..."
            className="search-input"
          />
          <button type="submit" className="search-button">Rechercher</button>
        </form>

        {loading && <p>Chargement des résultats...</p>}
        {error && <p className="error-message">Erreur : {error}</p>}

        {isSignedIn && hasPostedToday && (
          <p className="warning-message">
            Vous avez déjà posté votre musique aujourd'hui. Revenez demain !
          </p>
        )}
        {!isSignedIn && (
          <p className="info-message">
            Connectez-vous pour poster votre musique DailyTune !
          </p>
        )}

        <div className="results-list">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <div key={track.id} className="track-item">
                {track.album.images.length > 0 && (
                  <img src={track.album.images[0].url} alt={track.name} className="track-img" />
                )}
                <div>
                  <h3>{track.name}</h3>
                  <p>{track.artists.map(artist => artist.name).join(', ')} - {track.album.name}</p>
                  <button
                    onClick={() => handlePostTrack(track)}
                    disabled={!isSignedIn || hasPostedToday}
                    className="post-button"
                  >
                    Poster cette musique
                  </button>
                </div>
              </div>
            ))
          ) : (
            !loading && !error && searchTerm && <p>Aucun résultat trouvé pour "{searchTerm}".</p>
          )}
        </div>

        <hr className="divider" />

        <h2>Feed</h2>
        <div className="feed-list">
          {feed.length > 0 ? (
            feed.map((post) => {
              const isLikedByCurrentUser = post.likes.includes(userId);
              const postComments = comments[post._id] || [];

              return (
                <div key={post._id} className="feed-item">
                  <div className="post-main-content">
                    {post.albumImageUrl && (
                      <img src={post.albumImageUrl} alt={post.title} className="feed-img" />
                    )}
                    <div className="post-details">
                      <h3>{post.title}</h3>
                      <p>{post.artist} - {post.album}</p>
                    </div>
                  </div>

                  <div className="posted-by">
                    {post.userImageUrl && (
                      <img src={post.userImageUrl} alt={post.userName} className="user-avatar" />
                    )}
                    <p className="posted-text">
                      Posté par <Link to={`/profile/${post.userId}`} className="user-link">{post.userName}</Link> le {new Date(post.postedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="likes-section">
                    <button
                      onClick={() => handleLikeToggle(post._id)}
                      className="like-button"
                      style={{ color: isLikedByCurrentUser ? '#FF0000' : 'var(--text-light)' }}
                      disabled={!isSignedIn}
                      title={isSignedIn ? (isLikedByCurrentUser ? 'Ne plus aimer' : 'Aimer') : 'Connectez-vous pour aimer'}
                    >
                      ❤️
                    </button>
                    <span className="likes-count">{post.likes.length} J'aime</span>
                  </div>

                  <div className="comments-container">
                    <button onClick={() => toggleComments(post._id)} className="comment-toggle-button">
                      {showCommentsForPost === post._id ? `Masquer les commentaires (${postComments.length})` : `Afficher les commentaires (${postComments.length})`}
                    </button>

                    {showCommentsForPost === post._id && (
                      <div className="comments-section">
                        {isSignedIn ? (
                          <div className="comment-input-area">
                            <input
                              type="text"
                              placeholder="Écrire un commentaire..."
                              value={currentCommentText}
                              onChange={(e) => setCurrentCommentText(e.target.value)}
                              className="comment-input"
                            />
                            <button onClick={() => handleAddComment(post._id)} className="comment-submit-button">
                              Envoyer
                            </button>
                          </div>
                        ) : (
                          <p className="info-message">Connectez-vous pour commenter.</p>
                        )}

                        <div className="comments-list">
                          {postComments.length > 0 ? (
                            postComments.map(comment => (
                              <div key={comment._id} className="comment-item">
                                {comment.userImageUrl && (
                                  <img src={comment.userImageUrl} alt={comment.userName} className="comment-user-avatar" />
                                )}
                                <div className="comment-content">
                                  <p className="comment-author">{comment.userName}</p>
                                  <p className="comment-text">{comment.text}</p>
                                  <p className="comment-date">{new Date(comment.postedAt).toLocaleString()}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="info-message">Soyez le premier à commenter !</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>Le feed est vide pour le moment. Postez la première musique !</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
