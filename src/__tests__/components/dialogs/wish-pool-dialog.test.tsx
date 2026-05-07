import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WishPoolDialog from '@/components/dialogs/wish-pool-dialog'

const createWishMock = jest.fn()

jest.mock('@/lib/supabase/mutations/wishes', () => ({
  createWish: (...args: unknown[]) => createWishMock(...args),
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { user: { id: 'user-123' } },
    isLoggedIn: true,
    loading: false,
    role: 'member',
  }),
}))

describe('WishPoolDialog', () => {
  beforeEach(() => {
    createWishMock.mockReset()
    window.alert = jest.fn()
  })

  test('does not throw on render when closed', () => {
    expect(() => {
      render(<WishPoolDialog open={false} onOpenChange={() => {}} />)
    }).not.toThrow()
  })

  test('disables submit when textarea is empty or whitespace', () => {
    render(<WishPoolDialog open={true} onOpenChange={() => {}} />)
    const submitBtn = screen.getByRole('button', { name: /送出許願/ })
    expect(submitBtn).toBeDisabled()

    const textarea = screen.getByPlaceholderText(/希望可以新增/) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '   ' } })
    expect(submitBtn).toBeDisabled()
  })

  test('calls createWish with userId and content on submit', async () => {
    createWishMock.mockResolvedValueOnce(undefined)
    const onOpenChange = jest.fn()
    render(<WishPoolDialog open={true} onOpenChange={onOpenChange} />)

    const textarea = screen.getByPlaceholderText(/希望可以新增/) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '希望增加 PDF 匯出' } })

    fireEvent.click(screen.getByRole('button', { name: /送出許願/ }))

    await waitFor(() => {
      expect(createWishMock).toHaveBeenCalledWith('user-123', '希望增加 PDF 匯出')
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  test('shows error message when over 1000 chars', () => {
    render(<WishPoolDialog open={true} onOpenChange={() => {}} />)
    const textarea = screen.getByPlaceholderText(/希望可以新增/) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'a'.repeat(1001) } })

    const submitBtn = screen.getByRole('button', { name: /送出許願/ })
    expect(submitBtn).toBeDisabled()
    expect(screen.getByText(/1001 \/ 1000/)).toBeInTheDocument()
  })
})
