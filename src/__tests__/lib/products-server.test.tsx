import { getProductsFromSheets } from "@/lib/products-server"
import { formattedMockFetchData, mockInfoData, mockIngredientsData, mockSpecData } from "../utils/test-data"

jest.mock('@/lib/google-sheet-api', () => ({
  fetchSheetsData: jest.fn(() => Promise.resolve({
    infoData: mockInfoData,
    specData: mockSpecData,
    ingredientsData: mockIngredientsData
  }))
}))

describe('products server', () => {
  test('fetches product data', async () => {
    const result = await getProductsFromSheets()
    expect(result).toEqual([formattedMockFetchData])
  })
})
