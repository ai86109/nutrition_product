import { createClient } from '@/utils/supabase/client'
import type { ProductCategory, ProductStatus } from '@/lib/supabase/queries/admin-products'

export async function updateProductCategories(
  licenseNo: string,
  categories: ProductCategory[]
) {
  const supabase = createClient()
  const { error } = await supabase.rpc('update_product_categories', {
    target_license_no: licenseNo,
    new_categories: categories,
  })

  if (error) {
    console.error('Error updating product categories:', error)
    throw error
  }
}

export async function updateProductIsApproved(
  licenseNo: string,
  isApproved: boolean
) {
  const supabase = createClient()
  const { error } = await supabase.rpc('update_product_is_approved', {
    target_license_no: licenseNo,
    new_is_approved: isApproved,
  })

  if (error) {
    console.error('Error updating product is_approved:', error)
    throw error
  }
}

export async function updateProductStatus(
  licenseNo: string,
  status: ProductStatus
) {
  const supabase = createClient()
  const { error } = await supabase.rpc('update_product_status', {
    target_license_no: licenseNo,
    new_status: status,
  })

  if (error) {
    console.error('Error updating product status:', error)
    throw error
  }
}
