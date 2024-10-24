import axios from 'axios';

const api = axios.create({
  baseURL: 'https://karrots.com', // Replace with your actual API URL
});

export default api;

export const updateEmailVerificationStatus = async (userId: string) => {
  try {
    await axios.post('/api/updateEmailVerification', { userId });
  } catch (error) {
    console.error('Error updating email verification status:', error);
    throw error;
  }
};
