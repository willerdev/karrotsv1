import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Tag, User } from 'lucide-react';
import { Ad } from '../types/Ad';
import { useAuth } from '../contexts/AuthContext';
import { saveAd, unsaveAd } from '../services/adService';
import { getUserById } from '../services/userService'; // Assume this function exists
import toast from 'react-hot-toast'; // Add this import

interface ProductGridProps {
  ads: Ad[];
}

const CACHE_KEY = 'productGridCache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

const ProductGrid: React.FC<ProductGridProps> = ({ ads }) => {
  const { user } = useAuth();
  const [sellersData, setSellersData] = useState<{[key: string]: string}>({});
  const [savedAds, setSavedAds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAndCacheData = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const now = new Date().getTime();

      if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (now - timestamp < CACHE_EXPIRY) {
          setSellersData(data.sellersData);
          return;
        }
      }

      const sellersInfo: {[key: string]: string} = {};
      for (const ad of ads) {
        if (!sellersInfo[ad.userId]) {
          try {
            const sellerData = await getUserById(ad.userId);
            sellersInfo[ad.userId] = sellerData?.name ?? 'Unknown Seller';
          } catch (error) {
            console.error('Error fetching seller data:', error);
            sellersInfo[ad.userId] = 'Unknown Seller';
          }
        }
      }

      setSellersData(sellersInfo);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: now,
        data: { sellersData: sellersInfo }
      }));
    };

    fetchAndCacheData();

    // Initialize savedAds
    if (user) {
      setSavedAds(ads.filter(ad => ad.savedBy?.includes(user.uid)).map(ad => ad.id));
    }
  }, [ads, user]);

  const handleSaveAd = async (e: React.MouseEvent, ad: Ad) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to save ads');
      // Optionally redirect to login page here
      return;
    }

    try {
      if (savedAds.includes(ad.id)) {
        await unsaveAd(ad.id);
        setSavedAds(prev => prev.filter(id => id !== ad.id));
        toast.success('Ad removed from favorites');
      } else {
        await saveAd(ad.id);
        setSavedAds(prev => [...prev, ad.id]);
        toast.success('Ad added to favorites');
      }
    } catch (error) {
      console.error('Error saving/unsaving ad:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const preloadImage = (src: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  };

  useEffect(() => {
    ads.forEach(ad => {
      if (ad.images && ad.images.length > 0) {
        preloadImage(ad.images[0]).catch(error => console.error('Error preloading image:', error));
      }
    });
  }, [ads]);

 

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
            {ad.status === 'active' && ad.isVip && (
              <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                Verified
              </span>
            )}
            {ad.status === 'underDeal' && (
              <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                May be bought
              </span>
            )}
          </div>
          <div className="p-2 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-xs mb-1 truncate">{ad.title}</h3>
              <p className="text-orange-500 font-bold text-sm">{ad.price.toLocaleString()} Frw </p>
            </div>
            <div>
              <p className="bg-gray-100 text-gray-700 text-xs p-1 rounded-md mb-1 flex items-center">
                <MapPin size={12} className="mr-1" /> 
                <span className="font-semibold mr-2">{ad.location}</span>
                
                <Tag size={12} className="mr-1" /> <span className="text-gray-600">{ad.condition}</span>
              </p>
              <p className="text-orange-500 text-xs truncate flex items-center">
                <User size={16} className="mr-1" /> {sellersData[ad.userId] || 'Loading...'}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
