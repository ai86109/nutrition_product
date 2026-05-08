import { requireAdmin } from '@/lib/admin'
import { listProductReports } from '@/lib/supabase/queries/product-reports'
import ProductReportTable from '@/components/admin/product-report-table'

export default async function AdminReportsPage() {
  await requireAdmin()
  const reports = await listProductReports()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">錯誤回報</h2>
        <p className="text-muted-foreground">
          使用者送出的營養品資料錯誤回報，可調整處理進度與寫後台備註。
        </p>
      </div>
      <ProductReportTable reports={reports} />
    </div>
  )
}
