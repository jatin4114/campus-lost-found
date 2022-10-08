import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient, setAccessToken } from '../lib/apiClient'
import { getSocket } from '../lib/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | anonymous

  useEffect(() => {
    // No token to check client-side anymore — the refresh token is an
    // httpOnly cookie the browser sends automatically. Just attempt a
    // refresh; it succeeds if a valid cookie exists from a previous visit.
    apiClient
      .post('/auth/refresh')
      .then((res) => {
        setAccessToken(res.data.data.accessToken)
        setUser(res.data.data.user)
        setStatus('authenticated')
      })
      .catch(() => {
        setAccessToken(null)
        setStatus('anonymous')
      })
  }, [])

  async function login(credentials) {
    const res = await apiClient.post('/auth/login', credentials)
    setAccessToken(res.data.data.accessToken)
    setUser(res.data.data.user)
    setStatus('authenticated')
  }

  async function register(payload) {
    const res = await apiClient.post('/auth/register', payload)
    return res.data.data.user
  }

  async function logout() {
    await apiClient.post('/auth/logout').catch(() => {})
    setAccessToken(null)
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
