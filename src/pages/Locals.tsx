import React, { useState, useEffect, useRef } from 'react';
import LocalProductGrid from '../components/LocalProductGrid';
import { Ad } from '../types/Ad';
import { collection, query, limit, getDocs, orderBy, startAfter } from 'firebase/firestore';
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
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Move fetchLocalAds outside useEffect and make it a component-level function
  const fetchLocalAds = async (isLoadMore = false) => {
    try {
      const adsRef = collection(db, 'ads');
      let q = query(adsRef, orderBy('createdAt', 'desc'), limit(10));

      if (isLoadMore && lastDoc) {
        q = query(adsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(10));
      }

      const querySnapshot = await getDocs(q);
      const ads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 10);

      if (isLoadMore) {
        setLocalAds(prevAds => [...prevAds, ...ads]);
      } else {
        setLocalAds(ads);
      }
    } catch (err) {
      console.error('Error fetching local ads:', err);
      setError('Failed to load local ads. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
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

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchLocalAds(true);
  };

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

      {hasMore && (
        <div className="flex justify-center mt-8 mb-20">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

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
