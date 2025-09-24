import type { ApiProductData } from '@/types/api'
import { fetchSheetsData } from './google-sheet-api'
import { combineSheetData } from './sheet-data-processor'

export async function getProductsFromSheets(): Promise<ApiProductData[]> {
  try {
    const { infoData, specData, ingredientsData } = await fetchSheetsData()
    
    const combinedData = combineSheetData(infoData, specData, ingredientsData)
    return combinedData
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
