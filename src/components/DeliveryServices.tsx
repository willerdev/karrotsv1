import React from 'react';

const DeliveryService: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Delivery Services</h1>
      <p className="mb-4">Choose from our available delivery options:</p>
      <ul className="list-disc pl-5">
        <li className="mb-2">Standard Delivery (2-3 business days)</li>
        <li className="mb-2">Express Delivery (1 business day)</li>
        <li className="mb-2">Same-day Delivery (order before 2 PM)</li>
      </ul>
      <button className="mt-4 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors">
        Schedule a Delivery
      </button>
    </div>
  );
};

export default DeliveryService;