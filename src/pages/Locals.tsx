import React, { useState, useEffect } from 'react';
import LocalProductGrid from '../components/LocalProductGrid';
import { Ad } from '../types/Ad';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const Locals = () => {
  const [localAds, setLocalAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocalAds = async () => {
      try {
        const adsRef = collection(db, 'ads');
        const q = query(adsRef, orderBy('createdAt', 'desc'), limit(10)); // Fetch 10 most recent ads
        const querySnapshot = await getDocs(q);
        const ads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
        setLocalAds(ads);
      } catch (err) {
        console.error('Error fetching local ads:', err);
        setError('Failed to load local ads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocalAds();
  }, []);

  if (loading) return <div className="text-center py-8">Loading local ads...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Local Marketplace</h1>
      <LocalProductGrid ads={localAds} />
    </div>
  );
};

export default Locals;