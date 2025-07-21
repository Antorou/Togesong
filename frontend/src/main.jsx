import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import ProfilePage from './components/ProfilePage.jsx';

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
          <Route path="/" element={<App />} />
          <Route path="/profile/:userId" element={<ProfilePage />} /> 
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
);