interface SubscriptionPlanProps {
  title: string;
  price: string | number;
  features: string[];
  recommended?: boolean;
  onChoose: () => void;
}

const SubscriptionPlan = ({ title, price, features, recommended = false, onChoose }: SubscriptionPlanProps) => (
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
        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors duration-300"
        onClick={onChoose}
      >
        Choose Plan
      </button>
    </div>
  );

export default SubscriptionPlan;
