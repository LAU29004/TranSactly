import { apiClient } from './client';

export const loginWithGoogle = async (
  idToken: string,
) => {

  const response =
    await apiClient.post(
      '/api/v1/auth/google',
      {
        id_token: idToken,
      },
    );

  return response.data;
};