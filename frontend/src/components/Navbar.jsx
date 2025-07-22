import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="bg-spotifyCard shadow-md py-4 px-6 md:px-8 flex justify-between items-center sticky top-0 z-50 rounded-b-lg">
      <h1 className="text-3xl font-extrabold text-spotifyGreen tracking-wider">
        <Link to="/" className="text-spotifyGreen hover:text-green-500 transition-colors duration-200">DailyTune</Link>
      </h1>
      <nav className="flex gap-6">
        <Link to="/" className="text-spotifyTextLight hover:text-spotifyGreen transition-colors duration-200 text-lg font-semibold">Feed</Link>
        <Link to="/add" className="text-spotifyTextLight hover:text-spotifyGreen transition-colors duration-200 text-lg font-semibold">Rechercher & Poster</Link>
      </nav>
      <div className="flex items-center \">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

export default Navbar;
