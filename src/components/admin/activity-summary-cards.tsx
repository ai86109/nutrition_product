import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import type { ActivityDays, ActivitySummary } from '@/lib/supabase/queries/admin-activity'

interface ActivitySummaryCardsProps {
  summary: ActivitySummary
  days: ActivityDays
}

function formatNumber(n: number) {
  // 整數不加小數點
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(1)
}

export function ActivitySummaryCards({ summary, days }: ActivitySummaryCardsProps) {
  const items = [
    {
      title: '今日 DAU',
      value: formatNumber(summary.today_dau),
      description: '今天活躍人數（去重，不含 admin）',
    },
    {
      title: `${days} 天平均 DAU`,
      value: formatNumber(summary.avg_dau_in_range),
      description: '每日活躍人數平均',
    },
    {
      title: `${days} 天活躍人數`,
      value: formatNumber(summary.total_active_users),
      description: '去重後總活躍使用者數',
    },
    {
      title: '平均活躍天數',
      value: formatNumber(summary.avg_active_days_per_user),
      description: `${days} 天內每位使用者平均上線天數`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardContent className="space-y-2">
            <CardDescription className="text-xs">{item.title}</CardDescription>
            <CardTitle className="text-3xl font-bold">{item.value}</CardTitle>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
