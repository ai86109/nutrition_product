'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ALLOWED_ACTIVITY_DAYS, type ActivityDays } from '@/lib/supabase/queries/admin-activity'

interface ActivityRangeSwitcherProps {
  value: ActivityDays
}

/**
 * 把使用者選擇的時間範圍寫進 URL 的 ?days=，這樣 Server Component
 * 重新抓資料就會跟著變。可書籤、可分享。
 */
export function ActivityRangeSwitcher({ value }: ActivityRangeSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (raw: string) => {
    const n = Number(raw) as ActivityDays
    const params = new URLSearchParams(searchParams.toString())
    params.set('days', String(n))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={String(value)} onValueChange={onChange}>
      <TabsList>
        {ALLOWED_ACTIVITY_DAYS.map((d) => (
          <TabsTrigger key={d} value={String(d)} className="min-w-[60px]">
            {d} 天
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
