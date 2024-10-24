import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface Deposit {
  id: string;
  dateCreated: { toDate: () => Date };
  amount: number;
  status: string;
  // Add other properties as needed
}

const DepositHistory = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDeposits = async () => {
      if (!user) return;

      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('type', '==', 'topup'),
        orderBy('dateCreated', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const depositData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deposit[];

      setDeposits(depositData);
      setLoading(false);
    };

    fetchDeposits();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/wallet" className="flex items-center text-orange-500 mb-6">
        <FaArrowLeft className="mr-2" />
        Back to Wallet
      </Link>

      <h1 className="text-2xl font-bold mb-6">Deposit History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : deposits.length === 0 ? (
        <p>No deposit history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="border-b">
                  <td className="py-3 px-4">{new Date(deposit.dateCreated.toDate()).toLocaleString()}</td>
                  <td className="py-3 px-4">{deposit.amount.toLocaleString()} FRW</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded ${
                      deposit.status === 'success' ? 'bg-green-200 text-green-800' :
                      deposit.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {deposit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepositHistory;
