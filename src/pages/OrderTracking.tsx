import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, runTransaction, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Purchase {
  id: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  sellerId: string;
  price: number;
  paymentMethod: string;
  status: string;
  purchaseDate: { toDate: () => Date };
  lastUpdated: Date;
}

const OrderTracking: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:"AIzaSyCIRjn9GL-E-eKxxsrgq2jiT0ux0tRNFjM"
  });

  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }

    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    if (!user) return;

    try {
      const purchasesRef = collection(db, 'purchases');
      const q = query(
        purchasesRef,
        where('buyerId', '==', user.uid),
        orderBy('purchaseDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const purchasesData: Purchase[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Purchase));
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to fetch purchases');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'ads', orderId), {
        status: 'active'
      });
      toast.success('Order cancelled successfully');
      fetchPurchases();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const handleMarkAsReceived = async (orderId: string, sellerId: string, amount: number) => {
    try {
      await runTransaction(db, async (transaction) => {
        const sellerWalletRef = doc(db, 'wallets', sellerId);
        const sellerWalletDoc = await transaction.get(sellerWalletRef);

        if (!sellerWalletDoc.exists()) {
          throw new Error("Seller wallet does not exist!");
        }

        const sellerData = sellerWalletDoc.data();
        const currentBalance = sellerData.balance || 0;
        const currentReleaseable = sellerData.releaseable || 0;

        if (currentReleaseable < amount) {
          throw new Error("Insufficient releaseable amount");
        }

        transaction.update(sellerWalletRef, {
          balance: currentBalance + amount,
          releaseable: currentReleaseable - amount,
          status: true
        });

        transaction.update(doc(db, 'ads', orderId), {
          status: 'completed'
        });
      });

      toast.success('Order marked as received');
      fetchPurchases();
    } catch (error) {
      console.error('Error marking order as received:', error);
      toast.error('Failed to mark order as received');
    }
  };

  const handleCancelPurchase = async (purchaseId: string) => {
    try {
      await updateDoc(doc(db, 'purchases', purchaseId), {
        status: 'cancelled'
      });
      toast.success('Purchase cancelled successfully');
      fetchPurchases();
    } catch (error) {
      console.error('Error cancelling purchase:', error);
      toast.error('Failed to cancel purchase');
    }
  };

  const handleConfirmDelivery = async (purchaseId: string) => {
    try {
      await updateDoc(doc(db, 'purchases', purchaseId), {
        status: 'delivered'
      });
      toast.success('Delivery confirmed successfully');
      fetchPurchases();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error('Failed to confirm delivery');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '90%' }}
          center={center}
          zoom={10}
        >
          <Marker position={center} />
        </GoogleMap>
      ) : (
        <div>Loading map...</div>
      )}

      <motion.div
        className="bg-white rounded-t-3xl p-4 absolute bottom-0 left-0 right-0"
        initial={{ y: "100%" }}
        animate={{ 
          y: modalOpen ? 0 : "70%",
          translateY: isAnimating ? [0, -20, 0] : 0
        }}
        transition={{ 
          y: { type: "spring", stiffness: 300, damping: 30 },
          translateY: { duration: 0.5, ease: "easeInOut" }
        }}
      >
        <div
          className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
          onClick={() => setModalOpen(!modalOpen)}
        ></div>
        <h2 className="text-2xl font-bold mb-4">Your Purchases</h2>
        {purchases.length === 0 ? (
          <p className="text-center text-gray-500">No purchases found.</p>
        ) : (
          purchases.map((purchase) => (
            <div key={purchase.id} className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="font-semibold">{purchase.productTitle}</h3>
              <p>Price: {purchase.price.toLocaleString()} Frw</p>
              <p>Status: {purchase.status}</p>
              <p>Payment Method: {purchase.paymentMethod}</p>
              <p>Purchase Date: {purchase.purchaseDate.toDate().toLocaleString()}</p>
              
              {purchase.status === 'pending' && (
                <button
                  onClick={() => handleCancelPurchase(purchase.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded mt-2 mr-2"
                >
                  Cancel Purchase
                </button>
              )}
              
              {purchase.status === 'shipped' && (
                <button
                  onClick={() => handleConfirmDelivery(purchase.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                >
                  Confirm Delivery
                </button>
              )}

              {purchase.status === 'pending' && user?.uid === purchase.sellerId && (
                <Link
                  to={`/order-confirmation/${purchase.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2 inline-block"
                >
                  Confirm Order
                </Link>
              )}
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default OrderTracking;
