import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // App sera notre layout principal
import './index.css'; // Styles globaux
import ProfilePage from './components/ProfilePage.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPostPage from './pages/SearchPostPage.jsx';

import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key from Clerk. Check your .env (root) or docker-compose.yml.");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          {/* App est maintenant la route parente qui contient la Navbar et l'Outlet */}
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} /> {/* La page d'accueil par défaut */}
            <Route path="search-post" element={<SearchPostPage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
);