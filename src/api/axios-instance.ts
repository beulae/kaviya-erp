import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let pendingQueue: Array<(token: string) => void> = []

function getAccessToken() {
  return localStorage.getItem('kaviya-access-token')
}
function getRefreshToken() {
  return localStorage.getItem('kaviya-refresh-token')
}
function setAccessToken(token: string) {
  localStorage.setItem('kaviya-access-token', token)
}
function clearSession() {
  localStorage.removeItem('kaviya-access-token')
  localStorage.removeItem('kaviya-refresh-token')
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearSession()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push((token: string) => {
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
        setAccessToken(data.accessToken)
        pendingQueue.forEach((cb) => cb(data.accessToken))
        pendingQueue = []
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearSession()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export interface ApiErrorShape {
  message: string
  errors?: Record<string, string[]>
}

/** Normalizes an unknown thrown error into a user-facing message. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorShape | undefined
    return data?.message || error.message || 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}
