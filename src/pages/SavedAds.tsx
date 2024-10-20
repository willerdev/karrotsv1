import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSavedAds } from '../services/adService';
import { Ad } from '../types/Ad';
import { MapPin, MessageCircle } from 'lucide-react';

const SavedAds = () => {
  const { user } = useAuth();
  const [savedAds, setSavedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('adverts');

  useEffect(() => {
    const fetchSavedAds = async () => {
      if (!user) return;

      try {
        const ads = await getSavedAds();
        setSavedAds(ads);
      } catch (err) {
        console.error('Error fetching saved ads:', err);
        setError('Failed to load saved ads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedAds();
  }, [user]);

  const clearAllAds = () => {
    // Implement the logic to clear all saved ads
    console.log('Clear all ads');
  };

  if (loading) return <div>Loading saved ads...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Saved</h1>
        <button onClick={clearAllAds} className="text-green-500 hover:underline">
          Clear all ads
        </button>
      </div>

      <div className="flex mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded-full ${
            activeTab === 'adverts' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('adverts')}
        >
          Adverts ({savedAds.length})
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            activeTab === 'searches' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('searches')}
        >
          Searches (0)
        </button>
      </div>

      {activeTab === 'adverts' && (
        <div className="space-y-4">
          {savedAds.map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex">
                <img
                  src={ad.images[0]}
                  alt={ad.title}
                  className="w-32 h-32 object-cover rounded-lg mr-4"
                />
                <div className="flex-grow">
                  <Link to={`/product/${ad.id}`} className="text-lg font-semibold hover:underline">
                    {ad.title}
                  </Link>
                  <p className="text-green-500 font-bold">USh {ad.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{ad.condition}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin size={16} className="mr-1" />
                    <span>{ad.location}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <button className="bg-green-500 text-white px-4 py-2 rounded-full">
                    Show contact
                  </button>
                  <button className="flex items-center text-green-500 mt-2">
                    <MessageCircle size={16} className="mr-1" />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'searches' && (
        <div className="text-center text-gray-500 mt-8">
          <p>You haven't saved any searches yet.</p>
        </div>
      )}
    </div>
  );
};

export default SavedAds;