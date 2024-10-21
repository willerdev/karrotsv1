import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { ChevronUp, Crosshair, MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCIRjn9GL-E-eKxxsrgq2jiT0ux0tRNFjM';

const Delivery: React.FC = () => {
  const [center, setCenter] = useState({ lat: -1.2921, lng: 36.8219 });
  const [zoom, setZoom] = useState(14);
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
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
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCenter({ lat, lng });
          setCurrentLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        },
        (error) => console.error('Geolocation error:', error.message)
      );
    }
  }, []);

  const handleStartDelivery = () => {
    if (!map || !destination) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: center,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error('Error fetching directions:', status);
        }
      }
    );
  };

  return (
    <div className="relative h-screen">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          onLoad={(map) => setMap(map)}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      ) : (
        <div>Loading...</div>
      )}

      {showModal && (
        <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg p-4 transition-transform duration-300 ease-in-out transform translate-y-0 z-20">
          <div className="flex justify-center mb-2">
            <ChevronUp size={24} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
          <div className="flex flex-col space-y-4">
            <div>
              <label className="text-sm">Destination Address</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="Enter destination address"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm">Current Location</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={currentLocation}
                disabled
              />
            </div>
            <button
              className="w-full p-3 bg-blue-500 text-white rounded-lg shadow"
              onClick={handleStartDelivery}
            >
              Start Delivery
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-20 right-4 flex flex-col space-y-2 z-10">
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
          onClick={() => setShowModal(!showModal)}
        >
          <MapPin size={24} />
        </button>
        <button
          className="bg-orange-500 text-white p-3 rounded-full shadow-lg"
          onClick={() => {
            navigator.geolocation.getCurrentPosition((position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              setCenter({ lat, lng });
              setZoom(14);
            });
          }}
        >
          <Crosshair size={24} />
        </button>
      </div>
    </div>
  );
};

export default Delivery;
