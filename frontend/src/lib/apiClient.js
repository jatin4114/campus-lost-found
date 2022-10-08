import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'
// Uploaded images are served from the backend's origin at /uploads, not
// under /api/v1 — derive the plain origin once so <img> tags don't need to
// know about the API's base path.
const API_ORIGIN = BASE_URL.replace(/\/api\/v1\/?$/, '')

// withCredentials is required for the browser to send/receive the httpOnly
// refresh-token cookie on every request (the backend's CORS config already
// allows credentials for the configured origin).
export const apiClient = axios.create({ baseURL: BASE_URL, withCredentials: true })

export function getMediaUrl(path) {
  if (!path) return path
  return `${API_ORIGIN}${path}`
}

// The refresh token itself never touches JS — it's an httpOnly cookie the
// browser manages. Only the short-lived access token lives here, in
// memory only (not localStorage), so an XSS payload reading page state
// still can't get at anything long-lived.
let accessToken = null

export function setAccessToken(token) {
  accessToken = token
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

    if (status === 401 && code === 'UNAUTHENTICATED' && !original._retried) {
      original._retried = true
      try {
        refreshPromise ??= apiClient
          .post('/auth/refresh')
          .then((res) => res.data.data)
          .finally(() => {
            refreshPromise = null
          })
        const { accessToken: newAccessToken } = await refreshPromise
        setAccessToken(newAccessToken)
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(original)
      } catch (refreshError) {
        setAccessToken(null)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
