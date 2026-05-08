import axiosInstance from '@/lib/axios';
import { INVENTORY_ENDPOINTS } from '@/lib/apiEndpoints';

// Get inventory with filters
export const getInventory = async (params = {}) => {
  const response = await axiosInstance.get(INVENTORY_ENDPOINTS.ALL, { params });
  return response;
};

// Update product stock
export const updateStock = async (productId, data) => {
  const response = await axiosInstance.put(INVENTORY_ENDPOINTS.UPDATE_STOCK(productId), data);
  return response;
};

// Get low stock products
export const getLowStockProducts = async (threshold = 10) => {
  const response = await axiosInstance.get(INVENTORY_ENDPOINTS.LOW_STOCK, {
    params: { threshold },
  });
  return response;
};

// Get out of stock products
export const getOutOfStockProducts = async () => {
  const response = await axiosInstance.get(INVENTORY_ENDPOINTS.OUT_OF_STOCK);
  return response;
};

// Get inventory logs
export const getInventoryLogs = async (params = {}) => {
  const response = await axiosInstance.get(INVENTORY_ENDPOINTS.LOGS, { params });
  return response;
};

// Bulk update stock
export const bulkUpdateStock = async (updates) => {
  const response = await axiosInstance.post(INVENTORY_ENDPOINTS.BULK_UPDATE, { updates });
  return response;
};
