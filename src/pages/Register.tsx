import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, User, Mail, Lock, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, saveReferral } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get('ref');
    if (ref) {
      try {
        const decryptedId = atob(ref);
        setReferrerId(decryptedId);
      } catch (error) {
        console.error('Invalid referral code');
      }
    }
  }, [location]);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationEmail = async (userEmail: string, code: string) => {
    const templateParams = {
      to_email: userEmail,
      verification_code: code,
    };

    try {
      await emailjs.send('service_5w02ryo', 'template_dt0imx9', templateParams);
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Failed to send verification email', error);
      throw new Error('Failed to send verification email');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!register) {
      setError('Authentication service is not available. Please try again later.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await register(name, email, password);
      if (typeof result === 'string') {
        const code = generateVerificationCode();
        setSentCode(code);
        await sendVerificationEmail(email, code);
        setIsVerifying(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create an account. Please try again.');
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === sentCode) {
      if (referrerId) {
        await saveReferral(email, referrerId);
      }
      navigate('/locals');
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-6 text-center text-orange-500"
      >
        Register
      </motion.h2>
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      {isVerifying ? (
        <form onSubmit={handleVerification} className="space-y-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <label htmlFor="verificationCode" className="block mb-1 font-medium">
              <Lock className="inline mr-2" size={18} />
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition"
              required
            />
          </motion.div>
          <motion.button
            type="submit"
            className="w-full bg-orange-500 text-white p-2 rounded disabled:opacity-50 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="mr-2" size={18} />
            Verify
          </motion.button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <label htmlFor="name" className="block mb-1 font-medium">
              <User className="inline mr-2" size={18} />
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition"
              required
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <label htmlFor="email" className="block mb-1 font-medium">
              <Mail className="inline mr-2" size={18} />
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition"
              required
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <label htmlFor="password" className="block mb-1 font-medium">
              <Lock className="inline mr-2" size={18} />
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition"
              required
              minLength={6}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <label htmlFor="confirmPassword" className="block mb-1 font-medium">
              <Lock className="inline mr-2" size={18} />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition"
              required
              minLength={6}
            />
          </motion.div>
          <motion.button
            type="submit"
            className="w-full bg-orange-500 text-white p-2 rounded disabled:opacity-50 flex items-center justify-center"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="mr-2" size={18} />
            {loading ? 'Registering...' : 'Register'}
          </motion.button>
        </form>
      )}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        Already have an account?{' '}
        <Link to="/login" className="text-orange-500 hover:underline">
          Login
        </Link>
      </motion.p>
    </motion.div>
  );
};

export default Register;
