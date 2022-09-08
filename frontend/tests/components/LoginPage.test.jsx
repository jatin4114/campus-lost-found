import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../src/context/AuthContext'
import { LoginPage } from '../../src/pages/auth/LoginPage'

vi.mock('../../src/lib/apiClient', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
  loadStoredRefreshToken: () => null,
  setTokens: vi.fn(),
  getAccessToken: () => null,
}))

vi.mock('../../src/lib/socket', () => ({
  getSocket: () => ({ connect: vi.fn(), disconnect: vi.fn(), on: vi.fn(), off: vi.fn(), emit: vi.fn() }),
}))

import { apiClient } from '../../src/lib/apiClient'

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors instead of submitting when fields are invalid', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument()
    expect(apiClient.post).not.toHaveBeenCalledWith('/auth/login', expect.anything())
  })

  it('submits valid credentials and shows the server error on failure', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: { data: { error: { message: 'Incorrect email or password.' } } },
    })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'alice@campus.edu')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'alice@campus.edu',
        password: 'wrongpassword',
      })
    })
    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument()
  })
})
