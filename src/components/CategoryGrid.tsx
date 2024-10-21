import React from 'react';
import { Link } from 'react-router-dom';
import plusIcon from '../icons/post-ad.png';
import carIcon from '../icons/vehicles.png';
import homeIcon from '../icons/home.png';
import smartphoneIcon from '../icons/phones.png';
import laptopIcon from '../icons/electronics.png';
import sofaIcon from '../icons/homea.png';
import shoppingBagIcon from '../icons/fashion.png';
import dumbbellIcon from '../icons/sports.png';
import briefcaseIcon from '../icons/services.png';
import dogIcon from '../icons/health.png';
import babiesIcon from '../icons/health.png';
import jobsIcon from '../icons/jobs.png';
// import agricultureIcon from '../icons/agriculture.png';
import repair from '../icons/repair.png';
import healthIcon from '../icons/health.png';
import equipmentIcon from '../icons/equipment.png';
const categories = [
  { name: 'Post ad', icon: plusIcon,  link: '/post-ad' },
  { name: 'Vehicles', icon: carIcon },
  { name: 'Property', icon: homeIcon },
  { name: 'Phones & Tablets', icon: smartphoneIcon },
  { name: 'Electronics', icon: laptopIcon },
  { name: 'Home, Appliances & Furniture', icon: sofaIcon },
  { name: 'Health & Beauty', icon: healthIcon },
  { name: 'Fashion', icon: shoppingBagIcon },
  { name: 'Sports, Arts & Outdoors', icon: dumbbellIcon },
  { name: 'Services', icon: briefcaseIcon },
  { name: 'Jobs', icon: jobsIcon },
  { name: 'Pets', icon: dogIcon },
  { name: 'Babies', icon: babiesIcon },
  // { name: 'Agriculture', icon: agricultureIcon },
  { name: 'Repair', icon: repair },
  { name: 'Equipment', icon: equipmentIcon },

  
];

const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {categories.map((category, index) => (
        <Link
          key={index}
          to={category.link || `/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="flex flex-col items-center border border-gray-300 p-2 rounded"
        >
          <div className={`w-14 h-16 rounded-full flex items-center justify-center mb-2`}>
            <img src={category.icon} alt={category.name} className={`w-12 h-12 ${category.name === 'Post ad' ? 'text-white' : 'text-gray-600'}`} />
          </div>
          <span className="text-center text-sm">{category.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;
