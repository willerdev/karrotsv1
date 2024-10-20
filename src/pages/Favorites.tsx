import React, { useState, useEffect } from 'react';
import { getSavedAds } from '../services/adService';
import ProductGrid from '../components/ProductGrid';
import { Ad } from '../types/Ad';

const Favorites = () => {
  const [savedAds, setSavedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedAds = async () => {
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
  }, []);

  if (loading) return <div className="text-center py-8">Loading saved ads...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Favorites</h1>
      {savedAds.length === 0 ? (
        <p>You haven't saved any ads yet.</p>
      ) : (
        <ProductGrid ads={savedAds} />
      )}
    </div>
  );
};

export default Favorites;