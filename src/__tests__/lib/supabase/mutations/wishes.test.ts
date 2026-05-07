import { createWish, updateWishStatus } from '@/lib/supabase/mutations/wishes'

const insertMock = jest.fn()
const rpcMock = jest.fn()

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({ insert: insertMock })),
    rpc: rpcMock,
  }),
}))

describe('createWish', () => {
  beforeEach(() => {
    insertMock.mockReset()
  })

  test('inserts a wish with trimmed content and the given user_id', async () => {
    insertMock.mockResolvedValueOnce({ error: null })

    await createWish('user-123', '  希望可以新增匯出功能  ')

    expect(insertMock).toHaveBeenCalledTimes(1)
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'user-123',
      content: '希望可以新增匯出功能',
    })
  })

  test('throws when supabase returns an error', async () => {
    insertMock.mockResolvedValueOnce({ error: new Error('rls denied') })

    await expect(createWish('user-123', 'hi')).rejects.toThrow('rls denied')
  })
})

describe('updateWishStatus', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  test('calls update_wish_status RPC with all params', async () => {
    rpcMock.mockResolvedValueOnce({ error: null })

    await updateWishStatus('wish-1', 'in-progress', 'WIP')

    expect(rpcMock).toHaveBeenCalledWith('update_wish_status', {
      p_id: 'wish-1',
      p_status: 'in-progress',
      p_admin_note: 'WIP',
    })
  })

  test('defaults admin_note to null when not provided', async () => {
    rpcMock.mockResolvedValueOnce({ error: null })

    await updateWishStatus('wish-1', 'completed')

    expect(rpcMock).toHaveBeenCalledWith('update_wish_status', {
      p_id: 'wish-1',
      p_status: 'completed',
      p_admin_note: null,
    })
  })

  test('throws when supabase returns an error', async () => {
    rpcMock.mockResolvedValueOnce({ error: new Error('not admin') })

    await expect(updateWishStatus('wish-1', 'planned')).rejects.toThrow('not admin')
  })
})
