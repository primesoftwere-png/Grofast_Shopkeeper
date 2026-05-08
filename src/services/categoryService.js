import axiosInstance from '@/lib/axios';
import { CATEGORY_ENDPOINTS } from '@/lib/apiEndpoints';

// Add new category
export const addCategory = async (data) => {
  const response = await axiosInstance.post(CATEGORY_ENDPOINTS.ADD, data);
  return response;
};

// Get all categories
export const getAllCategories = async (params = {}) => {
  const response = await axiosInstance.get(CATEGORY_ENDPOINTS.ALL, { params });
  return response;
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
  const response = await axiosInstance.get(CATEGORY_ENDPOINTS.BY_ID(categoryId));
  return response;
};

// Update category
export const updateCategory = async (categoryId, data) => {
  const response = await axiosInstance.put(CATEGORY_ENDPOINTS.UPDATE(categoryId), data);
  return response;
};

// Delete category
export const deleteCategory = async (categoryId) => {
  const response = await axiosInstance.delete(CATEGORY_ENDPOINTS.DELETE(categoryId));
  return response;
};

// Get categories with products
export const getCategoriesWithProducts = async (userId) => {
  const response = await axiosInstance.get(CATEGORY_ENDPOINTS.WITH_PRODUCTS(userId));
  return response;
};
