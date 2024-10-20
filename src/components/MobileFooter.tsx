import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Compass, MessageCircle, User } from 'lucide-react';

const MobileFooter = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-orange-500' : 'text-gray-500';
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
      <div className="grid grid-cols-5 gap-4">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Home size={24} />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/locals" className={`flex flex-col items-center ${isActive('/locals')}`}>
          <Map size={24} />
          <span className="text-xs">My Local</span>
        </Link>
        <Link to="/explore" className={`flex flex-col items-center ${isActive('/explore')}`}>
          <Compass size={24} />
          <span className="text-xs">Explore</span>
        </Link>
        <Link to="/chat" className={`flex flex-col items-center ${isActive('/chat')}`}>
          <MessageCircle size={24} />
          <span className="text-xs">Chats</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
          <User size={24} />
          <span className="text-xs">My Karrot</span>
        </Link>
      </div>
    </footer>
  );
};

export default MobileFooter;