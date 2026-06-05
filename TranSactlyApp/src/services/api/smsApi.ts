import { apiClient } from './client';

type SMSPayload = {

  message: string;

  date: string;
};

export const analyzeSMS = async (

  messages: SMSPayload[],
) => {

  const response = await apiClient.post(

    '/api/v1/analyze-sms',

    {
      messages,
    },
  );

  return response.data;
};
