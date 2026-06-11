import { apiClient } from './client';

export const fetchHomeData =
  async () => {

    const response =
      await apiClient.get(
        '/api/v1/home',
      );

    return response.data;
  };