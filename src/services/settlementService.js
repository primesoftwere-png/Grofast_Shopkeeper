import axiosInstance from '@/lib/axios';
import { SETTLEMENT_ENDPOINTS } from '@/lib/apiEndpoints';

// Request a new settlement
export const requestSettlement = async (data) => {
  const response = await axiosInstance.post(SETTLEMENT_ENDPOINTS.REQUEST, data);
  return response;
};

// Get settlement list
export const getSettlements = async (page = 1, limit = 10, status = '') => {
  let query = `?page=${page}&limit=${limit}`;
  if (status) query += `&status=${status}`;
  
  const response = await axiosInstance.get(`${SETTLEMENT_ENDPOINTS.LIST}${query}`);
  return response;
};

// Get settlement summary
export const getSettlementSummary = async () => {
  const response = await axiosInstance.get(SETTLEMENT_ENDPOINTS.SUMMARY);
  return response;
};

// Cancel a settlement
export const cancelSettlement = async (settlementId) => {
  const response = await axiosInstance.post(SETTLEMENT_ENDPOINTS.CANCEL(settlementId));
  return response;
};
