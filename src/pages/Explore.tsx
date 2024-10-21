//const GOOGLE_MAPS_API_KEY = 'AIzaSyCIRjn9GL-E-eKxxsrgq2jiT0ux0tRNFjM';

import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
  MapPin, Coffee, Stethoscope, ShoppingBag, Utensils, School,
  Fuel, Building2, Hotel, Car, ChevronUp, Filter, Crosshair
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCIRjn9GL-E-eKxxsrgq2jiT0ux0tRNFjM';

interface Category {
  name: string;
  icon: React.ComponentType<React.ComponentProps<'svg'> & { size?: number | string }>;
}

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  description?: string;
}

const Explore: React.FC = () => {
  const [center, setCenter] = useState({ lat: -1.2921, lng: 36.8219 });
  const [zoom, setZoom] = useState(14);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Geolocation error:', error.message)
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  }, []);

  const categories: Category[] = [
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

  const fetchCategoryData = (category: string) => {
    if (!map) return;

    const service = new google.maps.places.PlacesService(map);
    const request = {
      location: center,
      radius: 5000,
      type: getCategoryType(category)
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const newMarkers: MarkerData[] = results.map((place) => ({
          id: place.place_id as string,
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          name: place.name,
          description: place.vicinity
        }));
        setMarkers(newMarkers);
      } else {
        console.error('Error fetching places:', status);
      }
    });
  };

  const getCategoryType = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Restaurants': 'restaurant',
      'Hospitals': 'hospital',
      'Shopping': 'shopping_mall',
      'Cafes': 'cafe',
      'Schools': 'school',
      'Gas Stations': 'gas_station',
      'Banks': 'bank',
      'Hotels': 'lodging',
      'Car Rentals': 'car_rental',
      'Landmarks': 'tourist_attraction'
    };
    return categoryMap[category] || 'point_of_interest';
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    fetchCategoryData(category.name);
    setShowFilterModal(false);
  };

  const goToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setZoom(14);
        },
        (error) => console.error('Geolocation error:', error.message)
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  };

  return (
    <div className="relative h-screen">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          onLoad={map => setMap(map)}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => setSelectedMarker(marker)}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h4>{selectedMarker.name}</h4>
                <p>{selectedMarker.description}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <LoadingScreen />
      )}

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
    </div>
  );
};

export default Explore;
