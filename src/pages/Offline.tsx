import React, { useEffect } from 'react';

const Offline = () => {
  // Disable scrolling when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-orange-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <img 
          src="https://i.imgur.com/5ck0U9M.png" 
          alt="Karrots Logo" 
          className="w-32 h-32 mx-auto mb-8 animate-bounce"
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">No Internet Connection</h1>
        <p className="text-gray-600">
          Please check your connection and try again
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-300"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default Offline;
