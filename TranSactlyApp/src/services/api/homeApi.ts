import { apiClient } from './client';

export const fetchHomeData = async (

  startDate?: string,

  endDate?: string,

  page: number = 1,

  limit: number = 10,

) => {

  const response =
    await apiClient.get(

      '/api/v1/home',

      {
        params: {

          start_date: startDate,

          end_date: endDate,

          page,

          limit,
        },
      },
    );

  return response.data;
};