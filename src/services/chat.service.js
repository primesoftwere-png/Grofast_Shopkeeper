import api from '@/lib/axios';

export const chatAPI = {
  getConversations: async () => {
    try {
      const response = await api.get('/api/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  getMessages: async (conversationId) => {
    try {
      const response = await api.get(`/api/chat/messages/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  sendMessage: async (receiverId, messageText) => {
    try {
      const response = await api.post('/api/chat/send', { receiverId, messageText });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};
