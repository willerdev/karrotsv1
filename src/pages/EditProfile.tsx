import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types/User';

const EditProfile = () => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = { id: userSnap.id, ...userSnap.data() } as User;
          setUserData(userData);
          setName(userData.name || '');
          setEmail(userData.email || '');
          setPhone(userData.phoneNumber || '');
          setAddress(userData.address || '');
        } else {
          setError('User data not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      let updateData: Partial<User> = {};

      switch (section) {
        case 'name':
          updateData = { name };
          break;
        case 'email':
          updateData = { email };
          break;
        case 'phone':
          updateData = { phoneNumber: phone };
          break;
        case 'address':
          updateData = { address };
          break;
        case 'password':
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          // Handle password update through Firebase Auth
          // This is just a placeholder, you'll need to implement the actual password change logic
          console.log('Password update not implemented');
          break;
        default:
          setError('Invalid section');
          return;
      }

      await updateDoc(userRef, updateData);
      navigate('/profile');
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update user data. Please try again later.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Edit {section?.charAt(0).toUpperCase() + section?.slice(1)}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {section === 'name' && (
          <div>
            <label htmlFor="name" className="block mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        {section === 'email' && (
          <div>
            <label htmlFor="email" className="block mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        {section === 'phone' && (
          <div>
            <label htmlFor="phone" className="block mb-1">Phone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        {section === 'address' && (
          <div>
            <label htmlFor="address" className="block mb-1">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        {section === 'password' && (
          <>
            <div>
              <label htmlFor="password" className="block mb-1">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-1">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
                minLength={6}
              />
            </div>
          </>
        )}
        <button type="submit" className="w-full bg-orange-500 text-white p-2 rounded">
          Update {section?.charAt(0).toUpperCase() + section?.slice(1)}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;