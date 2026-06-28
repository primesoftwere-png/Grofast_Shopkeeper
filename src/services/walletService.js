import axiosInstance from '@/lib/axios';
import { WALLET_ENDPOINTS } from '@/lib/apiEndpoints';

// Get wallet details
export const getWalletDetails = async () => {
  const response = await axiosInstance.get(WALLET_ENDPOINTS.DETAILS);
  return response;
};

// Request payout
export const requestPayout = async (amount) => {
  const response = await axiosInstance.post(WALLET_ENDPOINTS.PAYOUT, { amount });
  return response;
};

// Add balance (Deposit)
export const addBalance = async (amount) => {
  const response = await axiosInstance.post(WALLET_ENDPOINTS.ADD_BALANCE, { amount });
  return response;
};
