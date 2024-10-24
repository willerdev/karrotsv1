import React, { useState, useEffect } from 'react';
import { FaWallet, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { db } from '../firebase'; // Make sure to import your Firebase configuration
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, getDoc, DocumentReference, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext
import { toast, Toaster } from 'react-hot-toast'; // Updated import

const Wallet = () => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionRef, setTransactionRef] = useState<DocumentReference | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhoneNumber, setWithdrawPhoneNumber] = useState('');

  const { user } = useAuth(); // Get the current user from your AuthContext

  // Fetch or create wallet
  useEffect(() => {
    const fetchOrCreateWallet = async () => {
      if (!user) {
        console.error('User not logged in');
        return;
      }

      try {
        const walletRef = doc(db, 'wallets', user.uid);
        const walletDoc = await getDoc(walletRef);
        
        if (!walletDoc.exists()) {
          // Create a new wallet if it doesn't exist
          await setDoc(walletRef, {
            userId: user.uid,
            balance: 0,
            dateCreated: new Date(),
            dateUpdated: new Date()
          });
          setBalance(0);
        } else {
          // Wallet exists, set the balance
          setBalance(walletDoc.data().balance || 0);
        }
      } catch (error) {
        console.error('Error fetching or creating wallet:', error);
        setError('Failed to fetch wallet. Please try again later.');
      }
    };

    fetchOrCreateWallet();
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

    let transactionRef;

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

      const accessToken = tokenResponse.data.access;

      // Create a new transaction document
      transactionRef = await addDoc(collection(db, 'transactions'), {
        transId: Date.now().toString(), // You might want to use a more robust ID generation method
        userId: user.uid,
        amount: parseInt(amount),
        type: 'topup',
        status: 'pending',
        dateCreated: new Date()
      });
      setTransactionRef(transactionRef);

      // Make the deposit request
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
        setError('');
        setLoading(false);
        setShowTopUpModal(false);
        
        // Show a new modal or update UI to inform user
        setShowConfirmationModal(true);
        
        // Start checking the transaction status
        checkTransactionStatus(depositResponse.data.ref, accessToken);
      } else {
        setSuccessMessage('Please check your phone for confirmation *182*7*1#');
        toast.success('Please check your phone for confirmation *182*7*1#'); // Updated toast
        setLoading(true);
        
        checkTransactionStatus(depositResponse.data.ref, accessToken);
      }
    } catch (error) {
      console.error('Error topping up:', error);
      toast.error('An error occurred. Please try again.'); // Added error toast
      if (transactionRef) {
        await updateDoc(doc(db, 'transactions', transactionRef.id), {
          status: 'failed'
        });
      }
      setLoading(false);
    }
  };

  const checkTransactionStatus = async (ref: string, accessToken: string) => {
    let attempts = 0;
    const maxAttempts = 120; // Adjust as needed
    const checkInterval = 10000; // 10 seconds

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setError('Transaction timed out. Please check your account or try again.');
        setShowConfirmationModal(false);
        return;
      }

      try {
        const checkStatusResponse = await axios.get(
          `https://payments.paypack.rw/api/events/transactions?ref=${ref}&kind=CASHIN&client=${phoneNumber}&status=pending`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (checkStatusResponse.data.status === 'success') {
          if (!user) {
            throw new Error('User not found');
          }

          // Update user's balance and transaction status
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const currentBalance = userDoc.data()?.balance || 0;
          const newBalance = currentBalance + parseInt(amount);

          await updateDoc(userDocRef, { balance: newBalance });
          if (transactionRef) {
            const q = query(collection(db, 'transactions'), where('transId', '==', transactionRef.id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              await updateDoc(querySnapshot.docs[0].ref, {
                status: 'success'
              });
            }
          }

          setBalance(newBalance);
          setShowConfirmationModal(false);
          // Show success message
          setSuccessMessage('Top-up successful!');
        } else if (checkStatusResponse.data.status === 'failed') {
          setError('Transaction failed. Please try again.');
          setShowConfirmationModal(false);
        } else {
          attempts++;
          setTimeout(checkStatus, checkInterval);
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        attempts++;
        setTimeout(checkStatus, checkInterval);
      }
    };

    checkStatus();
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    setLoading(true);
    setError('');

    if (!user) {
      setError('You must be logged in to withdraw from your wallet.');
      setLoading(false);
      return;
    }

    try {
      // Check user's balance
      const walletRef = doc(db, 'wallets', user.uid);
      const walletDoc = await getDoc(walletRef);
      
      if (!walletDoc.exists()) {
        setError('Wallet not found. Please try again.');
        setLoading(false);
        return;
      }

      const currentBalance = walletDoc.data().balance || 0;

      if (parseInt(withdrawAmount) > currentBalance) {
        setError('Insufficient balance for this withdrawal.');
        setLoading(false);
        return;
      }

      // Get access token
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

      const accessToken = tokenResponse.data.access;

      // Create a new transaction document
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        transId: Date.now().toString(),
        userId: user.uid,
        amount: parseInt(withdrawAmount),
        type: 'withdraw',
        status: 'pending',
        dateCreated: new Date()
      });

      // Make the withdraw request
      const withdrawResponse = await axios.post(
        'https://payments.paypack.rw/api/transactions/cashout',
        {
          amount: parseInt(withdrawAmount),
          number: withdrawPhoneNumber
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (withdrawResponse.data.success) {
        // Update user's balance
        const newBalance = currentBalance - parseInt(withdrawAmount);
        await updateDoc(walletRef, {
          balance: newBalance,
          dateUpdated: new Date()
        });

        // Update transaction status
        await updateDoc(doc(db, 'transactions', transactionRef.id), {
          status: 'success'
        });

        setBalance(newBalance);
        setShowWithdrawModal(false);
        setSuccessMessage('Withdrawal successful!');
        toast.success('Withdrawal successful!');
      } else {
        throw new Error('Withdrawal failed');
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast.error('An error occurred. Please try again.');
      setError('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Toaster /> {/* Add this line to render the toast notifications */}
      
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

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Withdraw</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleWithdraw(); }}>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-2 mb-4 border rounded"
                required
              />
              <input
                type="tel"
                value={withdrawPhoneNumber}
                onChange={(e) => setWithdrawPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full p-2 mb-4 border rounded"
                required
              />
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <button 
                type="submit" 
                className="w-full py-2 bg-orange-500 text-white rounded"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Withdraw'}
              </button>
            </form>
            <button 
              onClick={() => setShowWithdrawModal(false)} 
              className="mt-4 text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;
