import { requireAdmin } from '@/lib/admin'
import { listTutorialsAdmin } from '@/lib/supabase/queries/tutorials'
import TutorialTable from '@/components/admin/tutorial-table'

export default async function AdminTutorialsPage() {
  await requireAdmin()
  const tutorials = await listTutorialsAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">新手上路</h2>
        <p className="text-muted-foreground">
          管理「新手上路」頁面上顯示的教學連結。可新增、編輯、上下移動順序、切換上下架。
        </p>
      </div>
      <TutorialTable initialTutorials={tutorials} />
    </div>
  )
}
