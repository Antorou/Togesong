// frontend/src/components/FeedCard.jsx
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
    <div className="bg-togesongCard p-6 rounded-3xl shadow-card w-full max-w-lg mx-auto transform transition-transform duration-200 hover:scale-[1.01] border border-togesongBorder">
      {/* Section info utilisateur et date */}
      <div className="flex items-center mb-4">
        {/* Avatar du user */}
        <div className="w-14 h-14 bg-togesongPlaceholder rounded-full flex items-center justify-center overflow-hidden mr-4">
          {post.userImageUrl ? (
            <img src={post.userImageUrl} alt={post.userName} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          )}
        </div>
        <div>
          <Link to={`/profile/${post.userId}`} className="text-xl font-semibold text-togesongText hover:underline">
            {post.userName}
          </Link>
          <p className="text-togesongTime text-sm">{new Date(post.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Section image de l'album et infos du morceau */}
      <div className="mb-4">
        {/* Photo de l'album (grand carré) */}
        <div className="w-full h-72 bg-togesongPlaceholder rounded-xl overflow-hidden flex items-center justify-center mb-4">
          {post.albumImageUrl ? (
            <img src={post.albumImageUrl} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"></path></svg>
          )}
        </div>
        <h3 className="text-3xl font-bold text-togesongText">{post.title}</h3>
        <p className="text-xl text-togesongText opacity-80">{post.artist}</p>
        {post.previewUrl ? (
          <audio controls src={post.previewUrl} className="w-full mt-4 bg-togesongBorder rounded-md"></audio>
        ) : (
          <p className="text-sm text-togesongTime italic mt-4">Pas de prévisualisation disponible.</p>
        )}
      </div>

      {/* Section Likes et Commentaires */}
      <div className="flex justify-around items-center border-t border-togesongBorder pt-4 mt-4">
        <button
          onClick={handleLikeToggle}
          className="bg-transparent border-none p-2 text-4xl cursor-pointer transition-transform duration-200 hover:scale-110 disabled:cursor-not-allowed"
          style={{ color: isLikedByCurrentUser ? '#FF0000' : '#808080' }}
          disabled={!isSignedIn}
          title={isSignedIn ? (isLikedByCurrentUser ? 'Ne plus aimer' : 'Aimer') : 'Connectez-vous pour aimer'}
        >
          ❤️
        </button>
        <span className="text-togesongText text-xl">{post.likes.length}</span>

        <button
          onClick={() => setShowComments(!showComments)}
          className="bg-transparent border-none p-2 text-4xl cursor-pointer transition-transform duration-200 hover:scale-110 text-togesongTime"
        >
          💬
        </button>
        <span className="text-togesongText text-xl">{comments.length}</span>
      </div>

      {/* Section des commentaires (visible si showComments est true) */}
      {showComments && (
        <div className="mt-6 border-t border-togesongBorder pt-4 w-full">
          {isSignedIn ? (
            <div className="flex mb-4 gap-2 items-center">
              <input
                type="text"
                placeholder="Écrire un commentaire..."
                value={currentCommentText}
                onChange={(e) => setCurrentCommentText(e.target.value)}
                className="flex-grow p-3 rounded-lg border border-togesongBorder bg-gray-100 text-togesongText text-sm focus:border-spotifyGreen focus:outline-none"
              />
              <button onClick={handleAddComment} className="px-5 py-2 bg-spotifyGreen text-white rounded-lg font-bold hover:bg-green-600 transition-colors duration-200">
                Envoyer
              </button>
            </div>
          ) : (
            <p className="text-sm text-togesongTime text-center mb-4">Connectez-vous pour commenter.</p>
          )}

          <div className="flex flex-col gap-3">
              {comments.length > 0 ? (
                  comments.map(comment => (
                  <div key={comment._id} className="flex items-start p-3 bg-gray-50 rounded-lg shadow-sm">
                      {comment.userImageUrl && (
                      <img src={comment.userImageUrl} alt={comment.userName} className="w-8 h-8 rounded-full mr-3 object-cover border border-togesongBorder flex-shrink-0" />
                      )}
                      <div>
                      <p className="m-0 font-bold text-togesongText text-sm">{comment.userName}</p>
                      <p className="m-0 text-togesongText text-sm break-words">{comment.text}</p>
                      <p className="m-0 text-xs text-togesongTime mt-1">{new Date(comment.postedAt).toLocaleString()}</p>
                      </div>
                  </div>
                  ))
              ) : (
                  <p className="text-sm text-togesongTime text-center">Soyez le premier à commenter !</p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedCard;
