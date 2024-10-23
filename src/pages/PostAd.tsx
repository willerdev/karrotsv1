import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAd } from '../services/adService';
import ImageUpload from '../components/ImageUpload';
import { AlertCircle, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { categories } from '../data/categories';
import { Ad } from '../types/Ad';

import Loading from '../components/LoadingScreen';
import { motion } from 'framer-motion';

const PostAd: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
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

      const adData: Omit<Ad, "id" | "status" | "createdAt" | "updatedAt" | "views" | "savedBy"> = {
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
        color: '',
        brand: '',
        model: '',
        internalStorage: null,
        ram: null,
        screenSize: null,
        secondCondition: "",
        network: '',
        sim: '',
        wifi: false,
        // Add other missing properties with default values (null or empty string)
        // ...
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setSubcategory('');
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
        <div>
          <label htmlFor="category" className="block mb-2 font-semibold text-gray-700">Category</label>
          <div className="relative">
            <select
              id="category"
              value={category}
              onChange={handleCategoryChange}
              className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
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
          <label htmlFor="condition" className="block mb-2 font-semibold text-gray-700">Condition</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            required
          >
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
            <option value="used_s_class">Used S Class</option>
            <option value="used_a_class">Used A Class</option>
            <option value="used_b_grade">Used B Grade</option>
            <option value="used_cracked">Used Cracked</option>
            <option value="for_parts">For Parts</option>
          </select>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="mr-2"
            />
            Price is negotiable
          </label>
        </div>
        <div>
          <label htmlFor="location" className="block mb-2 font-semibold text-gray-700">Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            required
          />
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
      </motion.form>
    </motion.div>
  );
};

export default PostAd;
