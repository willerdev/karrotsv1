import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings, MapPin, Mail, Phone, LogOut, ShoppingBag, Store } from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types/User';
import { Ad } from '../types/Ad';
import LoadingScreen from '../components/LoadingScreen';

const Profile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/login');
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

        const adsRef = collection(db, 'ads');
        const q = query(adsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const ads: Ad[] = [];
        querySnapshot.forEach((doc) => {
          ads.push({ id: doc.id, ...doc.data() } as Ad);
        });
        setUserAds(ads);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (loading || authLoading) return <LoadingScreen />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!userData) return <div className="text-center py-8">No user data available</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="relative h-48 md:h-64">
        <img
          src="https://smallbizclub.com/wp-content/uploads/2017/12/Awesome-Facebook-Cover-Photos.jpg"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <img
            src={userData.profilePictureUrl || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 pt-16 md:pt-24 max-w-[600px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{userData.name}</h1>
          <p className="text-gray-600">{userData.bio || 'No bio available'}</p>
          <div className="flex justify-center items-center mt-4 space-x-4">
            <div className="text-center">
              <p className="font-bold">{userAds.length}</p>
              <p className="text-sm text-gray-600">Ads</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{userData.followers || 0}</p>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{userData.following || 0}</p>
              <p className="text-sm text-gray-600">Following</p>
            </div>
          </div>
         
        </div>
        {/* <div className="mb-8">

          <div className="space-y-2">
            <p className="flex items-center">
              <MapPin className="mr-2" size={16} />
              {userData.country ? (
                <span>{userData.country}</span>
              ) : (
                <Link to="/edit-profile" className="text-orange-500 hover:underline">
                  Add location
                </Link>
              )}
            </p>
            <p className="flex items-center">
              <Mail className="mr-2" size={16} />
              {userData.email}
            </p>
            <p className="flex items-center">
              <Phone className="mr-2" size={16} />
              {userData.phoneNumber ? (
                <span>{userData.phoneNumber}</span>
              ) : (
                <Link to="/edit-profile" className="text-orange-500 hover:underline">
                  Add phone number
                </Link>
              )}
            </p>
          </div>
        </div> */}
        <div>
         
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/myads" 
              className="flex items-center justify-center bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-4 mb-3 mx-auto w-fit">
                  <ShoppingBag className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">My Ads</h3>
                <p className="text-gray-500 text-sm mt-1">{userAds.length} items</p>
              </div>
            </Link>

            <Link 
              to="/shop-settings" 
              className="flex items-center justify-center bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-4 mb-3 mx-auto w-fit">
                  <Store className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">My Shop</h3>
                <p className="text-gray-500 text-sm mt-1">View shop</p>
              </div>
            </Link>
          </div>
          <div className="flex justify-center gap-2">
            <Link
              to="/settings"
              className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors duration-300"
            >
              <Settings className="inline-block mr-2" size={16} />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="mt-4 inline-block bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300"
            >
              <LogOut className="inline-block mr-2" size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
