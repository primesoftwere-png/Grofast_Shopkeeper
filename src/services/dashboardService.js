import axiosInstance from '@/lib/axios';
import { DASHBOARD_ENDPOINTS } from '@/lib/apiEndpoints';

export const getDashboardData = async () => {
  const response = await axiosInstance.get(DASHBOARD_ENDPOINTS.GET_DATA);
  return response;
};
