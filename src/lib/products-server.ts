import type { ApiProductData } from '@/types/api'
import { fetchSheetsData } from './google-sheet-api'
import { combineSheetData } from './sheet-data-processor'
import { createClientForServer } from '@/utils/supabase/server'
import { formatProductData } from './product-processor'

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

export async function getProductFromSupabase() {
  try {
    const supabase = await createClientForServer()
    let { data: products, error } = await supabase
      .from('products')
      .select(`*, product_variants (*)`)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    const formattedProducts = formatProductData(products)
    return formattedProducts
  } catch (error) {
    console.error('Error fetching products from Supabase:', error)
    return []
  }
}