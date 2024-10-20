import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Car, Home, Smartphone, Laptop, Sofa, ShoppingBag, Dumbbell, Briefcase, Baby, Dog, Carrot } from 'lucide-react';

const categories = [
  { name: 'Post ad', icon: Plus, color: 'bg-red-500', link: '/post-ad' },
  { name: 'Vehicles', icon: Car },
  { name: 'Property', icon: Home },
  { name: 'Phones & Tablets', icon: Smartphone },
  { name: 'Electronics', icon: Laptop },
  { name: 'Home, Appliances & Furniture', icon: Sofa },
  { name: 'Health & Beauty', icon: ShoppingBag },
  { name: 'Fashion', icon: ShoppingBag },
  { name: 'Sports, Arts & Outdoors', icon: Dumbbell },
  { name: 'Seeking Work CVs', icon: Briefcase },
  { name: 'Services', icon: Briefcase },
  { name: 'Jobs', icon: Briefcase },
  { name: 'Babies & Kids', icon: Baby },
  { name: 'Pets', icon: Dog },
  { name: 'Agriculture & Food', icon: Carrot },
];

const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {categories.map((category, index) => (
        <Link
          key={index}
          to={category.link || `/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="flex flex-col items-center"
        >
          <div className={`w-16 h-16 rounded-full ${category.color || 'bg-gray-200'} flex items-center justify-center mb-2`}>
            <category.icon size={24} className={category.name === 'Post ad' ? 'text-white' : 'text-gray-600'} />
          </div>
          <span className="text-center text-sm">{category.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;