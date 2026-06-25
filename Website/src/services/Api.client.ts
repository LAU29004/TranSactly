import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

// ─── BASE INSTANCE ────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Attach auth token if present (swap localStorage key to match your auth setup)

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
// Unwrap data; redirect to /login on 401

import { auth } from '@/utils/auth'

api.interceptors.response.use(
  response => response,

  async error => {

    const originalRequest =
      error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true

      try {

        const refreshToken =
          localStorage.getItem(
            'refresh_token'
          )

        if (!refreshToken) {
          auth.logout()
          return Promise.reject(error)
        }

        const refreshResponse =
          await api.post(
            '/auth/refresh',
            {
              refresh_token:
                refreshToken,
            }
          )

        const newToken =
          refreshResponse.data
            .access_token

        localStorage.setItem(
          'auth_token',
          newToken
        )

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`

        return api(
          originalRequest
        )

      } catch {

        auth.logout()

        if (
          typeof window !==
          'undefined'
        ) {
          window.location.href =
            '/login'
        }

        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api