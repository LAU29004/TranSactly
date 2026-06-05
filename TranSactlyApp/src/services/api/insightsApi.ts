import { apiClient } from './client';

export const fetchInsights = async (
  startDate?: Date,
  endDate?: Date,
) => {

  const params = new URLSearchParams();

  if (startDate) {
    params.append(
      'start_date',
      startDate.toISOString(),
    );
  }

  if (endDate) {
    params.append(
      'end_date',
      endDate.toISOString(),
    );
  }

  const response = await apiClient.get(
    `/api/v1/insights?${params.toString()}`,
  );

  return response.data;
};

export const fetchTransactions = async (
  startDate?: Date,
  endDate?: Date,
  limit: number = 20,
) => {

  const params =
    new URLSearchParams();

  params.append(
    'limit',
    limit.toString(),
  );

  if (startDate) {
    params.append(
      'start_date',
      startDate.toISOString(),
    );
  }

  if (endDate) {
    params.append(
      'end_date',
      endDate.toISOString(),
    );
  }

  const response =
    await apiClient.get(
      `/api/v1/transactions?${params.toString()}`,
    );

  return response.data;
};