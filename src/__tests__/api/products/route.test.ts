/**
 * @jest-environment node
 */
import { formattedMockFetchData, mockInfoData, mockIngredientsData, mockSpecData } from "@/__tests__/utils/test-data"
import { GET } from "@/app/api/products/route"

jest.mock('@/lib/google-sheet-api', () => ({
  fetchSheetsData: jest.fn(() => Promise.resolve({
    infoData: mockInfoData,
    specData: mockSpecData,
    ingredientsData: mockIngredientsData
  }))
}))

describe('/api/products API Route', () => {
  describe('GET', () => {
    test('return products data on success', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([formattedMockFetchData])
    })
  })
})
