import { createClientForServer } from '@/utils/supabase/server'

/**
 * 允許的範圍：呼叫端要把使用者選擇白名單成這幾個值。
 * SQL 端不再驗證，所以這層要把好關。
 */
export const ALLOWED_ACTIVITY_DAYS = [7, 30, 90] as const
export type ActivityDays = (typeof ALLOWED_ACTIVITY_DAYS)[number]

export function parseActivityDays(raw: string | string[] | undefined): ActivityDays {
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number(value)
  if ((ALLOWED_ACTIVITY_DAYS as readonly number[]).includes(n)) {
    return n as ActivityDays
  }
  return 30
}

export interface ActivitySummary {
  today_dau: number
  avg_dau_in_range: number
  total_active_users: number
  avg_active_days_per_user: number
}

export interface DauPoint {
  date: string // 'YYYY-MM-DD'
  dau: number
}

export interface UserActivityItem {
  user_id: string
  email: string
  name: string | null
  avatar_url: string | null
  active_days: number
  total_hit_count: number
  estimated_minutes: number
  last_active_date: string // 'YYYY-MM-DD'
}

export async function getActivitySummary(days: ActivityDays): Promise<ActivitySummary> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('admin_get_activity_summary', { p_days: days })

  if (error) {
    console.error('admin_get_activity_summary error:', error)
    return {
      today_dau: 0,
      avg_dau_in_range: 0,
      total_active_users: 0,
      avg_active_days_per_user: 0,
    }
  }

  // RPC 回傳 table，supabase-js 給 array
  const row = (data as ActivitySummary[] | null)?.[0]
  return (
    row ?? {
      today_dau: 0,
      avg_dau_in_range: 0,
      total_active_users: 0,
      avg_active_days_per_user: 0,
    }
  )
}

export async function getDauSeries(days: ActivityDays): Promise<DauPoint[]> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('admin_get_dau_series', { p_days: days })

  if (error) {
    console.error('admin_get_dau_series error:', error)
    return []
  }

  return (data ?? []) as DauPoint[]
}

export async function getUserActivityList(days: ActivityDays): Promise<UserActivityItem[]> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('admin_list_user_activity', { p_days: days })

  if (error) {
    console.error('admin_list_user_activity error:', error)
    return []
  }

  return (data ?? []) as UserActivityItem[]
}
