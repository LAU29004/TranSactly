import { apiClient } from './client';

export const fetchAIInsight = async (
  query: string,
) => {

  const response =
    await apiClient.post(

      '/api/v1/chat-insights',

      {
        query,
      },
    );

  return response.data;
};
