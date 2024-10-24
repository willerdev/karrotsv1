import React, { useState, useEffect } from 'react';
import { FaWallet, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { db } from '../firebase'; // Make sure to import your Firebase configuration
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext

const Wallet = () => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth(); // Get the current user from your AuthContext

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) {
        console.error('User not logged in');
        return;
      }

      try {
        const walletRef = collection(db, 'wallet');
        const q = query(
          walletRef,
          where('userId', '==', user.uid),
          orderBy('dateUpdated', 'desc'),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const latestTransaction = querySnapshot.docs[0].data();
          setBalance(latestTransaction.balance || 0);
        } else {
          setBalance(0);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Failed to fetch balance. Please try again later.');
      }
    };

    fetchBalance();
  }, [user]);

  // Handle top-up
  const handleTopUp = async () => {
    setLoading(true);
    setError('');

    if (!user) {
      setError('You must be logged in to top up your wallet.');
      setLoading(false);
      return;
    }

    let walletRef;

    try {
      // First, get the access token
      const tokenResponse = await axios.post(
        'https://payments.paypack.rw/api/auth/agents/authorize',
        {
          client_id: 'bcab7088-91da-11ef-bf15-dead742b0238',
          client_secret: '37eddf55fb3f4e6329d9dcbb04050294da39a3ee5e6b4b0d3255bfef95601890afd80709'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Create a new wallet transaction document
      walletRef = await addDoc(collection(db, 'wallet'), {
        userId: user.uid,
        amount: parseInt(amount),
        transactionType: 'cashin',
        balance: 0, // This will be updated after successful transaction
        dateCreated: new Date(),
        dateUpdated: new Date(),
        status: 'pending'
      });

      // Now, make the deposit request
      const depositResponse = await axios.post(
        'https://payments.paypack.rw/api/transactions/cashin',
        {
          amount: parseInt(amount),
          number: phoneNumber
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (depositResponse.data.success) {
        // Update the user's balance
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const currentBalance = userDoc.data()?.balance || 0;
        const newBalance = currentBalance + parseInt(amount);

        await updateDoc(userDocRef, { balance: newBalance });

        // Update the wallet transaction
        await updateDoc(doc(db, 'wallet', walletRef.id), {
          balance: newBalance,
          status: 'success',
          dateUpdated: new Date()
        });

        setBalance(newBalance);
        setShowTopUpModal(false);
        setAmount('');
        setPhoneNumber('');
        setProvider('');
      } else {
        // Update the wallet transaction as failed
        await updateDoc(doc(db, 'wallet', walletRef.id), {
          status: 'failed',
          dateUpdated: new Date()
        });

        setError('Deposit failed. Please try again.');
      }
    } catch (error) {
      console.error('Error topping up:', error);
      setError('An error occurred. Please try again.');

      // If there's an error, update the wallet transaction as failed
      if (walletRef) {
        await updateDoc(doc(db, 'wallet', walletRef.id), {
          status: 'failed',
          dateUpdated: new Date()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle withdraw (you can implement this similarly to handleTopUp if needed)

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Back button */}
      <button className="absolute top-4 left-4 flex items-center text-orange-500">
        <FaArrowLeft className="mr-2" />
        Back
      </button>

      <div className="container mx-auto px-4 py-16">
        {/* Wallet header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-500">My Wallet</h1>
          <FaWallet className="text-4xl text-orange-500" />
        </div>

        {/* Balance display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-lg text-gray-600 mb-2">Current Balance</p>
          <p className="text-lg font-bold text-orange-500">{balance.toLocaleString()} FRW</p>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex-1 py-3 px-4 bg-white text-orange-500 border-2 border-orange-500 rounded-lg font-semibold"
          >
            Top Up
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-semibold"
          >
            Withdraw
          </button>
        </div>

        {/* History links */}
        <div className="flex justify-between">
          <a href="/deposit-history" className="text-orange-500 font-semibold">
            Deposit History
          </a>
          <a href="/withdraw-history" className="text-orange-500 font-semibold">
            Withdraw History
          </a>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Top Up</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleTopUp(); }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-2 mb-4 border rounded"
                required
              />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full p-2 mb-4 border rounded"
                required
              />
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
                required
              >
                <option value="">Select provider</option>
                <option value="MTN">MTN</option>
                <option value="Airtel">Airtel</option>
              </select>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <button 
                type="submit" 
                className="w-full py-2 bg-orange-500 text-white rounded"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Top Up'}
              </button>
            </form>
            <button 
              onClick={() => setShowTopUpModal(false)} 
              className="mt-4 text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal (implement similarly to Top Up Modal) */}
    </div>
  );
}

export default Wallet;
