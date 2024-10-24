// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { useAuth } from '../contexts/AuthContext';

// const Verify = () => {
//   const { token } = useParams<{ token: string }>();
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const { verifyUser } = useAuth();

//   useEffect(() => {
//     const verifyToken = async () => {
//       if (!token) {
//         setError('Invalid verification link');
//         setLoading(false);
//         return;
//       }

//       try {
//         await verifyUser(token);
//         // Redirect to login page after successful verification
//         navigate('/login', { state: { message: 'Email verified successfully. You can now log in.' } });
//       } catch (err: any) {
//         setError(err.message || 'Failed to verify email. Please try again.');
//         setLoading(false);
//       }
//     };

//     verifyToken();
//   }, [token, verifyUser, navigate]);

//   if (loading) {
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="max-w-md mx-auto p-6 text-center"
//       >
//         <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
//       </motion.div>
//     );
//   }

//   if (error) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center"
//       >
//         <h2 className="text-2xl font-bold mb-4 text-red-500">Verification Failed</h2>
//         <p className="mb-4">{error}</p>
//         <button
//           onClick={() => navigate('/register')}
//           className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
//         >
//           Back to Registration
//         </button>
//       </motion.div>
//     );
//   }

//   return null;
// };

// export default Verify;

