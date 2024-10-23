import React, { useState, useEffect, useRef } from 'react';
import LocalProductGrid from '../components/LocalProductGrid';
import { Ad } from '../types/Ad';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingScreen from '../components/LoadingScreen';
import { FaMapMarkerAlt, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Locals = () => {
  const [localAds, setLocalAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showFullButton, setShowFullButton] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [imageError, setImageError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchLocalAds = async () => {
      try {
        const adsRef = collection(db, 'ads');
        const q = query(adsRef, orderBy('createdAt', 'desc'), limit(10));
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

    const handleScroll = () => {
      if (buttonRef.current) {
        setShowFullButton(window.scrollY < 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const filtered = localAds.filter(ad =>
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAds(filtered);
  }, [searchTerm, localAds]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-13 left-4 bg-white text-orange-500 rounded-full p-3 shadow-md text-xl z-10 hover:bg-orange-100 transition-colors"
      >
        <FaArrowLeft />
      </button>
      <div className="flex items-center justify-center mb-6">
        <FaMapMarkerAlt className="text-gray-500 mr-2" />
        <h3 className="text-xl text-gray-500 font-semibold">Local Marketplace - Near You</h3>
      </div>
      <div className="mb-8">
        {!imageError ? (
          <img 
            src="https://i0.wp.com/blog.karrotmarket.com/wp-content/uploads/2024/10/discover-the-joy-of-local-deals-with-karrot-1.webp?fit=2048%2C1024&ssl=1" 
            alt="Featured banner" 
            className="w-full h-48 object-cover rounded-lg" 
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Failed to load banner image</p>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search local ads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <LocalProductGrid ads={filteredAds} />
      <button
        ref={buttonRef}
        onClick={() => navigate('/post-ad')}
        className={`fixed bottom-[62px] right-4 bg-orange-500 text-white rounded-full p-4 shadow-lg z-20 transition-all duration-300 ${
          showFullButton ? 'w-auto px-6' : 'w-12 h-12'
        }`}
      >
        <div className="flex items-center justify-center">
          <FaPlus className={showFullButton ? 'mr-2' : ''} />
          <span className={showFullButton ? 'inline' : 'hidden'}>Post a karrot</span>
        </div>
      </button>
    </div>
  );
};

export default Locals;
