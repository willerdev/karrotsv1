import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAd } from '../services/adService';
import ImageUpload from '../components/ImageUpload';
import { AlertCircle, X, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { categories } from '../data/categories';
import { Ad } from '../types/Ad';

import Loading from '../components/LoadingScreen';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const masterCategories = [
  { name: 'Normal Ads', color: '#4CAF50' },
  { name: 'AirBnb', color: '#FF5A5F' },
  { name: 'Services', color: '#2196F3' },
  { name: 'Rentals', color: '#FFC107' },
];

const PostAd: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedMasterCategory, setSelectedMasterCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [condition, setCondition] = useState('new');
  const [negotiable, setNegotiable] = useState(false);
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.9441, lng: 30.0619 }); // Kigali coordinates
  const mapRef = useRef<google.maps.Map | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [rentalPeriod, setRentalPeriod] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyCIRjn9GL-E-eKxxsrgq2jiT0ux0tRNFjM"
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files);
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadPromises = images.map(async (image) => {
      const imageRef = ref(storage, `ad-images/${uuidv4()}`);
      await uploadBytes(imageRef, image);
      return getDownloadURL(imageRef);
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!user) {
      setError('You must be logged in to post an ad.');
      setIsSubmitting(false);
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image for your ad.');
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadedImageUrls = await uploadImages();

      const adData: Partial<Omit<Ad, "id" | "status" | "createdAt" | "updatedAt" | "views" | "savedBy">> = {
        title,
        description,
        price: Number(price),
        category,
        subcategory: subcategory || null,
        condition: condition as "new" | "used" | "refurbished" | "used_s_class" | "used_a_class" | "used_b_grade" | "used_cracked" | "for_parts",
        negotiable,
        images: uploadedImageUrls,
        location,
        userId: user.uid,
        masterCategory: selectedMasterCategory,
        checkInDate: checkInDate || null,
        checkOutDate: checkOutDate || null,
        serviceType: serviceType || null,
        rentalPeriod: rentalPeriod || null,
      };

      const postedAd = await postAd(adData);

      navigate('/locals');
    } catch (err: any) {
      console.error("Error posting ad:", err);
      setError(err.message || 'Failed to post ad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMasterCategoryButtons = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {masterCategories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => setSelectedMasterCategory(cat.name)}
          className="h-32 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-transform transform hover:scale-105"
          style={{ backgroundColor: cat.color }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );

  const renderAdditionalFields = () => {
    switch (selectedMasterCategory) {
      case 'AirBnb':
        return (
          <>
            <div>
              <label htmlFor="checkInDate" className="block mb-2 font-semibold text-gray-700">Check-in Date</label>
              <input
                type="date"
                id="checkInDate"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label htmlFor="checkOutDate" className="block mb-2 font-semibold text-gray-700">Check-out Date</label>
              <input
                type="date"
                id="checkOutDate"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                required
              />
            </div>
          </>
        );
      case 'Services':
        return (
          <div>
            <label htmlFor="serviceType" className="block mb-2 font-semibold text-gray-700">Service Type</label>
            <input
              type="text"
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              required
            />
          </div>
        );
      case 'Rentals':
        return (
          <div>
            <label htmlFor="rentalPeriod" className="block mb-2 font-semibold text-gray-700">Rental Period</label>
            <input
              type="text"
              id="rentalPeriod"
              value={rentalPeriod}
              onChange={(e) => setRentalPeriod(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMapCenter({ lat, lng });
      
      // Get address from coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setLocation(results[0].formatted_address);
          setShowMap(false);
        }
      });
    }
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <div>You need to be logged in to post an ad.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Post a New Ad</h2>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" 
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6 mb-8 bg-white shadow-lg rounded-lg p-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {!selectedMasterCategory && renderMasterCategoryButtons()}
        
        {selectedMasterCategory && (
          <>
            <div>
              <label htmlFor="title" className="block mb-2 font-semibold text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block mb-2 font-semibold text-gray-700">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                rows={4}
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block mb-2 font-semibold text-gray-700">Price (Frw)</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                required
              />
            </div>
            
            {renderAdditionalFields()}

            <div>
              <label htmlFor="category" className="block mb-2 font-semibold text-gray-700">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory('');
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            {category && (
              <div>
                <label htmlFor="subcategory" className="block mb-2 font-semibold text-gray-700">Subcategory</label>
                <select
                  id="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Select a subcategory</option>
                  {categories.find(cat => cat.name === category)?.subcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="location" className="block mb-2 font-semibold text-gray-700">Location</label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                  onClick={() => setShowMap(true)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowMap(true)}
                >
                  <MapPin size={20} />
                </button>
              </div>
            </div>
            <ImageUpload onImageUpload={handleImageUpload} />
            <motion.div 
              className="flex flex-wrap gap-3 mb-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {images.map((image, index) => (
                <motion.div 
                  key={index} 
                  className="relative"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
            <motion.button
              type="submit"
              className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? 'Posting...' : 'Post Ad'}
            </motion.button>
          </>
        )}
      </motion.form>

      {showMap && isLoaded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-2">Select Location</h3>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '400px' }}
              center={mapCenter}
              zoom={10}
              onClick={onMapClick}
              onLoad={onMapLoad}
            >
              <Marker position={mapCenter} />
            </GoogleMap>
            <button
              className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              onClick={() => setShowMap(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostAd;
