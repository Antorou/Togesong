import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

function BottomNav() {
  const location = useLocation();
  const { userId } = useAuth();

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path || (path === '/' && location.pathname === '/');
    if (path.includes('/profile/') && location.pathname.startsWith('/profile/')) {
      if (userId && location.pathname === `/profile/${userId}`) {
        return `flex flex-col items-center p-2 rounded-lg transition-colors duration-200 
                text-white bg-spotifyGreen shadow-lg`;
      }
    }
    return `flex flex-col items-center p-2 rounded-lg transition-colors duration-200 
            ${isActive ? 'text-white bg-spotifyGreen shadow-lg' : 'text-togesongText hover:bg-gray-200'}`;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-togesongBlueLight to-togesongBlueDark rounded-t-3xl shadow-xl p-3">
      <div className="flex justify-around items-center w-full max-w-md mx-auto">
        <Link to="/" className={getLinkClasses('/')}>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
          <span className="text-xs mt-1">Feed</span>
        </Link>
        <Link to="/search-post" className={getLinkClasses('/search-post')}>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
          <span className="text-xs mt-1">Ajouter</span>
        </Link>
        <Link to={`/profile/${userId}`} className={getLinkClasses(`/profile/${userId}`)}>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          <span className="text-xs mt-1">Profil</span>
        </Link>
      </div>
    </nav>
  );
}

export default BottomNav;
