import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import FeedCard from '../components/FeedCard';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function HomePage() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isSignedIn, userId } = useAuth();

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/feed`);
      if (!response.ok) throw new Error('Erreur lors de la récupération du feed.');
      const data = await response.json();
      setFeed(data);
    } catch (err) {
      console.error("Erreur lors du chargement du feed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const intervalId = setInterval(fetchFeed, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <p className="text-primary text-lg mt-8 text-center">Chargement du feed...</p>;
  if (error) return <p className="text-error-color font-bold text-lg mt-8 text-center">Erreur : {error}</p>;

  return (
    <div className="w-full max-w-lg md:max-w-3xl mx-auto py-6 md:py-8">
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 md:mb-8 text-center">Feed</h2>
      <div className="flex flex-col gap-6">
        {feed.length > 0 ? (
          feed.map((post) => (
            <FeedCard key={post._id} post={post} fetchFeed={fetchFeed} />
          ))
        ) : (
          <p className="text-primary text-center text-base md:text-lg mt-8">Le feed est vide pour le moment. Postez la première musique !</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;