import React, { useState, useEffect } from 'react';
import { FaWallet, FaArrowLeft } from 'react-icons/fa';

const Wallet = () => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/balance');
        const data = await response.json();
        setBalance(data.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, []);

  // Handle top-up
  const handleTopUp = async () => {
    try {
      const response = await fetch('/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await response.json();
      if (data.success) {
        setBalance(prevBalance => prevBalance + parseFloat(amount));
        setShowTopUpModal(false);
        setAmount('');
      }
    } catch (error) {
      console.error('Error topping up:', error);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await response.json();
      if (data.success) {
        setBalance(prevBalance => prevBalance - parseFloat(amount));
        setShowWithdrawModal(false);
        setAmount('');
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
    }
  };

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
        <Modal title="Top Up" onClose={() => setShowTopUpModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); handleTopUp(); }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">Select provider</option>
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
            </select>
            <button type="submit" className="w-full py-2 bg-orange-500 text-white rounded">
              Top Up
            </button>
          </form>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <Modal title="Withdraw" onClose={() => setShowWithdrawModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); handleWithdraw(); }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">Select provider</option>
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
            </select>
            <button type="submit" className="w-full py-2 bg-orange-500 text-white rounded">
              Withdraw
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Modal component
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Wallet;
