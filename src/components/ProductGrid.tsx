import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Ad } from '../types/Ad';
import { useAuth } from '../contexts/AuthContext';
import { saveAd, unsaveAd } from '../services/adService';
import { getUserById } from '../services/userService'; // Assume this function exists

interface ProductGridProps {
  ads: Ad[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ ads }) => {
  const { user } = useAuth();
  const [sellersData, setSellersData] = useState<{[key: string]: string}>({});
  const [savedAds, setSavedAds] = useState<string[]>([]);

  useEffect(() => {
    const fetchSellersData = async () => {
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
    };

    fetchSellersData();

    // Initialize savedAds
    if (user) {
      setSavedAds(ads.filter(ad => ad.savedBy?.includes(user.uid)).map(ad => ad.id));
    }
  }, [ads, user]);

  const handleSaveAd = async (e: React.MouseEvent, ad: Ad) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login page or show a login prompt
      return;
    }

    try {
      if (savedAds.includes(ad.id)) {
        await unsaveAd(ad.id);
        setSavedAds(prev => prev.filter(id => id !== ad.id));
      } else {
        await saveAd(ad.id);
        setSavedAds(prev => [...prev, ad.id]);
      }
    } catch (error) {
      console.error('Error saving/unsaving ad:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {ads.map((ad) => (
        <Link to={`/product/${ad.id}`} key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-64">
          <div className="relative h-40">
            <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
            <button 
              className="absolute top-2 right-2 bg-white rounded-full p-1"
              onClick={(e) => handleSaveAd(e, ad)}
            >
              <Heart 
                size={16} 
                className={savedAds.includes(ad.id) ? 'text-red-500' : 'text-gray-500'} 
                fill={savedAds.includes(ad.id) ? 'currentColor' : 'none'}
              />
            </button>
            {ad.status === 'active' && ad.isVip && (
              <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                Verified
              </span>
            )}
          </div>
          <div className="p-2 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-xs mb-1 truncate">{ad.title}</h3>
              <p className="text-orange-500 font-bold text-sm">{ad.price.toLocaleString()} Frw</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs truncate">{ad.location}</p>
              <p className="text-orange-500 text-xs truncate">Seller: {sellersData[ad.userId] || 'Loading...'}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
