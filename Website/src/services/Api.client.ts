import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { auth } from '@/utils/auth'

// ─── DYNAMIC BASE URL CONFIGURATION ──────────────────────────────────────────

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (envUrl) {
    // Remove any accidental trailing slash from the Vercel environment variable config
    const cleanUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    
    // Ensure the required backend router version prefix /api/v1 is appended cleanly
    return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
  }
  
  // Local development fallback path
  return 'http://localhost:4000/api/v1';
};

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Automatically attaches the Bearer token to all outward headers if present

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
// Automatically captures 401 errors to refresh tokens or route back to login

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          auth.logout()
          return Promise.reject(error)
        }

        // Hits your FastAPI @router.post("/refresh") endpoint smoothly
        const refreshResponse = await api.post(
          '/auth/refresh',
          {
            refresh_token: refreshToken,
          }
        )

        const newToken = refreshResponse.data.access_token

        localStorage.setItem('auth_token', newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return api(originalRequest)
      } catch (refreshError) {
        auth.logout()

        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api