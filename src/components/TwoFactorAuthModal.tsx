import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TwoFactorAuthModalProps {
  onClose: () => void;
}

const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({ onClose }) => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement the API call to save the two-factor authentication method
    console.log('Saving 2FA method:', method, value);
    // After successful save, close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Activate Two-Factor Authentication</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Authentication Method</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={method === 'email'}
                  onChange={() => setMethod('email')}
                  className="form-radio"
                />
                <span className="ml-2">Email</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="phone"
                  checked={method === 'phone'}
                  onChange={() => setMethod('phone')}
                  className="form-radio"
                />
                <span className="ml-2">Phone</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="value" className="block mb-2">
              {method === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={method === 'email' ? 'email' : 'tel'}
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button type="submit" className="btn btn-primary">Activate 2FA</button>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorAuthModal;
