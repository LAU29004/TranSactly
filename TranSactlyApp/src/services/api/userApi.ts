// src/api/userApi.ts

import { apiClient } from './client';

export const fetchMe = async () => {

  const response =
    await apiClient.get(
      '/api/v1/me',
    );

  return response.data;
};