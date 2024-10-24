import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<{ id: string; adId: string; amount: number; method: string; createdAt: { seconds: number; }; }[]>([]);
  const [ads, setAds] = useState<{ id: string; image: string; name: string; price: number; }[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<{ id: string; adId: string; amount: number; method: string; createdAt: { seconds: number; }; } | null>(null); // Update type to include transaction object
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for modal visibility

  useEffect(() => {
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

    const fetchAds = async () => {
      const adsRef = collection(db, 'ads');
      const adsSnapshot = await getDocs(adsRef);
      const adsData = adsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          image: data.images[0], // Assuming the first image is the main one
          name: data.title,
          price: data.price,
        };
      });
      setAds(adsData);
    };

    fetchTransactions();
    fetchAds();
  }, [user]);

  const openModal = (transaction: { id: string; adId: string; amount: number; method: string; createdAt: { seconds: number; }; }) => {
    setSelectedTransaction(transaction);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Transactions</h1>
      {transactions.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map(transaction => {
            const ad = ads.find(ad => ad.id === transaction.adId);
            return (
              <li key={transaction.id} className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                {ad ? (
                  <p className="text-lg font-semibold">Name: <span className="font-normal">{ad.name}</span></p>
                ) : (
                  <p className="text-lg font-semibold text-red-500">Ad details not found</p>
                )}
                <p className="text-lg font-semibold">Amount: <span className="font-normal">{transaction.amount.toFixed(2)} Frw</span></p>
                <p className="text-lg font-semibold">Date: <span className="font-normal">{new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()}</span></p>
                <button onClick={() => openModal(transaction)} className="mt-2 text-blue-500 hover:underline">View Details</button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No transactions found.</p>
      )}

      {/* Simple Modal Implementation */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {selectedTransaction && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
                <p className="text-lg font-semibold">Amount: <span className="font-normal">{selectedTransaction.amount.toFixed(2)} Frw</span></p>
                <p className="text-lg font-semibold">Method: <span className="font-normal">{selectedTransaction.method}</span></p>
                <p className="text-lg font-semibold">Date: <span className="font-normal">{new Date(selectedTransaction.createdAt.seconds * 1000).toLocaleDateString()}</span></p>
                <button onClick={closeModal} className="mt-4 text-blue-500 hover:underline">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
