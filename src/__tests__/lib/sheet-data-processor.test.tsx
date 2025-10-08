import { combineSheetData } from "@/lib/sheet-data-processor"
import { formattedMockFetchData, mockInfoData, mockIngredientsData, mockSpecData } from "../utils/test-data"

describe('combineSheetData', () => {
  test('successfully combines sheet data', () => {
    const result = combineSheetData(mockInfoData, mockSpecData, mockIngredientsData)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(formattedMockFetchData)
  })
})
