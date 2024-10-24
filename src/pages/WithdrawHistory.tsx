import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Add this interface above the component
interface Withdrawal {
  id: string;
  dateCreated: { toDate: () => Date };
  amount: number;
  status: string;
  [key: string]: any; // For any additional properties
}

const WithdrawHistory = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!user) return;

      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('type', '==', 'withdraw'),
        orderBy('dateCreated', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const withdrawalData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Withdrawal[];

      setWithdrawals(withdrawalData);
      setLoading(false);
    };

    fetchWithdrawals();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/wallet" className="flex items-center text-orange-500 mb-6">
        <FaArrowLeft className="mr-2" />
        Back to Wallet
      </Link>

      <h1 className="text-2xl font-bold mb-6">Withdraw History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p>No withdrawal history found.</p>
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
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="border-b">
                  <td className="py-3 px-4">{new Date(withdrawal.dateCreated.toDate()).toLocaleString()}</td>
                  <td className="py-3 px-4">{withdrawal.amount.toLocaleString()} FRW</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded ${
                      withdrawal.status === 'success' ? 'bg-green-200 text-green-800' :
                      withdrawal.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {withdrawal.status}
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

export default WithdrawHistory;
