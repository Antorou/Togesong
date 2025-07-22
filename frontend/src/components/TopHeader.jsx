import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function TopHeader() {
  return (
    <header className="relative w-full max-w-screen-2xl mx-auto overflow-hidden">
      {/* Background Gradient Shape */}
      <div className="absolute inset-0 top-header-gradient transform -skew-y-3 origin-top-left z-0"></div>
      
      {/* Content Container */}
      <div className="relative z-10 flex justify-between items-center py-4 px-6 md:py-6 md:px-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-widest drop-shadow-lg">
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

      {/* Bottom curved section */}
      <div className="relative z-10 h-4 md:h-6 -mt-4 md:-mt-6 
                      bottom-curve-gradient 
                      rounded-t-full"></div>
    </header>
  );
}

export default TopHeader;