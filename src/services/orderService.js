import axiosInstance from '@/lib/axios';
import { ORDER_ENDPOINTS } from '@/lib/apiEndpoints';

// Get all orders with filters
export const getOrders = async (params = {}) => {
  const response = await axiosInstance.get(ORDER_ENDPOINTS.ALL, { params });
  return response;
};

// Get pending orders
export const getPendingOrders = async () => {
  const response = await axiosInstance.get(ORDER_ENDPOINTS.PENDING);
  return response;
};

// Get order statistics
export const getOrderStats = async () => {
  const response = await axiosInstance.get(ORDER_ENDPOINTS.STATS);
  return response;
};

// Get order details
export const getOrderDetails = async (orderId) => {
  const response = await axiosInstance.get(ORDER_ENDPOINTS.DETAILS(orderId));
  return response;
};

// Accept order
export const acceptOrder = async (orderToken) => {
  const response = await axiosInstance.post(ORDER_ENDPOINTS.ACCEPT, { orderToken });
  return response;
};

// Mark order ready
export const markOrderReady = async (orderToken) => {
  const response = await axiosInstance.post(ORDER_ENDPOINTS.READY, { orderToken });
  return response;
};

// Cancel order
export const cancelOrder = async (orderToken, reason) => {
  const response = await axiosInstance.post(ORDER_ENDPOINTS.CANCEL, { orderToken, reason });
  return response;
};
