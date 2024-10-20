import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserAds, getSavedAds } from '../services/adService';
import { useAuth } from '../contexts/AuthContext';
import { Ad } from '../types/Ad';

const Dashboard = () => {
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [savedAds, setSavedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAds = async () => {
      if (!user) {
        setError('You must be logged in to view this page');
        setLoading(false);
        return;
      }

      const maxRetries = 3;
      let retries = 0;

      while (retries < maxRetries) {
        try {
          const [userAdsData, savedAdsData] = await Promise.all([getUserAds(), getSavedAds()]);
          setUserAds(userAdsData);
          setSavedAds(savedAdsData);
          setLoading(false);
          return;
        } catch (err) {
          console.error(`Error fetching ads (attempt ${retries + 1}):`, err);
          retries++;
          if (retries === maxRetries) {
            setError('Failed to fetch ads. Please check your internet connection and try again later.');
          }
          // Wait for 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      setLoading(false);
    };

    fetchAds();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">My Ads</h3>
          {userAds.length === 0 ? (
            <p>You haven't posted any ads yet.</p>
          ) : (
            <ul className="space-y-2">
              {userAds.map((ad) => (
                <li key={ad.id} className="bg-white p-4 rounded shadow flex items-center">
                  <img src={ad.images[0]} alt={ad.title} className="w-16 h-16 object-cover rounded mr-4" />
                  <div>
                    <h4 className="font-semibold">{ad.title}</h4>
                    <p className="text-gray-600">${ad.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/post-ad" className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded">
            Post New Ad
          </Link>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Saved Ads</h3>
          {savedAds.length === 0 ? (
            <p>You haven't saved any ads yet.</p>
          ) : (
            <ul className="space-y-2">
              {savedAds.map((ad) => (
                <li key={ad.id} className="bg-white p-4 rounded shadow flex items-center">
                  <img src={ad.images[0]} alt={ad.title} className="w-16 h-16 object-cover rounded mr-4" />
                  <div>
                    <h4 className="font-semibold">{ad.title}</h4>
                    <p className="text-gray-600">${ad.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
