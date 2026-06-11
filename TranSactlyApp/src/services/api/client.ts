import axios from 'axios';

import {
  getToken,
} from '../auth/authStorage';

export const apiClient = axios.create({

  baseURL:
    'http://127.0.0.1:8000',

  timeout: 10000,

  headers: {
    'Content-Type':
      'application/json',
  },
});

apiClient.interceptors.request.use(

  async config => {

    const token =
      await getToken();

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);