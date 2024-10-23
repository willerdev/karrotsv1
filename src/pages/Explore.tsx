import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import {
  MapPin, Coffee, Stethoscope, ShoppingBag, Utensils, School,
  Fuel, Building2, Hotel, Car, ChevronUp, Filter, Crosshair,
  Rotate3D, RotateCcw, RotateCw, ChevronDown, X
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
  photo?: string; // Added photo URL
}

const Explore: React.FC = () => {
  const [center, setCenter] = useState({ lat: -1.2921, lng: 36.8219 });
  const [zoom, setZoom] = useState(14);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentPlaces, setRecentPlaces] = useState<MarkerData[]>([]); // Store recent places
  const [showPlaceModal, setShowPlaceModal] = useState(false); // Modal for listing places
  const [tilt, setTilt] = useState(45); // Change initial tilt to 45
  const [heading, setHeading] = useState(0);
  const [mapTypeId, setMapTypeId] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.TERRAIN);

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
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.error('User denied Geolocation');
            alert("Location access denied. Showing default location.");
            setCenter({ lat: -1.2921, lng: 36.8219 }); // Fallback to Nairobi
          } else {
            console.error('Geolocation error:', error.message);
          }
        }
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
          description: place.vicinity,
          photo: place.photos && place.photos.length > 0 ? place.photos[0].getUrl({ maxWidth: 400 }) : undefined,
        }));
        setMarkers(newMarkers);
        setShowPlaceModal(true); // Open modal to show places
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

  const handlePlaceSelect = (marker: MarkerData) => {
    setSelectedMarker(marker);
    setRecentPlaces([...recentPlaces, marker]);
    setMarkers([]); // Hide other markers
    setZoom(8);
    setShowPlaceModal(false);

  };

  const handleRemoveRecentPlace = (id: string) => {
    setRecentPlaces(recentPlaces.filter((place) => place.id !== id));
  };

  const getDirections = (lat: number, lng: number) => {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new google.maps.LatLng(center.lat, center.lng),
        destination: new google.maps.LatLng(lat, lng),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  const adjustMap = (mode: 'tilt' | 'rotate', amount: number) => {
    if (!map) return;

    switch (mode) {
      case 'tilt':
        if (map) {
          const newTilt = Math.max(0, Math.min(map.getTilt?.() ?? 0 + amount, 60));
          map.setTilt(newTilt);
          
          setTilt(newTilt);
        }
        break;
      case 'rotate':
        const newHeading = ((map?.getHeading() ?? 0) + amount + 360) % 360;
        map?.setHeading(newHeading);
        setHeading(newHeading);
        break;
    }
  };

  return (
    <div className="relative h-screen">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          tilt={tilt} // This will set the initial tilt to 45 degrees
          heading={heading}
          onLoad={map => {
            setMap(map);
            if (map) {
              map.setTilt(45); // Ensure the tilt is set when the map loads
            }
          }}
          mapTypeId={mapTypeId}
        >
          {/* Origin Marker (Point A) */}
          <Marker
            position={center}
            icon={{
              url: "https://icon-library.com/images/google-map-pin-icon-png/google-map-pin-icon-png-5.jpg",
              scaledSize: new google.maps.Size(40, 40),
              labelOrigin: new google.maps.Point(20, -10)
            }}
            label={{
              text: "A",
              color: "#2563EB",
              fontWeight: "bold",
              fontSize: "16px"
            }}
          />

          {/* Destination Marker (Point B) when directions are active */}
          {selectedMarker && directions && (
            <Marker
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              icon={{
                url: "https://seeklogo.com/images/M/map-pin-logo-724AC2A023-seeklogo.com.png",
                scaledSize: new google.maps.Size(40, 40),
                labelOrigin: new google.maps.Point(20, -10)
              }}
              label={{
                text: "B",
                color: "#DC2626",
                fontWeight: "bold",
                fontSize: "16px"
              }}
            />
          )}

          {/* Regular markers for places */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handlePlaceSelect(marker)}
            />
          ))}

          {selectedMarker && !directions && (
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

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true, // Hide default markers to show our custom A/B markers
                polylineOptions: {
                  strokeColor: '#ff8a05',
                  strokeWeight: 8,
                },
              }}
            />
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

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center">
          <p>Loading...</p>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-blue-100 to-white rounded-t-3xl shadow-lg transition-transform duration-300 ease-in-out transform translate-y-0 z-20 p-6">
          <h3 className="text-2xl font-bold mb-6 text-center text-orange-600">Explore Nearby</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {categories.map((category) => (
              <button
                key={category.name}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out"
                onClick={() => handleCategoryClick(category)}
              >
                <category.icon size={28} className="text-orange-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </button>
            ))}
          </div>
          <button 
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors duration-200 ease-in-out"
            onClick={() => setShowFilterModal(false)}
          >
            Close
          </button>
        </div>
      )}

      {showPlaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="bg-white p-6 rounded-2xl w-11/12 max-w-md max-h-[80vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Nearby Places</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPlaceModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {markers.map((marker) => (
                <div key={marker.id} className="flex bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="w-1/3 aspect-w-1 aspect-h-1">
                    {marker.photo ? (
                      <img src={marker.photo} alt={marker.name} className="w-full h-full object-cover rounded-l-lg" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-l-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="w-2/3 p-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-1 truncate">{marker.name}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{marker.description}</p>
                    </div>
                    <button
                      className="w-full bg-orange-500 text-white text-xs font-medium py-2 px-3 rounded-full hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => {
                        getDirections(marker.lat, marker.lng);
                        handlePlaceSelect(marker);
                      }}
                    >
                      Get Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {recentPlaces.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-20">
          <h3 className="text-xl font-semibold mb-4 text-orange-600">Recently Visited Places</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {recentPlaces.map((place) => (
              <div key={place.id} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex-grow mr-4">
                  <h4 className="font-semibold text-gray-800">{place.name}</h4>
                  <p className="text-sm text-gray-600 line-clamp-1">{place.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors duration-200"
                    onClick={() => getDirections(place.lat, place.lng)}
                    aria-label="Get Directions"
                  >
                    <MapPin size={20} />
                  </button>
                  <button
                    className="bg-white text-orange-500 p-2 rounded-full border border-orange-500 hover:bg-orange-100 transition-colors duration-200"
                    onClick={() => handleRemoveRecentPlace(place.id)}
                    aria-label="Remove"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tilt and Rotation Controls */}
      <div className="fixed top-1/2 left-4 transform -translate-y-1/2 flex flex-col space-y-2 z-10 hidden">
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
          onClick={() => adjustMap('rotate', 20)}
        >
          <RotateCcw size={24} />
        </button>
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
          onClick={() => adjustMap('rotate', -20)}
        >
          <RotateCw size={24} />
        </button>
      </div>

      <div className="fixed hidden top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
          onClick={() => adjustMap('tilt', -20)}
        >
          <ChevronUp size={24} />
        </button>
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
          onClick={() => adjustMap('tilt', 20)}
        >
          <ChevronDown size={24} />
        </button>
      </div>

      <div className="fixed hidden bottom-4 left-1/2 transform -translate-x-1/2 z-10 hidden">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2"
          onClick={() => {
            setTilt(0);
            setHeading(0);
            if (map) {
              map.setTilt(0);
              map.setHeading(0);
            }
          }}
        >
          <Rotate3D size={20} />
          <span>Reset View</span>
        </button>
      </div>
    </div>
  );
};

export default Explore;
