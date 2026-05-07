import { requireAdmin } from '@/lib/admin'
import { listWishes } from '@/lib/supabase/queries/wishes'
import WishPoolTable from '@/components/admin/wish-pool-table'

export default async function AdminWishesPage() {
  await requireAdmin()
  const wishes = await listWishes()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">許願池</h2>
        <p className="text-muted-foreground">
          使用者送出的功能 / 改善許願，可調整處理進度與寫後台備註。
        </p>
      </div>
      <WishPoolTable wishes={wishes} />
    </div>
  )
}
