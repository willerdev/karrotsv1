import React, { useState, useEffect } from 'react';
import { getAds } from '../services/adService';
import { Ad } from '../types/Ad';

const Home: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadAds = async () => {
    setLoading(true);
    try {
      const newAds = await getAds(page);
      setAds(newAds);
    } catch (error) {
      console.error("Error loading ads:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAds();
  }, [page]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div style={{ marginBottom: '100px' }}>
      <h1>Home</h1>
      {/* Render your ads here */}
      {ads.map(ad => (
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

export default Home;
