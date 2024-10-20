import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Moon, Sun, LogOut, Edit, Key, Phone, MapPin, Heart, List, ShoppingBag, PiggyBank, Gift, FileText } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types/User';
import Modal from '../components/Modal';

// Add this type definition
type RecentlyViewedItem = {
  link: string;
  title: string;
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<RecentlyViewedItem[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData({ id: userSnap.id, ...userSnap.data() } as User);
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

    // Fetch recently viewed items from localStorage
    const recentItems = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewedItems(recentItems);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implement dark mode logic here
  };

  const handleEditClick = (field: string) => {
    setEditField(field);
    setShowEditModal(true);
  };

  const handleEditSubmit = (value: string) => {
    // Implement the logic to update the user data
    console.log(`Updating ${editField} to ${value}`);
    setShowEditModal(false);
  };

  if (loading) return <div className="text-center py-8">Loading user data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!userData) return <div className="text-center py-8">No user data available</div>;

  return (
    <div className="bg-white text-orange-600 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            {userData.profilePictureUrl ? (
              <img src={userData.profilePictureUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <Camera size={64} className="text-orange-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{userData.name}</h1>
          <p className="text-gray-500">{userData.email}</p>
        </div>

        {/* O Pay Section */}
        <div className="bg-orange-100 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">O Pay</h2>
          <p>Your current balance: $0.00</p>
          <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg">Add Funds</button>
        </div>

        {/* Recently Viewed Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Recently viewed</h2>
          {recentlyViewedItems.length === 0 ? (
            <p>No recently viewed items</p>
          ) : (
            <div className="flex space-x-4">
              <Link to="/recentlyViewed" className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full whitespace-nowrap">
                All
              </Link>
              {recentlyViewedItems.slice(0, 2).map((item, index) => (
                <Link key={index} to={item.link} className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full whitespace-nowrap">
                  {item.title}
                </Link>
              ))}
              {recentlyViewedItems.length > 2 && (
                <Link to="/recently-viewed" className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full whitespace-nowrap">
                  View more
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Profile Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/favorites" className="flex items-center p-3 bg-orange-100 rounded-lg">
            <Heart className="mr-2" />
            <span>Favorites</span>
          </Link>
          <Link to="/listings" className="flex items-center p-3 bg-orange-100 rounded-lg">
            <List className="mr-2" />
            <span>My Listings</span>
          </Link>
          <Link to="/purchases" className="flex items-center p-3 bg-orange-100 rounded-lg">
            <ShoppingBag className="mr-2" />
            <span>Purchases</span>
          </Link>
          <Link to="/savings" className="flex items-center p-3 bg-orange-100 rounded-lg">
            <PiggyBank className="mr-2" />
            <span>Savings</span>
          </Link>
          <Link to="/events" className="flex items-center p-3 bg-orange-100 rounded-lg">
            <Gift className="mr-2" />
            <span>Events</span>
          </Link>
          <Link to="/whats-new" className="flex items-center p-3 bg-orange-100 rounded-lg">
            <FileText className="mr-2" />
            <span>What's New</span>
          </Link>
        </div>

        {/* Settings */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Settings</h2>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>Edit Profile</span>
              <div className="flex space-x-2">
                <button onClick={() => handleEditClick('name')} className="p-2 rounded-full bg-orange-100 text-orange-500">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleEditClick('password')} className="p-2 rounded-full bg-orange-100 text-orange-500">
                  <Key size={20} />
                </button>
                <button onClick={() => handleEditClick('phone')} className="p-2 rounded-full bg-orange-100 text-orange-500">
                  <Phone size={20} />
                </button>
                <button onClick={() => handleEditClick('address')} className="p-2 rounded-full bg-orange-100 text-orange-500">
                  <MapPin size={20} />
                </button>
              </div>
            </li>
            {/* <li className="flex items-center justify-between">
              <span>Dark Mode</span>
              <button onClick={toggleDarkMode} className="flex items-center">
                {darkMode ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </li> */}
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className=" bg-red-500 text-white py-2 rounded-sm"
        >
          Logout
        </button>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${editField}`}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditSubmit((e.target as HTMLFormElement).value.value);
        }}>
          <input
            type={editField === 'password' ? 'password' : 'text'}
            name="value"
            className="w-full p-2 border rounded mb-4"
            placeholder={`Enter new ${editField}`}
          />
          <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
