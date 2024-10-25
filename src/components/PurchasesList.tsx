import React, { useState } from 'react';
import { Purchase } from '../types'; // Assume you have a Purchase type defined

interface PurchaseItemProps {
  purchase: Purchase;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}

const PurchaseItem: React.FC<PurchaseItemProps> = ({ purchase, onConfirm, onCancel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="purchase-item">
      <div 
        className="purchase-summary" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{purchase.date}</span>
        <span>{purchase.amount}</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="purchase-details">
          <p>Description: {purchase.description}</p>
          <p>Category: {purchase.category}</p>
          <div className="purchase-actions">
            <button onClick={() => onConfirm(purchase.id.toString())}>Confirm</button>
            <button onClick={() => onCancel(purchase.id.toString())}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

interface PurchasesListProps {
  purchases: Purchase[];
  onConfirmPurchase: (id: string) => void;
  onCancelPurchase: (id: string) => void;
}

const PurchasesList: React.FC<PurchasesListProps> = ({ 
  purchases, 
  onConfirmPurchase, 
  onCancelPurchase 
}) => {
  return (
    <div className="purchases-list">
      {purchases.map((purchase) => (
        <PurchaseItem 
          key={purchase.id} 
          purchase={purchase} 
          onConfirm={onConfirmPurchase}
          onCancel={onCancelPurchase}
        />
      ))}
    </div>
  );
};

export default PurchasesList;
