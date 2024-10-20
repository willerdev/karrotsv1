import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Ad } from '../types/Ad';
import CategoryList from '../components/CategoryList';
import ProductGrid from '../components/ProductGrid';
import CategoryGrid from '../components/CategoryGrid';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Uganda');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsRef = collection(db, 'ads');
        const q = query(adsRef, limit(8)); // Fetch 8 ads for the home page
        const querySnapshot = await getDocs(q);
        const fetchedAds: Ad[] = [];
        querySnapshot.forEach((doc) => {
          fetchedAds.push({ id: doc.id, ...doc.data() } as Ad);
        });
        setAds(fetchedAds);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load ads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const toggleLocationPopup = () => {
    setShowLocationPopup(!showLocationPopup);
  };

  const selectCountry = (country: string) => {
    setSelectedCountry(country);
    setShowLocationPopup(false);
  };

  return (
    <div className="flex flex-col w-full">
      <SearchBar />

      <div className="container mx-auto px-4 py-8">
        <div className="md:hidden mb-8">
          <CategoryGrid />
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 pr-4 mb-4 md:mb-0 hidden md:block">
            <CategoryList />
          </div>
          <div className="md:w-3/4">
            <div className="mb-8">
              <img 
                src="https://i0.wp.com/blog.karrotmarket.com/wp-content/uploads/2024/10/why-fast-shipping-matters-in-local-marketplaces.webp?fit=2048%2C1024&ssl=1" 
                alt="Featured banner" 
                className="w-full h-48 object-cover rounded-lg" 
              />
            </div>
            <h2 className="text-2xl font-bold mb-4">Trending ads</h2>
            {loading && <div>Loading ads...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && <ProductGrid ads={ads} />}
          </div>
        </div>
      </div>

      {showLocationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-2">Select Country</h2>
            <ul>
              {['Uganda', 'Kenya', 'Tanzania', 'Rwanda'].map((country) => (
                <li
                  key={country}
                  className="cursor-pointer hover:bg-gray-100 p-2"
                  onClick={() => selectCountry(country)}
                >
                  {country}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;