import axiosInstance, { setToken, removeToken, setUser, removeUser } from '@/lib/axios';
import { AUTH_ENDPOINTS } from '@/lib/apiEndpoints';

// Single-step Registration
export const register = async (data) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, data);
  return response;
};

// Login
export const login = async (data) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, data);
  
  // Save token and user data
  if (response?.data?.token) {
    setToken(response.data.token);
    console.log('✅ Token saved to localStorage');
  }
  
  if (response?.data?.shopkeeper || response?.data?.user) {
    const userData = response.data.user
      ? {
          ...response.data.user,
          shopkeeper: response.data.shopkeeper || null,
          shop: response.data.shop || null,
        }
      : response.data.shopkeeper;
    setUser(userData);
    console.log('✅ User data saved to localStorage');
  }
  
  return response;
};

// Get Profile
export const getProfile = async () => {
  const response = await axiosInstance.get(AUTH_ENDPOINTS.PROFILE);
  return response;
};

// Update Shop Details
export const updateShop = async (data) => {
  const response = await axiosInstance.put(AUTH_ENDPOINTS.SHOP_UPDATE, data);
  return response;
};

// Toggle Shop Status
export const toggleShopStatus = async (isOpen) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.TOGGLE_STATUS, { isOpen });
  return response;
};

// Logout
export const logout = () => {
  removeToken();
  removeUser();
};
