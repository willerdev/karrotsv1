import React from 'react';
import { Carrot } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-orange-100 flex items-center justify-center z-50">
      <div className="animate-pulse">
        <Carrot size={64} className="text-orange-500 animate-zoom" />
      </div>
    </div>
  );
};

export default LoadingScreen;