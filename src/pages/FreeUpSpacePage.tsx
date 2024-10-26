import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trash2, RefreshCw } from 'lucide-react';

const FreeUpSpacePage = () => {
  const [localStorageSize, setLocalStorageSize] = useState<number>(0);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  useEffect(() => {
    calculateLocalStorageSize();
  }, []);

  const calculateLocalStorageSize = () => {
    let size = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length * 2; // Approximate size in bytes
      }
    }
    setLocalStorageSize(size);
  };

  const clearLocalStorage = () => {
    setIsClearing(true);
    setTimeout(() => {
      localStorage.clear();
      calculateLocalStorageSize();
      setIsClearing(false);
    }, 1500); // Simulate clearing process
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <Link to="/settings" className="text-gray-600">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-semibold ml-4">Free Up Space</h1>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Local Storage</h2>
            <button
              onClick={calculateLocalStorageSize}
              className="text-blue-500 hover:text-blue-600"
            >
              <RefreshCw size={20} />
            </button>
          </div>
          <p className="text-gray-600 mb-2">Current usage:</p>
          <p className="text-2xl font-bold text-indigo-600">{formatSize(localStorageSize)}</p>
        </div>

        <button
          onClick={clearLocalStorage}
          disabled={isClearing}
          className={`w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 ${
            isClearing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isClearing ? (
            <RefreshCw size={24} className="animate-spin mr-2" />
          ) : (
            <Trash2 size={24} className="mr-2" />
          )}
          {isClearing ? 'Clearing...' : 'Clear Local Storage'}
        </button>

        {localStorageSize === 0 && (
          <p className="text-center text-green-600 mt-4">Local storage is empty!</p>
        )}
      </div>
    </div>
  );
};

export default FreeUpSpacePage;

