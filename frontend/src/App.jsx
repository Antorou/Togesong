import React from 'react';
import { Outlet } from 'react-router-dom';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';
import './App.css';
import './index.css'; 

function App() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <TopHeader />
       <main className="px-5 md:px-8 flex-grow pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
