import axiosInstance from '@/lib/axios';
import { ADVERTISEMENT_ENDPOINTS } from '@/lib/apiEndpoints';

// Create a new advertisement (banner/ad)
export const createAdvertisement = async (formData) => {
  const response = await axiosInstance.post(ADVERTISEMENT_ENDPOINTS.CREATE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Get all advertisements for the logged-in shopkeeper
export const getAdvertisements = async () => {
  const response = await axiosInstance.get(ADVERTISEMENT_ENDPOINTS.LIST);
  return response;
};

// Get a specific advertisement by ID
export const getAdvertisementById = async (id) => {
  const response = await axiosInstance.get(ADVERTISEMENT_ENDPOINTS.DETAILS(id));
  return response;
};

// Update an existing advertisement
export const updateAdvertisement = async (id, formData) => {
  const response = await axiosInstance.put(ADVERTISEMENT_ENDPOINTS.UPDATE(id), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Delete an advertisement
export const deleteAdvertisement = async (id) => {
  const response = await axiosInstance.delete(ADVERTISEMENT_ENDPOINTS.DELETE(id));
  return response;
};
