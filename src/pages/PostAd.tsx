import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAd } from '../services/adService';
import ImageUpload from '../components/ImageUpload';
import { AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { categories } from '../data/categories';

const PostAd = () => {
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

      const adData = {
        title,
        description,
        price: Number(price),
        category,
        subcategory: subcategory || null, // Add subcategory, use null if not selected
        condition: condition as "new" | "used",
        negotiable,
        images: uploadedImageUrls,
        location,
        userId: user.uid
      };

      await postAd(adData);
      navigate('/dashboard');
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
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Post a New Ad</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block mb-1">Price (USh)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block mb-1">Category</label>
          <select
            id="category"
            value={category}
            onChange={handleCategoryChange}
            className="w-full p-2 border rounded"
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
            <label htmlFor="subcategory" className="block mb-1">Subcategory</label>
            <select
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full p-2 border rounded"
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
          <label htmlFor="condition" className="block mb-1">Condition</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full p-2 border rounded"
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
          <label htmlFor="location" className="block mb-1">Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <ImageUpload onImageUpload={handleImageUpload} />
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt={`Uploaded ${index + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white p-2 rounded disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Ad'}
        </button>
      </form>
    </div>
  );
};

export default PostAd;
