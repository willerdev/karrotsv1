import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('All Uganda');
  const navigate = useNavigate();
  const suggestions = [
    'iPhone',
    'Jamp',
    'Yoga',
    'pants',
    'wigs',
    'Bicycles'
  ];

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
        setLocation(data.country_name || 'All Africa');
      })
      .catch(error => {
        console.error('Error fetching location:', error);
      });
  }, []);

  return (
    <div className="bg-orange-500 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Find anything in</h2>
          <div className="flex items-center space-x-2">
            <MapPin size={20} />
            <span className="text-lg">{location}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="relative w-full mx-auto">
          <input
            type="text"
            placeholder="I am looking for..."
            className="w-full p-5 pr-12 rounded-md text-gray-800 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </button>
        </form>
        {!searchTerm && (
          <div className="mt-4 flex flex-wrap justify-center">
            {suggestions.map((suggestion, index) => (
              <span
                key={index}
                className="bg-orange-600 text-white text-base px-3 py-1.5 rounded-full m-1.5 cursor-pointer hover:bg-orange-700"
                onClick={() => handleSearch(suggestion)}
              >
                {suggestion}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
