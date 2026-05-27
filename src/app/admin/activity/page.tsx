import { requireAdmin } from '@/lib/admin'
import {
  getActivitySummary,
  getDauSeries,
  getUserActivityList,
  parseActivityDays,
} from '@/lib/supabase/queries/admin-activity'
import { ActivityRangeSwitcher } from '@/components/admin/activity-range-switcher'
import { ActivitySummaryCards } from '@/components/admin/activity-summary-cards'
import { DauChart } from '@/components/admin/dau-chart'
import UserActivityTable from '@/components/admin/user-activity-table'

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  await requireAdmin()
  const { days: rawDays } = await searchParams
  const days = parseActivityDays(rawDays)

  const [summary, dauSeries, userList] = await Promise.all([
    getActivitySummary(days),
    getDauSeries(days),
    getUserActivityList(days),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">使用分析</h2>
          <p className="text-muted-foreground text-sm">
            DAU 與個別使用者活躍情形（排除管理員，時間以台北時區計）
          </p>
        </div>
        <ActivityRangeSwitcher value={days} />
      </div>

      <ActivitySummaryCards summary={summary} days={days} />

      <div className="rounded-md border bg-white p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">每日活躍人數</h3>
          <p className="text-muted-foreground text-xs">過去 {days} 天</p>
        </div>
        <DauChart data={dauSeries} />
      </div>

      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">使用者活躍排行</h3>
          <p className="text-muted-foreground text-xs">
            「估計使用時間」= 該使用者該日 1 分鐘間隔以上的活動次數加總，每 hit ≈ 1 分鐘，僅供粗略參考
          </p>
        </div>
        <UserActivityTable users={userList} days={days} />
      </div>
    </div>
  )
}
