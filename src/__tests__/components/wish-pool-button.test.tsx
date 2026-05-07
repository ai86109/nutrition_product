import { render, screen, fireEvent } from '@testing-library/react'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const useAuthMock = jest.fn()

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}))

import WishPoolButton from '@/components/wish-pool-button'

function setLoggedIn(loggedIn: boolean) {
  useAuthMock.mockReturnValue(
    loggedIn
      ? {
          session: { user: { id: 'user-123' } },
          isLoggedIn: true,
          loading: false,
          role: 'member',
        }
      : {
          session: null,
          isLoggedIn: false,
          loading: false,
          role: null,
        },
  )
}

describe('WishPoolButton', () => {
  beforeEach(() => {
    pushMock.mockReset()
    useAuthMock.mockReset()
  })

  test('shows the 許願池 button when logged out (popover is closed by default)', () => {
    setLoggedIn(false)
    render(<WishPoolButton />)
    expect(screen.getByRole('button', { name: /許願池/ })).toBeInTheDocument()
  })

  test('logged out: clicking button opens popover with 前往登入', () => {
    setLoggedIn(false)
    render(<WishPoolButton />)

    fireEvent.click(screen.getByRole('button', { name: /許願池/ }))

    expect(screen.getByText('登入後即可許願')).toBeInTheDocument()
    const loginBtn = screen.getByRole('button', { name: /前往登入/ })
    fireEvent.click(loginBtn)
    expect(pushMock).toHaveBeenCalledWith('/auth')
  })

  test('logged in: clicking button opens the wish dialog', () => {
    setLoggedIn(true)
    render(<WishPoolButton />)

    fireEvent.click(screen.getByRole('button', { name: /許願池/ }))

    // Dialog title should appear when open
    expect(screen.getAllByText('許願池').length).toBeGreaterThan(0)
    expect(
      screen.getByPlaceholderText(/希望可以新增/),
    ).toBeInTheDocument()
  })
})
