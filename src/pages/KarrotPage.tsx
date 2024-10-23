import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingScreen from '../components/LoadingScreen';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock, FaTruck, FaGlobe, FaDollarSign, FaEdit, FaCheckCircle } from 'react-icons/fa';

const KarrotPage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!shopId) return;

      const shopRef = doc(db, 'shop', shopId);
      const shopSnap = await getDoc(shopRef);

      if (shopSnap.exists()) {
        setShopData(shopSnap.data());
      }

      // Fetch ads associated with the shop
      const adsQuery = query(collection(db, 'ads'), where('userId', '==', shopId));
      const adsSnapshot = await getDocs(adsQuery);
      const adsData = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsData);

      setLoading(false);
    };

    fetchShopData();
  }, [shopId]);

  const saveNotification = async (title: string, details: string) => {
    try {
      const notificationRef = collection(db, 'notifications');
      await addDoc(notificationRef, {
        title,
        details,
        status: 'unread',
        dateCreated: serverTimestamp()
      });
      console.log('Notification saved successfully');
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleMarkAsSold = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), { 
        status: 'sold',
        soldAt: new Date()
      });
      setAds(ads.map(ad => ad.id === adId ? { ...ad, status: 'sold' } : ad));
      
      // Save a notification when an item is marked as sold
      const soldAd = ads.find(ad => ad.id === adId);
      if (soldAd) {
        await saveNotification(
          'Item Sold',
          `The item "${soldAd.title}" has been marked as sold.`
        );
      }
    } catch (error) {
      console.error("Error marking ad as sold:", error);
    }
  };

  const handleUpdatePrice = async (adId: string, newPrice: number) => {
    try {
      await updateDoc(doc(db, 'ads', adId), { price: newPrice });
      setAds(ads.map(ad => ad.id === adId ? { ...ad, price: newPrice } : ad));
      
      // Save a notification when an item's price is updated
      const updatedAd = ads.find(ad => ad.id === adId);
      if (updatedAd) {
        await saveNotification(
          'Price Updated',
          `The price for "${updatedAd.title}" has been updated to $${newPrice}.`
        );
      }
    } catch (error) {
      console.error("Error updating price:", error);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!shopData) return <div>Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-64 md:h-96">
        <img src={shopData.shopCover} alt="Shop Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <img src={shopData.shopLogo} alt="Shop Logo" className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">{shopData.shopName}</h1>
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-orange-500 mr-3 text-xl" />
            <span>{shopData.shopAddress}</span>
          </div>
          <div className="flex items-center">
            <FaEnvelope className="text-orange-500 mr-3 text-xl" />
            <span>{shopData.shopEmail}</span>
          </div>
          <div className="flex items-center">
            <FaPhone className="text-orange-500 mr-3 text-xl" />
            <span>{shopData.shopNumber}</span>                                        
          </div>
          <div className="flex items-center">                                
            <FaClock className="text-orange-500 mr-3 text-xl" />
            <span>Working hours: {shopData.workingFrom} - {shopData.workingTo}</span>
          </div>
          <div className="flex items-center">
            <FaTruck className="text-orange-500 mr-3 text-xl" />
            <span>Delivery time: {shopData.deliveryTime}</span>
          </div>
          {shopData.websiteUrl && (
            <div className="flex items-center">
              <FaGlobe className="text-orange-500 mr-3 text-xl" />
              <a href={shopData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {shopData.websiteUrl}
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Shop Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              <img src={ad.images[0]} alt={ad.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{ad.title}</h3>
                <p className="text-gray-600 mb-3">{ad.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-orange-600 flex items-center">
                    <FaDollarSign className="mr-1" />{ad.price}
                  </span>
                  {ad.sold && (
                    <span className="text-white bg-red-500 px-2 py-1 rounded-full text-sm font-semibold">
                      SOLD
                    </span>
                  )}
                </div>
                {!ad.sold && (
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleMarkAsSold(ad.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 md:px-4 md:py-2 rounded flex items-center transition-colors duration-300 text-xs md:text-sm"
                    >
                      <FaCheckCircle className="mr-1 md:mr-2" />
                      <span className="hidden xs:inline">Mark as Sold</span>
                      <span className="xs:hidden">Sold</span>
                    </button>
                    <button
                      onClick={() => {
                        const newPrice = prompt('Enter new price:');
                        if (newPrice && !isNaN(Number(newPrice))) {
                          handleUpdatePrice(ad.id, Number(newPrice));
                        }
                      }}
                      className="bg-white hover:bg-gray-100 text-orange-500 border border-orange-500 px-2 py-1 md:px-4 md:py-2 rounded flex items-center transition-colors duration-300 text-xs md:text-sm"
                    >
                      <FaEdit className="mr-1 md:mr-2" />
                      <span className="hidden xs:inline">Update Price</span>
                      <span className="xs:hidden">Update</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KarrotPage;
