import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function TopHeader() {
  return (
    <header className="relative w-full max-w-screen-2xl mx-auto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-togesongBlueLight to-togesongBlueDark transform -skew-y-3 origin-top-left z-0"></div>
      
      <div className="relative z-10 flex justify-between items-center py-6 px-8 md:px-12">
        <h1 className="text-5xl font-extrabold text-white tracking-widest drop-shadow-lg transform -rotate-2">
          <Link to="/" className="text-white no-underline">TOGESONG</Link>
        </h1>
        <div className="flex items-center">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      <div className="relative z-10 h-6 -mt-6 bg-gradient-to-r from-togesongBlueDark to-togesongBlueLight rounded-t-full"></div>
    </header>
  );
}

export default TopHeader;
