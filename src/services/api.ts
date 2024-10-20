import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.karrots.com', // Replace with your actual API URL
});

export default api;