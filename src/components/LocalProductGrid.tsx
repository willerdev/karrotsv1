import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Ad } from '../types/Ad';
import { useAuth } from '../contexts/AuthContext';
import { saveAd, unsaveAd } from '../services/adService';

interface LocalProductGridProps {
  ads: Ad[];
}

const LocalProductGrid: React.FC<LocalProductGridProps> = ({ ads }) => {
  const { user } = useAuth();

  const handleSaveAd = async (e: React.MouseEvent, ad: Ad) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login page or show a login prompt
      return;
    }

    try {
      if (ad.savedBy?.includes(user.uid)) {
        await unsaveAd(ad.id);
      } else {
        await saveAd(ad.id);
      }
      // You might want to update the local state or refetch the ads here
    } catch (error) {
      console.error('Error saving/unsaving ad:', error);
    }
  };

  const formatDate = (date: string | number | Date): string => {
    const dateObject = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObject.getTime())) {
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() - 20);
      return fallbackDate.toLocaleDateString();
    }
    return dateObject.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {ads.map((ad) => (
        <Link to={`/product/${ad.id}`} key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="relative">
            <img src={ad.images[0]} alt={ad.title} className="w-full h-40 object-cover" />
            <button 
              className="absolute top-2 right-2 bg-white rounded-full p-1"
              onClick={(e) => handleSaveAd(e, ad)}
            >
              <Heart 
                size={20} 
                className={user && ad.savedBy?.includes(user.uid) ? 'text-orange-500' : 'text-gray-500'} 
                fill={user && ad.savedBy?.includes(user.uid) ? 'currentColor' : 'none'}
              />
            </button>
          </div>
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm mb-1 truncate">{ad.title}</h3>
              <p className="text-orange-500 font-bold"> {ad.price.toLocaleString()} Frw</p>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 text-xs flex items-center">
                <MapPin size={12} className="mr-1" />
                {ad.location}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Posted {formatDate(ad.createdAt)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default LocalProductGrid;
