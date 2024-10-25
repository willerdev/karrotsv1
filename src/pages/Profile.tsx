import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Moon, Sun, LogOut, Edit, Key, Phone, MapPin, Heart, List, ShoppingBag, PiggyBank, Gift, FileText, Store, Plus, HelpCircle, DollarSign } from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types/User';
import Modal from '../components/Modal';
import LoadingScreen from '../components/LoadingScreen';

type RecentlyViewedItem = {
  link: string;
  title: string;
};

type BanReason = {
  id: string;
  title: string;
};

type Transaction = {
  id: string;
  adId: string;
  amount: number;
  method: string;
  createdAt: { seconds: number };
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
  const [imageError, setImageError] = useState(false);                                            
  const [showBanReasonModal, setShowBanReasonModal] = useState(false);
  const [banReasons, setBanReasons] = useState<BanReason[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setError('Reload this Page');
        setLoading(false);
        navigate('/'); // Redirect to login page
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

    const recentItems = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewedItems(recentItems);

    const fetchBanReasons = async () => {
      try {
        const reasonsCollection = collection(db, 'reasons');
        const reasonsSnapshot = await getDocs(reasonsCollection);
        const reasonsList = reasonsSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
        }));
        setBanReasons(reasonsList);
      } catch (error) {
        console.error('Error fetching ban reasons:', error);
      }
    };

    fetchBanReasons();

    const fetchTransactions = async () => {
      if (!user) return;

      const transactionsRef = collection(db, 'paymentsList');
      const q = query(transactionsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const transactionsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          adId: data.adId,
          amount: data.amount,
          method: data.method,
          createdAt: data.createdAt,
        };
      });
      setTransactions(transactionsData);
    };

    fetchTransactions();
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

  const handleEditClick = (field: string) => {
    setEditField(field);
    setShowEditModal(true);
  };

  const handleEditSubmit = (value: string) => {
    console.log(`Updating ${editField} to ${value}`);
    setShowEditModal(false);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!userData) return <div className="text-center py-8">No user data available</div>;

  return (
    <div className="bg-white text-orange-600 min-h-screen relative pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-2">
          <div className="w-32 h-32 bg-orange-100 rounded-full flex-shrink-0 mr-6">
            {userData.profilePictureUrl ? (
              <img src={userData.profilePictureUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <img 
                src="https://downloadr2.apkmirror.com/wp-content/uploads/2023/02/30/63ec3579b1618.png" 
                alt="Default Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{userData.name}</h1>
            <p className="text-gray-500">{userData.email}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
          <div className="flex space-x-4">
            <Link to="/wallet" className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full">
              Check Wallet
            </Link>
            <Link to="/transactions" className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full">
              Check Transactions
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Recently Viewed</h2>
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

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Profile Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/favorites" className="flex items-center p-3 bg-orange-100 rounded-lg">
              <Heart className="mr-2" />
              <span>Favorites</span>
            </Link>
            <Link to="/myads" className="flex items-center p-3 bg-orange-100 rounded-lg">
              <List className="mr-2" />
              <span>My Listings</span>
            </Link>
            <Link to="/purchases" className="flex hidden items-center p-3 bg-orange-100 rounded-lg">
              <ShoppingBag className="mr-2" />
              <span>Purchases</span>
            </Link>
            <Link to="/savings" className="flex hidden items-center p-3 bg-orange-100 rounded-lg">
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
        </div>

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
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">My Karrot Shop</h2>
          <Link to="/shop-settings" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-300">
            Shop Settings
          </Link>
          <Link to="/myads" className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg inline-flex items-center">
            <Store className="mr-2" />
            Shop Products
          </Link>
        </div>

        <Link
          to="/postad"
          className="fixed bottom-20 left-8 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors duration-300"
          aria-label="Add Product"
        >
          <Plus size={24} />
        </Link>

        <button
          onClick={handleLogout}
          className="fixed bottom-20 right-8 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300"
          aria-label="Logout"
        >
          <LogOut size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Support</h2>
          <Link to="/support" className="flex items-center p-3 bg-orange-100 rounded-lg">
            <HelpCircle className="mr-2" />
            <span>Get Support</span>
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Account Status</h2>
          <button
            onClick={() => setShowBanReasonModal(true)}
            className="text-red-500 underline"
          >
            See why you could be banned
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Earn with Karrot</h2>
          <Link to="/earn-with-karrot" className="flex items-center p-3 bg-orange-100 rounded-lg">
            <DollarSign className="mr-2" />
            <span>Referral Program</span>
          </Link>
        </div>

        <Link to="/order-tracking" className="text-blue-500 hover:underline mt-2 block">
          Track Orders
        </Link>
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

      <Modal
        isOpen={showBanReasonModal}
        onClose={() => setShowBanReasonModal(false)}
        title="Reasons for Banning"
      >
        <div className="space-y-2">
          <p className="font-semibold">You can be banned for the following reasons:</p>
          <ul className="list-disc pl-5">
            {banReasons.map((reason) => (
              <li key={reason.id}>{reason.title}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
