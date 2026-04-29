import { requireAdmin } from '@/lib/admin'
import { getAdminProductList } from '@/lib/supabase/queries/admin-products'
import AdminProductTable from '@/components/admin/admin-product-table'

export default async function AdminProductsPage() {
  await requireAdmin()
  const products = await getAdminProductList()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">營養品管理</h2>
        <p className="text-muted-foreground">管理 DB 內的營養品配方種類、是否顯示與產品狀態</p>
      </div>
      <AdminProductTable products={products} />
    </div>
  )
}
