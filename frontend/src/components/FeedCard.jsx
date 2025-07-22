import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function FeedCard({ post, fetchFeed }) {
  const { isSignedIn, getToken, userId } = useAuth();
  const { user } = useUser();

  const [showComments, setShowComments] = useState(false);
  const [currentCommentText, setCurrentCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const isLikedByCurrentUser = post.likes.includes(userId);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post._id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${post._id}/comments`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des commentaires.');
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("Erreur lors du chargement des commentaires:", err);
    }
  };

  const handleLikeToggle = async () => {
    if (!isSignedIn) {
      alert("Veuillez vous connecter pour liker un post.");
      return;
    }

    try {
      const token = await getToken({ template: 'long_lived' });
      const endpoint = isLikedByCurrentUser
        ? `${API_BASE_URL}/posts/${post._id}/unlike`
        : `${API_BASE_URL}/posts/${post._id}/like`;

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
      fetchFeed(); // Re-fetch le feed principal après un like/unlike
    } catch (err) {
      console.error("Erreur lors de la gestion du like:", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  const handleAddComment = async () => {
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

      const response = await fetch(`${API_BASE_URL}/posts/${post._id}/comments`, {
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
      setComments(prevComments => [newComment.comment, ...prevComments]);
      setCurrentCommentText('');
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  return (
    <div className="card-background p-4 sm:p-6 rounded-3xl shadow-lg w-full max-w-md mx-auto transform transition-transform duration-200 hover:scale-[1.01]">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 placeholder-background rounded-full flex items-center justify-center overflow-hidden mr-3 sm:mr-4">
          {post.userImageUrl ? (
            <img src={post.userImageUrl} alt={post.userName} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-9 h-9 sm:w-10 sm:h-10 text-secondary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          )}
        </div>
        <div>
          <Link to={`/profile/${post.userId}`} className="text-lg sm:text-xl font-semibold text-primary hover:underline">
            {post.userName}
          </Link>
          <p className="text-secondary text-sm">{new Date(post.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full h-60 sm:h-72 placeholder-background rounded-xl overflow-hidden flex items-center justify-center mb-4">
          {post.albumImageUrl ? (
            <img src={post.albumImageUrl} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-20 h-20 sm:w-24 sm:h-24 text-border-dark" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"></path></svg>
          )}
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-primary">{post.title}</h3>
        <p className="text-lg sm:text-xl text-primary opacity-80">{post.artist}</p>
        {post.previewUrl ? (
          <audio controls src={post.previewUrl} className="w-full mt-4 audio-control-colors rounded-md"></audio>
        ) : (
          <p className="text-sm text-secondary italic mt-4">Pas de prévisualisation disponible.</p>
        )}
      </div>

      <div className="flex justify-around items-center border-t border-light pt-4 mt-4">
        <button
          onClick={handleLikeToggle}
          className="bg-transparent border-none p-2 text-3xl sm:text-4xl cursor-pointer transition-transform duration-200 hover:scale-110 disabled:cursor-not-allowed"
          style={{ color: isLikedByCurrentUser ? 'var(--liked-color)' : 'var(--default-like-color)' }}
          disabled={!isSignedIn}
          title={isSignedIn ? (isLikedByCurrentUser ? 'Ne plus aimer' : 'Aimer') : 'Connectez-vous pour aimer'}
        >
          ❤️
        </button>
        <span className="text-primary text-lg sm:text-xl">{post.likes.length}</span>

        <button
          onClick={() => setShowComments(!showComments)}
          className="bg-transparent border-none p-2 text-3xl sm:text-4xl cursor-pointer transition-transform duration-200 hover:scale-110 text-secondary"
        >
          💬
        </button>
        <span className="text-primary text-lg sm:text-xl">{comments.length}</span>
      </div>

      {showComments && (
        <div className="mt-6 border-t border-light pt-4 w-full">
          {isSignedIn ? (
            <div className="flex mb-4 gap-2 items-center">
              <input
                type="text"
                placeholder="Écrire un commentaire..."
                value={currentCommentText}
                onChange={(e) => setCurrentCommentText(e.target.value)}
                className="flex-grow p-2 sm:p-3 rounded-lg border border-light input-background text-primary text-sm focus-input-border focus:outline-none"
              />
              <button onClick={handleAddComment} className="button-primary px-4 py-2 sm:px-5 sm:py-2 rounded-lg font-bold hover-button transition-colors duration-200">
                Envoyer
              </button>
            </div>
          ) : (
            <p className="text-sm text-secondary text-center mb-4">Connectez-vous pour commenter.</p>
          )}

          <div className="flex flex-col gap-3">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment._id} className="flex items-start p-3 comment-background rounded-lg shadow-sm">
                  {comment.userImageUrl && (
                    <img src={comment.userImageUrl} alt={comment.userName} className="w-8 h-8 rounded-full mr-3 object-cover border border-light flex-shrink-0" />
                  )}
                  <div>
                    <p className="m-0 font-bold text-primary text-sm">{comment.userName}</p>
                    <p className="m-0 text-primary text-sm break-words">{comment.text}</p>
                    <p className="m-0 text-xs text-secondary mt-1">{new Date(comment.postedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-secondary text-center">Soyez le premier à commenter !</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedCard;