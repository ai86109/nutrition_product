import { fetchSheetsData } from "@/lib/google-sheet-api"

global.fetch = jest.fn()

describe('fetchSheetsData', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEET_ID = 'test-sheet-id'
    process.env.GOOGLE_SHEET_API_KEY = 'test-api-key'
  })

  test('return data successfully', async () => {
    const mockInfoData = [['id', 'name'], ['1', 'Product A'], ['2', 'Product B']]
    const mockSpecData = [['id', 'spec'], ['1', 'Spec A'], ['2', 'Spec B']]
    const mockIngredientsData = [['id', 'calories'], ['1', '100'], ['2', '200']]

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: mockInfoData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: mockSpecData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: mockIngredientsData }),
      })

    const result = await fetchSheetsData()

    expect(result).toEqual({
      infoData: mockInfoData,
      specData: mockSpecData,
      ingredientsData: mockIngredientsData,
    })
  })
})
