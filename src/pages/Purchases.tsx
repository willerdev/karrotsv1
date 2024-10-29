import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';

interface Purchase {
  id: string;
  buyerId: string;
  lastUpdated: { toDate: () => Date };
  paymentMethod: string;
  price: number;
  productId: string;
  productTitle: string;
  purchaseDate: { toDate: () => Date };
  sellerId: string;
  status: string;
}

const Purchases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPurchases = async () => {
      try {
        const purchasesRef = collection(db, 'purchases');
        const q = query(
          purchasesRef,
          where('buyerId', '==', user.uid),
          orderBy('purchaseDate', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const purchasesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Purchase[];
        
        setPurchases(purchasesData);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user, navigate]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Purchases</h1>
      {purchases.length === 0 ? (
        <p className="text-center text-gray-500">No purchases found.</p>
      ) : (
        <div className="grid gap-4">
          {purchases.map((purchase) => (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{purchase.productTitle}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Price:</p>
                  <p className="font-medium">{purchase.price.toLocaleString()} Frw</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Method:</p>
                  <p className="font-medium capitalize">{purchase.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-600">Purchase Date:</p>
                  <p className="font-medium">
                    {purchase.purchaseDate.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                    purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Purchases;