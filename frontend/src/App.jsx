import React from 'react';
import { Outlet } from 'react-router-dom';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';
import './App.css';

function App() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-togesongBlueLight">
      <TopHeader />
      <main className="container mx-auto px-5 md:px-8 flex-grow">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
