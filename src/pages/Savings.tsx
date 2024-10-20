import React, { useState } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Savings = () => {
  const [balance, setBalance] = useState(1000); // Mock balance
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0) {
      setBalance(balance + depositAmount);
      setShowDepositModal(false);
      setAmount('');
    }
  };

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > 0 && withdrawAmount <= balance) {
      setBalance(balance - withdrawAmount);
      setShowWithdrawModal(false);
      setAmount('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Karrot Savings</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Current Balance</span>
          <span className="text-2xl font-bold text-orange-500">${balance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <ArrowUpCircle className="mr-2" /> Deposit
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <ArrowDownCircle className="mr-2" /> Withdraw
          </button>
        </div>
      </div>

      {/* Transaction History (Mock data) */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <ul className="space-y-2">
          <li className="flex justify-between items-center">
            <span>Deposit</span>
            <span className="text-green-500">+$500.00</span>
          </li>
          <li className="flex justify-between items-center">
            <span>Withdrawal</span>
            <span className="text-red-500">-$200.00</span>
          </li>
          <li className="flex justify-between items-center">
            <span>Deposit</span>
            <span className="text-green-500">+$1000.00</span>
          </li>
        </ul>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Deposit Funds</h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Enter amount"
            />
            <div className="flex justify-end">
              <button onClick={() => setShowDepositModal(false)} className="mr-2">Cancel</button>
              <button onClick={handleDeposit} className="bg-green-500 text-white px-4 py-2 rounded-lg">Deposit</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Enter amount"
            />
            <div className="flex justify-end">
              <button onClick={() => setShowWithdrawModal(false)} className="mr-2">Cancel</button>
              <button onClick={handleWithdraw} className="bg-red-500 text-white px-4 py-2 rounded-lg">Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;