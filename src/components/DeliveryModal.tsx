import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string;
  userId: string;
}

const DeliveryModal: React.FC<DeliveryModalProps> = ({ isOpen, onClose, purchaseId, userId }) => {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!
  });

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `${userId}-${Date.now()}`;
    
    try {
      await setDoc(doc(db, 'orders', orderId), {
        userId,
        purchaseId,
        location,
        phoneNumber,
        city,
        createdAt: new Date()
      });

      onClose();
      navigate('/order-tracking');
    } catch (error) {
      console.error('Error saving order:', error);
      // Handle error (show toast, etc.)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-4">Delivery Details</h2>
        <form onSubmit={handleSubmit}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '300px' }}
              center={location}
              zoom={10}
              onClick={handleMapClick}
            >
              <Marker position={location} />
            </GoogleMap>
          ) : (
            <div>Loading map...</div>
          )}
          <input
            type="text"
            value={`${location.lat}, ${location.lng}`}
            readOnly
            className="w-full p-2 border rounded mt-4"
          />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
            className="w-full p-2 border rounded mt-2"
            required
          />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full p-2 border rounded mt-2"
            required
          />
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded mt-4">
            Confirm Delivery Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryModal;