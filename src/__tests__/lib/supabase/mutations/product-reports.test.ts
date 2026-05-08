import {
  createProductReport,
  updateProductReportStatus,
} from '@/lib/supabase/mutations/product-reports'

const insertMock = jest.fn()
const rpcMock = jest.fn()

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({ insert: insertMock })),
    rpc: rpcMock,
  }),
}))

describe('createProductReport', () => {
  beforeEach(() => {
    insertMock.mockReset()
  })

  test('inserts a report with trimmed description and reporter_name for guest', async () => {
    insertMock.mockResolvedValueOnce({ error: null })

    await createProductReport({
      product_id: 'A12345678',
      user_id: null,
      reporter_name: '  小王  ',
      category: 'nutrition',
      description: '  鈣含量單位錯誤  ',
    })

    expect(insertMock).toHaveBeenCalledTimes(1)
    expect(insertMock).toHaveBeenCalledWith({
      product_id: 'A12345678',
      user_id: null,
      reporter_name: '小王',
      category: 'nutrition',
      description: '鈣含量單位錯誤',
    })
  })

  test('inserts with reporter_name=null when guest left it blank', async () => {
    insertMock.mockResolvedValueOnce({ error: null })

    await createProductReport({
      product_id: 'A12345678',
      user_id: null,
      reporter_name: '   ',
      category: 'other',
      description: '其他',
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ reporter_name: null }),
    )
  })

  test('inserts with user_id and reporter_name=null for logged-in user', async () => {
    insertMock.mockResolvedValueOnce({ error: null })

    await createProductReport({
      product_id: 'A12345678',
      user_id: 'user-uuid-1',
      reporter_name: null,
      category: 'spec',
      description: '容量錯誤',
    })

    expect(insertMock).toHaveBeenCalledWith({
      product_id: 'A12345678',
      user_id: 'user-uuid-1',
      reporter_name: null,
      category: 'spec',
      description: '容量錯誤',
    })
  })

  test('throws when supabase returns an error', async () => {
    insertMock.mockResolvedValueOnce({ error: new Error('rls denied') })

    await expect(
      createProductReport({
        product_id: 'A12345678',
        user_id: null,
        reporter_name: null,
        category: 'nutrition',
        description: 'test',
      }),
    ).rejects.toThrow('rls denied')
  })
})

describe('updateProductReportStatus', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  test('calls update_product_report_status RPC with all params', async () => {
    rpcMock.mockResolvedValueOnce({ error: null })

    await updateProductReportStatus('report-1', 'in-progress', '查證中')

    expect(rpcMock).toHaveBeenCalledWith('update_product_report_status', {
      p_id: 'report-1',
      p_status: 'in-progress',
      p_admin_note: '查證中',
    })
  })

  test('defaults admin_note to null when not provided', async () => {
    rpcMock.mockResolvedValueOnce({ error: null })

    await updateProductReportStatus('report-1', 'completed')

    expect(rpcMock).toHaveBeenCalledWith('update_product_report_status', {
      p_id: 'report-1',
      p_status: 'completed',
      p_admin_note: null,
    })
  })

  test('throws when supabase returns an error', async () => {
    rpcMock.mockResolvedValueOnce({ error: new Error('not admin') })

    await expect(
      updateProductReportStatus('report-1', 'planned'),
    ).rejects.toThrow('not admin')
  })
})
