import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient, loadStoredRefreshToken, setTokens } from '../lib/apiClient'
import { getSocket } from '../lib/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | anonymous

  useEffect(() => {
    const storedRefreshToken = loadStoredRefreshToken()
    if (!storedRefreshToken) {
      setStatus('anonymous')
      return
    }

    apiClient
      .post('/auth/refresh', { refreshToken: storedRefreshToken })
      .then((res) => {
        setTokens(res.data.data)
        setUser(res.data.data.user)
        setStatus('authenticated')
      })
      .catch(() => {
        setTokens(null)
        setStatus('anonymous')
      })
  }, [])

  async function login(credentials) {
    const res = await apiClient.post('/auth/login', credentials)
    setTokens(res.data.data)
    setUser(res.data.data.user)
    setStatus('authenticated')
  }

  async function register(payload) {
    const res = await apiClient.post('/auth/register', payload)
    return res.data.data.user
  }

  async function logout() {
    const refreshToken = localStorage.getItem('cf_refresh_token')
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken }).catch(() => {})
    }
    setTokens(null)
    setUser(null)
    setStatus('anonymous')
    getSocket().disconnect()
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
