import axiosInstance from '@/lib/axios';
import { SETTINGS_ENDPOINTS } from '@/lib/apiEndpoints';

// Get all settings
export const getAllSettings = async () => {
  const response = await axiosInstance.get(SETTINGS_ENDPOINTS.ALL);
  return response;
};

// Update business hours
export const updateBusinessHours = async (data) => {
  const response = await axiosInstance.put(SETTINGS_ENDPOINTS.BUSINESS_HOURS, data);
  return response;
};

// Update bank details
export const updateBankDetails = async (data) => {
  const response = await axiosInstance.put(SETTINGS_ENDPOINTS.BANK_DETAILS, data);
  return response;
};

// Update profile
export const updateProfile = async (data) => {
  const response = await axiosInstance.put(SETTINGS_ENDPOINTS.PROFILE, data);
  return response;
};

// Update location
export const updateLocation = async (data) => {
  const response = await axiosInstance.put(SETTINGS_ENDPOINTS.LOCATION, data);
  return response;
};

// Change password
export const changePassword = async (data) => {
  const response = await axiosInstance.post(SETTINGS_ENDPOINTS.CHANGE_PASSWORD, data);
  return response;
};
