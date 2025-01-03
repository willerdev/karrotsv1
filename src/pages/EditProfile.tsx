import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { User } from '../types/User';
import { Camera, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = { id: userSnap.id, ...userSnap.data() } as User;
          setUserData(userData);
          setName(userData.name || '');
          setEmail(userData.email || '');
          setPhoneNumber(userData.phoneNumber || '');
          setDateOfBirth(userData.dateOfBirth || '');
          setCountry(userData.country || '');
        } else {
          setError('User data not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        email,
        phoneNumber,
        dateOfBirth,
        country,
      });
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update user data. Please try again later.');
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !user) return;

    try {
      setUploadingImage(true);
      const storage = getStorage();
      const imageRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}_${selectedImage.name}`);
      
      await uploadBytes(imageRef, selectedImage);
      const downloadUrl = await getDownloadURL(imageRef);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        profilePictureUrl: downloadUrl
      });

      setUserData(prev => prev ? { ...prev, profilePictureUrl: downloadUrl } : null);
      toast.success('Profile picture updated successfully');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      toast.error('Failed to update profile picture');
    } finally {
      setUploadingImage(false);
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      handleImageUpload();
    }
  }, [selectedImage]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold ml-4">Edit Profile</h1>
      </div>

      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <img
            src={previewUrl || userData?.profilePictureUrl || 'https://via.placeholder.com/128'}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
          <label 
            htmlFor="profile-picture"
            className={`absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer 
              hover:bg-orange-600 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Camera size={20} />
            <input
              type="file"
              id="profile-picture"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country/Region
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select a country</option>
              <option value="Nigeria">Nigeria</option>
              <option value="South Africa">South Africa</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Kenya">Kenya</option>
              <option value="Burundi">Burundi</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Ghana">Ghana</option>
              {/* Add more countries as needed */}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
