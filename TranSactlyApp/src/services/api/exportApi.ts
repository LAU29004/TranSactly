import { apiClient } from './client';

export const downloadExcel = async (
  startDate: Date,
  endDate: Date,
) => {

  const response =
    await apiClient.get(
      '/api/v1/export-transactions',
      {
        params: {
          start_date:
            startDate.toISOString(),
          end_date:
            endDate.toISOString(),
        },
        responseType:
          'arraybuffer',
      },
    );

  return response.data;
};