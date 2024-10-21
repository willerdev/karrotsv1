import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Ad } from '../types/Ad';
import ProductGrid from '../components/ProductGrid';
import LoadingScreen from '../components/LoadingScreen';

const CategoryPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Advanced search states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [brand, setBrand] = useState('');
  const [make, setMake] = useState('');
  const [year, setYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      setError(null);
      try {
        const adsRef = collection(db, 'ads');
        let q = query(adsRef, where('category', '==', categoryName));

        // Apply filters
        if (brand) q = query(q, where('brand', '==', brand));
        if (make) q = query(q, where('make', '==', make));
        if (year) q = query(q, where('year', '==', parseInt(year)));

        const querySnapshot = await getDocs(q);
        const fetchedAds: Ad[] = [];
        querySnapshot.forEach((doc) => {
          const adData = doc.data() as Ad;
          if (adData.price >= priceRange[0] && adData.price <= priceRange[1]) {
            fetchedAds.push({ ...adData, id: doc.id });
          }
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
  }, [categoryName, priceRange, brand, make, year]);

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(event.target.value);
    setPriceRange(newPriceRange as [number, number]);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{categoryName}</h1>
      
      <button 
        className="mb-4 bg-orange-500 text-white px-4 py-2 rounded-full flex items-center"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? <ChevronUp className="mr-2" /> : <ChevronDown className="mr-2" />}
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Advanced Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="w-1/2 p-2 border rounded"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="w-1/2 p-2 border rounded"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label htmlFor="brand" className="block mb-1">Brand</label>
              <input
                type="text"
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter brand"
              />
            </div>
            <div>
              <label htmlFor="make" className="block mb-1">Make</label>
              <input
                type="text"
                id="make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter make"
              />
            </div>
            <div>
              <label htmlFor="year" className="block mb-1">Year</label>
              <input
                type="number"
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter year"
              />
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingScreen />}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          <p className="mb-4">{ads.length} ads found</p>
          <ProductGrid ads={ads} />
        </>
      )}
    </div>
  );
};

export default CategoryPage;
