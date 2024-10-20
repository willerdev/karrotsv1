import React, { useState, useEffect } from 'react';
import { getUserAds } from '../services/adService';
import { Ad } from '../types/Ad';

const LocalPage: React.FC = () => {
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadUserAds = async () => {
    setLoading(true);
    try {
      const newUserAds = await getUserAds(page);
      setUserAds(newUserAds);
    } catch (error) {
      console.error("Error loading user ads:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserAds();
  }, [page]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div style={{ marginBottom: '100px' }}>
      <h1>My Ads</h1>
      {/* Render user ads here */}
      {userAds.map(ad => (
        <div key={ad.id}>{/* Render ad details */}</div>
      ))}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <button onClick={handleLoadMore} disabled={loading}>
          Load More
        </button>
      )}
    </div>
  );
};

export default LocalPage;
