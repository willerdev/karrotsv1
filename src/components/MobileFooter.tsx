import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Compass, MessageCircle, User } from 'lucide-react';

const MobileFooter = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'bg-orange-500 text-white' 
      : 'bg-white text-gray-500 hover:bg-orange-50';
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 py-2 px-3">
      <div className="grid grid-cols-5 gap-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${isActive('/')}`}
        >
          <Home size={22} />
          <span className="text-[10px] mt-1 font-medium hidden">Home</span>
        </Link>
        <Link 
          to="/locals" 
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${isActive('/locals')}`}
        >
          <Map size={22} />
          <span className="text-[10px] mt-1 font-medium hidden">My Local</span>
        </Link>
        <Link 
          to="/explore" 
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${isActive('/explore')}`}
        >
          <Compass size={22} />
          <span className="text-[10px] mt-1 font-medium hidden">Explore</span>
        </Link>
        <Link 
          to="/chat" 
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${isActive('/chat')}`}
        >
          <MessageCircle size={22} />
          <span className="text-[10px] mt-1 font-medium hidden">Chats</span>
        </Link>
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${isActive('/profile')}`}
        >
          <User size={22} />
          <span className="text-[10px] mt-1 font-medium hidden">Karrot</span>
        </Link>
      </div>
    </footer>
  );
};

export default MobileFooter;