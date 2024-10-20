import api from './api';

export const getBuyerChats = async () => {
  try {
    const response = await api.get('/chats/buyer');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch buyer chats');
  }
};

export const getSellerChats = async () => {
  try {
    const response = await api.get('/chats/seller');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch seller chats');
  }
};

export const sendMessage = async (chatId: string, message: string) => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, { message });
    return response.data;
  } catch (error) {
    throw new Error('Failed to send message');
  }
};