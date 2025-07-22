import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar'; // Importez la Navbar
import './App.css'; // Gardez les styles généraux de App.css si nécessaire (principalement @apply)

function App() {
  return (
    <div className="min-h-screen bg-spotifyDark text-spotifyTextDark">
      <Navbar />
      <main className="container mx-auto p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
