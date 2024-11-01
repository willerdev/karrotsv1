import React from 'react';
import { Carrot } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-orange-100 flex flex-col items-center justify-center z-50">
      <div className="animate-bounce">
        <Carrot size={64} className="text-orange-500" />
      </div>
      <p className="mt-4 text-orange-500 font-medium">Loading...</p>
    </div>
  );
};

export default LoadingScreen;