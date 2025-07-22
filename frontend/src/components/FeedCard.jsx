import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function FeedCard({ post, fetchFeed }) { // post et fetchFeed sont passés en props
  const { isSignedIn, getToken, userId } = useAuth();
  const { user } = useUser();

  const [showComments, setShowComments] = useState(false);
  const [currentCommentText, setCurrentCommentText] = useState('');
  const [comments, setComments] = useState([]); // État pour les commentaires de *ce* post

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
      fetchFeed();
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
    <div className="flex flex-col items-start bg-spotifyCard p-4 rounded-lg shadow-lg transition-transform duration-200 hover:translate-y-[-3px] gap-0 w-full">
      <div className="flex items-start w-full mb-2">
        {post.albumImageUrl && (
          <img src={post.albumImageUrl} alt={post.title} className="w-20 h-20 rounded-lg mr-4 object-cover flex-shrink-0" />
        )}
        <div className="flex-grow flex flex-col justify-center">
          <h3 className="text-xl font-semibold text-spotifyTextDark mb-1">{post.title}</h3>
          <p className="text-spotifyTextLight text-sm mb-2">{post.artist} - {post.album}</p>
          {post.previewUrl ? (
            <audio controls src={post.previewUrl} className="w-full min-w-[200px] mt-2 bg-spotifyAccent rounded-md outline-none"></audio>
          ) : (
            <p className="text-sm text-spotifyTextLight italic mt-2">Pas de prévisualisation disponible.</p>
          )}
        </div>
      </div>

      <div className="flex items-center mt-2 w-full text-sm text-spotifyTextLight">
        {post.userImageUrl && (
            <img src={post.userImageUrl} alt={post.userName} className="w-7 h-7 rounded-full mr-2 object-cover border border-spotifyGreen" />
        )}
        <p className="m-0">
            Posté par <Link to={`/profile/${post.userId}`} className="font-bold text-spotifyGreen no-underline hover:underline">{post.userName}</Link> le {new Date(post.postedAt).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center mt-3 w-full gap-2">
        <button
          onClick={handleLikeToggle}
          className="bg-transparent border-none p-0 text-3xl cursor-pointer transition-transform duration-200 hover:scale-110 disabled:cursor-not-allowed"
          style={{ color: isLikedByCurrentUser ? '#FF0000' : 'var(--spotifyTextLight)' }}
          disabled={!isSignedIn}
          title={isSignedIn ? (isLikedByCurrentUser ? 'Ne plus aimer' : 'Aimer') : 'Connectez-vous pour aimer'}
        >
          ❤️
        </button>
        <span className="text-spotifyTextLight text-base">{post.likes.length} J'aime</span>
      </div>

      <div className="w-full mt-4">
        <button onClick={() => setShowComments(!showComments)} className="bg-spotifyAccent text-spotifyTextDark px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors duration-200 w-auto self-start">
          {showComments ? `Masquer les commentaires (${comments.length})` : `Afficher les commentaires (${comments.length})`}
        </button>

        {showComments && (
          <div className="mt-4 border-t border-spotifyAccent pt-4 text-left w-full">
            {isSignedIn ? (
              <div className="flex mb-4 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Écrire un commentaire..."
                  value={currentCommentText}
                  onChange={(e) => setCurrentCommentText(e.target.value)}
                  className="flex-grow p-2 rounded-md border border-spotifyAccent bg-spotifyDark text-spotifyTextDark text-sm outline-none focus:border-spotifyGreen"
                />
                <button onClick={handleAddComment} className="px-4 py-2 bg-spotifyGreen text-white rounded-md text-sm font-bold hover:bg-green-600 transition-colors duration-200 flex-shrink-0">
                  Envoyer
                </button>
              </div>
            ) : (
              <p className="text-sm text-spotifyTextLight">Connectez-vous pour commenter.</p>
            )}

            <div className="flex flex-col gap-3">
                {comments.length > 0 ? (
                    comments.map(comment => (
                    <div key={comment._id} className="flex items-start p-3 bg-spotifyAccent rounded-lg shadow-sm">
                        {comment.userImageUrl && (
                        <img src={comment.userImageUrl} alt={comment.userName} className="w-7 h-7 rounded-full mr-2 object-cover flex-shrink-0" />
                        )}
                        <div className="flex-grow">
                        <p className="m-0 font-bold text-spotifyGreen text-sm">{comment.userName}</p>
                        <p className="m-0 text-spotifyTextDark text-sm break-words">{comment.text}</p>
                        <p className="m-0 text-xs text-spotifyTextLight mt-1">{new Date(comment.postedAt).toLocaleString()}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="text-sm text-spotifyTextLight">Soyez le premier à commenter !</p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedCard;
