import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MapPin,
  Coffee,
  Stethoscope,
  ShoppingBag,
  Utensils,
  School,
  Fuel,
  Building2,
  Hotel,
  Car,
  ChevronUp,
  Filter,
  X,
  Crosshair
} from 'lucide-react';
import axios from 'axios';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoid2lsbGVyMjU2IiwiYSI6ImNtMmc0aGsyMjBmZGcyanF5dDBub2p6ZDkifQ.YE8sYueo0-MDpSvYXDyflg'; // Replace with your Mapbox token

// Add this interface above the component
interface Category {
  name: string;
  icon: React.ComponentType<React.ComponentProps<'svg'> & { size?: number | string }>;
}

// Add this interface near the top of the file, with other interfaces
interface Marker {
  id: string | number;
  lat: number;
  lng: number;
  name?: string;
  description?: string;
}

// Add this interface near the top of the file, with other interfaces
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
}

const Explore = () => {
  const [viewState, setViewState] = useState({
    latitude: -1.2921, // Default to Nairobi, Kenya
    longitude: 36.8219,
    zoom: 14
  });

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoom: 14
          });
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          // Keep the default location set in the initial state
        }
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
      // Keep the default location set in the initial state
    }
  }, []);

  const categories = [
    { name: 'Restaurants', icon: Utensils },
    { name: 'Hospitals', icon: Stethoscope },
    { name: 'Shopping', icon: ShoppingBag },
    { name: 'Cafes', icon: Coffee },
    { name: 'Schools', icon: School },
    { name: 'Gas Stations', icon: Fuel },
    { name: 'Banks', icon: Building2 },
    { name: 'Hotels', icon: Hotel },
    { name: 'Car Rentals', icon: Car },
    { name: 'Landmarks', icon: MapPin }
  ];

  const fetchCategoryData = async (category: string) => {
    try {
      const response = await axios.get(`https://dummyjson.com/products/category/${category}`);
      const data = response.data;
      
      setProducts(data.products);
      setShowDataModal(true);
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    fetchCategoryData(category.name.toLowerCase());
    setShowFilterModal(false);
  };

  const goToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoom: 14
          });
        },
        (error) => {
          console.error('Geolocation error:', error.message);
        }
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  };

  return (
    <div className="relative h-screen">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        style={{ width: '100%', height: '100%' }}
      >
        <Marker longitude={viewState.longitude} latitude={viewState.latitude} anchor="bottom">
          <MapPin size={32} color="#FF6600" />
        </Marker>

        {markers.map((marker) => (
          <Marker key={marker.id} latitude={marker.lat} longitude={marker.lng}>
            <MapPin
              size={32}
              color="#FF6600"
              onClick={() => setSelectedMarker(marker)}
            />
          </Marker>
        ))}

        {selectedMarker && (
          <Popup
            latitude={selectedMarker.lat}
            longitude={selectedMarker.lng}
            onClose={() => setSelectedMarker(null)}
            closeOnClick={true}
          >
            <div>
              <h4>{selectedMarker.name}</h4>
              <p>{selectedMarker.description}</p>
            </div>
          </Popup>
        )}
      </Map>

      <div className="fixed bottom-20 right-4 flex flex-col space-y-2 z-10">
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
          onClick={goToCurrentLocation}
        >
          <Crosshair size={24} />
        </button>
        <button
          className="bg-orange-500 text-white p-3 rounded-full shadow-lg"
          onClick={() => setShowFilterModal(true)}
        >
          <Filter size={24} />
        </button>
      </div>

      {showFilterModal && (
        <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg transition-transform duration-300 ease-in-out transform translate-y-0 z-20">
          <div className="p-4">
            <div className="flex justify-center mb-2">
              <ChevronUp size={24} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold mb-4">Select Category</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="flex items-center justify-center p-3 bg-gray-100 rounded-lg"
                  onClick={() => handleCategoryClick(category)}
                >
                  <category.icon size={20} className="mr-2 text-orange-500" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Available {selectedCategory?.name}</h2>
              <button onClick={() => setShowDataModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="mb-4 p-2 border-b">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="text-sm font-semibold mt-1">Price: ${product.price}</p>
                  <p className="text-sm text-gray-500">Rating: {product.rating}/5</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
