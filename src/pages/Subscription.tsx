import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Adjust the import path as needed
import Loading from '../components/LoadingScreen';

interface SubscriptionPlanProps {
  title: string;
  price: string;
  features: string[];
  recommended?: boolean;
  onChoose: () => void;
  isSelected: boolean;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({ title, price, features, recommended = false, onChoose, isSelected }) => (
  <div className={`border rounded-lg p-6 ${recommended ? 'border-orange-500 shadow-lg' : 'border-gray-200'}`}>
    {recommended && <div className="text-orange-500 font-bold mb-2">Recommended</div>}
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-2xl font-bold mb-4">{price}</p>
    <ul className="space-y-2 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <button 
      className={`w-full ${isSelected ? 'bg-green-500' : 'bg-orange-500'} text-white py-2 rounded-lg hover:bg-orange-600 transition-colors duration-300`} 
      onClick={onChoose}
      disabled={isSelected}
    >
      {isSelected ? 'Selected' : 'Choose Plan'}
    </button>
  </div>
);

interface Plan {
  id: string;
  planName: string;
  planPrice: number;
  planDetails: string[];
  recommended?: boolean;
}

const Subscription = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('Fetching plans...');
        const plansQuery = query(collection(db, 'plans'));
        const querySnapshot = await getDocs(plansQuery);
        console.log('Query snapshot:', querySnapshot);
        console.log('Number of documents:', querySnapshot.size);

        if (querySnapshot.empty) {
          console.log('No documents found in the Plans collection');
          setError('No subscription plans available. Please try again later.');
          setLoading(false);
          return;
        }

        const plansData = querySnapshot.docs.map(doc => {
          console.log('Document data:', doc.data()); // Add this line
          return {
            id: doc.id,
            ...doc.data()
          } as Plan;
        });

        console.log('Fetched plans:', plansData);
        setPlans(plansData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setError('Failed to load subscription plans. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleChoosePlan = async (planId: string) => {
    if (!auth.currentUser) {
      console.error('User not logged in');
      return;
    }

    setSelectedPlan(planId);

    try {
      const userPlanRef = await addDoc(collection(db, 'userplans'), {
        userId: auth.currentUser.uid,
        planId: planId,
        dateCreated: serverTimestamp(),
        dateUpdated: serverTimestamp(),
        status: 'active'
      });
      console.log('Plan selected and saved successfully');
      
      // Redirect to the payment page
      navigate(`/payment/${userPlanRef.id}`);
    } catch (error) {
      console.error('Error saving user plan:', error);
      // You can show an error message to the user here
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (plans.length === 0) {
    return <div className="text-center">No subscription plans available at the moment.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Subscription Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <SubscriptionPlan
            key={plan.id}
            title={plan.planName}
            price={plan.planPrice === 0 ? 'Free' : `$${plan.planPrice}/month`}
            features={plan.planDetails}
            recommended={plan.recommended}
            onChoose={() => handleChoosePlan(plan.id)}
            isSelected={selectedPlan === plan.id || (plan.planPrice === 0 && !selectedPlan)}
          />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link to="/profile" className="text-orange-500 hover:underline">
          Back to Profile
        </Link>
      </div>
    </div>
  );
};

export default Subscription;
