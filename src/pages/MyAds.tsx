import React, { useState, useEffect } from 'react';
import { getuserAds, updateAdStatus } from '../services/adService';
import { Ad } from '../types/Ad';
import LoadingScreen from '../components/LoadingScreen';
import { Eye, EyeOff, Check, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Add this import


const MyAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchAds = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const fetchedAds = await getuserAds(user.uid);
        console.log('Fetched ads:', fetchedAds);
        setAds(fetchedAds);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load ads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [user]);

  useEffect(() => {
    const filtered = ads.filter(ad =>
      ad.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAds(filtered);
  }, [searchTerm, ads]);

  const handleUpdateAdStatus = async (adId: string, newStatus: 'active' | 'sold' | 'unavailable') => {
    try {
      // Update status in Firestore
      const adRef = doc(db, 'ads', adId);
      await updateDoc(adRef, { status: newStatus });

      // Update local state
      setAds(prevAds =>
        prevAds.map(ad =>
          ad.id === adId ? { ...ad, status: newStatus } : ad
        )
      );
    } catch (err) {
      console.error('Error updating ad status:', err);
      setError('Failed to update ad status. Please try again.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">All Ads</h1>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search ads..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      {filteredAds.length === 0 ? (
        <p>No ads available.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg shadow-md p-4">
              <img src={ad.images[0]} alt={ad.title} className="w-full h-48 object-cover rounded-lg mb-2" />
              <h2 className="text-lg font-semibold mb-1">{ad.title}</h2>
              <p className="text-gray-600 mb-2">{ad.price.toLocaleString()} Frw</p>
              <p className="text-sm text-gray-500 mb-2">Status: {ad.status}</p>
              <div className="flex justify-between">
                <button
                  onClick={() => handleUpdateAdStatus(ad.id, ad.status === 'active' ? 'unavailable' : 'active')}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  {ad.status === 'active' ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                  {ad.status === 'active' ? 'Hide' : 'Unhide'}
                </button>
                {ad.status !== 'sold' && (
                  <button
                    onClick={() => handleUpdateAdStatus(ad.id, 'sold')}
                    className="flex items-center text-green-500 hover:text-green-700"
                  >
                    <Check size={16} className="mr-1" />
                    Mark as Sold
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAds;
