/**
 * @jest-environment node
 */
import { GET } from "@/app/api/products/route"

const testFetchSheetsData = [{
  id: '1139091114',
  name: '測試產品',
  engName: 'Test Product',
  brand: '測試品牌',
  type: '液劑',
  defaultAmount: '100g',
  reviewStatus: 'TRUE',
  categories: [],
  spec: [{
      defaultAmount: '100g',
      type: '液劑',
      unit: '罐',
      volume: '100g',
  }],
  ingredients: {
    calories: 100,
    protein: 5,
    fat: 0,
    carbohydrate: 20,
    phosphorus: 0,
    potassium: 0,
    sodium: 0,
    fiber: 0
  }
}]

const mockInfoData = [
  ['審核狀態', '許可證字號', '中文品名', '英文品名', '申請商名稱', '劑型', '類別'],
  ['TRUE', '1139091114', '測試產品', 'Test Product', '測試品牌', '液劑', '']
]

const mockSpecData = [
  ['許可證字號', '中文品名', '預設份量', 'type', 'unit', 'defaultAmount', 'volume'],
  ['1139091114', '測試產品', '100g', '液劑', '罐', '100g', '100g']
]

const mockIngredientsData = [
  ['許可證字號', '中文品名', 'calories', 'carbohydrate', 'protein', 'fat', 'phosphorus', 'potassium', 'sodium', 'fiber'],
  ['1139091114', '測試產品', '100', '20', '5', '0', '0', '0', '0', '0']
]

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
      expect(data).toEqual(testFetchSheetsData)
    })
  })
})
