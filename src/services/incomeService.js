import axiosInstance from '@/lib/axios';
import { INCOME_ENDPOINTS } from '@/lib/apiEndpoints';

// Get income overview
export const getIncomeOverview = async () => {
  const response = await axiosInstance.get(INCOME_ENDPOINTS.OVERVIEW);
  return response;
};

// Get daily income stats
export const getDailyIncome = async (query = '') => {
  const response = await axiosInstance.get(`${INCOME_ENDPOINTS.DAILY}${query ? `?${query}` : ''}`);
  return response;
};

// Get income by payment mode
export const getIncomeByPaymentMode = async () => {
  const response = await axiosInstance.get(INCOME_ENDPOINTS.BY_PAYMENT_MODE);
  return response;
};

// Get transaction history
export const getTransactionHistory = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(`${INCOME_ENDPOINTS.TRANSACTIONS}?page=${page}&limit=${limit}`);
  return response;
};
