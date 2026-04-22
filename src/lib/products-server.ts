import { createClientForServer } from '@/utils/supabase/server'
import { formatProductData } from './product-processor'

export async function getProductFromSupabase() {
  try {
    const supabase = await createClientForServer()
    const { data: products, error } = await supabase
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