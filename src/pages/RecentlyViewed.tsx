import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface RecentlyViewedItem {
  id: string;
  title: string;
  link: string;
}

const RecentlyViewed = () => {
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewedItems(items);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Recently Viewed</h1>
      {recentlyViewedItems.length === 0 ? (
        <p>You haven't viewed any items recently.</p>
      ) : (
        <ul className="space-y-2">
          {recentlyViewedItems.map((item) => (
            <li key={item.id}>
              <Link to={item.link} className="text-blue-500 hover:underline">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentlyViewed;