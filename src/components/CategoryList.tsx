import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Home, Smartphone, Laptop, Sofa, ShoppingBag, Dumbbell, Briefcase, Baby, Dog, Carrot } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Category {
  name: string;
  icon: React.ElementType;
  count: number;
}

const initialCategories: Category[] = [
  { name: 'Vehicles', icon: Car, count: 0 },
  { name: 'property', icon: Home, count: 0 },
  { name: 'Phones & Tablets', icon: Smartphone, count: 0 },
  { name: 'electronics', icon: Laptop, count: 0 },
  { name: 'home, appliances & furniture', icon: Sofa, count: 0 },
  { name: 'health & beauty', icon: ShoppingBag, count: 0 },
  { name: 'fashion', icon: ShoppingBag, count: 0 },
  { name: 'sports, arts & outdoors', icon: Dumbbell, count: 0 },
  { name: 'seeking work cvs', icon: Briefcase, count: 0 },
  { name: 'services', icon: Briefcase, count: 0 },
  { name: 'jobs', icon: Briefcase, count: 0 },
  { name: 'Babies & Kids', icon: Baby, count: 0 },
  { name: 'Pets', icon: Dog, count: 0 },
  { name: 'Agriculture & Food', icon: Carrot, count: 0 },
];

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const adsRef = collection(db, 'ads');
        const updatedCategories = await Promise.all(
          categories.map(async (category) => {
            const q = query(adsRef, where('category', '==', category.name));
            const querySnapshot = await getDocs(q);
            return { ...category, count: querySnapshot.size };
          })
        );
        setCategories(updatedCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category counts:', err);
        setError('Failed to load category counts. Please try again later.');
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {categories.map((category, index) => (
        <Link 
          key={index} 
          to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} 
          className="flex items-center py-2 hover:bg-gray-100"
        >
          <category.icon size={20} className="mr-2 text-gray-600" />
          <span className="flex-grow">{category.name}</span>
          <span className="text-gray-500 text-sm">{category.count.toLocaleString()} ads</span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;