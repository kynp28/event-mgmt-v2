import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

export const PublicLayout: React.FC = () => {
  return (
    <div className="public-layout">
      {/* Top Navbar for Desktop/Tablet */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* Main Content Area */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};
