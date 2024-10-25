import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FaShippingFast } from 'react-icons/fa';

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

const OrderConfirmation: React.FC = () => {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!purchaseId) return;

      try {
        const purchaseRef = doc(db, 'purchases', purchaseId);
        const purchaseSnap = await getDoc(purchaseRef);

        if (purchaseSnap.exists()) {
          setPurchase({ id: purchaseSnap.id, ...purchaseSnap.data() } as Purchase);
        } else {
          setError('Purchase not found');
        }
      } catch (err) {
        console.error('Error fetching purchase:', err);
        setError('Failed to fetch purchase details');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [purchaseId]);

  const handleConfirmShipment = async () => {
    if (!purchase || !user) return;

    try {
      await updateDoc(doc(db, 'purchases', purchase.id), {
        status: 'shipped',
        lastUpdated: new Date()
      });

      setPurchase({ ...purchase, status: 'shipped' });
      toast.success('Order marked as shipped successfully');
    } catch (err) {
      console.error('Error updating purchase status:', err);
      toast.error('Failed to update order status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!purchase) return <div>No purchase found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Order Confirmation</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{purchase.productTitle}</h2>
        <p className="mb-2"><strong>Order ID:</strong> {purchase.id}</p>
        <p className="mb-2"><strong>Price:</strong> {purchase.price.toLocaleString()} Frw</p>
        <p className="mb-2"><strong>Payment Method:</strong> {purchase.paymentMethod}</p>
        <p className="mb-2"><strong>Purchase Date:</strong> {purchase.purchaseDate.toDate().toLocaleString()}</p>
        <p className="mb-4"><strong>Status:</strong> {purchase.status}</p>

        {purchase.status === 'pending' && user?.uid === purchase.sellerId && (
          <button
            onClick={handleConfirmShipment}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <FaShippingFast className="mr-2" />
            Mark as Shipped
          </button>
        )}

        {purchase.status === 'shipped' && (
          <div className="text-green-500 font-semibold">
            This order has been marked as shipped.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
