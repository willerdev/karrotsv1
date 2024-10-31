import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, CreditCard, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Toaster, toast } from 'react-hot-toast';
import { getCurrencyForCountry } from '../utils/currency';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('All Uganda');
  const [currencyCode, setCurrencyCode] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const handleLocationInfo = (e: React.MouseEvent, location: string) => {
    e.preventDefault();
    if (location.toLowerCase() !== 'rwanda') {
      toast('Only Rwanda is supported for now, coming to all EAC Soon..');
    }
  };

  const handleSearch = (term: string) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleSearch(searchTerm);
    }
  };

  useEffect(() => {
    fetch('https://api.ipdata.co?api-key=235c3d2efdfdbada73b3dd981eec577656a166edbd983fe8c5e72996')
      .then(response => response.json())
      .then(data => {
        const countryName = data.country_name || 'All Africa';
        setLocation(countryName);
        const currency = getCurrencyForCountry(countryName);
        setCurrencyCode(currency?.toString() || '');
      })
      .catch(error => {
        console.error('Error fetching location:', error);
      });
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length > 2) {
        const adsRef = collection(db, 'ads');
        const q = query(
          adsRef,
          where('title', '>=', searchTerm),
          where('title', '<=', searchTerm + '\uf8ff'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const suggestionSet = new Set<string>();
        querySnapshot.forEach((doc) => {
          const { title, price, negotiable } = doc.data();
          if (title.toLowerCase().includes(searchTerm.toLowerCase())) {
            const negotiableText = negotiable ? 'Negotiable' : 'Fixed Price';
            suggestionSet.add(`${title} - ${price} ${currencyCode} (${negotiableText})`);
          }
        });
        setSuggestions(Array.from(suggestionSet));
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchTerm, currencyCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-orange-500 text-white py-6">
      <Toaster />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center">
           karrots in
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin size={20} />
              <span className="text-lg">{location} {location.toLowerCase() !== 'rwanda' && (
                <button onClick={(e) => handleLocationInfo(e, location)}>
                  <HelpCircle size={15} className="text-white-500" />
                </button>
              )}
              </span>
            </div>
            {currencyCode && (
              <div className="flex items-center space-x-2">
                <CreditCard size={20} />
                <span className="text-lg">{currencyCode}</span>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="relative w-full mx-auto" ref={searchBarRef}>
          <input
            type="text"
            placeholder="I am looking for..."
            className="w-full p-5 pr-12 rounded-md text-gray-800 text-lg"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
          />
          <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white w-full mt-1 rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                  onClick={() => {
                    setSearchTerm(suggestion);
                    handleSearch(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
