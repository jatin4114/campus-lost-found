import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'
// Uploaded images are served from the backend's origin at /uploads, not
// under /api/v1 — derive the plain origin once so <img> tags don't need to
// know about the API's base path.
const API_ORIGIN = BASE_URL.replace(/\/api\/v1\/?$/, '')

export const apiClient = axios.create({ baseURL: BASE_URL })

export function getMediaUrl(path) {
  if (!path) return path
  return `${API_ORIGIN}${path}`
}

let accessToken = null
let refreshToken = null

export function setTokens(tokens) {
  accessToken = tokens?.accessToken ?? null
  refreshToken = tokens?.refreshToken ?? null
  if (tokens) {
    localStorage.setItem('cf_refresh_token', tokens.refreshToken)
  } else {
    localStorage.removeItem('cf_refresh_token')
  }
}

export function loadStoredRefreshToken() {
  refreshToken = localStorage.getItem('cf_refresh_token')
  return refreshToken
}

export function getAccessToken() {
  return accessToken
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshPromise = null

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const code = error.response?.data?.error?.code

    if (status === 401 && code === 'UNAUTHENTICATED' && refreshToken && !original._retried) {
      original._retried = true
      try {
        refreshPromise ??= apiClient
          .post('/auth/refresh', { refreshToken })
          .then((res) => res.data.data)
          .finally(() => {
            refreshPromise = null
          })
        const tokens = await refreshPromise
        setTokens(tokens)
        original.headers.Authorization = `Bearer ${tokens.accessToken}`
        return apiClient(original)
      } catch (refreshError) {
        setTokens(null)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
