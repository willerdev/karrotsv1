import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, DocumentData, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import Loading from '../components/LoadingScreen';
import { FaCreditCard, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface PlanDetails extends DocumentData {
  id: string;
  planName: string;
  planPrice: number;
}

const PaymentMethod = ({ name, logo, selected, onSelect }: {
  name: string;
  logo: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <motion.div 
    className={`border p-4 rounded-lg cursor-pointer ${selected ? 'border-orange-500' : 'border-gray-200'}`}
    onClick={onSelect}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <img src={logo} alt={name} className="h-12 mx-auto mb-2" />
    <p className="text-center text-sm">{name}</p>
  </motion.div>
);

const PaymentModal = ({ method, amount, onClose, planDetails, userPlanId }: {
  method: string;
  amount: number;
  onClose: () => void;
  planDetails: PlanDetails;
  userPlanId: string;
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // If payment is successful, save the subscription
      await addDoc(collection(db, 'subscriptions'), {
        userPlanId,
        planId: planDetails.id,
        paymentMethod: method,
        amount,
        status: 'active',
        createdAt: new Date(),
      });

      console.log(`Payment successful: ${method} payment for $${amount} to ${phoneNumber}`);
      onClose();
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white p-8 rounded-lg max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <img 
          src={method === 'MoMo' ? 'https://agentportal.mtn.co.ug/static/assets/images/brand/MoMo_Logo_RGB_Horizontal_YELLOW.png' : 'https://seeklogo.com/images/A/airtel-logo-3954530A19-seeklogo.com.png'} 
          alt={method} 
          className="h-12 mx-auto mb-4"
        />
        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="w-full border rounded-lg p-2 mb-4 text-sm"
            required
          />
          <p className="mb-4 text-sm">Amount: ${amount}</p>
          <motion.button 
            type="submit" 
            className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm flex items-center justify-center"
            disabled={isProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isProcessing ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : 'Pay Now'}
          </motion.button>
        </form>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        <button onClick={onClose} className="mt-4 text-gray-500 text-sm" disabled={isProcessing}>Cancel</button>
      </motion.div>
    </motion.div>
  );
};

const Payment = () => {
  const { userPlanId } = useParams<{ userPlanId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!userPlanId) {
        setError('User plan ID is missing');
        setLoading(false);
        return;
      }

      try {
        const userPlanDoc = await getDoc(doc(db, 'userplans', userPlanId));
        if (userPlanDoc.exists()) {
          const planDoc = await getDoc(doc(db, 'plans', userPlanDoc.data().planId));
          if (planDoc.exists()) {
            setPlanDetails({ id: planDoc.id, ...planDoc.data() } as PlanDetails);
          } else {
            setError('Plan not found');
          }
        } else {
          setError('User plan not found');
        }
      } catch (err) {
        setError('Error fetching plan details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [userPlanId]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center text-sm">{error}</div>;
  if (!planDetails) return <div className="text-center text-sm">No plan details available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Payment</h1>
      <div className="max-w-2xl mx-auto">
        {planDetails && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Selected Plan: {planDetails.planName}</h2>
            <p className="text-xl mb-8">Amount: ${planDetails.planPrice}/month</p>
          </motion.div>
        )}
        
        <h3 className="text-xl font-bold mb-4">Choose Payment Method</h3>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <PaymentMethod 
            name="MoMo" 
            logo="https://agentportal.mtn.co.ug/static/assets/images/brand/MoMo_Logo_RGB_Horizontal_YELLOW.png"
            selected={paymentMethod === 'MoMo'}
            onSelect={() => setPaymentMethod('MoMo')}
          />
          <PaymentMethod 
            name="Airtel" 
            logo="https://seeklogo.com/images/A/airtel-logo-3954530A19-seeklogo.com.png"
            selected={paymentMethod === 'Airtel'}
            onSelect={() => setPaymentMethod('Airtel')}
          />
          <PaymentMethod 
            name="Card" 
            logo="https://media.licdn.com/dms/image/D4D12AQE6VgiqsbSEHQ/article-cover_image-shrink_600_2000/0/1707484096907?e=2147483647&v=beta&t=FA6WjbCgH-Slr1eLxIjYqjvcxpjme05IHCJMtb870VU"
            selected={paymentMethod === 'Card'}
            onSelect={() => setPaymentMethod('Card')}
          />
        </div>

        {paymentMethod === 'Card' && (
          <motion.div 
            className="border p-4 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center text-gray-500">
              <FaCreditCard className="mr-2" />
              <p className="text-sm">Card payment Comming soon</p>
            </div>
          </motion.div>
        )}

        {(paymentMethod === 'MoMo' || paymentMethod === 'Airtel') && (
          <motion.button 
            className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm"
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Proceed with {paymentMethod} Payment
          </motion.button>
        )}

        {showModal && planDetails && userPlanId && (
          <PaymentModal 
            method={paymentMethod!} 
            amount={planDetails.planPrice} 
            onClose={() => setShowModal(false)} 
            planDetails={planDetails}
            userPlanId={userPlanId}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;
