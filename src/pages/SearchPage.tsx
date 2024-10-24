import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure this path is correct
import LoadingScreen from '../components/LoadingScreen';
import { Link } from 'react-router-dom';

// Add this interface at the top of your file
interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  category: string;
  negotiable: boolean;
  images?: string[];
}

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const searchQuery = new URLSearchParams(location.search).get('q');
    if (searchQuery) {
      fetchSearchResults(searchQuery);
    }
  }, [location.search]);

  const fetchSearchResults = async (searchQuery: string) => {
    setLoading(true);
    try {
      const adsRef = collection(db, 'ads');
      const querySnapshot = await getDocs(adsRef);
      
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Ad))
        .filter(ad => 
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

      setSearchResults(results);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
          {!imageError ? (
            <img 
              src="https://i0.wp.com/blog.karrotmarket.com/wp-content/uploads/2024/10/spotting-real-deals-a-guide-for-savvy-shoppers.webp?fit=2048%2C1024&ssl=1" 
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
      <h1 className="text-2xl font-bold mb-4">Search karrots</h1>
      {loading ? (
        <LoadingScreen />
      ) : searchResults.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {searchResults.map((ad) => (
            <Link to={`/product/${ad.id}`} key={ad.id} className="border rounded-lg p-4 shadow-md block hover:shadow-lg transition-shadow">
              {ad.images && ad.images.length > 0 && (
                <img src={ad.images[0]} alt={ad.title} className="w-full h-48 object-cover mb-2 rounded" />
              )}
              <h2 className="text-lg font-semibold">{ad.title}</h2>
              <p className="text-gray-600">{ad.description.substring(0, 20)}...</p>
              <p className="text-orange-500 font-bold mt-2"> {ad.price.toLocaleString()} Frw</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">{ad.condition}</span>
                <span className="text-sm text-gray-500">{ad.location}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <span>Category: {ad.category}</span>
              </div>
              {ad.negotiable && (
                <div className="mt-1 text-sm text-green-500">Negotiable</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
