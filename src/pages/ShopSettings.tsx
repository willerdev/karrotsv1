import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingScreen from '../components/LoadingScreen';

type ShopData = {
  shopId: string;
  shopName: string;
  shopAddress: string;
  shopEmail: string;
  shopNumber: string;
  shopLogo: string;
  shopCover: string;
  workingFrom: string;
  workingTo: string;
  deliveryTime: string;
  websiteUrl: string;
  status: string;
  dateCreated: string;
  dateUpdated: string;
};
const saveNotification = async (title: string, details: string, userId: string) => {
    try {
      const notificationRef = collection(db, 'notifications');
      await addDoc(notificationRef, {
        title,
        details,
        status: 'unread',
        dateCreated: serverTimestamp(),
        userId: userId // Add user ID to the notification
      });
      console.log('Notification saved successfully');
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };
const ShopSettings = () => {
  const { user } = useAuth();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!user) return;

      const shopRef = doc(db, 'shop', user.uid);
      const shopSnap = await getDoc(shopRef);

      if (shopSnap.exists()) {
        setShopData(shopSnap.data() as ShopData);
      } else {
        setShopData({
          shopId: user.uid,
          shopName: '',
          shopAddress: '',
          shopEmail: '',
          shopNumber: '',
          shopLogo: '',
          shopCover: '',
          workingFrom: '',
          workingTo: '',
          deliveryTime: '',
          websiteUrl: '',
          status: 'active',
          dateCreated: new Date().toISOString(),
          dateUpdated: new Date().toISOString(),
        });
      }
      setLoading(false);
    };

    fetchShopData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !shopData) return;

    try {
      const shopRef = doc(db, 'shop', user.uid);
      await setDoc(shopRef, {
        ...shopData,
        dateUpdated: new Date().toISOString(),
      });
      
      // Save notification after successful shop update
      await saveNotification(
        'Shop Settings Updated',
        'Your shop settings have been successfully updated.',
        user.uid
      );
      
      alert('Shop settings updated successfully!');
    } catch (error) {
      console.error('Error updating shop settings:', error);
      alert('Failed to update shop settings. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShopData(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (loading) return <LoadingScreen />;
  if (!shopData) return <div>Error loading shop data</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Shop Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-16">
        <input
          type="text"
          name="shopName"
          value={shopData.shopName}
          onChange={handleInputChange}
          placeholder="Shop Name"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="shopAddress"
          value={shopData.shopAddress}
          onChange={handleInputChange}
          placeholder="Shop Address"
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="shopEmail"
          value={shopData.shopEmail}
          onChange={handleInputChange}
          placeholder="Shop Email"
          className="w-full p-2 border rounded"
        />
        <input
          type="tel"
          name="shopNumber"
          value={shopData.shopNumber}
          onChange={handleInputChange}
          placeholder="Shop Number"
          className="w-full p-2 border rounded"
        />
        <input
          type="url"
          name="shopLogo"
          value={shopData.shopLogo}
          onChange={handleInputChange}
          placeholder="Shop Logo URL"
          className="w-full p-2 border rounded"
        />
        <input
          type="url"
          name="shopCover"
          value={shopData.shopCover}
          onChange={handleInputChange}
          placeholder="Shop Cover URL"
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-4">
          <input
            type="time"
            name="workingFrom"
            value={shopData.workingFrom}
            onChange={handleInputChange}
            className="w-1/2 p-2 border rounded"
          />
          <input
            type="time"
            name="workingTo"
            value={shopData.workingTo}
            onChange={handleInputChange}
            className="w-1/2 p-2 border rounded"
          />
        </div>
        <input
          type="text"
          name="deliveryTime"
          value={shopData.deliveryTime}
          onChange={handleInputChange}
          placeholder="Delivery Time"
          className="w-full p-2 border rounded"
        />
        <input
          type="url"
          name="websiteUrl"
          value={shopData.websiteUrl}
          onChange={handleInputChange}
          placeholder="Shop Website URL"
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-4">
          <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">
            Save Shop Settings
          </button>
          {user && user.uid && (
            <button
              type="button"
              onClick={() => window.location.href = `/shop/${user.uid}`}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Go to Karrot Page
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ShopSettings;
