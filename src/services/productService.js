import axiosInstance from '@/lib/axios';
import { PRODUCT_ENDPOINTS } from '@/lib/apiEndpoints';

// Add new product
export const addProduct = async (formData) => {
  const response = await axiosInstance.post(PRODUCT_ENDPOINTS.ADD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Get all products
export const getAllProducts = async (params = {}) => {
  const response = await axiosInstance.get(PRODUCT_ENDPOINTS.ALL, { params });
  return response;
};

// Get products by user
export const getProductsByUser = async (userId) => {
  const response = await axiosInstance.get(PRODUCT_ENDPOINTS.BY_USER(userId));
  return response;
};

// Get product by ID
export const getProductById = async (productId) => {
  const response = await axiosInstance.get(PRODUCT_ENDPOINTS.BY_ID(productId));
  return response;
};

// Update product
export const updateProduct = async (productId, data) => {
  const response = await axiosInstance.put(PRODUCT_ENDPOINTS.UPDATE(productId), data);
  return response;
};

// Delete product
export const deleteProduct = async (productId) => {
  const response = await axiosInstance.delete(PRODUCT_ENDPOINTS.DELETE(productId));
  return response;
};

// Get products by category
export const getProductsByCategory = async (categoryId, userId) => {
  const response = await axiosInstance.get(PRODUCT_ENDPOINTS.BY_CATEGORY(categoryId, userId));
  return response;
};
