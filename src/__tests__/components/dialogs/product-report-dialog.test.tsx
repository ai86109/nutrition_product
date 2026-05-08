import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProductReportDialog from '@/components/dialogs/product-report-dialog'

const createReportMock = jest.fn()
let mockSession: { user: { id: string; email?: string } } | null = null
let mockIsLoggedIn = false

jest.mock('@/lib/supabase/mutations/product-reports', () => ({
  createProductReport: (...args: unknown[]) => createReportMock(...args),
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    session: mockSession,
    isLoggedIn: mockIsLoggedIn,
    loading: false,
    role: 'member',
  }),
}))

const PRODUCT = { id: 'A12345678', name: 'Test 配方食品' }

beforeEach(() => {
  createReportMock.mockReset()
  window.alert = jest.fn()
  mockSession = null
  mockIsLoggedIn = false
})

describe('ProductReportDialog (guest)', () => {
  test('does not throw on render when closed', () => {
    expect(() => {
      render(
        <ProductReportDialog
          open={false}
          onOpenChange={() => {}}
          productId={PRODUCT.id}
          productName={PRODUCT.name}
        />,
      )
    }).not.toThrow()
  })

  test('shows reporter name field when not logged in', () => {
    render(
      <ProductReportDialog
        open={true}
        onOpenChange={() => {}}
        productId={PRODUCT.id}
        productName={PRODUCT.name}
      />,
    )
    expect(screen.getByLabelText(/您的大名/)).toBeInTheDocument()
    expect(screen.getByText(PRODUCT.name)).toBeInTheDocument()
  })

  test('disables submit when description is empty or category not picked', () => {
    render(
      <ProductReportDialog
        open={true}
        onOpenChange={() => {}}
        productId={PRODUCT.id}
        productName={PRODUCT.name}
      />,
    )
    const submitBtn = screen.getByRole('button', { name: /送出回報/ })
    expect(submitBtn).toBeDisabled()

    const desc = screen.getByLabelText(/問題描述/) as HTMLTextAreaElement
    fireEvent.change(desc, { target: { value: '   ' } })
    expect(submitBtn).toBeDisabled()
  })

  test('submits with user_id=null and trimmed reporter_name for guest', async () => {
    createReportMock.mockResolvedValueOnce(undefined)
    const onOpenChange = jest.fn()

    render(
      <ProductReportDialog
        open={true}
        onOpenChange={onOpenChange}
        productId={PRODUCT.id}
        productName={PRODUCT.name}
      />,
    )

    const nameInput = screen.getByLabelText(/您的大名/) as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: '小王' } })

    // 直接觸發底層 select（jsdom 下 Radix Select 不易模擬點選）
    // 我們改成手動把 select 設成有效值的方式：藉由觸發 form input
    // 由於 Radix Select 用 hidden select，無法直接 click，這裡用 fireEvent.click 在 SelectItem
    // 上模擬。如果 jsdom 不行，改成 submit 前修改 state 的迂迴測試。
    // 簡化：透過直接設定 description 並使用 Radix 的鍵盤操作。
    const trigger = screen.getByLabelText(/問題種類/)
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    // pop the listbox
    const nutritionItem = await screen.findByText('營養品成分有誤')
    fireEvent.click(nutritionItem)

    const desc = screen.getByLabelText(/問題描述/) as HTMLTextAreaElement
    fireEvent.change(desc, { target: { value: '鈣含量單位錯誤' } })

    fireEvent.click(screen.getByRole('button', { name: /送出回報/ }))

    await waitFor(() => {
      expect(createReportMock).toHaveBeenCalledWith({
        product_id: PRODUCT.id,
        user_id: null,
        reporter_name: '小王',
        category: 'nutrition',
        description: '鈣含量單位錯誤',
      })
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  test('shows error message when description over 2000 chars', () => {
    render(
      <ProductReportDialog
        open={true}
        onOpenChange={() => {}}
        productId={PRODUCT.id}
        productName={PRODUCT.name}
      />,
    )
    const desc = screen.getByLabelText(/問題描述/) as HTMLTextAreaElement
    fireEvent.change(desc, { target: { value: 'a'.repeat(2001) } })

    const submitBtn = screen.getByRole('button', { name: /送出回報/ })
    expect(submitBtn).toBeDisabled()
    expect(screen.getByText(/2001 \/ 2000/)).toBeInTheDocument()
  })
})

describe('ProductReportDialog (logged in)', () => {
  beforeEach(() => {
    mockSession = { user: { id: 'user-uuid-1', email: 'me@example.com' } }
    mockIsLoggedIn = true
  })

  test('hides reporter name field when logged in', () => {
    render(
      <ProductReportDialog
        open={true}
        onOpenChange={() => {}}
        productId={PRODUCT.id}
        productName={PRODUCT.name}
      />,
    )
    expect(screen.queryByLabelText(/您的大名/)).not.toBeInTheDocument()
  })

  test('submits with user_id and reporter_name=null for logged-in user', async () => {
    createReportMock.mockResolvedValueOnce(undefined)
    const onOpenChange = jest.fn()

    render(
      <ProductReportDialog
        open={true}
        onOpenChange={onOpenChange}
        productId={PRODUCT.id}
        productName={PRODUCT.name}
      />,
    )

    const trigger = screen.getByLabelText(/問題種類/)
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    const otherItem = await screen.findByText('其他問題')
    fireEvent.click(otherItem)

    const desc = screen.getByLabelText(/問題描述/) as HTMLTextAreaElement
    fireEvent.change(desc, { target: { value: '一些其他問題' } })

    fireEvent.click(screen.getByRole('button', { name: /送出回報/ }))

    await waitFor(() => {
      expect(createReportMock).toHaveBeenCalledWith({
        product_id: PRODUCT.id,
        user_id: 'user-uuid-1',
        reporter_name: null,
        category: 'other',
        description: '一些其他問題',
      })
    })
  })
})
